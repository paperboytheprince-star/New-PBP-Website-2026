import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Heart, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(formData.email, formData.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error('Please enter your email address');
      return;
    }
    setLoading(true);

    try {
      await resetPassword(formData.email);
      toast.success('Password reset email sent! Check your inbox.');
      setShowForgotPassword(false);
    } catch (error) {
      console.error('Reset error:', error);
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 font-primary" data-testid="back-to-home">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <Card className="rounded-3xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(255,153,204,1)]">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-pp-magenta rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>
            <CardTitle className="font-campaign text-3xl tracking-wider">
              {showForgotPassword ? 'RESET PASSWORD' : 'WELCOME BACK'}
            </CardTitle>
            <CardDescription className="font-primary">
              {showForgotPassword 
                ? 'Enter your email to receive a reset link' 
                : 'Sign in to continue the revolution'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showForgotPassword ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-primary font-semibold">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="rounded-xl border-2 border-black px-4 py-3 input-glow"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-pp-magenta text-white font-bold py-6 text-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="w-full text-center text-pp-magenta font-semibold hover:underline font-primary"
                >
                  Back to Sign In
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-primary font-semibold">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="rounded-xl border-2 border-black px-4 py-3 input-glow"
                    data-testid="login-email-input"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="font-primary font-semibold">Password</Label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-pp-magenta hover:underline font-primary"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="rounded-xl border-2 border-black px-4 py-3 pr-10 input-glow"
                      data-testid="login-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      data-testid="toggle-password"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-pp-magenta text-white font-bold py-6 text-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50"
                  data-testid="login-submit-button"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="font-primary text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="text-pp-magenta font-semibold hover:underline" data-testid="register-link">
                  Join us
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
