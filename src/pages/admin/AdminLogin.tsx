import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AlertCircle, ArrowLeft, KeyRound, Lock, Mail, Shield, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiError, apiClient } from '@/lib/api-client';

// ── Types ────────────────────────────────────────────────────────────────────

interface LoginStep1Response {
  success: boolean;
  message: string;
  data: {
    mfaRequired?: true;
    challengeToken?: string;
    accessToken?: string;
    user?: {
      id: string;
      name: string;
      email: string;
      role: 'SUPER_ADMIN' | 'SECURITY_ADMIN' | 'READ_ONLY';
      lastLoginAt?: string | null;
    };
  };
}

interface MfaLoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: 'SUPER_ADMIN' | 'SECURITY_ADMIN' | 'READ_ONLY';
      lastLoginAt?: string | null;
    };
  };
}

// ── Component ────────────────────────────────────────────────────────────────

export default function AdminLogin() {
  const { authenticated, refresh } = useAuth();
  const navigate = useNavigate();

  // ── Step 1 state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // ── Step state: 'credentials' | 'mfa'
  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials');

  // ── MFA state
  const [challengeToken, setChallengeToken] = useState('');
  const [mfaCode, setMfaCode] = useState('');

  // ── Shared state
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Refs for focus management
  const mfaInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Focus the MFA input when we switch to step 2
  useEffect(() => {
    if (step === 'mfa') {
      setTimeout(() => mfaInputRef.current?.focus(), 50);
    }
  }, [step]);

  // Focus email on mount
  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  if (authenticated) {
    return <Navigate to="/admin" replace />;
  }

  // ── Step 1: Credentials submit ───────────────────────────────────────────
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      // We call the raw API to inspect the mfaRequired flag before calling the
      // auth context's login (which assumes a full session on success).
      const response = await apiClient.post<LoginStep1Response>('/api/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      if (response.data?.mfaRequired && response.data.challengeToken) {
        // Transition to step 2 — no page reload
        setChallengeToken(response.data.challengeToken);
        setStep('mfa');
        setIsSubmitting(false);
        return;
      }

      // Normal login: refresh token cookie was set by the API — use refresh() to
      // populate auth context state without re-posting credentials.
      apiClient.setAccessToken(response.data.accessToken ?? null);
      navigate('/admin');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors) {
          const messages = Object.entries(err.errors)
            .map(([field, msgs]) => `${field === 'general' ? '' : field + ': '}${msgs.join(', ')}`)
            .join('; ');
          setError(messages || err.message);
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      setIsSubmitting(false);
    }
  };

  // ── Step 2: MFA code submit ──────────────────────────────────────────────
  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = mfaCode.trim();
    if (!trimmed) {
      setError('Please enter your authentication code.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient.post<MfaLoginResponse>('/api/auth/2fa/login', {
        challengeToken,
        code: trimmed,
      });

      if (response.success && response.data.accessToken) {
        apiClient.setAccessToken(response.data.accessToken);
        // Populate auth context (user, authenticated) using the refresh token
        // cookie set by the 2fa/login endpoint, then navigate.
        await refresh();
        navigate('/admin');
      } else {
        throw new Error('Verification failed. Please try again.');
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors) {
          const messages = Object.entries(err.errors)
            .map(([field, msgs]) => `${field === 'general' ? '' : field + ': '}${msgs.join(', ')}`)
            .join('; ');
          setError(messages || err.message);
        } else {
          setError(err.message);
        }
      } else {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      }
      setIsSubmitting(false);
    }
  };

  // ── Back to step 1 ───────────────────────────────────────────────────────
  const handleBack = () => {
    setStep('credentials');
    setMfaCode('');
    setChallengeToken('');
    setError(null);
    setIsSubmitting(false);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-xifoz-base flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card wrapper with smooth height transition */}
        <div
          className="bg-xifoz-surface border border-xifoz-dim rounded-card p-8 shadow-sm transition-all duration-300"
          style={{ willChange: 'transform' }}
        >
          {/* ── Header ── */}
          <div className="text-center mb-8">
            <div
              className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 transition-colors duration-300 ${
                step === 'mfa'
                  ? 'bg-xifoz-blue/10 text-xifoz-blue'
                  : 'bg-xifoz-blue/5 text-xifoz-blue'
              }`}
            >
              {step === 'mfa' ? (
                <ShieldCheck className="w-6 h-6" />
              ) : (
                <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2L3 8.5V19.5L14 26L25 19.5V8.5L14 2Z" stroke="#2563EB" strokeWidth="1.5" fill="none" />
                  <circle cx="14" cy="14" r="2" fill="#2563EB" />
                </svg>
              )}
            </div>

            {step === 'credentials' ? (
              <>
                <h2 className="text-xl font-semibold text-xifoz-text mb-1.5">Admin Portal</h2>
                <p className="text-sm text-xifoz-text-secondary">Sign in to manage infrastructure protection</p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-xifoz-text mb-1.5">Two-Factor Authentication</h2>
                <p className="text-sm text-xifoz-text-secondary">
                  Enter the 6-digit code from your authenticator app, or a backup code
                </p>
              </>
            )}
          </div>

          {/* ── Step indicator ── */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div
              className={`h-1 rounded-full transition-all duration-500 ${
                step === 'credentials' ? 'w-8 bg-xifoz-blue' : 'w-4 bg-xifoz-dim'
              }`}
            />
            <div
              className={`h-1 rounded-full transition-all duration-500 ${
                step === 'mfa' ? 'w-8 bg-xifoz-blue' : 'w-4 bg-xifoz-dim'
              }`}
            />
          </div>

          {/* ── Error banner ── */}
          {error && (
            <div
              className="mb-6 flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-100 text-xifoz-danger animate-fade-in-up"
              role="alert"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              STEP 1 – Credentials
          ══════════════════════════════════════════════════ */}
          {step === 'credentials' && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-5" noValidate>
              {/* Email */}
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
                    ref={emailInputRef}
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-xifoz-base border border-xifoz-dim rounded-lg text-sm text-xifoz-text placeholder:text-xifoz-text-secondary/30 focus:outline-none focus:border-xifoz-blue/30 transition-colors"
                    placeholder="admin@xifoz.com"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Password */}
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
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <Button
                id="login-submit"
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-xifoz-blue hover:bg-xifoz-blue/90 text-white rounded-lg py-2.5"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          )}

          {/* ══════════════════════════════════════════════════
              STEP 2 – MFA Code
          ══════════════════════════════════════════════════ */}
          {step === 'mfa' && (
            <form onSubmit={handleMfaSubmit} className="space-y-5 animate-fade-in-up" noValidate>
              {/* Code input */}
              <div>
                <label htmlFor="mfa-code" className="block text-sm font-medium text-xifoz-text mb-1.5">
                  Authentication Code
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xifoz-text-secondary/40">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <input
                    id="mfa-code"
                    ref={mfaInputRef}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-xifoz-base border border-xifoz-dim rounded-lg text-sm text-xifoz-text placeholder:text-xifoz-text-secondary/30 focus:outline-none focus:border-xifoz-blue/30 transition-colors font-mono tracking-widest"
                    placeholder="000000 or XXXX-XXXX-XXXX"
                    required
                    disabled={isSubmitting}
                    maxLength={17}
                  />
                </div>
                <p className="mt-1.5 text-xs text-xifoz-text-secondary">
                  Enter the 6-digit code from your authenticator app, or a backup code in the format{' '}
                  <span className="font-mono">XXXX-XXXX-XXXX</span>.
                </p>
              </div>

              {/* Security indicator */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-xifoz-blue/5 border border-xifoz-blue/10">
                <Shield className="w-4 h-4 text-xifoz-blue flex-shrink-0" />
                <p className="text-xs text-xifoz-text-secondary">
                  Your credentials have been verified. Complete MFA to access the admin portal.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  id="mfa-back"
                  type="button"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="flex-none bg-xifoz-dim hover:bg-xifoz-dim/80 text-xifoz-text rounded-lg px-4 py-2.5 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>

                <Button
                  id="mfa-verify"
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-xifoz-blue hover:bg-xifoz-blue/90 text-white rounded-lg py-2.5"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    'Verify'
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
