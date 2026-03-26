'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarRange, Bell, Search, Ticket, CheckCircle2, Activity } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useUIStore, DateFilter } from '@/store/ui';
import api from '@/lib/axios';
import { UserNotification } from '@/types';
import { cn } from '@/lib/utils';

function formatTime(value: string) {
  return new Date(value).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function getNotificationIcon(type: string) {
  if (type.includes('progress')) {
    return <Activity className="h-4 w-4" />;
  }

  if (type.includes('status')) {
    return <CheckCircle2 className="h-4 w-4" />;
  }

  return <Ticket className="h-4 w-4" />;
}

export default function Navbar() {
  const { user } = useAuthStore();
  const { searchQuery, setSearchQuery, dateFilter, setDateFilter } = useUIStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement | null>(null);
  const notificationButtonRef = useRef<HTMLButtonElement | null>(null);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const firstName = user?.name?.trim().split(' ')[0] || 'Team';

    if (hour < 11) {
      return `Morning ${firstName}! Gaskeun hari ini 🔥`;
    }

    if (hour < 15) {
      return `Siang ${firstName}! Keep it going 💪`;
    }

    if (hour < 18) {
      return `Sore ${firstName}! Udah hampir finish nih 👀`;
    }

    return `Malam ${firstName}! Last push ya 🚀`;
  }, [user?.name]);

  const initials = useMemo(() => {
    return (user?.name || 'Guest User')
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0] || '')
      .join('')
      .toUpperCase();
  }, [user?.name]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get('/notifications');
        setNotifications(data.items || []);
        setUnreadCount(data.unread_count || 0);
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      }
    };

    fetchNotifications();
  }, []);

  const openNotifications = async () => {
    setShowNotifications((current) => !current);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showNotifications &&
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node) &&
        notificationButtonRef.current &&
        !notificationButtonRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showNotifications]);

  const markAsRead = async (notification: UserNotification) => {
    if (notification.read_at) {
      return;
    }

    try {
      await api.patch(`/notifications/${notification.id}/read`);
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, read_at: new Date().toISOString() } : item
        )
      );
      setUnreadCount((current) => Math.max(0, current - 1));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const markAllRead = async () => {
    if (unreadCount === 0) return;
    try {
      await api.post('/notifications/mark-all-read');
      setNotifications((current) =>
        current.map((item) => ({ ...item, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read', error);
    }
  };

  const getDateLabel = (filter: DateFilter) => {
    switch (filter) {
      case 'today': return 'Today';
      case '7days': return 'Last 7 Days';
      case '30days': return 'Last 30 Days';
      case 'all': return 'All Time';
    }
  };

  return (
    <header className="relative flex w-full items-center justify-between px-8 pt-6 xl:px-10">
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-500">{greeting}</p>
        <h1 className="text-[2rem] font-semibold tracking-tight text-slate-900">Dashboard</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 shadow-sm backdrop-blur xl:flex">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets, assets, hosts..."
            className="w-72 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="relative group">
          <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur cursor-pointer hover:bg-white transition-all">
            <CalendarRange className="h-4 w-4 text-emerald-500" />
            <span>{getDateLabel(dateFilter)}</span>
            
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            >
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={openNotifications}
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/80 text-slate-500 shadow-sm backdrop-blur"
            ref={notificationButtonRef}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-2.5 top-2.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 top-14 z-50 w-[22rem] rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.14)]"
              ref={notificationRef}
            >
              <div className="mb-4 flex items-center justify-between px-1">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Notifications</p>
                  <p className="text-xs text-slate-500">Updates for your account</p>
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllRead}
                    className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => markAsRead(notification)}
                      className={cn(
                        'w-full rounded-2xl border px-3 py-3 text-left transition-all',
                        notification.read_at
                          ? 'border-slate-100 bg-slate-50'
                          : 'border-emerald-100 bg-emerald-50/60'
                      )}
                    >
                      <div className="flex gap-3">
                        <div className="mt-0.5 rounded-xl bg-white p-2 text-emerald-600 shadow-sm">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900 truncate">{notification.title}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-500 line-clamp-2">{notification.message}</p>
                          <p className="mt-2 text-[11px] font-medium text-slate-400">{formatTime(notification.created_at)}</p>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-center text-sm text-slate-400">
                    No notifications yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 rounded-full border border-white/70 bg-white/85 px-4 py-2 shadow-sm backdrop-blur">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">{user?.name || 'Guest'}</p>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">{user?.role || 'visitor'}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#dff7ea_0%,#ecfdf3_100%)] text-xs font-black uppercase tracking-[0.08em] text-primary shadow-inner">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
