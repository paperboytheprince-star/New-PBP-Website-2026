// Static data for the website - used when backend is unavailable
// This allows the site to work as a standalone static website

export const STATIC_POSTS = [
  {
    id: "static-1",
    title: "Welcome to Paperboy Prince 2026",
    content: "Together we build community, create art, and make change happen. Everyone is welcome to join our movement for a better future. We believe in the power of love, unity, and collective action to transform our communities.",
    image_url: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800",
    author_name: "Paperboy Prince",
    created_at: "2025-01-01T00:00:00Z",
    status: "approved",
    comment_count: 0
  },
  {
    id: "static-2", 
    title: "Join the Movement",
    content: "Be part of something bigger than yourself. Our campaign is built on love, community, and the belief that everyone deserves a voice. Together, we can create real change in Brooklyn and beyond.",
    image_url: "https://images.unsplash.com/photo-1555952494-efd681c7e3f9?w=800",
    author_name: "Paperboy Prince",
    created_at: "2025-01-01T00:00:00Z",
    status: "approved",
    comment_count: 0
  },
  {
    id: "static-3",
    title: "Community First",
    content: "Every great movement starts with people coming together. We're building a campaign that puts community needs first - housing, healthcare, education, and opportunity for all.",
    image_url: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800",
    author_name: "Paperboy Prince",
    created_at: "2025-01-01T00:00:00Z",
    status: "approved",
    comment_count: 0
  }
];

export const STATIC_EVENTS = [
  {
    id: "static-event-1",
    title: "Community Town Hall",
    description: "Join us for an open discussion about the issues that matter most to our community. Everyone's voice matters.",
    date: "2026-02-15",
    location: "Brooklyn Community Center",
    image_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
    rsvp_count: 0
  },
  {
    id: "static-event-2",
    title: "Neighborhood Cleanup Day",
    description: "Let's come together to beautify our streets and parks. Bring gloves and your community spirit!",
    date: "2026-02-22",
    location: "Prospect Park",
    image_url: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800",
    rsvp_count: 0
  }
];

export const STATIC_ACTIONS = [
  {
    id: "static-action-1",
    title: "Register to Vote",
    description: "Make your voice heard! Register to vote and help shape the future of our community.",
    action_type: "pledge",
    image_url: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800",
    action_url: "https://vote.gov",
    participant_count: 0
  },
  {
    id: "static-action-2",
    title: "Volunteer with Us",
    description: "Join our team of dedicated volunteers working to make Brooklyn a better place for everyone.",
    action_type: "volunteer",
    image_url: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800",
    participant_count: 0
  }
];

// Check if we're in static-only mode (no backend available)
export const isStaticMode = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  return !backendUrl || backendUrl === '' || backendUrl === 'undefined';
};

// Feature flags
// AUTH is now always enabled via Supabase (deployment-safe)
// Other features depend on backend availability
export const FEATURES = {
  // Auth is always available via Supabase
  AUTH_ENABLED: true,
  // These features still require backend
  COMMENTS_ENABLED: !isStaticMode(),
  ADMIN_ENABLED: !isStaticMode(),
  DYNAMIC_POSTS: !isStaticMode(),
  RSVP_ENABLED: !isStaticMode(),
  ACTION_SIGNUP_ENABLED: !isStaticMode(),
};
