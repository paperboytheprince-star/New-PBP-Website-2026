import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { ArrowLeft, Users, Search, MoreVertical, Key, ArrowUpDown, Copy, Check, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';

const AdminUsers = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [resetLink, setResetLink] = useState('');
  const [resetting, setResetting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (authLoading) return; // Wait for auth to load
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isAdmin) {
      navigate('/');
      toast.error('Admin access required');
      return;
    }
    loadUsers();
  }, [isAuthenticated, isAdmin, navigate, searchQuery, sortBy, sortOrder, authLoading]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers({
        search: searchQuery || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
      if (error.response?.status === 403) {
        navigate('/');
        toast.error('Admin access required');
      } else {
        toast.error('Failed to load users');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleResetPassword = async (targetUser) => {
    setSelectedUser(targetUser);
    setResetLink('');
    setCopied(false);
    setResetDialogOpen(true);
  };

  const generateResetLink = async () => {
    if (!selectedUser) return;
    
    setResetting(true);
    try {
      const response = await adminAPI.resetUserPassword(selectedUser.id);
      const fullLink = `${window.location.origin}${response.data.reset_link}`;
      setResetLink(fullLink);
      toast.success('Reset link generated successfully');
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait before trying again.');
      } else {
        toast.error(error.response?.data?.detail || 'Failed to generate reset link');
      }
    } finally {
      setResetting(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(resetLink);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    try {
      return format(parseISO(dateStr), 'MMM d, yyyy h:mm a');
    } catch {
      return dateStr;
    }
  };

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
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-campaign text-3xl tracking-wider">
            <Users className="w-8 h-8 text-pp-magenta" />
            USER MANAGEMENT
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-2 border-black rounded-xl"
              />
            </div>
            <div className="text-sm text-muted-foreground font-primary">
              {users.length} user{users.length !== 1 ? 's' : ''} total
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="rounded-3xl border-2 border-black">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-pp-pink mx-auto mb-3" />
              <p className="font-primary text-muted-foreground">
                {searchQuery ? 'No users found matching your search' : 'No users yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-black">
                    <TableHead className="font-campaign tracking-wider">
                      <Button
                        variant="ghost"
                        className="flex items-center gap-1 p-0 h-auto font-campaign"
                        onClick={() => handleSort('email')}
                      >
                        EMAIL
                        <ArrowUpDown className="w-3 h-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="font-campaign tracking-wider">
                      <Button
                        variant="ghost"
                        className="flex items-center gap-1 p-0 h-auto font-campaign"
                        onClick={() => handleSort('name')}
                      >
                        NAME
                        <ArrowUpDown className="w-3 h-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="font-campaign tracking-wider">ROLE</TableHead>
                    <TableHead className="font-campaign tracking-wider">
                      <Button
                        variant="ghost"
                        className="flex items-center gap-1 p-0 h-auto font-campaign"
                        onClick={() => handleSort('created_at')}
                      >
                        CREATED
                        <ArrowUpDown className="w-3 h-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="font-campaign tracking-wider">
                      <Button
                        variant="ghost"
                        className="flex items-center gap-1 p-0 h-auto font-campaign"
                        onClick={() => handleSort('last_login_at')}
                      >
                        LAST LOGIN
                        <ArrowUpDown className="w-3 h-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="font-campaign tracking-wider">STATUS</TableHead>
                    <TableHead className="font-campaign tracking-wider text-right">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id} className="border-b border-gray-200">
                      <TableCell className="font-primary font-medium">{u.email}</TableCell>
                      <TableCell className="font-primary">{u.name}</TableCell>
                      <TableCell>
                        {u.is_admin ? (
                          <Badge className="bg-pp-magenta text-white font-campaign">
                            <Shield className="w-3 h-3 mr-1" />
                            ADMIN
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="font-campaign">USER</Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-primary text-sm text-muted-foreground">
                        {formatDate(u.created_at)}
                      </TableCell>
                      <TableCell className="font-primary text-sm text-muted-foreground">
                        {formatDate(u.last_login_at)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`font-campaign ${u.status === 'active' ? 'border-green-500 text-green-600' : 'border-red-500 text-red-600'}`}
                        >
                          {u.status?.toUpperCase() || 'ACTIVE'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="border-2 border-black">
                            <DropdownMenuItem 
                              onClick={() => handleResetPassword(u)}
                              className="cursor-pointer"
                            >
                              <Key className="w-4 h-4 mr-2" />
                              Reset Password
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reset Password Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="border-2 border-black rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-campaign text-2xl tracking-wider flex items-center gap-2">
              <Key className="w-6 h-6 text-pp-magenta" />
              RESET PASSWORD
            </DialogTitle>
            <DialogDescription className="font-primary">
              Generate a one-time password reset link for <strong>{selectedUser?.email}</strong>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {!resetLink ? (
              <>
                <p className="font-primary text-sm text-muted-foreground">
                  This will generate a secure one-time link that expires in 60 minutes. 
                  Share it securely with the user.
                </p>
                <Button
                  onClick={generateResetLink}
                  disabled={resetting}
                  className="w-full rounded-full bg-pp-magenta text-white font-bold px-6 py-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all"
                >
                  {resetting ? 'Generating...' : 'Generate Reset Link'}
                </Button>
              </>
            ) : (
              <>
                <div className="p-3 bg-muted rounded-xl border-2 border-black">
                  <p className="font-primary text-xs text-muted-foreground mb-1">One-time reset link:</p>
                  <p className="font-mono text-xs break-all">{resetLink}</p>
                </div>
                <Button
                  onClick={copyToClipboard}
                  className="w-full rounded-full bg-black text-white font-bold px-6 py-2 border-2 border-black hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Link
                    </>
                  )}
                </Button>
                <p className="font-primary text-xs text-muted-foreground text-center">
                  ⚠️ This link can only be used once and expires in 60 minutes.
                </p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
