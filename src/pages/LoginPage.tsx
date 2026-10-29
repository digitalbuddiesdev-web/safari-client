import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { validateEmail, validateRequired } from '../lib/validation';
import { FormFieldError } from '../components/common/FormFieldError';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { info } = useToast();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});

  const clearFieldError = (field: string) => {
    setFieldErrors(prev => (prev[field] ? { ...prev, [field]: null } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string | null> = {};

    const emailErr = validateEmail(email);
    if (emailErr) errors.email = emailErr;

    const passErr = validateRequired(password, 'Password', 1);
    if (passErr) errors.password = passErr;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please enter your email and password to sign in.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setFieldErrors({});
      await login({ email: email.trim(), password });
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      navigate(redirect && redirect.startsWith('/') ? redirect : '/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (userEmail: string, pass: string) => {
    setEmail(userEmail);
    setPassword(pass);
  };

  return (
    <div className="bg-sand min-h-screen pt-28 pb-20 flex items-center justify-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-md">
        
        {/* Card */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-forest/15 shadow-xl space-y-6">
          
          <div className="text-center space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-forest/10 border border-forest/20 text-forest text-[11px] font-semibold uppercase tracking-widest mb-1">
              <Compass className="w-3 h-3 text-gold" />
              <span>Admin Access</span>
            </div>
            <h1 className="font-serif text-3xl font-bold text-forest">
              Admin Sign In
            </h1>
            <p className="text-forest/60 text-xs">
              Authorised Shutter And Stripes staff only.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-forest/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    clearFieldError('email');
                  }}
                  onBlur={() => {
                    const err = validateEmail(email);
                    if (err) setFieldErrors(prev => ({ ...prev, email: err }));
                  }}
                  placeholder="name@example.com"
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
                  className={`w-full pl-10 pr-4 py-2.5 bg-sand/30 border rounded-xl text-xs text-forest focus:outline-none transition-colors ${
                    fieldErrors.email ? 'border-red-500 ring-1 ring-red-400/20' : 'border-forest/15 focus:ring-2 focus:ring-forest/30'
                  }`}
                />
                <FormFieldError id="login-email-error" error={fieldErrors.email} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-forest/70">
                  Password
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); info('Please contact enquiries@shutterandstripessafaris.com for manual security key reset.'); }} className="text-[11px] text-earth hover:underline">
                  Forgot Key?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-forest/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    clearFieldError('password');
                  }}
                  onBlur={() => {
                    const err = validateRequired(password, 'Password', 1);
                    if (err) setFieldErrors(prev => ({ ...prev, password: err }));
                  }}
                  placeholder="••••••••"
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? 'login-pass-error' : undefined}
                  className={`w-full pl-10 pr-4 py-2.5 bg-sand/30 border rounded-xl text-xs text-forest focus:outline-none transition-colors ${
                    fieldErrors.password ? 'border-red-500 ring-1 ring-red-400/20' : 'border-forest/15 focus:ring-2 focus:ring-forest/30'
                  }`}
                />
                <FormFieldError id="login-pass-error" error={fieldErrors.password} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-forest text-sand rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-forest/90 transition shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-sand border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 text-gold" />
                </>
              )}
            </button>
          </form>

          {/* Demo Login Shortcut (admin only) */}
          {import.meta.env.DEV && (
            <div className="pt-4 border-t border-forest/10">
              <button
                type="button"
                onClick={() => fillCredentials('admin@shutterandstripes.com', 'Safari@2026')}
                className="w-full p-2.5 rounded-xl bg-forest/10 border border-forest/20 text-forest text-[11px] font-semibold hover:bg-forest hover:text-sand transition"
              >
                Fill Admin Demo Credentials
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
export default LoginPage;
