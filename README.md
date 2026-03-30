# No Show

A peer-to-peer fitness spot exchange. If you can't make a class you signed up for, post your spot so someone else can take it and avoid the cancellation fee. Seekers join a waitlist with their preferences and get notified the moment a matching spot is posted.

---

## Features

**Spot Posting**
- Post a class spot with studio name, class name, address, date, time, class type, level, and instructor
- Booking name is auto-filled from your profile
- Add additional booking info (door codes, check-in notes) that is only revealed after someone claims the spot
- Delete a listing anytime before it's claimed
- Spots must be posted at least 1 hour before the class start time

**Waitlist**
- Join the waitlist by selecting preferred class types, class level, and time of day (morning, afternoon, evening)
- Matching engine finds the best fit from the waitlist when a spot is posted
- Preferences can be updated at any time

**Smart Matching & Queue**
- When a spot is posted, the system matches against waitlist preferences (class type, level, and time of day)
- Falls back to class-type-only matching if no exact match is found
- If a seeker doesn't claim within 30 minutes, the spot automatically moves to the next person in line
- Seekers can also click "Not Interested" to pass and advance the queue
- After claiming a spot, the seeker is moved to the back of the waitlist so others get priority

**Notifications**
- Real-time in-app notification inbox
- Each notification includes a live 30-minute countdown timer
- Booking info (name, door code, etc.) is revealed only after claiming
- Notifications can be individually deleted or cleared all at once
- Notification badge on the navbar updates in real time and clears when inbox is visited

**Dashboard**
- Overview of upcoming claimed classes and active listings side by side
- Past classes split into classes taken and classes listed
- All spot details displayed: studio, class name, date, location, level, instructor, type

**Account**
- View and edit profile information
- Sign out

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript (Vite) |
| Backend / Database | Supabase (Postgres + Auth) |
| Real-time | Supabase Realtime (postgres_changes) |
| Routing | React Router v6 |
| Fonts | Berkshire Swash, Afacad (Google Fonts) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project

### Installation

```bash
git clone https://github.com/your-username/no-show.git
cd no-show
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Both values are found in your Supabase project under **Settings → API**.

### Database Setup

Paste the contents of `schema.sql` into the **Supabase SQL Editor** and run it.

### Run Locally

```bash
npm run dev
```

---

## Project Structure

```
src/
├── lib/
│   ├── supabase.ts
│   └── matching.ts
├── types/
│   └── index.ts
├── components/
│   ├── Layout/Navbar.tsx
│   ├── Spots/PostSpotForm.tsx
│   ├── Waitlist/WaitlistForm.tsx
│   └── Waitlist/NotificationInbox.tsx
└── pages/
    ├── LandingPage.tsx
    ├── LandingPage.css
    ├── LoginPage.tsx
    ├── SignupPage.tsx
    ├── Dashboard.tsx
    └── AccountPage.tsx
```

---

## How It Works

1. A user signs up for a fitness class but later can't make it
2. They post their spot on No Show with the class details and any booking info needed to attend
3. The matching engine scans the waitlist for the best match based on class type, level, and time preference
4. The matched seeker receives a real-time notification with a 30-minute countdown to claim the spot
5. If they claim it, they receive the full booking info instantly
6. If they don't claim it or click "Not Interested," the spot moves to the next person in the queue automatically

## Database Schema

No Show uses four tables in Supabase Postgres. Row Level Security (RLS) is enabled on all tables to ensure users can only access data they are permitted to see or modify.

---

### `profiles`

Stores basic user information. A row is automatically created via a Postgres trigger (`handle_new_user`) when a new user signs up through Supabase Auth.

| Column | Type | Notes |
|---|---|---|
| id | uuid | References `auth.users` |
| full_name | text | Set at signup |
| created_at | timestamptz | Auto-set |

**Policies**

- **Readable by all authenticated users** — The matching engine needs to read any user's profile to auto-fill the booking name when a spot is posted. Without this, the form couldn't fetch the poster's name.
- **Editable by owner only** — A user can only update their own profile row, preventing anyone from modifying another user's name or details.

---

### `spots`

Stores every class spot that has been posted. Each spot belongs to the user who posted it.

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| poster_id | uuid | References `profiles` |
| title | text | Class name (e.g. Morning Flow) |
| class_type | text | e.g. Yoga, Spin |
| studio | text | Studio name |
| location | text | Studio address |
| scheduled_at | timestamptz | Class date and time |
| class_level | text | Optional |
| instructor | text | Optional |
| claim_info | text | Revealed only after claiming |
| status | text | `available` or `claimed` |
| created_at | timestamptz | Auto-set |

**Policies**

- **Readable by all authenticated users** — Any logged-in user needs to be able to see available spots. The matching engine also reads spots to check for existing availability when a seeker joins the waitlist.
- **Insertable by authenticated users** — Any user can post a spot since there are no fixed roles — the same person can be a poster or a seeker depending on the situation.
- **Updatable by authenticated users** — Both the poster (managing their listing) and a seeker (marking a spot as claimed) need update access. Restricting updates to only the poster would break the claim flow.
- **Deletable by owner only** — Only the user who posted the spot can delete it, preventing others from removing listings they don't own.

---

### `waitlist_entries`

Stores each user's waitlist preferences. A user can have one active entry specifying the class types, level, and time of day they are looking for.

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| seeker_id | uuid | References `profiles` |
| class_types | text[] | Array of preferred class types |
| class_level | text | Optional preferred level |
| time_preferences | text[] | morning / afternoon / evening |
| created_at | timestamptz | Used to determine queue position |

**Policies**

- **Readable by all authenticated users** — The matching engine runs in the browser as the currently logged-in poster. It needs to query all waitlist entries to find matching seekers. Without this, the query would return no results and no notifications would ever be sent.
- **Insertable by owner only** — A user can only create a waitlist entry for themselves, preventing someone from signing others up without their knowledge.
- **Updatable by owner only** — Only the seeker can update their own preferences or have their queue position adjusted (e.g. bumped to the back after claiming a spot).
- **Deletable by owner only** — A user can only remove their own waitlist entry.

---

### `notifications`

Created by the matching engine when a seeker is found for a spot. Represents a pending, claimed, or expired offer sent to a specific seeker.

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| seeker_id | uuid | References `profiles` |
| spot_id | uuid | References `spots` (cascades on delete) |
| waitlist_entry_id | uuid | References `waitlist_entries` |
| message | text | The notification text shown to the seeker |
| status | text | `pending`, `claimed`, or `expired` |
| created_at | timestamptz | Used to calculate the 30-min countdown |

**Policies**

- **Readable by recipient only** — A seeker should only see their own notifications. Showing one user's notifications to another would expose private spot details and booking info.
- **Insertable by authenticated users** — The matching engine, running as the posting user, needs to insert a notification for a different user (the matched seeker). Restricting inserts to owner-only would break this entirely.
- **Updatable by authenticated users** — Both the seeker (claiming or rejecting) and the system (expiring a notification when the timer runs out) need to update notification status. The seeker is not always the one triggering the update.
- **Deletable by recipient only** — Only the seeker can delete their own notifications, keeping the inbox management personal and preventing others from clearing someone else's inbox.

## Notes

This project was built as a portfolio piece. SMS notifications and background scheduling are intentionally simulated in the UI — the 30-minute countdown runs client-side and auto-advances the queue on expiry. In production these would be handled by a scheduled background job and real SMS notifications via Twilio. In production, studio address fields would integrate with the Google Maps Places API for address autocomplete and validation. This would also enable location-based filtering on the waitlist queue, so seekers could be matched to spots within a preferred distance rather than across all locations.