import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Sliders, Shield, Bell } from 'lucide-react';

export default function AdminSettings() {
  const [portalTitle, setPortalTitle] = useState('XIFOZ Admin Portal');
  const [rateLimit, setRateLimit] = useState(60);
  const [sessionTimeout, setSessionTimeout] = useState(7);
  const [notifications, setNotifications] = useState(true);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-normal text-xifoz-text tracking-tight">Portal Settings</h2>
        <p className="text-sm text-xifoz-text-secondary">Configure system-wide administrative options and constraints.</p>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-green-50 border border-green-100 text-xifoz-success text-sm font-medium" role="alert">
          <CheckCircle2 className="w-5 h-5" />
          <span>Settings saved successfully.</span>
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
            />
            <label htmlFor="notifications" className="text-sm text-xifoz-text font-medium cursor-pointer">
              Enable critical alerts emails for failed authentication audit entries
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-xifoz-dim">
          <Button type="submit" className="bg-xifoz-blue hover:bg-xifoz-blue/90 text-white rounded-lg px-6">
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
