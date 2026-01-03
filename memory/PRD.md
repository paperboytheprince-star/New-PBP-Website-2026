# Paperboy Prince Platform - PRD

## Original Problem Statement
Build a responsive web application called "Paperboy Prince Platform" - a culture-first political and creative platform for Paperboy Prince, combining art, campaign engagement, events, and community action.

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
- About, Films, Music static pages

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
- [x] About page with artist bio placeholder
- [x] Films page with YouTube embed placeholders
- [x] Music page with Spotify embed placeholders
- [x] Updated navigation with all pages

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
- Add actual artist photo to About page
- Add real YouTube embed URLs for Films page
- Add real Spotify embed URLs for Music page
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
- Analytics dashboard for admin

## Demo Credentials
- Admin: admin@paperboyprince.com / admin123

## Next Steps
1. Replace placeholder images/embeds with real content
2. Add Stripe integration when ready for payments
3. Implement image upload functionality
4. Build email notification sender for subscribers
