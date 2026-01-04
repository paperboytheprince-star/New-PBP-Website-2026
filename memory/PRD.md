# Paperboy Prince Platform - PRD

## Original Problem Statement
Build a responsive web application called "Paperboy Prince Platform" - a culture-first political and creative platform for Paperboy Love Prince, combining art, campaign engagement, events, and community action.

## User Personas
1. **Community Members** - Young, digitally-native audience interested in political activism, art, and community events
2. **Volunteers** - People who want to take action through volunteering, signing petitions, and making pledges
3. **Fans** - People interested in Paperboy Prince's music, films, and art
4. **Admin (Paperboy Prince Team)** - Content managers who create posts, manage events, products, and actions

## Core Requirements (Static)
- Home Feed with posts (text, images, video links)
- Shop (Coming Soon state with cart ready for Stripe)
- Events with RSVP functionality
- Action Center (volunteer signups, petitions, pledges)
- User authentication (JWT email/password)
- Admin Dashboard with full CRUD capabilities
- About, Films, Music content pages

## Tech Stack
- Frontend: React + Tailwind CSS + Shadcn/UI
- Backend: FastAPI (Python)
- Database: MongoDB
- Authentication: JWT-based custom auth

## What's Been Implemented (January 2025)

### Phase 1 - MVP
- [x] Complete backend API with all CRUD endpoints
- [x] JWT authentication (register, login, admin login)
- [x] User management with admin role system
- [x] Posts system with author tracking
- [x] Products system (Coming Soon state)
- [x] Events with RSVP tracking
- [x] Actions with participant tracking (volunteer/petition/pledge)
- [x] Cart system ready for Stripe integration
- [x] Admin dashboard with stats and CRUD for all entities
- [x] Responsive design with Paperboy Prince branding
- [x] Demo data seeding
- [x] Profile page with user's RSVPs and signups

### Phase 2 - Content Pages & Notifications
- [x] "Notify Me" email collection system for shop launch
- [x] Admin dashboard: Subscribers tab with export CSV
- [x] Updated navigation with About, Films, Music links

### Phase 3 - Real Content
- [x] About page with actual artist photo and full bio
- [x] About page with political campaign stats and community impact
- [x] Films page with 5 YouTube video embeds (2022-2025)
- [x] Music page with Spotify artist embed
- [x] Music page with 6 albums (2016-2025) with Spotify embeds

## Content Details

### About Page
- Artist photo from bus pic
- Full bio covering heritage, education, political campaigns, community work
- Stats: ~100,000 votes, $4M+ food distributed, 50+ community fridges, 150+ nights housing

### Films (YouTube Embeds)
1. Paperboy Prince for Mayor 2025 Campaign Ad (2025)
2. Paperboy Prince is Love (2024)
3. Baddies For Paperboy Prince (2024)
4. I just Beat Joe Biden (2024)
5. Paperboy Love Prince Runs For Mayor (2022)

### Music (Spotify Embeds)
1. Themsterhood of the Traveling Drip (2025)
2. God's Twin (2023) - pending Spotify link
3. Shrek's Family Reunion (2022)
4. Lil Dennis Rodman (2018)
5. Middle School Food Fight (2017)
6. Holiday Love (2016)

## Admin Emails
- admin@paperboyprince.com
- paperboytheprince@gmail.com

## Branding
- Primary Color: #FF1493 (Deep Pink/Magenta)
- Secondary: #FF99CC (Bubbly Pink)
- Fonts: Poppins (primary), Fredoka One (accent), Bebas Neue (campaign)
- Style: Neo-Brutalist Pop with hard shadows

## Prioritized Backlog

### P0 (Critical - Next)
- Add Spotify link for "God's Twin" album when available
- Stripe payment integration for shop

### P1 (High)
- Email verification for new users
- Password reset functionality
- Image upload for posts/products/events
- Send email notifications when shop launches

### P2 (Medium)
- Search and filter for feed
- Social sharing for posts and events
- Comments on posts
- Event calendar view

## Demo Credentials
- Admin: admin@paperboyprince.com / admin123
