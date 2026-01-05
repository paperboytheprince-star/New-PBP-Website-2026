# Paperboy Prince Platform - PRD

## Original Problem Statement
Build a responsive web application called "Paperboy Prince Platform" - a culture-first political and creative platform for Paperboy Love Prince, combining art, campaign engagement, events, and community action.

## User Personas
1. **Community Members** - Young, digitally-native audience interested in political activism, art, and community events
2. **Volunteers** - People who want to take action through volunteering, signing petitions, and making pledges
3. **Fans** - People interested in Paperboy Prince's music, films, and art
4. **Admin (Paperboy Prince Team)** - Content managers who create posts, manage events, products, and actions

## Tech Stack
- Frontend: React + Tailwind CSS + Shadcn/UI
- Backend: FastAPI (Python)
- Database: MongoDB
- Authentication: JWT-based custom auth (unified login for all users)

## What's Been Implemented (January 2025)

### Phase 1 - MVP
- [x] Complete backend API with all CRUD endpoints
- [x] JWT authentication (unified login - admins use same flow as users)
- [x] Role-based access control (admin tools hidden from non-admin users)
- [x] Posts system with author tracking
- [x] Products system (Coming Soon state)
- [x] Events with RSVP tracking
- [x] Actions with participant tracking (volunteer/petition/pledge)
- [x] Cart system ready for Stripe integration
- [x] Admin dashboard with stats and CRUD for all entities

### Phase 2 - Content Pages & Notifications
- [x] "Notify Me" email collection system for shop launch
- [x] Admin dashboard: Subscribers tab with export CSV
- [x] About, Films, Music pages with real content

### Phase 3 - Campaign Updates (Latest)
- [x] Homepage hero: "Paperboy Prince 2026" with new hero image + slideshow
- [x] Pink-toned visual filter on hero
- [x] Hero buttons: Take Action, Donate (ActBlue), Music
- [x] God's Twin album added to Music page with Spotify embed
- [x] About page: "Congress and New York State Assembly District 54"
- [x] Removed separate admin login - unified authentication flow

## Current Campaign
**Running for:** Congress and New York State Assembly District 54 (2026)

**Donation Link:** https://secure.actblue.com/donate/paperboy-love-prince-2

## Content Details

### Films (YouTube Embeds)
1. Paperboy Prince for Mayor 2025 Campaign Ad (2025)
2. Paperboy Prince is Love (2024)
3. Baddies For Paperboy Prince (2024)
4. I just Beat Joe Biden (2024)
5. Paperboy Love Prince Runs For Mayor (2022)

### Music (Spotify Embeds) - All 6 albums now have embeds
1. Themsterhood of the Traveling Drip (2025)
2. God's Twin (2023) ✓ Now has Spotify link
3. Shrek's Family Reunion (2022)
4. Lil Dennis Rodman (2018)
5. Middle School Food Fight (2017)
6. Holiday Love (2016)

## Admin Emails
- admin@paperboyprince.com
- paperboytheprince@gmail.com

## Authentication Flow
- All users (including admins) login via /login
- /admin redirects to /login
- Admin access determined by role after login
- Admin dashboard only accessible to users with is_admin: true

## Branding
- Primary Color: #FF1493 (Deep Pink/Magenta)
- Secondary: #FF99CC (Bubbly Pink)
- Fonts: Poppins (primary), Fredoka One (accent), Bebas Neue (campaign)

## Prioritized Backlog

### P0 (Critical - Next)
- Stripe payment integration for shop

### P1 (High)
- Email verification for new users
- Password reset functionality
- Image upload for posts/products/events
- Send email notifications when shop launches

### P2 (Medium)
- Social sharing for posts and events
- Comments on posts
- Event calendar view

## Demo Credentials
- Admin: admin@paperboyprince.com / admin123
