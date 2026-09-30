import { type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  Compass,
  User,
  Users,
  Video,
  Bell,
  LogOut,
  Menu,
  X,
  Coins,
  Star,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/discover', label: 'Discover', icon: Compass },
  { path: '/connections', label: 'Connections', icon: Users },
  { path: '/sessions', label: 'Sessions', icon: Video },
  { path: '/profile', label: 'Profile', icon: User },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);
      setUnreadCount(count ?? 0);
    };
    fetchUnread();
  }, [user, location.pathname]);

  const handleSignOut = () => {
    signOut().then(() => navigate('/'));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 bg-white border-r border-slate-200 z-30">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <Link to="/">
            <Logo size={32} textClassName="text-lg text-slate-900" />
          </Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            );
          })}
          <Link
            to="/notifications"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
              location.pathname === '/notifications'
                ? 'bg-primary-50 text-primary-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Bell size={20} />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-auto w-5 h-5 text-[10px] font-bold text-white bg-danger-500 rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Link>
        </nav>

        {/* User card */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-sm">
              {profile?.full_name?.charAt(0).toUpperCase() ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{profile?.full_name ?? 'User'}</p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-0.5">
                  <Coins size={12} className="text-amber-500" />
                  {profile?.credits ?? 0}
                </span>
                <span className="flex items-center gap-0.5">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  {profile?.rating ?? 0}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-danger-600 hover:bg-danger-50 transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 inset-y-0 w-64 bg-white flex flex-col animate-fade-in">
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
              <Logo size={32} textClassName="text-lg text-slate-900" />
              <button onClick={() => setSidebarOpen(false)}>
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1" onClick={() => setSidebarOpen(false)}>
              {navItems.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-200">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-danger-600 hover:bg-danger-50"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-20 glass border-b border-slate-200 h-16 flex items-center px-4">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={22} className="text-slate-700" />
          </button>
          <div className="ml-4">
            <Logo size={28} textClassName="text-base text-slate-900" />
          </div>
          <Link to="/notifications" className="ml-auto relative">
            <Bell size={20} className="text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] font-bold text-white bg-danger-500 rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Link>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
