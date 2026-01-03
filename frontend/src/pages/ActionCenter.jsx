import { useState, useEffect } from 'react';
import { actionsAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Textarea } from '../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { HandHeart, FileSignature, Heart, Check, Users, Megaphone, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const ActionCenter = () => {
  const { isAuthenticated } = useAuth();
  const [actions, setActions] = useState([]);
  const [mySignups, setMySignups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [signupMessage, setSignupMessage] = useState('');
  const [signupDialogOpen, setSignupDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);

  useEffect(() => {
    loadActions();
    if (isAuthenticated) {
      loadMySignups();
    }
  }, [isAuthenticated]);

  const loadActions = async () => {
    try {
      const response = await actionsAPI.getAll();
      setActions(response.data);
    } catch (error) {
      console.error('Error loading actions:', error);
      toast.error('Failed to load actions');
    } finally {
      setLoading(false);
    }
  };

  const loadMySignups = async () => {
    try {
      const response = await actionsAPI.getMySignups();
      setMySignups(response.data.action_ids);
    } catch (error) {
      console.error('Error loading signups:', error);
    }
  };

  const handleSignup = async (actionId, withMessage = false) => {
    if (!isAuthenticated) {
      toast.error('Please login to take action');
      return;
    }

    const isSignedUp = mySignups.includes(actionId);
    
    try {
      if (isSignedUp) {
        await actionsAPI.cancelSignup(actionId);
        setMySignups(mySignups.filter(id => id !== actionId));
        toast.success('Action cancelled');
      } else {
        const data = withMessage && signupMessage ? { message: signupMessage } : {};
        await actionsAPI.signup(actionId, data);
        setMySignups([...mySignups, actionId]);
        toast.success('Thank you for taking action!');
        setSignupMessage('');
        setSignupDialogOpen(false);
      }
      await loadActions();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update signup');
    }
  };

  const openSignupDialog = (action) => {
    setSelectedAction(action);
    setSignupDialogOpen(true);
  };

  const getActionIcon = (type) => {
    switch (type) {
      case 'volunteer': return HandHeart;
      case 'petition': return FileSignature;
      case 'pledge': return Heart;
      default: return Megaphone;
    }
  };

  const getActionColor = (type) => {
    switch (type) {
      case 'volunteer': return 'bg-green-500';
      case 'petition': return 'bg-blue-500';
      case 'pledge': return 'bg-pp-magenta';
      default: return 'bg-pp-orange';
    }
  };

  const filterByType = (type) => {
    if (type === 'all') return actions;
    return actions.filter(a => a.action_type === type);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1728706613021-e447801e1ea6?w=1600)' }}
        />
        <div className="absolute inset-0 hero-gradient" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-primary font-extrabold text-4xl md:text-6xl text-white uppercase tracking-tight mb-4" data-testid="action-center-title">
            Action Center
          </h1>
          <p className="font-primary text-lg text-white/90 max-w-2xl mx-auto">
            Take action today. Volunteer, sign petitions, make pledges. Every action counts toward building a better community.
          </p>
        </div>
      </section>

      {/* Actions Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Tabs defaultValue="all" className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h2 className="font-campaign text-3xl md:text-4xl tracking-wider text-pp-magenta" data-testid="take-action-title">
              TAKE ACTION
            </h2>
            <TabsList className="bg-muted rounded-full p-1 border-2 border-black">
              <TabsTrigger 
                value="all" 
                className="rounded-full px-4 py-2 font-campaign data-[state=active]:bg-pp-magenta data-[state=active]:text-white"
                data-testid="tab-all"
              >
                ALL
              </TabsTrigger>
              <TabsTrigger 
                value="volunteer" 
                className="rounded-full px-4 py-2 font-campaign data-[state=active]:bg-green-500 data-[state=active]:text-white"
                data-testid="tab-volunteer"
              >
                VOLUNTEER
              </TabsTrigger>
              <TabsTrigger 
                value="petition" 
                className="rounded-full px-4 py-2 font-campaign data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                data-testid="tab-petition"
              >
                PETITIONS
              </TabsTrigger>
              <TabsTrigger 
                value="pledge" 
                className="rounded-full px-4 py-2 font-campaign data-[state=active]:bg-pp-magenta data-[state=active]:text-white"
                data-testid="tab-pledge"
              >
                PLEDGES
              </TabsTrigger>
            </TabsList>
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
            <>
              {['all', 'volunteer', 'petition', 'pledge'].map((tab) => (
                <TabsContent key={tab} value={tab}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filterByType(tab).map((action) => {
                      const Icon = getActionIcon(action.action_type);
                      const isSignedUp = mySignups.includes(action.id);
                      
                      return (
                        <Card 
                          key={action.id} 
                          className="bg-white rounded-3xl border-2 border-black overflow-hidden card-shadow transition-all duration-300"
                          data-testid={`action-card-${action.id}`}
                        >
                          <div className="relative h-48 overflow-hidden">
                            {action.image_url ? (
                              <img 
                                src={action.image_url} 
                                alt={action.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className={`w-full h-full ${getActionColor(action.action_type)} flex items-center justify-center`}>
                                <Icon className="w-16 h-16 text-white" />
                              </div>
                            )}
                            <Badge className={`absolute top-4 left-4 ${getActionColor(action.action_type)} text-white font-campaign uppercase`}>
                              {action.action_type}
                            </Badge>
                          </div>
                          <CardContent className="p-6">
                            <h3 className="font-primary font-bold text-xl mb-2">{action.title}</h3>
                            <p className="font-primary text-muted-foreground text-sm mb-4 line-clamp-3">
                              {action.description}
                            </p>
                            
                            <div className="flex items-center gap-2 mb-4">
                              <Users className="w-4 h-4 text-pp-magenta" />
                              <span className="font-primary text-sm font-semibold">
                                {action.participant_count} {action.action_type === 'petition' ? 'signatures' : 'participants'}
                              </span>
                            </div>
                            
                            {action.action_type === 'volunteer' ? (
                              <Dialog open={signupDialogOpen && selectedAction?.id === action.id} onOpenChange={(open) => {
                                setSignupDialogOpen(open);
                                if (!open) setSelectedAction(null);
                              }}>
                                <DialogTrigger asChild>
                                  <Button
                                    className={`w-full rounded-full font-bold px-6 py-2 border-2 border-black transition-all ${
                                      isSignedUp 
                                        ? 'bg-green-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                                        : 'bg-pp-magenta text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none'
                                    }`}
                                    onClick={() => isSignedUp ? handleSignup(action.id) : openSignupDialog(action)}
                                    data-testid={`action-button-${action.id}`}
                                  >
                                    {isSignedUp ? (
                                      <>
                                        <Check className="w-4 h-4 mr-2" />
                                        Signed Up
                                      </>
                                    ) : (
                                      <>
                                        <HandHeart className="w-4 h-4 mr-2" />
                                        Volunteer
                                      </>
                                    )}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="border-2 border-black rounded-3xl">
                                  <DialogHeader>
                                    <DialogTitle className="font-campaign text-2xl tracking-wider">
                                      Volunteer Sign Up
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4 mt-4">
                                    <p className="font-primary text-muted-foreground">
                                      Tell us a bit about yourself and why you want to volunteer (optional)
                                    </p>
                                    <Textarea
                                      placeholder="I want to volunteer because..."
                                      value={signupMessage}
                                      onChange={(e) => setSignupMessage(e.target.value)}
                                      className="border-2 border-black rounded-xl min-h-[100px]"
                                      data-testid="volunteer-message-input"
                                    />
                                    <Button
                                      className="w-full rounded-full bg-pp-magenta text-white font-bold py-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all"
                                      onClick={() => handleSignup(action.id, true)}
                                      data-testid="confirm-volunteer-button"
                                    >
                                      <Sparkles className="w-4 h-4 mr-2" />
                                      Confirm Sign Up
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            ) : (
                              <Button
                                className={`w-full rounded-full font-bold px-6 py-2 border-2 border-black transition-all ${
                                  isSignedUp 
                                    ? 'bg-green-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                                    : 'bg-pp-magenta text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none'
                                }`}
                                onClick={() => handleSignup(action.id)}
                                data-testid={`action-button-${action.id}`}
                              >
                                {isSignedUp ? (
                                  <>
                                    <Check className="w-4 h-4 mr-2" />
                                    {action.action_type === 'petition' ? 'Signed' : 'Pledged'}
                                  </>
                                ) : (
                                  <>
                                    <Icon className="w-4 h-4 mr-2" />
                                    {action.action_type === 'petition' ? 'Sign Petition' : 'Take Pledge'}
                                  </>
                                )}
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  
                  {filterByType(tab).length === 0 && (
                    <div className="text-center py-12">
                      <Megaphone className="w-16 h-16 text-pp-pink mx-auto mb-4" />
                      <p className="font-primary text-lg text-muted-foreground">
                        No {tab === 'all' ? 'actions' : tab + 's'} available right now. Check back soon!
                      </p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </>
          )}
        </Tabs>
      </section>

      {/* Impact Stats */}
      <section className="py-16 bg-pp-lavender">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-primary font-extrabold text-3xl md:text-4xl uppercase tracking-tight mb-12">
            Our Collective Impact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: HandHeart, label: 'Volunteer Hours', value: '10,000+' },
              { icon: FileSignature, label: 'Petition Signatures', value: '25,000+' },
              { icon: Heart, label: 'Pledges Made', value: '5,000+' },
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <stat.icon className="w-12 h-12 text-pp-magenta mb-4" />
                <p className="font-primary font-extrabold text-4xl md:text-5xl text-pp-magenta">
                  {stat.value}
                </p>
                <p className="font-primary text-lg text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ActionCenter;
