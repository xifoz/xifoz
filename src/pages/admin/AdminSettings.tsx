import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Sliders, Shield, Bell, AlertCircle, Loader2 } from 'lucide-react';
import { apiClient, ApiError } from '@/lib/api-client';

interface SettingsData {
  portalTitle: string;
  rateLimit: number;
  sessionTimeout: number;
  notificationsEnabled: boolean;
}

interface SettingsResponse {
  success: boolean;
  message: string;
  data: SettingsData;
}

export default function AdminSettings() {
  const [portalTitle, setPortalTitle] = useState('XIFOZ Admin Portal');
  const [rateLimit, setRateLimit] = useState(60);
  const [sessionTimeout, setSessionTimeout] = useState(7);
  const [notifications, setNotifications] = useState(true);

  // Status & error states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Store last successfully fetched/saved state for rollback
  const lastSavedState = useRef<SettingsData | null>(null);

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.get<SettingsResponse>('/api/admin/settings');
        
        if (!active) return;
        
        if (res.success && res.data) {
          const { portalTitle, rateLimit, sessionTimeout, notificationsEnabled } = res.data;
          setPortalTitle(portalTitle);
          setRateLimit(rateLimit);
          setSessionTimeout(sessionTimeout);
          setNotifications(notificationsEnabled);
          
          lastSavedState.current = {
            portalTitle,
            rateLimit,
            sessionTimeout,
            notificationsEnabled,
          };
        } else {
          throw new Error('Failed to retrieve system settings.');
        }
      } catch (err) {
        if (!active) return;
        console.error('Error fetching system settings:', err);
        setError(err instanceof Error ? err.message : 'Error fetching system settings.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const payload: SettingsData = {
      portalTitle: portalTitle.trim(),
      rateLimit,
      sessionTimeout,
      notificationsEnabled: notifications,
    };

    try {
      const res = await apiClient.patch<SettingsResponse>('/api/admin/settings', payload);
      
      if (res.success && res.data) {
        const { portalTitle, rateLimit, sessionTimeout, notificationsEnabled } = res.data;
        setPortalTitle(portalTitle);
        setRateLimit(rateLimit);
        setSessionTimeout(sessionTimeout);
        setNotifications(notificationsEnabled);
        
        lastSavedState.current = {
          portalTitle,
          rateLimit,
          sessionTimeout,
          notificationsEnabled,
        };

        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error('Failed to save settings.');
      }
    } catch (err) {
      console.error('Error saving system settings:', err);
      // Rollback values to last known good state
      if (lastSavedState.current) {
        setPortalTitle(lastSavedState.current.portalTitle);
        setRateLimit(lastSavedState.current.rateLimit);
        setSessionTimeout(lastSavedState.current.sessionTimeout);
        setNotifications(lastSavedState.current.notificationsEnabled);
      }
      
      if (err instanceof ApiError && err.errors) {
        const messages = Object.entries(err.errors)
          .map(([field, msgs]) => `${field === 'general' ? '' : field + ': '}${msgs.join(', ')}`)
          .join('; ');
        setError(messages || err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to save settings.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
        <Loader2 className="w-8 h-8 text-xifoz-blue animate-spin" />
        <span className="text-sm text-xifoz-text-secondary">Loading portal settings...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-normal text-xifoz-text tracking-tight">Portal Settings</h2>
        <p className="text-sm text-xifoz-text-secondary">Configure system-wide administrative options and constraints.</p>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-green-50 border border-green-100 text-xifoz-success text-sm font-medium" role="alert">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-100 text-xifoz-danger" role="alert">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm font-medium">
            <p className="font-semibold mb-1">Failed to update settings:</p>
            <p className="opacity-90">{error}</p>
            <p className="text-[11px] mt-1 text-xifoz-danger/80">Values have been rolled back to their last saved state.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-xifoz-surface border border-xifoz-dim rounded-card p-6 shadow-sm space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-xifoz-text flex items-center gap-2 pb-2 border-b border-xifoz-dim">
            <Sliders className="w-4 h-4 text-xifoz-text-secondary" />
            <span>General Configurations</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="portalTitle" className="block text-sm font-medium text-xifoz-text mb-1.5">
                Portal Custom Title
              </label>
              <input
                id="portalTitle"
                type="text"
                value={portalTitle}
                onChange={(e) => setPortalTitle(e.target.value)}
                className="w-full px-3 py-2 bg-xifoz-base border border-xifoz-dim rounded-lg text-sm text-xifoz-text focus:outline-none focus:border-xifoz-blue/30 transition-colors"
                required
                disabled={saving}
              />
            </div>

            <div>
              <label htmlFor="sessionTimeout" className="block text-sm font-medium text-xifoz-text mb-1.5">
                Session Expiration (Days)
              </label>
              <input
                id="sessionTimeout"
                type="number"
                min={1}
                max={30}
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(parseInt(e.target.value) || 7)}
                className="w-full px-3 py-2 bg-xifoz-base border border-xifoz-dim rounded-lg text-sm text-xifoz-text focus:outline-none focus:border-xifoz-blue/30 transition-colors"
                required
                disabled={saving}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-xifoz-text flex items-center gap-2 pb-2 border-b border-xifoz-dim">
            <Shield className="w-4 h-4 text-xifoz-text-secondary" />
            <span>API & Security Limits</span>
          </h3>

          <div>
            <label htmlFor="rateLimit" className="block text-sm font-medium text-xifoz-text mb-1.5">
              Global Contact rate limit (Requests per IP / hour)
            </label>
            <input
              id="rateLimit"
              type="number"
              min={10}
              max={1000}
              value={rateLimit}
              onChange={(e) => setRateLimit(parseInt(e.target.value) || 60)}
              className="w-full max-w-xs px-3 py-2 bg-xifoz-base border border-xifoz-dim rounded-lg text-sm text-xifoz-text focus:outline-none focus:border-xifoz-blue/30 transition-colors"
              required
              disabled={saving}
            />
            <p className="text-[11px] text-xifoz-text-secondary mt-1.5">
              Applies rate limit validation headers across all endpoints in this tenant space.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-xifoz-text flex items-center gap-2 pb-2 border-b border-xifoz-dim">
            <Bell className="w-4 h-4 text-xifoz-text-secondary" />
            <span>Alerts & Notifications</span>
          </h3>

          <div className="flex items-center gap-3">
            <input
              id="notifications"
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="w-4 h-4 text-xifoz-blue border-xifoz-dim rounded focus:ring-xifoz-blue cursor-pointer"
              disabled={saving}
            />
            <label htmlFor="notifications" className="text-sm text-xifoz-text font-medium cursor-pointer">
              Enable critical alerts emails for failed authentication audit entries
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-xifoz-dim">
          <Button type="submit" className="bg-xifoz-blue hover:bg-xifoz-blue/90 text-white rounded-lg px-6" disabled={saving}>
            {saving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </span>
            ) : (
              'Save Settings'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
