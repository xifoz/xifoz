import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AlertCircle, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminLogin() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      if (email.toLowerCase() === 'admin@xifoz.com' && password === 'admin123') {
        login(email.toLowerCase(), 'XIFOZ Admin');
        navigate('/admin');
      } else {
        setError('Invalid credentials. Please try again.');
        setIsSubmitting(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-xifoz-base flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-xifoz-surface border border-xifoz-dim rounded-card p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-xifoz-blue/5 text-xifoz-blue mb-4">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2L3 8.5V19.5L14 26L25 19.5V8.5L14 2Z" stroke="#2563EB" strokeWidth="1.5" fill="none" />
              <circle cx="14" cy="14" r="2" fill="#2563EB" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-xifoz-text mb-1.5">Admin Portal</h2>
          <p className="text-sm text-xifoz-text-secondary">Sign in to manage infrastructure protection</p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-100 text-xifoz-danger" role="alert">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-xifoz-text mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xifoz-text-secondary/40">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-xifoz-base border border-xifoz-dim rounded-lg text-sm text-xifoz-text placeholder:text-xifoz-text-secondary/30 focus:outline-none focus:border-xifoz-blue/30 transition-colors"
                placeholder="admin@xifoz.com"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-xifoz-text mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xifoz-text-secondary/40">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-xifoz-base border border-xifoz-dim rounded-lg text-sm text-xifoz-text placeholder:text-xifoz-text-secondary/30 focus:outline-none focus:border-xifoz-blue/30 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-xifoz-blue hover:bg-xifoz-blue/90 text-white rounded-lg py-2.5"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}
