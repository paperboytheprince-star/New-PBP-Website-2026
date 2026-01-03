import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.adminLogin(formData);
      login(response.data.user, response.data.token);
      toast.success('Welcome, Admin!');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 font-primary" data-testid="back-to-home">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <Card className="rounded-3xl border-2 border-pp-magenta bg-gray-900 shadow-[8px_8px_0px_0px_rgba(255,20,147,0.5)]">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-pp-magenta rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="font-campaign text-3xl tracking-wider text-white">ADMIN ACCESS</CardTitle>
            <CardDescription className="font-primary text-gray-400">
              Authorized personnel only
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-primary font-semibold text-white">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@paperboyprince.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="rounded-xl border-2 border-pp-magenta bg-gray-800 text-white px-4 py-3 focus:ring-pp-magenta"
                  data-testid="admin-email-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-primary font-semibold text-white">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="rounded-xl border-2 border-pp-magenta bg-gray-800 text-white px-4 py-3 pr-10 focus:ring-pp-magenta"
                    data-testid="admin-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    data-testid="toggle-password"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-pp-magenta text-white font-bold py-6 text-lg border-2 border-pp-magenta shadow-[4px_4px_0px_0px_rgba(255,20,147,0.5)] hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50"
                data-testid="admin-login-button"
              >
                {loading ? 'Authenticating...' : 'Access Dashboard'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="font-primary text-gray-500 text-sm">
                Demo: admin@paperboyprince.com / admin123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
