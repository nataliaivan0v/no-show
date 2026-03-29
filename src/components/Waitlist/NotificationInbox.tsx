import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { type Notification, type NotifStatus, type Spot } from '../../types'
import { rejectSpot } from '../../lib/matching'

const EXPIRY_MS = 2 * 60 * 1000

const colors: Record<NotifStatus, string> = {
  pending: '#f59e0b',
  claimed: '#10b981',
  expired: '#ef4444'
}

function Countdown({ createdAt, onExpire }: { createdAt: string; onExpire: () => void }) {
  const expiresAt = new Date(createdAt).getTime() + EXPIRY_MS
  const calcRemaining = () => Math.max(0, expiresAt - Date.now())
  const [remaining, setRemaining] = useState(calcRemaining)
  const firedRef = useRef(false)

  useEffect(() => {
    const interval = setInterval(() => {
      const r = calcRemaining()
      setRemaining(r)
      if (r === 0 && !firedRef.current) {
        firedRef.current = true
        clearInterval(interval)
        onExpire()
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [createdAt])

  const mins = Math.floor(remaining / 60000)
  const secs = Math.floor((remaining % 60000) / 1000)
  const isUrgent = remaining < 5 * 60 * 1000

  return (
    <span style={{ fontSize: 13, fontWeight: 'bold', color: isUrgent ? '#ef4444' : '#f59e0b' }}>
      ⏱ {mins}:{secs.toString().padStart(2, '0')} remaining
    </span>
  )
}

export default function NotificationInbox({ seekerId }: { seekerId: string }) {
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [claimedSpots, setClaimedSpots] = useState<Record<string, Spot>>({})

  const fetch = () =>
    supabase.from('notifications').select('*')
      .eq('seeker_id', seekerId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setNotifs(data ?? []))

  useEffect(() => {
    fetch()
    const channel = supabase.channel('notif-inbox')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'notifications',
        filter: `seeker_id=eq.${seekerId}`
      }, fetch)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [seekerId])

  const claim = async (notifId: string, spotId: string, waitlistEntryId: string) => {
    await supabase.from('notifications').update({ status: 'claimed' }).eq('id', notifId)
    await supabase.from('spots').update({ status: 'claimed' }).eq('id', spotId)
    await supabase.from('waitlist_entries').update({ created_at: new Date().toISOString() }).eq('id', waitlistEntryId)

    const { data: spot } = await supabase.from('spots').select('*').eq('id', spotId).single()
    if (spot) setClaimedSpots(prev => ({ ...prev, [spotId]: spot }))
    fetch()
  }

  const handleExpire = async (n: Notification) => {
    await rejectSpot(n.id, n.spot_id, n.waitlist_entry_id)
    fetch()
  }

  return (
    <div>
      <h3>📩 Notification Inbox</h3>
      {notifs.length === 0 && (
        <p style={{ color: 'gray' }}>No notifications yet. Join the waitlist below to get notified when a spot opens up.</p>
      )}
      {notifs.map(n => (
        <div key={n.id} style={{ border: `2px solid ${colors[n.status]}`, borderRadius: 8, padding: 12, marginBottom: 8 }}>
          <p style={{ margin: '0 0 8px' }}>{n.message}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ color: colors[n.status], fontWeight: 'bold', textTransform: 'capitalize', fontSize: 13 }}>
              ● {n.status}
            </span>
            {n.status === 'pending' && (
              <Countdown createdAt={n.created_at} onExpire={() => handleExpire(n)} />
            )}
          </div>

          {n.status === 'claimed' && claimedSpots[n.spot_id]?.claim_info && (
            <div style={{
              marginTop: 10, padding: 10, background: '#f0fdf4',
              borderRadius: 6, border: '1px solid #86efac'
            }}>
              <p style={{ margin: '0 0 4px', fontWeight: 'bold', fontSize: 13 }}>📋 Booking Info</p>
              <p style={{ margin: 0, fontSize: 13, whiteSpace: 'pre-wrap' }}>
                {claimedSpots[n.spot_id].claim_info}
              </p>
            </div>
          )}

          {n.status === 'pending' && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={() => claim(n.id, n.spot_id, n.waitlist_entry_id)}>✅ Claim Spot</button>
              <button
                onClick={() => rejectSpot(n.id, n.spot_id, n.waitlist_entry_id).then(fetch)}
                style={{ color: '#ef4444', borderColor: '#ef4444' }}
              >
                ✕ Not Interested
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}