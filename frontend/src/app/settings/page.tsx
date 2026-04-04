'use client';

import { useEffect, useState } from 'react';
import { UserCircle2, LockKeyhole, CheckCircle2 } from 'lucide-react';
import api from '@/lib/axios';
import axios from 'axios';

interface SettingsResponse {
  profile: {
    name: string;
    email: string;
    role: string;
    team: string;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsResponse | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        setSettings(data);
      } catch (error) {
        console.error('Failed to fetch settings', error);
      }
    };

    fetchSettings();
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordMessage('');
    setPasswordError('');

    try {
      const { data } = await api.put('/settings/password', passwordForm);
      setPasswordMessage(data.message || 'Password updated successfully.');
      setPasswordForm({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.response?.data?.errors?.current_password?.[0] || 'Failed to update password.'
        : 'Failed to update password.';
      setPasswordError(message);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-slate-500">Manage your account information and update your password.</p>
      </div>

      <div className="grid gap-6">
        <div className="rounded-3xl border border-[var(--border)] bg-white/92 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[var(--primary-soft)] p-3 text-primary">
              <UserCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Profile</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">Current account</h2>
            </div>
          </div>
          <div className="mt-6 space-y-3 text-sm text-slate-600">
            <p>Name: <span className="font-semibold text-slate-900">{settings?.profile.name || '-'}</span></p>
            <p>Email: <span className="font-semibold text-slate-900">{settings?.profile.email || '-'}</span></p>
            <p>Role: <span className="font-semibold uppercase text-slate-900">{settings?.profile.role || '-'}</span></p>
            <p>Team: <span className="font-semibold text-slate-900">{settings?.profile.team || '-'}</span></p>
          </div>
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-white/92 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[var(--primary-soft)] p-3 text-primary">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Account Security</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">Change password</h2>
            </div>
          </div>

          <form className="mt-6 grid gap-4 lg:grid-cols-3" onSubmit={handlePasswordChange}>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Current Password</label>
              <input
                type="password"
                required
                value={passwordForm.current_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-[var(--surface-soft)] px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">New Password</label>
              <input
                type="password"
                required
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-[var(--surface-soft)] px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Confirm New Password</label>
              <input
                type="password"
                required
                value={passwordForm.new_password_confirmation}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-[var(--surface-soft)] px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-white"
              />
            </div>

            <div className="lg:col-span-3 flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-sm text-slate-500">
              <p>Use a new password with at least 8 characters. Your new password will be used the next time you sign in.</p>
              {passwordMessage && (
                <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 font-medium text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{passwordMessage}</span>
                </div>
              )}
              {passwordError && (
                <div className="rounded-2xl bg-rose-50 px-4 py-3 font-medium text-rose-600">
                  {passwordError}
                </div>
              )}
              <div>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(21,104,187,0.18)] transition-all hover:opacity-90 disabled:opacity-60"
                >
                  {savingPassword ? 'Saving Password...' : 'Save New Password'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
