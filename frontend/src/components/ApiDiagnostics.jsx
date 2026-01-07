import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getApiCallLog, healthAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Activity, Check, X, Clock, AlertCircle, RefreshCw, User, Shield } from 'lucide-react';

const ApiDiagnostics = () => {
  const { user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [apiCalls, setApiCalls] = useState([]);
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // Only show for admins
  if (!isAdmin) return null;

  const refreshData = async () => {
    setLoading(true);
    setApiCalls(getApiCallLog());
    try {
      const response = await healthAPI.check();
      setHealthStatus(response.data);
    } catch (error) {
      setHealthStatus({ api: 'error', database: 'unknown', error: error.message });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      refreshData();
    }
  }, [open]);

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-400';
    if (status < 300) return 'bg-green-500';
    if (status < 400) return 'bg-blue-500';
    if (status < 500) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusIcon = (status) => {
    if (!status) return <Clock className="w-3 h-3" />;
    if (status < 300) return <Check className="w-3 h-3" />;
    if (status < 400) return <AlertCircle className="w-3 h-3" />;
    return <X className="w-3 h-3" />;
  };

  // Get token expiry from JWT
  const getTokenInfo = () => {
    const token = localStorage.getItem('pp_token');
    if (!token) return { hasToken: false };
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp ? new Date(payload.exp * 1000) : null;
      const now = new Date();
      return {
        hasToken: true,
        userId: payload.user_id,
        email: payload.email,
        isAdmin: payload.is_admin,
        expiresAt: exp?.toISOString(),
        isExpired: exp ? now > exp : false,
        expiresIn: exp ? Math.round((exp - now) / 1000 / 60) : null, // minutes
      };
    } catch {
      return { hasToken: true, error: 'Invalid token format' };
    }
  };

  const tokenInfo = getTokenInfo();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-4 right-4 z-50 rounded-full border-2 border-black bg-white shadow-lg hover:bg-gray-100"
          title="API Diagnostics (Admin Only)"
        >
          <Activity className="w-4 h-4 mr-1" />
          Diagnostics
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto border-2 border-black rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-campaign text-2xl tracking-wider flex items-center gap-2">
            <Activity className="w-6 h-6 text-pp-magenta" />
            API DIAGNOSTICS
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Health Status */}
          <div className="p-4 bg-muted rounded-xl">
            <h3 className="font-campaign text-sm tracking-wider mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              SYSTEM HEALTH
            </h3>
            {healthStatus ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Badge className={healthStatus.api === 'ok' ? 'bg-green-500' : 'bg-red-500'}>
                    API: {healthStatus.api}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={healthStatus.database === 'ok' ? 'bg-green-500' : 'bg-red-500'}>
                    DB: {healthStatus.database}
                  </Badge>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Loading...</p>
            )}
          </div>

          {/* Auth Status */}
          <div className="p-4 bg-muted rounded-xl">
            <h3 className="font-campaign text-sm tracking-wider mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              AUTH STATUS
            </h3>
            <div className="space-y-2 text-sm font-primary">
              <div className="flex justify-between">
                <span className="text-muted-foreground">User ID:</span>
                <span className="font-mono">{user?.id || tokenInfo.userId || 'Not logged in'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span>{user?.email || tokenInfo.email || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role:</span>
                <Badge variant={tokenInfo.isAdmin ? 'default' : 'outline'} className={tokenInfo.isAdmin ? 'bg-pp-magenta' : ''}>
                  {tokenInfo.isAdmin ? 'Admin' : 'User'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Token Status:</span>
                <Badge className={tokenInfo.isExpired ? 'bg-red-500' : 'bg-green-500'}>
                  {tokenInfo.isExpired ? 'Expired' : `Valid (${tokenInfo.expiresIn}m remaining)`}
                </Badge>
              </div>
              {tokenInfo.expiresAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expires At:</span>
                  <span className="font-mono text-xs">{tokenInfo.expiresAt}</span>
                </div>
              )}
            </div>
          </div>

          {/* Recent API Calls */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-campaign text-sm tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4" />
                RECENT API CALLS ({apiCalls.length})
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={refreshData}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            
            {apiCalls.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No API calls logged yet</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {apiCalls.map((call, idx) => (
                  <div 
                    key={idx} 
                    className={`p-2 rounded-lg text-xs font-mono flex items-start gap-2 ${
                      call.error ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <Badge className={`${getStatusColor(call.status)} text-white shrink-0`}>
                      {getStatusIcon(call.status)}
                      <span className="ml-1">{call.status || '?'}</span>
                    </Badge>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{call.method}</span>
                        <span className="truncate text-muted-foreground">{call.url}</span>
                      </div>
                      {call.error && (
                        <div className="text-red-600 mt-1 truncate">{call.error}</div>
                      )}
                      <div className="text-muted-foreground mt-1">
                        {call.duration}ms • {new Date(call.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApiDiagnostics;
