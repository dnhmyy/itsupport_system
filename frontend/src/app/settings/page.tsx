'use client';

import { useEffect, useState } from 'react';
import {
  UserCircle2,
  LockKeyhole,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import api from '@/lib/axios';
import axios from 'axios';
import { useAuthStore } from '@/store/auth';
import { PROFILE_ICON_PRESETS, ProfileAvatar } from '@/components/profile/ProfileAvatar';

interface SettingsResponse {
  profile: {
    name: string;
    email: string;
    role: string;
    team: string;
    profile_icon: string | null;
    requester_icon: string | null;
  };
}

export default function SettingsPage() {
  const { user, setAuth } = useAuthStore();
  const [settings, setSettings] = useState<SettingsResponse | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: '',
    profile_icon: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
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
        setProfileForm({
          name: data.profile.name,
          profile_icon: data.profile.profile_icon || '',
        });
      } catch (error) {
        console.error('Failed to fetch settings', error);
      }
    };

    fetchSettings();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage('');
    try {
      const { data } = await api.put('/settings/profile', profileForm);
      setSettings((prev) => prev ? {
        ...prev,
        profile: {
          ...prev.profile,
          name: data.profile.name,
          profile_icon: data.profile.profile_icon
        }
      } : null);

      if (user) {
        setAuth({
          ...user,
          name: data.profile.name,
          profile_icon: data.profile.profile_icon
        });
      }
      setProfileMessage('Profile updated successfully');
      setTimeout(() => setProfileMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update profile', error);
    } finally {
      setSavingProfile(false);
    }
  };

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
        <div className="rounded-3xl border border-[var(--border)] bg-white/92 p-8 shadow-sm">
          <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:text-left">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#eef5ff_0%,#d4e4fb_100%)] text-primary shadow-inner">
              <ProfileAvatar iconId={settings?.profile.profile_icon} name={settings?.profile.name} />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex flex-col items-center gap-2 lg:flex-row lg:gap-3">
                <h2 className="text-3xl font-bold text-slate-900">{settings?.profile.name || 'Loading...'}</h2>
                <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                  {settings?.profile.role || 'Role'}
                </span>
              </div>
              <p className="text-slate-500">{settings?.profile.email || 'Email'}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm font-medium text-slate-600 lg:justify-start">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Team: {settings?.profile.team || 'IT Support'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <span>Account Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleProfileUpdate} className="rounded-3xl border border-[var(--border)] bg-white/92 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[var(--primary-soft)] p-3 text-primary">
                <UserCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Account</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">Edit Profile</h2>
              </div>
            </div>
            <button
              type="submit"
              disabled={savingProfile}
              className="rounded-2xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:opacity-90 disabled:opacity-50"
            >
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div className="mt-8 space-y-6">
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Display Name</label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-[var(--surface-soft)] px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:bg-white"
                placeholder="Your full name"
              />
              <p className="text-[11px] text-slate-400">This name will be visible in the sidebar and on tickets you create.</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Profile Avatar</label>
              </div>

              <div className="rounded-[24px] border border-slate-100 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_100%)] p-3.5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[18px] border border-white/70 bg-white shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
                    <ProfileAvatar iconId={profileForm.profile_icon} name={profileForm.name} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setProfileForm({ ...profileForm, profile_icon: '' })}
                    disabled={savingProfile || !profileForm.profile_icon}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {PROFILE_ICON_PRESETS.map((preset) => {
                  const isActive = profileForm.profile_icon === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setProfileForm({ ...profileForm, profile_icon: preset.id })}
                      disabled={savingProfile}
                      aria-label={`Pilih avatar ${preset.label}`}
                      className={`rounded-[18px] border p-2 transition-all ${
                        isActive
                          ? 'border-primary bg-[var(--primary-soft)] shadow-[0_8px_20px_rgba(36,99,235,0.12)]'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        <div className={`h-14 w-14 overflow-hidden rounded-[14px] border ${
                          isActive ? 'border-white/70 bg-white' : 'border-slate-100 bg-slate-50'
                        }`}>
                          <ProfileAvatar iconId={preset.id} name={preset.label} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {profileMessage && (
            <div className="mt-6 flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 animate-in fade-in slide-in-from-bottom-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>{profileMessage}</span>
            </div>
          )}
        </form>

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
