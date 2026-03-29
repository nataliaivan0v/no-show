import { type Profile } from '../../types'

export default function Navbar({ profile, onSignOut }: { profile: Profile; onSignOut: () => void }) {
  return (
    <nav style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 24px', background: '#1e1e2e', color: 'white'
    }}>
      <strong style={{ fontSize: 18 }}>NoShow</strong>
      <span style={{ fontSize: 14, color: '#aaa' }}>{profile.full_name}</span>
      <button onClick={onSignOut} style={{
        background: 'none', color: 'white', border: '1px solid #555',
        cursor: 'pointer', padding: '4px 12px', borderRadius: 4
      }}>
        Sign Out
      </button>
    </nav>
  )
}