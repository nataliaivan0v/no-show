# NoShow

A peer-to-peer fitness spot exchange. If you can't make a class you signed up for, post your spot so someone else can take it — and you avoid the cancellation fee. Seekers join a waitlist by class type and get notified the moment a matching spot is posted.

---

## Features

- **Auth** — Sign up and log in via Supabase Auth
- **Post a spot** — List a class you can no longer attend, including studio, class type, and time
- **Waitlist** — Tell the app which class types you're looking for and get notified when one opens up
- **Smart matching** — When a spot is posted, the first matching seeker on the waitlist is notified instantly
- **Notification inbox** — Real-time in-app inbox simulates SMS notifications (dev environment)
- **Queue advancement** — If a seeker doesn't claim the spot in time, it automatically moves to the next person in line

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript (Vite) |
| Backend / Database | Supabase (Postgres + Auth) |
| Real-time | Supabase Realtime (postgres_changes) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project

### Installation

```bash
git clone https://github.com/your-username/noshow.git
cd noshow
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

Paste the contents of `schema.sql` into the **Supabase SQL Editor** and run it. This creates all tables, RLS policies, and the trigger that auto-creates a profile on signup.

### Run Locally

```bash
npm run dev
```

---

## Project Structure

```
src/
├── lib/
│   ├── supabase.ts          # Supabase client
│   └── matching.ts          # Waitlist matching + queue logic
├── types/
│   └── index.ts
├── components/
│   ├── Layout/Navbar.tsx
│   ├── Spots/PostSpotForm.tsx
│   ├── Spots/MyListings.tsx
│   ├── Waitlist/WaitlistForm.tsx
│   └── Waitlist/NotificationInbox.tsx
└── pages/
    ├── AuthPage.tsx
    └── Dashboard.tsx
```

---

## How It Works

1. A **user** signs up for a fitness class at their studio but later realizes they can't make it
2. They post their spot on NoShow — listing the class type, studio, and time
3. Another user has joined the waitlist for that class type and gets an in-app notification
4. They see it in their inbox and **claim the spot** before time runs out
5. If they don't claim it, the posting user can simulate a 30-minute timeout — the notification expires and the next seeker in line is notified

> In production, step 5 would be handled by a scheduled background job and real SMS notifications via Twilio.

---

## Notes

This project was built as a portfolio piece. SMS notifications and background scheduling are intentionally simulated in the UI to keep the app fully demonstrable in a local dev environment.
