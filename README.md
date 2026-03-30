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

---

## Notes

This project was built as a portfolio piece. SMS notifications and background scheduling are intentionally simulated in the UI — the 30-minute countdown runs client-side and auto-advances the queue on expiry. In production these would be handled by a scheduled background job and real SMS notifications via Twilio. In production, studio address fields would integrate with the Google Maps Places API for address autocomplete and validation. This would also enable location-based filtering on the waitlist queue, so seekers could be matched to spots within a preferred distance rather than across all locations.