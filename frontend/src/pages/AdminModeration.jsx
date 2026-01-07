import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postsAPI, actionsAPI, notificationsAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { ArrowLeft, FileText, Megaphone, Check, X, Clock, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';

const AdminModeration = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const [pendingPosts, setPendingPosts] = useState([]);
  const [pendingActions, setPendingActions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  
  // Moderation dialog state
  const [moderationDialog, setModerationDialog] = useState({ open: false, type: null, item: null, action: null });
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isAdmin) {
      navigate('/');
      toast.error('Admin access required');
      return;
    }
    loadData();
  }, [isAuthenticated, isAdmin, navigate, authLoading]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [postsRes, actionsRes, notifRes, unreadRes] = await Promise.all([
        postsAPI.getPending(),
        actionsAPI.getPending(),
        notificationsAPI.getAll(),
        notificationsAPI.getUnreadCount(),
      ]);
      setPendingPosts(postsRes.data);
      setPendingActions(actionsRes.data);
      setNotifications(notifRes.data);
      setUnreadCount(unreadRes.data.unread_count);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load pending items');
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async () => {
    if (!moderationDialog.item || !moderationDialog.action) return;
    
    if (moderationDialog.action === 'reject' && !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    
    setProcessing(true);
    try {
      const api = moderationDialog.type === 'post' ? postsAPI : actionsAPI;
      await api.moderate(
        moderationDialog.item.id, 
        moderationDialog.action,
        moderationDialog.action === 'reject' ? rejectionReason : null
      );
      
      toast.success(`${moderationDialog.type === 'post' ? 'Post' : 'Action'} ${moderationDialog.action}d successfully`);
      setModerationDialog({ open: false, type: null, item: null, action: null });
      setRejectionReason('');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to moderate item');
    } finally {
      setProcessing(false);
    }
  };

  const openModerationDialog = (type, item, action) => {
    setModerationDialog({ open: true, type, item, action });
    setRejectionReason('');
  };

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setUnreadCount(0);
      loadData();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark notifications as read');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return format(parseISO(dateStr), 'MMM d, yyyy h:mm a');
    } catch {
      return dateStr;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Back Link */}
      <Link 
        to="/admin/dashboard" 
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 font-primary"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <Card className="rounded-3xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(255,153,204,1)] mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-3 font-campaign text-3xl tracking-wider">
            <Clock className="w-8 h-8 text-pp-magenta" />
            MODERATION QUEUE
          </CardTitle>
          <div className="flex items-center gap-4">
            <Badge className="bg-orange-500 text-white font-campaign">
              {pendingPosts.length + pendingActions.length} PENDING
            </Badge>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllRead}
                className="flex items-center gap-2 rounded-full border-2 border-black"
              >
                <Bell className="w-4 h-4" />
                {unreadCount} New
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Posts ({pendingPosts.length})
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex items-center gap-2">
            <Megaphone className="w-4 h-4" />
            Actions ({pendingActions.length})
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Pending Posts */}
        <TabsContent value="posts">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          ) : pendingPosts.length === 0 ? (
            <Card className="rounded-3xl border-2 border-black">
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-pp-pink mx-auto mb-3" />
                <p className="font-primary text-muted-foreground">No pending posts to review</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingPosts.map((post) => (
                <Card key={post.id} className="rounded-xl border-2 border-black">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-campaign text-xl tracking-wider mb-2">{post.title}</h3>
                        <p className="font-primary text-muted-foreground mb-3 line-clamp-2">{post.content}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground font-primary">
                          <span>By: {post.author_name}</span>
                          <span>•</span>
                          <span>{formatDate(post.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          className="bg-green-600 text-white hover:bg-green-700 rounded-full border-2 border-black"
                          onClick={() => openModerationDialog('post', post, 'approve')}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="rounded-full border-2 border-black"
                          onClick={() => openModerationDialog('post', post, 'reject')}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Pending Actions */}
        <TabsContent value="actions">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          ) : pendingActions.length === 0 ? (
            <Card className="rounded-3xl border-2 border-black">
              <CardContent className="p-12 text-center">
                <Megaphone className="w-12 h-12 text-pp-pink mx-auto mb-3" />
                <p className="font-primary text-muted-foreground">No pending actions to review</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingActions.map((action) => (
                <Card key={action.id} className="rounded-xl border-2 border-black">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-campaign text-xl tracking-wider">{action.title}</h3>
                          <Badge variant="outline" className="font-campaign text-xs">
                            {action.action_type}
                          </Badge>
                        </div>
                        <p className="font-primary text-muted-foreground mb-3 line-clamp-2">{action.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground font-primary">
                          <span>By: {action.author_name}</span>
                          <span>•</span>
                          <span>{formatDate(action.created_at)}</span>
                          {action.location && (
                            <>
                              <span>•</span>
                              <span>{action.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          className="bg-green-600 text-white hover:bg-green-700 rounded-full border-2 border-black"
                          onClick={() => openModerationDialog('action', action, 'approve')}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="rounded-full border-2 border-black"
                          onClick={() => openModerationDialog('action', action, 'reject')}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <Card className="rounded-3xl border-2 border-black">
              <CardContent className="p-12 text-center">
                <Bell className="w-12 h-12 text-pp-pink mx-auto mb-3" />
                <p className="font-primary text-muted-foreground">No notifications</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {notifications.map((notif) => (
                <Card 
                  key={notif.id} 
                  className={`rounded-xl border-2 ${notif.read_at ? 'border-gray-200 bg-gray-50' : 'border-black bg-pp-pink/10'}`}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-primary">{notif.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(notif.created_at)}</p>
                      </div>
                      {!notif.read_at && (
                        <Badge className="bg-pp-magenta text-white">NEW</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Moderation Dialog */}
      <Dialog open={moderationDialog.open} onOpenChange={(open) => !open && setModerationDialog({ open: false, type: null, item: null, action: null })}>
        <DialogContent className="border-2 border-black rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-campaign text-2xl tracking-wider">
              {moderationDialog.action === 'approve' ? 'APPROVE' : 'REJECT'} {moderationDialog.type?.toUpperCase()}
            </DialogTitle>
            <DialogDescription className="font-primary">
              {moderationDialog.action === 'approve' 
                ? `This ${moderationDialog.type} will be visible on the public feed.`
                : `Please provide a reason for rejecting this ${moderationDialog.type}.`}
            </DialogDescription>
          </DialogHeader>
          
          {moderationDialog.item && (
            <div className="py-4">
              <p className="font-campaign text-lg">{moderationDialog.item.title}</p>
              <p className="font-primary text-sm text-muted-foreground mt-1">
                By {moderationDialog.item.author_name}
              </p>
            </div>
          )}
          
          {moderationDialog.action === 'reject' && (
            <div className="space-y-2">
              <label className="font-primary text-sm font-medium">Rejection Reason *</label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this submission is being rejected..."
                className="border-2 border-black rounded-xl"
              />
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setModerationDialog({ open: false, type: null, item: null, action: null })}
              className="rounded-full border-2 border-black"
            >
              Cancel
            </Button>
            <Button
              onClick={handleModerate}
              disabled={processing || (moderationDialog.action === 'reject' && !rejectionReason.trim())}
              className={`rounded-full border-2 border-black ${
                moderationDialog.action === 'approve' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              } text-white`}
            >
              {processing ? 'Processing...' : (moderationDialog.action === 'approve' ? 'Approve' : 'Reject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminModeration;
