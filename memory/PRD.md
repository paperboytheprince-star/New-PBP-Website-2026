# Paperboy Prince Platform - PRD

## Original Problem Statement
Build a responsive web application called "Paperboy Prince Platform" - a culture-first political and creative platform for Paperboy Prince, combining art, campaign engagement, events, and community action.

## User Personas
1. **Community Members** - Young, digitally-native audience interested in political activism, art, and community events
2. **Volunteers** - People who want to take action through volunteering, signing petitions, and making pledges
3. **Admin (Paperboy Prince Team)** - Content managers who create posts, manage events, products, and actions

## Core Requirements (Static)
- Home Feed with posts (text, images, video links)
- Shop (Coming Soon state with cart ready for Stripe)
- Events with RSVP functionality
- Action Center (volunteer signups, petitions, pledges)
- User authentication (JWT email/password)
- Admin Dashboard with full CRUD capabilities

## Tech Stack
- Frontend: React + Tailwind CSS + Shadcn/UI
- Backend: FastAPI (Python)
- Database: MongoDB
- Authentication: JWT-based custom auth

## What's Been Implemented (January 2025)
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

## Branding
- Primary Color: #FF1493 (Deep Pink/Magenta)
- Secondary: #FF99CC (Bubbly Pink)
- Fonts: Poppins (primary), Fredoka One (accent), Bebas Neue (campaign)
- Style: Neo-Brutalist Pop with hard shadows

## Prioritized Backlog

### P0 (Critical - Next)
- Stripe payment integration for shop
- Email verification for new users
- Password reset functionality

### P1 (High)
- Image upload for posts/products/events
- Search and filter for feed
- Social sharing for posts and events
- Email notifications for RSVPs and signups

### P2 (Medium)
- Comments on posts
- Event calendar view
- Analytics dashboard for admin
- Export participant data (CSV)

## Demo Credentials
- Admin: admin@paperboyprince.com / admin123

## Next Steps
1. Add Stripe integration when ready for payments
2. Implement image upload functionality
3. Add email notifications system
4. Build mobile app version
