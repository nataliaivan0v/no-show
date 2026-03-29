import { type Profile } from '../types'
import PostSpotForm from '../components/Spots/PostSpotForm'
import MyListings from '../components/Spots/MyListings'
import WaitlistForm from '../components/Waitlist/WaitlistForm.tsx'
import NotificationInbox from '../components/Waitlist/NotificationInbox.tsx'

import { useState, useCallback } from 'react'

export default function Dashboard({ profile }: { profile: Profile }) {
    const [refreshKey, setRefreshKey] = useState(0)
    const refresh = useCallback(() => setRefreshKey(k => k + 1), [])

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <h2>My Dashboard</h2>

      <section>
        <NotificationInbox seekerId={profile.id} />
      </section>

      <hr style={{ margin: '24px 0' }} />

      <section>
        <WaitlistForm seekerId={profile.id} />
      </section>

      <hr style={{ margin: '24px 0' }} />

      <section>
        <PostSpotForm posterId={profile.id} onPost={refresh}/>
      </section>

      <hr style={{ margin: '24px 0' }} />

      <section>
        <MyListings key={refreshKey} posterId={profile.id} />
      </section>
    </div>
  )
}