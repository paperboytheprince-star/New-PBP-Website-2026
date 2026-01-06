import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventsAPI, actionsAPI, authAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Heart, Calendar, Megaphone, ArrowLeft, LogOut, Check, X, Key } from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [myRsvps, setMyRsvps] = useState([]);
  const [mySignups, setMySignups] = useState([]);
  const [events, setEvents] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadData();
  }, [isAuthenticated, navigate]);

  const loadData = async () => {
    try {
      const [rsvpsRes, signupsRes, eventsRes, actionsRes] = await Promise.all([
        eventsAPI.getMyRsvps(),
        actionsAPI.getMySignups(),
        eventsAPI.getAll(),
        actionsAPI.getAll(),
      ]);
      
      setMyRsvps(rsvpsRes.data.event_ids);
      setMySignups(signupsRes.data.action_ids);
      setEvents(eventsRes.data);
      setActions(actionsRes.data);
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelRsvp = async (eventId) => {
    try {
      await eventsAPI.cancelRsvp(eventId);
      setMyRsvps(myRsvps.filter(id => id !== eventId));
      toast.success('RSVP cancelled');
    } catch (error) {
      toast.error('Failed to cancel RSVP');
    }
  };

  const cancelSignup = async (actionId) => {
    try {
      await actionsAPI.cancelSignup(actionId);
      setMySignups(mySignups.filter(id => id !== actionId));
      toast.success('Signup cancelled');
    } catch (error) {
      toast.error('Failed to cancel signup');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const myEvents = events.filter(e => myRsvps.includes(e.id));
  const myActions = actions.filter(a => mySignups.includes(a.id));

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Back Link */}
      <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 font-primary" data-testid="back-to-home">
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      {/* Profile Header */}
      <Card className="rounded-3xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(255,153,204,1)] mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-20 h-20 bg-pp-magenta rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <h1 className="font-primary font-extrabold text-3xl mb-1" data-testid="profile-name">
                {user?.name}
              </h1>
              <p className="font-primary text-muted-foreground">{user?.email}</p>
              {user?.is_admin && (
                <Badge className="mt-2 bg-pp-magenta text-white font-campaign">
                  ADMIN
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              className="rounded-full border-2 border-black px-6 hover:bg-red-50 hover:text-red-600 hover:border-red-600"
              onClick={handleLogout}
              data-testid="logout-button"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My RSVPs */}
        <Card className="rounded-3xl border-2 border-black">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-campaign text-2xl tracking-wider">
              <Calendar className="w-6 h-6 text-pp-magenta" />
              MY RSVPS
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : myEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-pp-pink mx-auto mb-3" />
                <p className="font-primary text-muted-foreground">No RSVPs yet</p>
                <Link to="/events">
                  <Button variant="link" className="text-pp-magenta mt-2">
                    Browse Events
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myEvents.map((event) => (
                  <div 
                    key={event.id}
                    className="flex items-center gap-4 p-4 bg-muted rounded-xl border-2 border-black"
                    data-testid={`rsvp-item-${event.id}`}
                  >
                    <div className="w-14 h-14 bg-pp-magenta rounded-xl flex flex-col items-center justify-center text-white">
                      <span className="font-campaign text-xl leading-none">
                        {format(parseISO(event.date), 'd')}
                      </span>
                      <span className="font-campaign text-xs leading-none">
                        {format(parseISO(event.date), 'MMM')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-primary font-bold">{event.title}</h4>
                      <p className="font-primary text-sm text-muted-foreground">
                        {event.location}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => cancelRsvp(event.id)}
                      data-testid={`cancel-rsvp-${event.id}`}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Actions */}
        <Card className="rounded-3xl border-2 border-black">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-campaign text-2xl tracking-wider">
              <Megaphone className="w-6 h-6 text-pp-magenta" />
              MY ACTIONS
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : myActions.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 text-pp-pink mx-auto mb-3" />
                <p className="font-primary text-muted-foreground">No actions taken yet</p>
                <Link to="/action">
                  <Button variant="link" className="text-pp-magenta mt-2">
                    Take Action
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myActions.map((action) => (
                  <div 
                    key={action.id}
                    className="flex items-center gap-4 p-4 bg-muted rounded-xl border-2 border-black"
                    data-testid={`action-item-${action.id}`}
                  >
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white ${
                      action.action_type === 'volunteer' ? 'bg-green-500' :
                      action.action_type === 'petition' ? 'bg-blue-500' : 'bg-pp-magenta'
                    }`}>
                      <Check className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-primary font-bold">{action.title}</h4>
                      <Badge variant="outline" className="mt-1 font-campaign text-xs uppercase">
                        {action.action_type}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => cancelSignup(action.id)}
                      data-testid={`cancel-action-${action.id}`}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
