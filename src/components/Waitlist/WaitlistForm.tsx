import { useState } from 'react'
import { supabase } from '../../lib/supabase'

const CLASS_TYPES = ['Yoga', 'Spin', 'Pilates', 'HIIT', 'Barre']

export default function WaitlistForm({ seekerId }: { seekerId: string }) {
  const [selected, setSelected] = useState<string[]>([])
  const [status, setStatus] = useState('')

  const toggle = (t: string) =>
    setSelected(s => s.includes(t) ? s.filter(x => x !== t) : [...s, t])

  const handleSubmit = async () => {
    if (!selected.length) { setStatus('Select at least one class type'); return }
    const { error } = await supabase.from('waitlist_entries').insert({
      seeker_id: seekerId,
      class_types: selected
    })
    if (error) setStatus(`Error: ${error.message}`)
    else { setStatus("✅ You're on the waitlist! We'll notify you when a match is posted."); setSelected([]) }
  }

  return (
    <div>
      <h3>Join the Waitlist</h3>
      <p style={{ fontSize: 14, color: 'gray', margin: '0 0 10px' }}>
        Select the class types you're looking for. You'll be notified when someone posts a matching spot.
      </p>
      <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
        {CLASS_TYPES.map(t => (
          <label key={t}>
            <input type="checkbox" checked={selected.includes(t)} onChange={() => toggle(t)} />
            {' '}{t}
          </label>
        ))}
      </div>
      <button onClick={handleSubmit}>Join Waitlist</button>
      {status && <p>{status}</p>}
    </div>
  )
}