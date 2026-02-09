import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI, DEFAULT_POST_IMAGE, FEATURES } from '../lib/api';
import { trackClick } from '../lib/analytics';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import ViewCounterBadge from '../components/ViewCounterBadge';
import { ArrowRight, Heart, Users, Calendar, Megaphone, Play, Music2, DollarSign, FileText } from 'lucide-react';

// Google Form URL for volunteer signup
const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScZbG2bCzNGf6AAaYzV9y8d9aVOJxct7El-m1MT92IlkDOy0w/viewform?usp=preview';

// Helper to get post image URL with fallback
const getPostImageUrl = (imageUrl) => {
  if (!imageUrl) return DEFAULT_POST_IMAGE;
  if (imageUrl.startsWith('/api/uploads/') && process.env.REACT_APP_BACKEND_URL) {
    return `${process.env.REACT_APP_BACKEND_URL}${imageUrl}`;
  }
  return imageUrl;
};

// Shuffle array (Fisher-Yates)
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // ALL hero images - in original order for reference
  const allHeroImages = [
    // Index 0: Original hero image 1
    'https://customer-assets.emergentagent.com/job_prince-engage/artifacts/wdi4o708_IMG_5791_Original.jpg',
    // Index 1: Original hero image 2
    'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1600',
    // Index 2: Third image (DSC01894) - THIS SHOULD BE FIRST
    'https://customer-assets.emergentagent.com/job_content-hub-661/artifacts/50pqt87v_DSC01894.JPEG',
    // Index 3+: Rest of the images
    'https://customer-assets.emergentagent.com/job_content-hub-661/artifacts/82b4ughh_DSC01891.JPEG',
    'https://customer-assets.emergentagent.com/job_content-hub-661/artifacts/q60n7tma_DSC01881.JPEG',
    'https://customer-assets.emergentagent.com/job_content-hub-661/artifacts/b37eq0uq_DSC01861.JPEG',
    'https://customer-assets.emergentagent.com/job_content-hub-661/artifacts/9br0kprf_DSC01857.JPEG',
    'https://customer-assets.emergentagent.com/job_content-hub-661/artifacts/pe6nypo0_DSC01816.JPEG',
    'https://customer-assets.emergentagent.com/job_content-hub-661/artifacts/6yibnud5_DSC01817.JPEG',
    'https://customer-assets.emergentagent.com/job_content-hub-661/artifacts/hd5i95jx_DSC01827.JPEG',
  ];

  // Reordered hero images: third image first, then randomize the rest
  const heroImages = useMemo(() => {
    // Third image (index 2) goes first
    const firstImage = allHeroImages[2];
    // Get all other images (excluding the third)
    const otherImages = [...allHeroImages.slice(0, 2), ...allHeroImages.slice(3)];
    // Shuffle the other images
    const shuffledOthers = shuffleArray(otherImages);
    // Return with first image at start
    return [firstImage, ...shuffledOthers];
  }, []);

  useEffect(() => {
    loadData();
    // Rotate every 5 seconds (between 4-6 as requested)
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(slideInterval);
  }, [heroImages.length]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await postsAPI.getLatest();
      setPosts(response.data || []);
    } catch (err) {
      console.warn('Using static content:', err.message);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVolunteerClick = () => {
    trackClick('volunteer_hero', '/');
  };

  const handleDonateClick = () => {
    trackClick('donate_hero', '/');
  };

  const handleMusicClick = () => {
    trackClick('music_hero', '/');
  };

  return (
    <div className="noise-overlay">
      {/* View Counter Badge - overlaid on hero */}
      <ViewCounterBadge />

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {heroImages.map((img, idx) => (
          <div 
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              currentSlide === idx ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={img}
              alt={`Hero background ${idx + 1}`}
              className="w-full h-full object-cover"
              style={{ objectPosition: '50% 30%' }}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-br from-pp-magenta/80 via-pp-pink/70 to-pp-magenta/80" />
        
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentSlide === idx ? 'bg-white w-6' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <h1 className="hero-text font-primary font-extrabold text-white uppercase tracking-tight mb-6 drop-shadow-lg" data-testid="hero-title">
            Paperboy Prince<br />2026
          </h1>
          <p className="font-primary text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8">
            Together we build community, create art, and make change happen. Everyone is welcome.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* VOLUNTEER button - opens Google Form */}
            <a 
              href={GOOGLE_FORM_URL}
              target="_blank" 
              rel="noopener noreferrer"
              onClick={handleVolunteerClick}
              data-testid="hero-cta-volunteer"
            >
              <Button className="rounded-full bg-white text-black font-bold px-8 py-6 text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all border-2 border-black uppercase tracking-wider">
                Volunteer
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </a>
            <a 
              href="https://secure.actblue.com/donate/paperboy-love-prince-2" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={handleDonateClick}
              data-testid="hero-cta-donate"
            >
              <Button className="rounded-full bg-pp-magenta text-white font-bold px-8 py-6 text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all border-2 border-black uppercase tracking-wider">
                <DollarSign className="mr-2 w-5 h-5" />
                Donate
              </Button>
            </a>
            <Link to="/music" onClick={handleMusicClick} data-testid="hero-cta-music">
              <Button className="rounded-full bg-transparent text-white font-bold px-8 py-6 text-lg border-2 border-white hover:bg-white/10 transition-all uppercase tracking-wider">
                <Music2 className="mr-2 w-5 h-5" />
                Music
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="bg-pp-magenta py-3 overflow-hidden border-y-2 border-black">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="font-campaign text-xl text-white tracking-widest mx-8">
              SPREAD LOVE ★ PAPERBOY PRINCE 2026 ★ THE FUTURE IS NOW ★ JOIN THE MOVEMENT ★
            </span>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <section className="py-12 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Heart, label: 'Community Members', value: '5,000+' },
              { icon: Users, label: 'Volunteers', value: '500+' },
              { icon: Calendar, label: 'Events Held', value: '500+' },
              { icon: Megaphone, label: 'Actions Taken', value: '10,000+' },
            ].map((stat, idx) => (
              <Card 
                key={idx} 
                className="bg-white rounded-2xl border-2 border-black p-4 text-center shadow-[4px_4px_0px_0px_rgba(255,153,204,1)]"
              >
                <stat.icon className="w-8 h-8 text-pp-magenta mx-auto mb-2" />
                <p className="font-primary font-extrabold text-2xl md:text-3xl">{stat.value}</p>
                <p className="font-primary text-sm text-muted-foreground">{stat.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feed Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-campaign text-3xl md:text-4xl tracking-wider text-pp-magenta" data-testid="feed-title">
            LATEST POSTS
          </h2>
          {FEATURES.DYNAMIC_POSTS && posts.length > 0 && (
            <Link to="/posts" className="hidden md:flex items-center gap-2 text-pp-magenta hover:text-pp-magenta/80 font-primary font-semibold transition-colors">
              View All Posts
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="rounded-3xl border-2 border-black overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
            {posts.map((post) => {
              const PostWrapper = FEATURES.DYNAMIC_POSTS ? Link : 'div';
              const wrapperProps = FEATURES.DYNAMIC_POSTS ? { to: `/posts/${post.id}` } : {};
              
              return (
                <PostWrapper 
                  key={post.id} 
                  {...wrapperProps}
                  data-testid={`post-card-${post.id}`}
                >
                  <Card 
                    className="bg-white rounded-3xl border-2 border-black overflow-hidden card-shadow transition-all duration-300 animate-fadeInUp opacity-0 hover:border-pp-magenta hover:shadow-lg group h-full"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={getPostImageUrl(post.image_url)} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = DEFAULT_POST_IMAGE;
                        }}
                      />
                      {post.video_url && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="w-14 h-14 rounded-full bg-pp-magenta flex items-center justify-center">
                            <Play className="w-6 h-6 text-white fill-white ml-1" />
                          </div>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-primary font-bold text-xl mb-3 group-hover:text-pp-magenta transition-colors">{post.title}</h3>
                      <p className="font-primary text-muted-foreground line-clamp-3 mb-4">
                        {post.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-primary text-sm text-pp-magenta font-semibold">
                          {post.author_name}
                        </span>
                        <span className="font-primary text-xs text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </PostWrapper>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 px-4 bg-muted rounded-3xl border-2 border-dashed border-gray-300">
            <FileText className="w-16 h-16 text-pp-pink mx-auto mb-4" />
            <p className="font-primary text-lg text-muted-foreground mb-2">
              Updates coming soon!
            </p>
            <p className="font-primary text-sm text-muted-foreground">
              Check back for the latest news and community updates.
            </p>
          </div>
        )}

        {/* View All Posts Button */}
        {FEATURES.DYNAMIC_POSTS && posts.length > 0 && (
          <div className="text-center mt-8">
            <Link to="/posts">
              <Button className="rounded-full bg-pp-magenta text-white font-bold px-8 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all border-2 border-black">
                View All Posts
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* CTA Section - Updated to use Google Form */}
      <section className="py-20 bg-pp-lavender">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-primary font-extrabold text-4xl md:text-5xl uppercase tracking-tight mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="font-primary text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of community members taking action every day. Your voice matters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href={GOOGLE_FORM_URL}
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => trackClick('volunteer_cta', '/')}
              data-testid="cta-volunteer"
            >
              <Button className="rounded-full bg-pp-magenta text-white font-bold px-10 py-6 text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all border-2 border-black uppercase tracking-wider">
                Join the Movement
                <Heart className="ml-2 w-5 h-5 fill-white" />
              </Button>
            </a>
            <a 
              href="https://secure.actblue.com/donate/paperboy-love-prince-2" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => trackClick('donate_cta', '/')}
            >
              <Button className="rounded-full bg-white text-pp-magenta font-bold px-10 py-6 text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all border-2 border-black uppercase tracking-wider">
                <DollarSign className="mr-2 w-5 h-5" />
                Donate Now
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
