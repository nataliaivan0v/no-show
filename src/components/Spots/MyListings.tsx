import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { type Spot } from '../../types'

export default function MyListings({ posterId }: { posterId: string }) {
  const [spots, setSpots] = useState<Spot[]>([])

  const fetchSpots = () =>
    supabase.from('spots').select('*')
      .eq('poster_id', posterId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setSpots(data ?? []))

  useEffect(() => {
    fetchSpots()
    const channel = supabase.channel('my-listings')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'spots',
        filter: `poster_id=eq.${posterId}`
      }, fetchSpots)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [posterId])

  const handleDelete = async (spotId: string) => {
    const { error } = await supabase.from('spots').delete().eq('id', spotId)
    if (error) { console.error('Delete error:', error); return }
    setSpots(prev => prev.filter(s => s.id !== spotId))
  }

  return (
    <div>
      <h3>My Posted Spots</h3>
      {spots.length === 0 && <p style={{ color: 'gray' }}>You haven't posted any spots yet.</p>}
      {spots.map(s => (
        <div key={s.id} style={{ border: '1px solid #ddd', padding: 12, marginBottom: 8, borderRadius: 8 }}>
          <strong>{s.title}</strong> — {s.class_type}
          <br />
          <span style={{ fontSize: 13, color: 'gray' }}>
            {s.studio} · {new Date(s.scheduled_at).toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone })}
          </span>
          <br />
          <span style={{ fontSize: 12, color: s.status === 'claimed' ? '#10b981' : '#f59e0b' }}>
            ● {s.status}
          </span>
          {s.status === 'available' && (
            <div style={{ marginTop: 8 }}>
              <button onClick={() => handleDelete(s.id)} style={{ color: '#ef4444', borderColor: '#ef4444' }}>
                🗑 Delete Listing
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}