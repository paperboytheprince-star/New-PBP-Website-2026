import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft, Key, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. No token provided.');
    }
  }, [token]);

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('One number');
    if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) errors.push('One special character');
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid reset link. Please request a new one.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      setError(`Password requirements not met: ${passwordErrors.join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPasswordWithToken(token, newPassword);
      setSuccess(true);
      toast.success('Password reset successfully!');
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to reset password';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const passwordErrors = validatePassword(newPassword);

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-b from-pp-pink/20 to-white">
        <Card className="w-full max-w-md rounded-3xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(255,153,204,1)]">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-campaign text-3xl tracking-wider mb-4">PASSWORD RESET!</h1>
            <p className="font-primary text-muted-foreground mb-6">
              Your password has been reset successfully. You can now log in with your new password.
            </p>
            <Link to="/login">
              <Button className="w-full rounded-full bg-pp-magenta text-white font-bold px-6 py-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all">
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-b from-pp-pink/20 to-white">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link 
          to="/login" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 font-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        <Card className="rounded-3xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(255,153,204,1)]">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-pp-magenta rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="w-8 h-8 text-white" />
              </div>
              <h1 className="font-campaign text-3xl tracking-wider">RESET PASSWORD</h1>
              <p className="font-primary text-muted-foreground mt-2">
                Enter your new password below
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="font-primary text-sm text-red-600">{error}</p>
              </div>
            )}

            {!token ? (
              <div className="text-center">
                <p className="font-primary text-muted-foreground mb-4">
                  This reset link is invalid or has expired.
                </p>
                <Link to="/login">
                  <Button variant="outline" className="rounded-full border-2 border-black">
                    Return to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="newPassword" className="font-primary font-medium">
                    New Password
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="pr-10 border-2 border-black rounded-xl focus:ring-pp-magenta"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {/* Password Requirements */}
                  {newPassword && (
                    <div className="mt-2 space-y-1">
                      <p className="font-primary text-xs text-muted-foreground">Password must have:</p>
                      <ul className="grid grid-cols-2 gap-1">
                        {[
                          { test: newPassword.length >= 8, label: '8+ characters' },
                          { test: /[A-Z]/.test(newPassword), label: 'Uppercase' },
                          { test: /[a-z]/.test(newPassword), label: 'Lowercase' },
                          { test: /[0-9]/.test(newPassword), label: 'Number' },
                          { test: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(newPassword), label: 'Special char' },
                        ].map((req, i) => (
                          <li 
                            key={i} 
                            className={`font-primary text-xs flex items-center gap-1 ${req.test ? 'text-green-600' : 'text-muted-foreground'}`}
                          >
                            {req.test ? <Check className="w-3 h-3" /> : <span className="w-3 h-3">•</span>}
                            {req.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="font-primary font-medium">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="mt-1 border-2 border-black rounded-xl focus:ring-pp-magenta"
                    placeholder="Confirm new password"
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="font-primary text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading || passwordErrors.length > 0 || newPassword !== confirmPassword}
                  className="w-full rounded-full bg-pp-magenta text-white font-bold px-6 py-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
