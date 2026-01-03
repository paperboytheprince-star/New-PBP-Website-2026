import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI, adminAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { ArrowRight, Heart, Users, Calendar, Megaphone, Play } from 'lucide-react';
import { toast } from 'sonner';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Try to seed data first
      try {
        await adminAPI.seed();
      } catch {
        // Already seeded, ignore
      }
      
      const response = await postsAPI.getAll();
      setPosts(response.data);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="noise-overlay">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1682447450943-c5785c84d047?w=1600)' }}
        />
        <div className="absolute inset-0 hero-gradient" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <h1 className="hero-text font-primary font-extrabold text-white uppercase tracking-tight mb-6 drop-shadow-lg" data-testid="hero-title">
            Join The<br />Love Revolution
          </h1>
          <p className="font-primary text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8">
            Together we build community, create art, and make change happen. Everyone is welcome.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/action" data-testid="hero-cta-action">
              <Button className="rounded-full bg-white text-black font-bold px-8 py-6 text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all border-2 border-black uppercase tracking-wider">
                Take Action
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/events" data-testid="hero-cta-events">
              <Button className="rounded-full bg-transparent text-white font-bold px-8 py-6 text-lg border-2 border-white hover:bg-white/10 transition-all uppercase tracking-wider">
                Upcoming Events
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
              SPREAD LOVE ★ PAPERBOY PRINCE ★ THE FUTURE IS NOW ★ JOIN THE MOVEMENT ★
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
              { icon: Calendar, label: 'Events Held', value: '100+' },
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
            LATEST UPDATES
          </h2>
          <div className="love-beam w-24 h-1 hidden md:block" />
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
            {posts.map((post) => (
              <Card 
                key={post.id} 
                className="bg-white rounded-3xl border-2 border-black overflow-hidden card-shadow transition-all duration-300 animate-fadeInUp opacity-0"
                data-testid={`post-card-${post.id}`}
              >
                {post.image_url && (
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={post.image_url} 
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                    {post.video_url && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="w-14 h-14 rounded-full bg-pp-magenta flex items-center justify-center">
                          <Play className="w-6 h-6 text-white fill-white ml-1" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="font-primary font-bold text-xl mb-3">{post.title}</h3>
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
            ))}
          </div>
        )}

        {posts.length === 0 && !loading && (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-pp-pink mx-auto mb-4" />
            <p className="font-primary text-lg text-muted-foreground">
              No posts yet. Check back soon!
            </p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-pp-lavender">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-primary font-extrabold text-4xl md:text-5xl uppercase tracking-tight mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="font-primary text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of community members taking action every day. Your voice matters.
          </p>
          <Link to="/register" data-testid="cta-register">
            <Button className="rounded-full bg-pp-magenta text-white font-bold px-10 py-6 text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all border-2 border-black uppercase tracking-wider">
              Join the Movement
              <Heart className="ml-2 w-5 h-5 fill-white" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
