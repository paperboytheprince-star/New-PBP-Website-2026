import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventsAPI, actionsAPI, authAPI, postsAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Heart, Calendar, Megaphone, ArrowLeft, LogOut, Check, X, Key, FileText, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [myRsvps, setMyRsvps] = useState([]);
  const [mySignups, setMySignups] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [mySubmittedActions, setMySubmittedActions] = useState([]);
  const [events, setEvents] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('activity');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadData();
  }, [isAuthenticated, navigate]);

  const loadData = async () => {
    try {
      const [rsvpsRes, signupsRes, eventsRes, actionsRes, myPostsRes, myActionsRes] = await Promise.all([
        eventsAPI.getMyRsvps(),
        actionsAPI.getMySignups(),
        eventsAPI.getAll(),
        actionsAPI.getAll(),
        postsAPI.getMyPosts().catch(() => ({ data: [] })),
        actionsAPI.getMyActions().catch(() => ({ data: [] })),
      ]);
      
      setMyRsvps(rsvpsRes.data.event_ids);
      setMySignups(signupsRes.data.action_ids);
      setEvents(eventsRes.data);
      setActions(actionsRes.data);
      setMyPosts(myPostsRes.data);
      setMySubmittedActions(myActionsRes.data);
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
      toast.success('Action signup cancelled');
    } catch (error) {
      toast.error('Failed to cancel signup');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setChangingPassword(true);
    try {
      await authAPI.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const myEventsFiltered = events.filter(e => myRsvps.includes(e.id));
  const myActionsFiltered = actions.filter(a => mySignups.includes(a.id));
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500 text-white"><Check className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'pending':
        return <Badge className="bg-orange-500 text-white"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500 text-white"><X className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="activity" className="font-campaign">MY ACTIVITY</TabsTrigger>
          <TabsTrigger value="submissions" className="font-campaign">MY SUBMISSIONS</TabsTrigger>
          <TabsTrigger value="settings" className="font-campaign">SETTINGS</TabsTrigger>
        </TabsList>
        
        {/* Activity Tab */}
        <TabsContent value="activity">
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
                ) : myEventsFiltered.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-pp-pink mx-auto mb-3" />
                    <p className="font-primary text-muted-foreground">No RSVPs yet</p>
                    <Link to="/events">
                      <Button variant="link" className="text-pp-magenta mt-2">Browse Events</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myEventsFiltered.map(event => (
                      <div key={event.id} className="p-4 rounded-xl border-2 border-gray-200 flex justify-between items-center">
                        <div>
                          <h4 className="font-primary font-semibold">{event.title}</h4>
                          <p className="text-sm text-muted-foreground font-primary">
                            {format(parseISO(event.date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => cancelRsvp(event.id)}>
                          <X className="w-4 h-4 mr-1" />Cancel
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* My Action Signups */}
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
                ) : myActionsFiltered.length === 0 ? (
                  <div className="text-center py-8">
                    <Megaphone className="w-12 h-12 text-pp-pink mx-auto mb-3" />
                    <p className="font-primary text-muted-foreground">No action signups yet</p>
                    <Link to="/action">
                      <Button variant="link" className="text-pp-magenta mt-2">Browse Actions</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myActionsFiltered.map(action => (
                      <div key={action.id} className="p-4 rounded-xl border-2 border-gray-200 flex justify-between items-center">
                        <div>
                          <h4 className="font-primary font-semibold">{action.title}</h4>
                          <Badge variant="outline" className="text-xs mt-1">{action.action_type}</Badge>
                        </div>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => cancelSignup(action.id)}>
                          <X className="w-4 h-4 mr-1" />Leave
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Submissions Tab */}
        <TabsContent value="submissions">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* My Posts */}
            <Card className="rounded-3xl border-2 border-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-campaign text-2xl tracking-wider">
                  <FileText className="w-6 h-6 text-pp-magenta" />
                  MY POSTS
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full rounded-xl" />
                    ))}
                  </div>
                ) : myPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-pp-pink mx-auto mb-3" />
                    <p className="font-primary text-muted-foreground">No posts yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myPosts.map(post => (
                      <div key={post.id} className="p-4 rounded-xl border-2 border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-primary font-semibold">{post.title}</h4>
                          {getStatusBadge(post.status)}
                        </div>
                        <p className="text-sm text-muted-foreground font-primary line-clamp-2">{post.content}</p>
                        {post.status === 'rejected' && post.rejection_reason && (
                          <div className="mt-2 p-2 bg-red-50 rounded-lg text-sm text-red-600 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{post.rejection_reason}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* My Submitted Actions */}
            <Card className="rounded-3xl border-2 border-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-campaign text-2xl tracking-wider">
                  <Megaphone className="w-6 h-6 text-pp-magenta" />
                  SUBMITTED ACTIONS
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full rounded-xl" />
                    ))}
                  </div>
                ) : mySubmittedActions.length === 0 ? (
                  <div className="text-center py-8">
                    <Megaphone className="w-12 h-12 text-pp-pink mx-auto mb-3" />
                    <p className="font-primary text-muted-foreground">No submitted actions yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mySubmittedActions.map(action => (
                      <div key={action.id} className="p-4 rounded-xl border-2 border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-primary font-semibold">{action.title}</h4>
                          {getStatusBadge(action.status)}
                        </div>
                        <p className="text-sm text-muted-foreground font-primary line-clamp-2">{action.description}</p>
                        {action.status === 'rejected' && action.rejection_reason && (
                          <div className="mt-2 p-2 bg-red-50 rounded-lg text-sm text-red-600 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{action.rejection_reason}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card className="rounded-3xl border-2 border-black">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-campaign text-2xl tracking-wider">
                <Key className="w-6 h-6 text-pp-magenta" />
                CHANGE PASSWORD
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <div>
                  <Label htmlFor="currentPassword" className="font-primary">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    required
                    className="mt-1 border-2 border-black rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword" className="font-primary">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    required
                    minLength={8}
                    className="mt-1 border-2 border-black rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="font-primary">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    required
                    className="mt-1 border-2 border-black rounded-xl"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={changingPassword}
                  className="rounded-full bg-pp-magenta text-white font-bold px-6 py-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all"
                >
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
