import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { notifyNextSeeker } from '../../lib/matching'

const CLASS_TYPES = ['Yoga', 'Spin', 'Pilates', 'HIIT', 'Barre']

function getNameDisplay(fullName: string): string {
  const parts = fullName.trim().split(' ')
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}

export default function PostSpotForm({ posterId, onPost }: { posterId: string; onPost: () => void }) {
  const [title, setTitle] = useState('')
  const [classType, setClassType] = useState('Yoga')
  const [studio, setStudio] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [claimInfo, setClaimInfo] = useState('')
  const [profileName, setProfileName] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    supabase.from('profiles').select('full_name').eq('id', posterId).single()
      .then(({ data }) => { if (data) setProfileName(getNameDisplay(data.full_name)) })
  }, [posterId])

  const handleSubmit = async () => {
    if (!title || !studio || !scheduledAt) { setStatus('Please fill in all fields'); return }

    const classTime = new Date(scheduledAt).getTime()
    const oneHourFromNow = Date.now() + 60 * 60 * 1000

    if (classTime < Date.now()) { setStatus('❌ This class is in the past.'); return }
    if (classTime < oneHourFromNow) { setStatus('❌ Class must be at least 1 hour away to give someone enough time to claim it.'); return }

    const bookingLine = `Booking name: ${profileName}`
    const fullClaimInfo = claimInfo.trim()
      ? `${bookingLine}\n${claimInfo.trim()}`
      : bookingLine

    const { data, error } = await supabase
      .from('spots')
      .insert({
        poster_id: posterId,
        title,
        class_type: classType,
        studio,
        scheduled_at: scheduledAt,
        claim_info: fullClaimInfo
      })
      .select().single()

    if (error) { setStatus(`Error: ${error.message}`); return }

    const notified = await notifyNextSeeker(data.id)
    setStatus(notified
      ? '✅ Spot posted! First matched seeker has been notified.'
      : '✅ Spot posted! No matching seekers on the waitlist yet.')
    setTitle(''); setStudio(''); setScheduledAt(''); setClaimInfo('')
    onPost()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <h3>Post a Spot</h3>
      <p style={{ fontSize: 14, color: 'gray', margin: 0 }}>
        Can't make your class? Post your spot so someone else can take it — and you avoid the no-show fee.
      </p>
      <input placeholder="Class name (e.g. Morning Flow)" value={title} onChange={e => setTitle(e.target.value)} />
      <select value={classType} onChange={e => setClassType(e.target.value)}>
        {CLASS_TYPES.map(t => <option key={t}>{t}</option>)}
      </select>
      <input placeholder="Studio name" value={studio} onChange={e => setStudio(e.target.value)} />
      <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />

      <div style={{ borderTop: '1px solid #eee', paddingTop: 10, marginTop: 4 }}>
        <label style={{ fontSize: 14, fontWeight: 'bold', display: 'block', marginBottom: 4 }}>
          Booking Info <span style={{ fontWeight: 'normal', color: 'gray' }}>(only shown after someone claims)</span>
        </label>
        {profileName && (
          <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 6px' }}>
            📋 Booking name <strong>{profileName}</strong> will be included automatically.
            If the class is booked under a different name, note it below.
          </p>
        )}
        <textarea
          placeholder={`Add anything else the claimer needs, e.g:\n• Door code: 1234\n• Check in at the front desk\n• Booked under a different name: Jane D.`}
          value={claimInfo}
          onChange={e => setClaimInfo(e.target.value)}
          rows={4}
          style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical' }}
        />
      </div>

      <button onClick={handleSubmit}>Post Spot</button>
      {status && <p>{status}</p>}
    </div>
  )
}