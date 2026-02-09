# Paperboy Prince Platform - Product Requirements Document

## Original Problem Statement
Build and enhance the "Paperboy Prince Platform" - a community engagement platform for the Paperboy Prince 2026 campaign featuring posts, events, and volunteer engagement.

## User Personas
- **Public Visitors**: Browse content, learn about the campaign, volunteer via Google Form
- **Admin Users**: Manage posts, view analytics, update credentials

## Core Requirements (Completed)

### Static Site Architecture
- React frontend functions independently for public users
- Backend features fail gracefully or are hidden when unavailable
- Structured for Bluehost deployment via cPanel Git deployment

### Authentication
- **Public Auth**: REMOVED - All CTAs link to external Google Form
- **Admin Auth**: Email/password via backend, credentials from ENV vars

### Features Implemented
1. **Hero Section**
   - Auto-rotating image slideshow (10 images, 5-second intervals)
   - First image: DSC01894.JPEG, rest randomized

2. **Views Badge** (lower-left corner)
   - Thinner/smaller design with rose icon
   - Label: "Views" + comma-formatted count
   - Fixed position, scrolls with viewport
   - Counter starts at 129,602, increments on load and randomly

3. **Navbar**
   - Spinning logo animation (360° rotation every 2 seconds)
   - Navigation links: Home, About, Films, Music, Events, Action, Shop
   - "Join Us" button links to Google Form

3. **Analytics System**
   - Lightweight anonymous tracking (page views, clicks)
   - Admin-only dashboard at `/admin/analytics`

4. **Footer**
   - Socialist rose SVG icon
   - Social links, copyright

## Architecture

```
/app/
├── .cpanel.yml             # Bluehost deployment config
├── public_html/            # Production build output
├── backend/
│   ├── server.py           # FastAPI (admin, posts, analytics)
│   └── .env                # Backend environment variables
└── frontend/
    └── src/
        ├── components/
        │   ├── Layout.jsx
        │   ├── RotatingLogo.jsx
        │   └── ViewCounterBadge.jsx
        ├── pages/
        │   ├── Home.jsx
        │   ├── AdminAnalytics.jsx
        │   └── Login.jsx
        └── lib/
            ├── api.js
            └── analytics.js
```

## Key API Endpoints
- `/api/seed` - Create initial admin (when ENABLE_SEED=true)
- `/api/login` - Admin authentication
- `/api/admin/update-credentials` - Change admin password
- `/api/analytics/track` - Store analytics events
- `/api/admin/analytics` - Fetch analytics data

## Database Schema (MongoDB)
- `users`: {email, password_hash, role, name}
- `posts`: {id, title, content, status, image_url}
- `analytics_events`: {id, timestamp, event_name, page_path, etc.}

## Admin Credentials
- Email: Set via `ADMIN_SEED_EMAIL` env var
- Password: Set via `ADMIN_SEED_PASSWORD` env var

## External Integrations
- Google Forms: Volunteer signups
- YouTube/Spotify: Content embeds
- ActBlue: Donation processing

---

## Backlog (P2)

### Code Cleanup
- Remove unused Supabase auth code
- Refactor backend/server.py into modules

### Potential Enhancements
- Social sharing buttons for posts
- Email newsletter signup
- Event calendar integration

---

*Last Updated: February 9, 2026*
