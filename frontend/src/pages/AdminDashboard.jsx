import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI, postsAPI, productsAPI, eventsAPI, actionsAPI, notifyAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { 
  Heart, Users, ShoppingBag, Calendar, Megaphone, FileText, 
  Plus, Edit2, Trash2, ArrowLeft, LogOut, BarChart3, Check, Bell, Mail
} from 'lucide-react';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [products, setProducts] = useState([]);
  const [events, setEvents] = useState([]);
  const [actions, setActions] = useState([]);
  const [users, setUsers] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isAdmin) {
      toast.error('Admin access required');
      navigate('/');
      return;
    }
    loadAllData();
  }, [isAuthenticated, isAdmin, navigate]);

  const loadAllData = async () => {
    try {
      const [statsRes, postsRes, productsRes, eventsRes, actionsRes, usersRes, subscribersRes] = await Promise.all([
        adminAPI.getStats(),
        postsAPI.getAll(),
        productsAPI.getAll(),
        eventsAPI.getAll(),
        actionsAPI.getAll(),
        adminAPI.getUsers(),
        notifyAPI.getSubscribers(),
      ]);
      
      setStats(statsRes.data);
      setPosts(postsRes.data);
      setProducts(productsRes.data);
      setEvents(eventsRes.data);
      setActions(actionsRes.data);
      setUsers(usersRes.data);
      setSubscribers(subscribersRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Post CRUD
  const [postForm, setPostForm] = useState({ title: '', content: '', image_url: '', video_url: '' });
  
  const savePost = async () => {
    try {
      if (editItem) {
        await postsAPI.update(editItem.id, postForm);
        toast.success('Post updated');
      } else {
        await postsAPI.create(postForm);
        toast.success('Post created');
      }
      setDialogOpen(false);
      setEditItem(null);
      setPostForm({ title: '', content: '', image_url: '', video_url: '' });
      loadAllData();
    } catch (error) {
      toast.error('Failed to save post');
    }
  };

  const deletePost = async (id) => {
    if (!confirm('Delete this post?')) return;
    try {
      await postsAPI.delete(id);
      toast.success('Post deleted');
      loadAllData();
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  // Product CRUD
  const [productForm, setProductForm] = useState({ title: '', description: '', price: 0, image_url: '', available: false });
  
  const saveProduct = async () => {
    try {
      if (editItem) {
        await productsAPI.update(editItem.id, productForm);
        toast.success('Product updated');
      } else {
        await productsAPI.create(productForm);
        toast.success('Product created');
      }
      setDialogOpen(false);
      setEditItem(null);
      setProductForm({ title: '', description: '', price: 0, image_url: '', available: false });
      loadAllData();
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await productsAPI.delete(id);
      toast.success('Product deleted');
      loadAllData();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  // Event CRUD
  const [eventForm, setEventForm] = useState({ title: '', description: '', date: '', location: '', image_url: '' });
  
  const saveEvent = async () => {
    try {
      if (editItem) {
        await eventsAPI.update(editItem.id, eventForm);
        toast.success('Event updated');
      } else {
        await eventsAPI.create(eventForm);
        toast.success('Event created');
      }
      setDialogOpen(false);
      setEditItem(null);
      setEventForm({ title: '', description: '', date: '', location: '', image_url: '' });
      loadAllData();
    } catch (error) {
      toast.error('Failed to save event');
    }
  };

  const deleteEvent = async (id) => {
    if (!confirm('Delete this event?')) return;
    try {
      await eventsAPI.delete(id);
      toast.success('Event deleted');
      loadAllData();
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  // Action CRUD
  const [actionForm, setActionForm] = useState({ title: '', description: '', action_type: 'volunteer', image_url: '' });
  
  const saveAction = async () => {
    try {
      if (editItem) {
        await actionsAPI.update(editItem.id, actionForm);
        toast.success('Action updated');
      } else {
        await actionsAPI.create(actionForm);
        toast.success('Action created');
      }
      setDialogOpen(false);
      setEditItem(null);
      setActionForm({ title: '', description: '', action_type: 'volunteer', image_url: '' });
      loadAllData();
    } catch (error) {
      toast.error('Failed to save action');
    }
  };

  const deleteAction = async (id) => {
    if (!confirm('Delete this action?')) return;
    try {
      await actionsAPI.delete(id);
      toast.success('Action deleted');
      loadAllData();
    } catch (error) {
      toast.error('Failed to delete action');
    }
  };

  // Toggle admin
  const toggleAdmin = async (userId, currentStatus) => {
    try {
      await adminAPI.updateUser(userId, { is_admin: !currentStatus });
      toast.success('User updated');
      loadAllData();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  // Unsubscribe notify
  const unsubscribeNotify = async (email) => {
    if (!confirm(`Remove ${email} from subscribers?`)) return;
    try {
      await notifyAPI.unsubscribe(email);
      toast.success('Subscriber removed');
      loadAllData();
    } catch (error) {
      toast.error('Failed to remove subscriber');
    }
  };

  // Export subscribers as CSV
  const exportSubscribers = () => {
    const csv = ['Email,Subscribed Date'];
    subscribers.forEach(s => {
      csv.push(`${s.email},${new Date(s.created_at).toLocaleDateString()}`);
    });
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shop_subscribers.csv';
    a.click();
    toast.success('Subscribers exported!');
  };

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-black text-white py-4 px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2" data-testid="admin-logo">
              <div className="w-10 h-10 bg-pp-magenta rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white fill-white" />
              </div>
              <span className="font-campaign text-xl tracking-wider">ADMIN</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-primary text-sm text-gray-400">{user?.email}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-400 hover:text-white"
              onClick={handleLogout}
              data-testid="admin-logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border-2 border-black rounded-full p-1 mb-8">
            <TabsTrigger 
              value="overview" 
              className="rounded-full px-6 py-2 font-campaign data-[state=active]:bg-pp-magenta data-[state=active]:text-white"
              data-testid="tab-overview"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              OVERVIEW
            </TabsTrigger>
            <TabsTrigger 
              value="posts" 
              className="rounded-full px-6 py-2 font-campaign data-[state=active]:bg-pp-magenta data-[state=active]:text-white"
              data-testid="tab-posts"
            >
              <FileText className="w-4 h-4 mr-2" />
              POSTS
            </TabsTrigger>
            <TabsTrigger 
              value="products" 
              className="rounded-full px-6 py-2 font-campaign data-[state=active]:bg-pp-magenta data-[state=active]:text-white"
              data-testid="tab-products"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              PRODUCTS
            </TabsTrigger>
            <TabsTrigger 
              value="events" 
              className="rounded-full px-6 py-2 font-campaign data-[state=active]:bg-pp-magenta data-[state=active]:text-white"
              data-testid="tab-events"
            >
              <Calendar className="w-4 h-4 mr-2" />
              EVENTS
            </TabsTrigger>
            <TabsTrigger 
              value="actions" 
              className="rounded-full px-6 py-2 font-campaign data-[state=active]:bg-pp-magenta data-[state=active]:text-white"
              data-testid="tab-actions"
            >
              <Megaphone className="w-4 h-4 mr-2" />
              ACTIONS
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="rounded-full px-6 py-2 font-campaign data-[state=active]:bg-pp-magenta data-[state=active]:text-white"
              data-testid="tab-users"
            >
              <Users className="w-4 h-4 mr-2" />
              USERS
            </TabsTrigger>
            <TabsTrigger 
              value="subscribers" 
              className="rounded-full px-6 py-2 font-campaign data-[state=active]:bg-pp-magenta data-[state=active]:text-white"
              data-testid="tab-subscribers"
            >
              <Bell className="w-4 h-4 mr-2" />
              NOTIFY
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Users', value: stats?.users || 0, icon: Users, color: 'bg-blue-500' },
                { label: 'Posts', value: stats?.posts || 0, icon: FileText, color: 'bg-green-500' },
                { label: 'Products', value: stats?.products || 0, icon: ShoppingBag, color: 'bg-purple-500' },
                { label: 'Events', value: stats?.events || 0, icon: Calendar, color: 'bg-orange-500' },
                { label: 'Actions', value: stats?.actions || 0, icon: Megaphone, color: 'bg-pp-magenta' },
                { label: 'RSVPs', value: stats?.rsvps || 0, icon: Check, color: 'bg-teal-500' },
                { label: 'Action Signups', value: stats?.action_signups || 0, icon: Heart, color: 'bg-pink-500' },
                { label: 'Shop Subscribers', value: stats?.notify_subscribers || 0, icon: Bell, color: 'bg-yellow-500' },
              ].map((stat, idx) => (
                <Card key={idx} className="border-2 border-black rounded-xl">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-primary text-2xl font-bold">{stat.value}</p>
                      <p className="font-primary text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts">
            <Card className="border-2 border-black rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-campaign text-2xl tracking-wider">MANAGE POSTS</CardTitle>
                <Dialog open={dialogOpen && activeTab === 'posts'} onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (!open) { setEditItem(null); setPostForm({ title: '', content: '', image_url: '', video_url: '' }); }
                }}>
                  <DialogTrigger asChild>
                    <Button className="rounded-full bg-pp-magenta text-white border-2 border-black" data-testid="add-post-button">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Post
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="border-2 border-black rounded-2xl max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="font-campaign text-xl">{editItem ? 'EDIT POST' : 'NEW POST'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label className="font-primary font-semibold">Title</Label>
                        <Input
                          value={postForm.title}
                          onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                          className="border-2 border-black rounded-xl mt-1"
                          data-testid="post-title-input"
                        />
                      </div>
                      <div>
                        <Label className="font-primary font-semibold">Content</Label>
                        <Textarea
                          value={postForm.content}
                          onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                          className="border-2 border-black rounded-xl mt-1 min-h-[100px]"
                          data-testid="post-content-input"
                        />
                      </div>
                      <div>
                        <Label className="font-primary font-semibold">Image URL</Label>
                        <Input
                          value={postForm.image_url}
                          onChange={(e) => setPostForm({ ...postForm, image_url: e.target.value })}
                          className="border-2 border-black rounded-xl mt-1"
                          data-testid="post-image-input"
                        />
                      </div>
                      <div>
                        <Label className="font-primary font-semibold">Video URL (optional)</Label>
                        <Input
                          value={postForm.video_url}
                          onChange={(e) => setPostForm({ ...postForm, video_url: e.target.value })}
                          className="border-2 border-black rounded-xl mt-1"
                          data-testid="post-video-input"
                        />
                      </div>
                      <Button 
                        onClick={savePost}
                        className="w-full rounded-full bg-pp-magenta text-white border-2 border-black"
                        data-testid="save-post-button"
                      >
                        Save Post
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => (
                      <TableRow key={post.id} data-testid={`post-row-${post.id}`}>
                        <TableCell className="font-primary font-medium">{post.title}</TableCell>
                        <TableCell>{post.author_name}</TableCell>
                        <TableCell>{new Date(post.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditItem(post);
                              setPostForm({ title: post.title, content: post.content, image_url: post.image_url || '', video_url: post.video_url || '' });
                              setDialogOpen(true);
                            }}
                            data-testid={`edit-post-${post.id}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500"
                            onClick={() => deletePost(post.id)}
                            data-testid={`delete-post-${post.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card className="border-2 border-black rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-campaign text-2xl tracking-wider">MANAGE PRODUCTS</CardTitle>
                <Dialog open={dialogOpen && activeTab === 'products'} onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (!open) { setEditItem(null); setProductForm({ title: '', description: '', price: 0, image_url: '', available: false }); }
                }}>
                  <DialogTrigger asChild>
                    <Button className="rounded-full bg-pp-magenta text-white border-2 border-black" data-testid="add-product-button">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="border-2 border-black rounded-2xl max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="font-campaign text-xl">{editItem ? 'EDIT PRODUCT' : 'NEW PRODUCT'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label className="font-primary font-semibold">Title</Label>
                        <Input
                          value={productForm.title}
                          onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                          className="border-2 border-black rounded-xl mt-1"
                          data-testid="product-title-input"
                        />
                      </div>
                      <div>
                        <Label className="font-primary font-semibold">Description</Label>
                        <Textarea
                          value={productForm.description}
                          onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                          className="border-2 border-black rounded-xl mt-1"
                          data-testid="product-description-input"
                        />
                      </div>
                      <div>
                        <Label className="font-primary font-semibold">Price ($)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                          className="border-2 border-black rounded-xl mt-1"
                          data-testid="product-price-input"
                        />
                      </div>
                      <div>
                        <Label className="font-primary font-semibold">Image URL</Label>
                        <Input
                          value={productForm.image_url}
                          onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                          className="border-2 border-black rounded-xl mt-1"
                          data-testid="product-image-input"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={productForm.available}
                          onCheckedChange={(checked) => setProductForm({ ...productForm, available: checked })}
                          data-testid="product-available-switch"
                        />
                        <Label className="font-primary">Available for sale</Label>
                      </div>
                      <Button 
                        onClick={saveProduct}
                        className="w-full rounded-full bg-pp-magenta text-white border-2 border-black"
                        data-testid="save-product-button"
                      >
                        Save Product
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id} data-testid={`product-row-${product.id}`}>
                        <TableCell className="font-primary font-medium">{product.title}</TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={product.available ? 'bg-green-500' : 'bg-gray-400'}>
                            {product.available ? 'Available' : 'Coming Soon'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditItem(product);
                              setProductForm({ title: product.title, description: product.description, price: product.price, image_url: product.image_url || '', available: product.available });
                              setDialogOpen(true);
                            }}
                            data-testid={`edit-product-${product.id}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500"
                            onClick={() => deleteProduct(product.id)}
                            data-testid={`delete-product-${product.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <Card className="border-2 border-black rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-campaign text-2xl tracking-wider">MANAGE EVENTS</CardTitle>
                <Dialog open={dialogOpen && activeTab === 'events'} onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (!open) { setEditItem(null); setEventForm({ title: '', description: '', date: '', location: '', image_url: '' }); }
                }}>
                  <DialogTrigger asChild>
                    <Button className="rounded-full bg-pp-magenta text-white border-2 border-black" data-testid="add-event-button">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Event
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="border-2 border-black rounded-2xl max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="font-campaign text-xl">{editItem ? 'EDIT EVENT' : 'NEW EVENT'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label className="font-primary font-semibold">Title</Label>
                        <Input
                          value={eventForm.title}
                          onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                          className="border-2 border-black rounded-xl mt-1"
                          data-testid="event-title-input"
                        />
                      </div>
                      <div>
                        <Label className="font-primary font-semibold">Description</Label>
                        <Textarea
                          value={eventForm.description}
                          onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                          className="border-2 border-black rounded-xl mt-1"
                          data-testid="event-description-input"
                        />
                      </div>
                      <div>
                        <Label className="font-primary font-semibold">Date & Time</Label>
                        <Input
                          type="datetime-local"
                          value={eventForm.date}
                          onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                          className="border-2 border-black rounded-xl mt-1"
                          data-testid="event-date-input"
                        />
                      </div>
                      <div>
                        <Label className="font-primary font-semibold">Location</Label>
                        <Input
                          value={eventForm.location}
                          onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                          className="border-2 border-black rounded-xl mt-1"
                          data-testid="event-location-input"
                        />
                      </div>
                      <div>
                        <Label className="font-primary font-semibold">Image URL</Label>
                        <Input
                          value={eventForm.image_url}
                          onChange={(e) => setEventForm({ ...eventForm, image_url: e.target.value })}
                          className="border-2 border-black rounded-xl mt-1"
                          data-testid="event-image-input"
                        />
                      </div>
                      <Button 
                        onClick={saveEvent}
                        className="w-full rounded-full bg-pp-magenta text-white border-2 border-black"
                        data-testid="save-event-button"
                      >
                        Save Event
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>RSVPs</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id} data-testid={`event-row-${event.id}`}>
                        <TableCell className="font-primary font-medium">{event.title}</TableCell>
                        <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className="bg-pp-magenta">{event.rsvp_count} RSVPs</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditItem(event);
                              setEventForm({ title: event.title, description: event.description, date: event.date.replace('Z', ''), location: event.location, image_url: event.image_url || '' });
                              setDialogOpen(true);
                            }}
                            data-testid={`edit-event-${event.id}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500"
                            onClick={() => deleteEvent(event.id)}
                            data-testid={`delete-event-${event.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions">
            <Card className="border-2 border-black rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-campaign text-2xl tracking-wider">MANAGE ACTIONS</CardTitle>
                <Dialog open={dialogOpen && activeTab === 'actions'} onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (!open) { setEditItem(null); setActionForm({ title: '', description: '', action_type: 'volunteer', image_url: '' }); }
                }}>
                  <DialogTrigger asChild>
                    <Button className="rounded-full bg-pp-magenta text-white border-2 border-black" data-testid="add-action-button">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Action
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="border-2 border-black rounded-2xl max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="font-campaign text-xl">{editItem ? 'EDIT ACTION' : 'NEW ACTION'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label className="font-primary font-semibold">Title</Label>
                        <Input
                          value={actionForm.title}
                          onChange={(e) => setActionForm({ ...actionForm, title: e.target.value })}
                          className="border-2 border-black rounded-xl mt-1"
                          data-testid="action-title-input"
                        />
                      </div>
                      <div>
                        <Label className="font-primary font-semibold">Description</Label>
                        <Textarea
                          value={actionForm.description}
                          onChange={(e) => setActionForm({ ...actionForm, description: e.target.value })}
                          className="border-2 border-black rounded-xl mt-1"
                          data-testid="action-description-input"
                        />
                      </div>
                      <div>
                        <Label className="font-primary font-semibold">Action Type</Label>
                        <Select
                          value={actionForm.action_type}
                          onValueChange={(value) => setActionForm({ ...actionForm, action_type: value })}
                        >
                          <SelectTrigger className="border-2 border-black rounded-xl mt-1" data-testid="action-type-select">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="volunteer">Volunteer</SelectItem>
                            <SelectItem value="petition">Petition</SelectItem>
                            <SelectItem value="pledge">Pledge</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="font-primary font-semibold">Image URL</Label>
                        <Input
                          value={actionForm.image_url}
                          onChange={(e) => setActionForm({ ...actionForm, image_url: e.target.value })}
                          className="border-2 border-black rounded-xl mt-1"
                          data-testid="action-image-input"
                        />
                      </div>
                      <Button 
                        onClick={saveAction}
                        className="w-full rounded-full bg-pp-magenta text-white border-2 border-black"
                        data-testid="save-action-button"
                      >
                        Save Action
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Participants</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {actions.map((action) => (
                      <TableRow key={action.id} data-testid={`action-row-${action.id}`}>
                        <TableCell className="font-primary font-medium">{action.title}</TableCell>
                        <TableCell>
                          <Badge className={
                            action.action_type === 'volunteer' ? 'bg-green-500' :
                            action.action_type === 'petition' ? 'bg-blue-500' : 'bg-pp-magenta'
                          }>
                            {action.action_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{action.participant_count}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditItem(action);
                              setActionForm({ title: action.title, description: action.description, action_type: action.action_type, image_url: action.image_url || '' });
                              setDialogOpen(true);
                            }}
                            data-testid={`edit-action-${action.id}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500"
                            onClick={() => deleteAction(action.id)}
                            data-testid={`delete-action-${action.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="border-2 border-black rounded-xl">
              <CardHeader>
                <CardTitle className="font-campaign text-2xl tracking-wider">MANAGE USERS</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Admin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id} data-testid={`user-row-${u.id}`}>
                        <TableCell className="font-primary font-medium">{u.name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Badge className={u.is_admin ? 'bg-pp-magenta' : 'bg-gray-400'}>
                            {u.is_admin ? 'Admin' : 'User'}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Switch
                            checked={u.is_admin}
                            onCheckedChange={() => toggleAdmin(u.id, u.is_admin)}
                            disabled={u.id === user?.id}
                            data-testid={`toggle-admin-${u.id}`}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscribers Tab */}
          <TabsContent value="subscribers">
            <Card className="border-2 border-black rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-campaign text-2xl tracking-wider">
                  <Bell className="w-6 h-6 inline mr-2 text-pp-magenta" />
                  SHOP LAUNCH SUBSCRIBERS
                </CardTitle>
                <Button 
                  className="rounded-full bg-pp-magenta text-white border-2 border-black"
                  onClick={exportSubscribers}
                  disabled={subscribers.length === 0}
                  data-testid="export-subscribers-button"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                {subscribers.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-16 h-16 text-pp-pink mx-auto mb-4" />
                    <p className="font-primary text-muted-foreground">No subscribers yet</p>
                    <p className="font-primary text-sm text-muted-foreground mt-2">
                      People who want to be notified when the shop launches will appear here.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 p-4 bg-pp-lavender rounded-xl border-2 border-pp-pink">
                      <p className="font-primary font-bold text-lg">
                        {subscribers.length} people waiting for the shop launch!
                      </p>
                      <p className="font-primary text-sm text-muted-foreground">
                        Export the list to send email announcements when you're ready to launch.
                      </p>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Subscribed</TableHead>
                          <TableHead className="text-right">Remove</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subscribers.map((sub) => (
                          <TableRow key={sub.id} data-testid={`subscriber-row-${sub.id}`}>
                            <TableCell className="font-primary font-medium">{sub.email}</TableCell>
                            <TableCell>{new Date(sub.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => unsubscribeNotify(sub.email)}
                                data-testid={`remove-subscriber-${sub.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
