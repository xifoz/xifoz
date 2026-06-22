import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { CheckCircle2, User, Mail, Shield } from 'lucide-react';

export default function AdminProfile() {
  const { admin, login } = useAuth();
  const [name, setName] = useState(admin?.name || '');
  const [email, setEmail] = useState(admin?.email || '');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    if (name.trim() && email.trim()) {
      login(email, name);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-normal text-xifoz-text tracking-tight">Admin Profile</h2>
        <p className="text-sm text-xifoz-text-secondary">Update your administrative profile details and credentials.</p>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-green-50 border border-green-100 text-xifoz-success text-sm font-medium" role="alert">
          <CheckCircle2 className="w-5 h-5" />
          <span>Profile updated successfully.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-xifoz-surface border border-xifoz-dim rounded-card p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-xifoz-text mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xifoz-text-secondary/40">
                <User className="w-4 h-4" />
              </span>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-xifoz-base border border-xifoz-dim rounded-lg text-sm text-xifoz-text focus:outline-none focus:border-xifoz-blue/30 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-xifoz-text mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xifoz-text-secondary/40">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-xifoz-base border border-xifoz-dim rounded-lg text-sm text-xifoz-text focus:outline-none focus:border-xifoz-blue/30 transition-colors"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-xifoz-text mb-1.5">
            Security Role
          </label>
          <div className="flex items-center gap-2 p-3 bg-xifoz-dim rounded-lg text-xifoz-text text-sm">
            <Shield className="w-4 h-4 text-xifoz-text-secondary" />
            <span className="font-medium">Super Administrator</span>
            <span className="text-xs text-xifoz-text-secondary">(Root Level clearance)</span>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-xifoz-dim">
          <Button type="submit" className="bg-xifoz-blue hover:bg-xifoz-blue/90 text-white rounded-lg px-6">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
