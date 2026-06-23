import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  RefreshCw,
  Shield,
  ShieldCheck,
  ShieldOff,
  User,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient, ApiError } from '@/lib/api-client';
import { toast } from 'sonner';

// ── API response types ────────────────────────────────────────────────────────

interface TwoFAStatus {
  enabled: boolean;
  backupCodesCount: number;
}

interface SetupResponse {
  success: boolean;
  data: { qrCode: string; secret: string };
}

interface VerifyResponse {
  success: boolean;
  data: { backupCodes: string[] };
}

interface RegenerateResponse {
  success: boolean;
  data: { backupCodes: string[] };
}

// ── Inline spinner helper ─────────────────────────────────────────────────────
function Spinner({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

// ── Overlay modal wrapper ────────────────────────────────────────────────────
function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="relative z-10 w-full max-w-md bg-xifoz-surface border border-xifoz-dim rounded-card shadow-card animate-fade-in-up">
        {children}
      </div>
    </div>
  );
}

// ── Backup codes display ─────────────────────────────────────────────────────
function BackupCodesDisplay({
  codes,
  onDone,
  title,
}: {
  codes: string[];
  onDone: () => void;
  title: string;
}) {
  const codesText = codes.join('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codesText);
      toast.success('Backup codes copied to clipboard');
    } catch {
      toast.error('Failed to copy. Please copy them manually.');
    }
  };

  const handleDownload = () => {
    const blob = new Blob(
      [
        `XIFOZ Admin – 2FA Backup Codes\nGenerated: ${new Date().toISOString()}\n\n${codesText}\n\nStore these securely. Each code can only be used once.`,
      ],
      { type: 'text/plain' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'xifoz-2fa-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup codes downloaded');
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1.5">
          <ShieldCheck className="w-5 h-5 text-xifoz-success flex-shrink-0" />
          <h3 className="text-base font-semibold text-xifoz-text">{title}</h3>
        </div>
        <p className="text-sm text-xifoz-text-secondary">
          These codes can be used to access your account if you lose your authenticator device.
        </p>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 p-3.5 rounded-lg bg-amber-50 border border-amber-200">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 font-medium leading-relaxed">
          Store these backup codes securely. They cannot be shown again. Each code can only be used once.
        </p>
      </div>

      {/* Codes grid */}
      <div className="bg-xifoz-base border border-xifoz-dim rounded-lg p-4">
        <div className="grid grid-cols-2 gap-2">
          {codes.map((code) => (
            <div
              key={code}
              className="font-mono text-sm text-xifoz-text bg-xifoz-surface border border-xifoz-dim rounded px-3 py-2 text-center tracking-widest"
            >
              {code}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          id="backup-codes-copy"
          type="button"
          onClick={handleCopy}
          className="flex-1 bg-xifoz-dim hover:bg-xifoz-dim/80 text-xifoz-text rounded-lg flex items-center justify-center gap-2"
        >
          <Copy className="w-4 h-4" />
          Copy All
        </Button>
        <Button
          id="backup-codes-download"
          type="button"
          onClick={handleDownload}
          className="flex-1 bg-xifoz-dim hover:bg-xifoz-dim/80 text-xifoz-text rounded-lg flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download
        </Button>
      </div>

      <Button
        id="backup-codes-done"
        type="button"
        onClick={onDone}
        className="w-full bg-xifoz-blue hover:bg-xifoz-blue/90 text-white rounded-lg"
      >
        I've saved these codes
      </Button>
    </div>
  );
}

// ── Enable 2FA Modal ─────────────────────────────────────────────────────────
function Enable2FAModalInner({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [phase, setPhase] = useState<'setup' | 'verify' | 'backup'>('setup');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secretVisible, setSecretVisible] = useState(false);

  // Fetch QR code on mount (parent controls open/close with a key-based remount)
  useEffect(() => {
    const fetchSetup = async () => {
      setSetupLoading(true);
      try {
        const response = await apiClient.post<SetupResponse>('/api/auth/2fa/setup');
        setQrCode(response.data.qrCode);
        setSecret(response.data.secret);
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : 'Failed to initiate 2FA setup.';
        setError(msg);
        toast.error(msg);
      } finally {
        setSetupLoading(false);
      }
    };

    fetchSetup();
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!verifyCode.trim()) {
      setError('Please enter the verification code.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post<VerifyResponse>('/api/auth/2fa/verify', {
        code: verifyCode.trim(),
      });
      setBackupCodes(response.data.backupCodes);
      setPhase('backup');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    toast.success('Two-factor authentication enabled successfully');
    onSuccess();
    onClose();
  };

  const handleClose = () => {
    if (phase === 'backup') {
      handleDone();
    } else {
      onClose();
    }
  };

  return (
    <Modal open={true} onClose={handleClose}>
      {/* ── Phase: Setup – QR code display ── */}
      {phase === 'setup' && (
        <div className="p-6 space-y-5">
          {/* Title row */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-xifoz-text">Enable Two-Factor Authentication</h3>
              <p className="text-sm text-xifoz-text-secondary mt-0.5">Scan with your authenticator app</p>
            </div>
            <button
              id="enable-2fa-close"
              onClick={handleClose}
              className="p-1.5 rounded-md text-xifoz-text-secondary hover:bg-xifoz-dim transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-3.5 rounded-lg bg-red-50 border border-red-100 text-xifoz-danger">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Steps */}
          <ol className="space-y-2 text-sm text-xifoz-text-secondary">
            <li className="flex gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-xifoz-blue/10 text-xifoz-blue text-xs font-semibold flex items-center justify-center">1</span>
              Install an authenticator app (Google Authenticator, Authy, 1Password, etc.)
            </li>
            <li className="flex gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-xifoz-blue/10 text-xifoz-blue text-xs font-semibold flex items-center justify-center">2</span>
              Scan the QR code or enter the secret key manually
            </li>
            <li className="flex gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-xifoz-blue/10 text-xifoz-blue text-xs font-semibold flex items-center justify-center">3</span>
              Enter the 6-digit code shown in your app to verify
            </li>
          </ol>

          {/* QR code */}
          <div className="flex flex-col items-center gap-4">
            {setupLoading ? (
              <div className="w-48 h-48 flex items-center justify-center bg-xifoz-base border border-xifoz-dim rounded-lg">
                <Spinner className="w-8 h-8 text-xifoz-blue" />
              </div>
            ) : qrCode ? (
              <div className="p-3 bg-white border border-xifoz-dim rounded-lg shadow-xs">
                <img
                  src={qrCode}
                  alt="2FA QR Code"
                  className="w-44 h-44 block"
                  draggable={false}
                />
              </div>
            ) : null}

            {/* Manual secret */}
            {secret && !setupLoading && (
              <div className="w-full">
                <p className="text-xs text-xifoz-text-secondary mb-1.5 text-center">
                  Can't scan? Enter this key manually:
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-xifoz-base border border-xifoz-dim rounded-lg px-3 py-2 font-mono text-sm text-xifoz-text tracking-widest text-center">
                    {secretVisible ? secret : secret.replace(/./g, '•')}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSecretVisible((v) => !v)}
                    className="p-2 rounded-lg bg-xifoz-base border border-xifoz-dim hover:bg-xifoz-dim transition-colors text-xifoz-text-secondary"
                    title={secretVisible ? 'Hide secret' : 'Show secret'}
                  >
                    {secretVisible ? <Lock className="w-4 h-4" /> : <KeyRound className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(secret).catch(() => {});
                      toast.success('Secret key copied');
                    }}
                    className="p-2 rounded-lg bg-xifoz-base border border-xifoz-dim hover:bg-xifoz-dim transition-colors text-xifoz-text-secondary"
                    title="Copy secret"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <Button
            id="enable-2fa-next"
            type="button"
            disabled={setupLoading || !qrCode}
            onClick={() => { setError(null); setPhase('verify'); }}
            className="w-full bg-xifoz-blue hover:bg-xifoz-blue/90 text-white rounded-lg"
          >
            Continue to Verification
          </Button>
        </div>
      )}

      {/* ── Phase: Verify – Enter code ── */}
      {phase === 'verify' && (
        <form onSubmit={handleVerify} className="p-6 space-y-5" noValidate>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-xifoz-text">Verify Your Authenticator</h3>
              <p className="text-sm text-xifoz-text-secondary mt-0.5">
                Enter the 6-digit code from your app
              </p>
            </div>
            <button
              id="verify-2fa-close"
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-md text-xifoz-text-secondary hover:bg-xifoz-dim transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-3.5 rounded-lg bg-red-50 border border-red-100 text-xifoz-danger">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="verify-2fa-code" className="block text-sm font-medium text-xifoz-text mb-1.5">
              Verification Code
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xifoz-text-secondary/40">
                <KeyRound className="w-4 h-4" />
              </span>
              <input
                id="verify-2fa-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-xifoz-base border border-xifoz-dim rounded-lg text-sm text-xifoz-text placeholder:text-xifoz-text-secondary/30 focus:outline-none focus:border-xifoz-blue/30 transition-colors font-mono tracking-widest"
                placeholder="000000"
                maxLength={6}
                autoFocus
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              id="verify-2fa-back"
              type="button"
              onClick={() => { setError(null); setPhase('setup'); }}
              disabled={loading}
              className="flex-none bg-xifoz-dim hover:bg-xifoz-dim/80 text-xifoz-text rounded-lg px-4"
            >
              Back
            </Button>
            <Button
              id="verify-2fa-submit"
              type="submit"
              disabled={loading}
              className="flex-1 bg-xifoz-blue hover:bg-xifoz-blue/90 text-white rounded-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner className="w-4 h-4" /> Verifying...
                </span>
              ) : (
                'Verify & Enable'
              )}
            </Button>
          </div>
        </form>
      )}

      {/* ── Phase: Backup codes ── */}
      {phase === 'backup' && (
        <BackupCodesDisplay
          codes={backupCodes}
          onDone={handleDone}
          title="2FA Enabled – Save Your Backup Codes"
        />
      )}
    </Modal>
  );
}

function Enable2FAModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  if (!open) return null;
  return <Enable2FAModalInner key={String(open)} onClose={onClose} onSuccess={onSuccess} />;
}

// ── Disable 2FA Modal ────────────────────────────────────────────────────────
function Disable2FAModalInner({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code.trim()) {
      setError('Please enter your authentication or backup code.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/api/auth/2fa/disable', { code: code.trim() });
      toast.success('Two-factor authentication disabled');
      onSuccess();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to disable 2FA. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={true} onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-5" noValidate>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-xifoz-text">Disable Two-Factor Authentication</h3>
            <p className="text-sm text-xifoz-text-secondary mt-0.5">
              Confirm your identity to disable 2FA
            </p>
          </div>
          <button
            id="disable-2fa-close"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-xifoz-text-secondary hover:bg-xifoz-dim transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-3 p-3.5 rounded-lg bg-red-50 border border-red-100">
          <ShieldOff className="w-4 h-4 text-xifoz-danger flex-shrink-0 mt-0.5" />
          <p className="text-xs text-xifoz-danger font-medium leading-relaxed">
            Disabling 2FA will reduce the security of your admin account. Your session may be audited.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-3.5 rounded-lg bg-red-50 border border-red-100 text-xifoz-danger">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div>
          <label htmlFor="disable-2fa-code" className="block text-sm font-medium text-xifoz-text mb-1.5">
            Authentication or Backup Code
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xifoz-text-secondary/40">
              <KeyRound className="w-4 h-4" />
            </span>
            <input
              id="disable-2fa-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-xifoz-base border border-xifoz-dim rounded-lg text-sm text-xifoz-text placeholder:text-xifoz-text-secondary/30 focus:outline-none focus:border-xifoz-blue/30 transition-colors font-mono tracking-widest"
              placeholder="000000 or XXXX-XXXX-XXXX"
              maxLength={17}
              autoFocus
              disabled={loading}
            />
          </div>
          <p className="mt-1.5 text-xs text-xifoz-text-secondary">
            Enter a 6-digit TOTP code or a backup code in the format{' '}
            <span className="font-mono">XXXX-XXXX-XXXX</span>.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            id="disable-2fa-cancel"
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-none bg-xifoz-dim hover:bg-xifoz-dim/80 text-xifoz-text rounded-lg px-4"
          >
            Cancel
          </Button>
          <Button
            id="disable-2fa-submit"
            type="submit"
            disabled={loading}
            className="flex-1 bg-xifoz-danger hover:bg-xifoz-danger/90 text-white rounded-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner className="w-4 h-4" /> Disabling...
              </span>
            ) : (
              'Disable 2FA'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function Disable2FAModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  if (!open) return null;
  return <Disable2FAModalInner key={String(open)} onClose={onClose} onSuccess={onSuccess} />;
}

// ── Regenerate Backup Codes Modal ────────────────────────────────────────────
function RegenerateModalInner({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [phase, setPhase] = useState<'confirm' | 'backup'>('confirm');
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code.trim()) {
      setError('Please enter your authentication code.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post<RegenerateResponse>(
        '/api/auth/2fa/regenerate-backup-codes',
        { code: code.trim() }
      );
      setBackupCodes(response.data.backupCodes);
      setPhase('backup');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to regenerate backup codes. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    toast.success('New backup codes generated successfully');
    onSuccess();
    onClose();
  };

  return (
    <Modal open={true} onClose={phase === 'backup' ? handleDone : onClose}>
      {phase === 'confirm' ? (
        <form onSubmit={handleSubmit} className="p-6 space-y-5" noValidate>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-xifoz-text">Regenerate Backup Codes</h3>
              <p className="text-sm text-xifoz-text-secondary mt-0.5">
                Enter your current TOTP code to generate new backup codes
              </p>
            </div>
            <button
              id="regen-close"
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-xifoz-text-secondary hover:bg-xifoz-dim transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-3.5 rounded-lg bg-amber-50 border border-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 font-medium leading-relaxed">
              Your existing backup codes will be invalidated immediately. Only the new codes will be valid.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-3.5 rounded-lg bg-red-50 border border-red-100 text-xifoz-danger">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="regen-code" className="block text-sm font-medium text-xifoz-text mb-1.5">
              Authenticator Code
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xifoz-text-secondary/40">
                <KeyRound className="w-4 h-4" />
              </span>
              <input
                id="regen-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-xifoz-base border border-xifoz-dim rounded-lg text-sm text-xifoz-text placeholder:text-xifoz-text-secondary/30 focus:outline-none focus:border-xifoz-blue/30 transition-colors font-mono tracking-widest"
                placeholder="000000"
                maxLength={6}
                autoFocus
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              id="regen-cancel"
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-none bg-xifoz-dim hover:bg-xifoz-dim/80 text-xifoz-text rounded-lg px-4"
            >
              Cancel
            </Button>
            <Button
              id="regen-submit"
              type="submit"
              disabled={loading}
              className="flex-1 bg-xifoz-blue hover:bg-xifoz-blue/90 text-white rounded-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner className="w-4 h-4" /> Generating...
                </span>
              ) : (
                'Regenerate Codes'
              )}
            </Button>
          </div>
        </form>
      ) : (
        <BackupCodesDisplay
          codes={backupCodes}
          onDone={handleDone}
          title="New Backup Codes Generated"
        />
      )}
    </Modal>
  );
}

function RegenerateModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  if (!open) return null;
  return <RegenerateModalInner key={String(open)} onClose={onClose} onSuccess={onSuccess} />;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminProfile() {
  const { user, getProfile } = useAuth();
  const [success, setSuccess] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── 2FA status
  const [twoFAStatus, setTwoFAStatus] = useState<TwoFAStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);

  // ── Modal visibility
  const [showEnable, setShowEnable] = useState(false);
  const [showDisable, setShowDisable] = useState(false);
  const [showRegenerate, setShowRegenerate] = useState(false);

  // ── Load 2FA status (used for manual refreshes after enable/disable/regen)
  const loadStatus = useCallback(async () => {
    setStatusLoading(true);
    setStatusError(null);
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: TwoFAStatus;
      }>('/api/auth/2fa/status');
      setTwoFAStatus(response.data);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to load 2FA status.';
      setStatusError(msg);
    } finally {
      setStatusLoading(false);
    }
  }, []);

  // Initial load on mount – define async fn inside effect to satisfy lint rule
  useEffect(() => {
    async function fetchStatus() {
      setStatusLoading(true);
      setStatusError(null);
      try {
        const response = await apiClient.get<{
          success: boolean;
          data: TwoFAStatus;
        }>('/api/auth/2fa/status');
        setTwoFAStatus(response.data);
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : 'Failed to load 2FA status.';
        setStatusError(msg);
      } finally {
        setStatusLoading(false);
      }
    }
    void fetchStatus();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setSuccess(false);
    setError(null);
    try {
      await getProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh profile.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatRole = (role?: string) => {
    if (!role) return 'Administrator';
    return role.split('_').map((word) => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* ── Title ── */}
      <div>
        <h2 className="text-xl font-normal text-xifoz-text tracking-tight">Admin Profile</h2>
        <p className="text-sm text-xifoz-text-secondary">View your administrative profile details and system access level.</p>
      </div>

      {/* ── Toasts / inline feedback ── */}
      {success && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-green-50 border border-green-100 text-xifoz-success text-sm font-medium" role="alert">
          <CheckCircle2 className="w-5 h-5" />
          <span>Profile refreshed successfully.</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-100 text-xifoz-danger text-sm font-medium" role="alert">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Profile card ── */}
      <div className="bg-xifoz-surface border border-xifoz-dim rounded-card p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-xifoz-text-secondary mb-1.5">Full Name</label>
            <div className="flex items-center gap-3 p-3 bg-xifoz-base border border-xifoz-dim rounded-lg text-xifoz-text text-sm">
              <User className="w-4 h-4 text-xifoz-text-secondary" />
              <span className="font-medium">{user?.name || 'N/A'}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-xifoz-text-secondary mb-1.5">Email Address</label>
            <div className="flex items-center gap-3 p-3 bg-xifoz-base border border-xifoz-dim rounded-lg text-xifoz-text text-sm">
              <Mail className="w-4 h-4 text-xifoz-text-secondary" />
              <span className="font-medium">{user?.email || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-xifoz-text-secondary mb-1.5">Security Role</label>
            <div className="flex items-center gap-3 p-3 bg-xifoz-dim rounded-lg text-xifoz-text text-sm">
              <Shield className="w-4 h-4 text-xifoz-text-secondary" />
              <span className="font-semibold text-xifoz-blue">{formatRole(user?.role)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-xifoz-text-secondary mb-1.5">Last Login</label>
            <div className="flex items-center gap-3 p-3 bg-xifoz-base border border-xifoz-dim rounded-lg text-xifoz-text text-sm">
              <Clock className="w-4 h-4 text-xifoz-text-secondary" />
              <span className="font-medium">
                {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'First session (New login)'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-xifoz-dim">
          <Button
            id="profile-refresh"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-xifoz-blue hover:bg-xifoz-blue/90 text-white rounded-lg px-6 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Profile'}</span>
          </Button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          SECURITY SECTION
      ══════════════════════════════════════════════════ */}
      <div>
        <h3 className="text-base font-semibold text-xifoz-text mb-1">Security</h3>
        <p className="text-sm text-xifoz-text-secondary mb-4">
          Manage account security settings including two-factor authentication.
        </p>

        {/* ── 2FA Card ── */}
        <div className="bg-xifoz-surface border border-xifoz-dim rounded-card p-6 shadow-sm">
          {/* Card header */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                  twoFAStatus?.enabled
                    ? 'bg-green-50 text-xifoz-success'
                    : 'bg-xifoz-dim text-xifoz-text-secondary'
                }`}
              >
                {twoFAStatus?.enabled ? (
                  <ShieldCheck className="w-5 h-5" />
                ) : (
                  <ShieldOff className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-semibold text-xifoz-text">Two-Factor Authentication</span>
                  {/* Status badge */}
                  {statusLoading ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-badge text-xs font-medium bg-xifoz-dim text-xifoz-text-secondary">
                      <Loader2 className="w-3 h-3 animate-spin" /> Loading
                    </span>
                  ) : twoFAStatus?.enabled ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-badge text-xs font-semibold bg-green-100 text-xifoz-success">
                      <CheckCircle2 className="w-3 h-3" /> Enabled
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-badge text-xs font-semibold bg-xifoz-dim text-xifoz-text-secondary">
                      Disabled
                    </span>
                  )}
                </div>

                <p className="text-sm text-xifoz-text-secondary mt-1 leading-relaxed">
                  {twoFAStatus?.enabled
                    ? `2FA is active. You have ${twoFAStatus.backupCodesCount} backup code${twoFAStatus.backupCodesCount !== 1 ? 's' : ''} remaining.`
                    : 'Add an extra layer of security to your admin account with a time-based one-time password (TOTP).'}
                </p>
              </div>
            </div>
          </div>

          {/* Status error */}
          {statusError && (
            <div className="mb-5 flex items-start gap-3 p-3.5 rounded-lg bg-red-50 border border-red-100 text-xifoz-danger">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-sm">{statusError}</span>
                <button
                  type="button"
                  onClick={loadStatus}
                  className="ml-2 text-xs underline hover:no-underline"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          {!statusLoading && !statusError && (
            <div className="flex flex-wrap gap-3 pt-4 border-t border-xifoz-dim">
              {!twoFAStatus?.enabled ? (
                /* Disabled state: one CTA */
                <Button
                  id="enable-2fa-btn"
                  type="button"
                  onClick={() => setShowEnable(true)}
                  className="bg-xifoz-blue hover:bg-xifoz-blue/90 text-white rounded-lg flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Enable 2FA
                </Button>
              ) : (
                /* Enabled state: two actions */
                <>
                  <Button
                    id="disable-2fa-btn"
                    type="button"
                    onClick={() => setShowDisable(true)}
                    className="bg-xifoz-dim hover:bg-xifoz-dim/80 text-xifoz-text rounded-lg flex items-center gap-2"
                  >
                    <ShieldOff className="w-4 h-4" />
                    Disable 2FA
                  </Button>

                  <Button
                    id="regen-backup-codes-btn"
                    type="button"
                    onClick={() => setShowRegenerate(true)}
                    className="bg-xifoz-dim hover:bg-xifoz-dim/80 text-xifoz-text rounded-lg flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Regenerate Backup Codes
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Loading skeleton */}
          {statusLoading && (
            <div className="pt-4 border-t border-xifoz-dim flex gap-3">
              <div className="h-9 w-32 bg-xifoz-dim rounded-lg animate-pulse" />
              <div className="h-9 w-44 bg-xifoz-dim rounded-lg animate-pulse" />
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      <Enable2FAModal
        open={showEnable}
        onClose={() => setShowEnable(false)}
        onSuccess={() => { loadStatus(); }}
      />

      <Disable2FAModal
        open={showDisable}
        onClose={() => setShowDisable(false)}
        onSuccess={() => { loadStatus(); }}
      />

      <RegenerateModal
        open={showRegenerate}
        onClose={() => setShowRegenerate(false)}
        onSuccess={() => { loadStatus(); }}
      />
    </div>
  );
}
