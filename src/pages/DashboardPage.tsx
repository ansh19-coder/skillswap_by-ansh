import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Video,
  Coins,
  Star,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Connection, LearningSession, UserSkill } from '@/types';

export function DashboardPage() {
  const { user, profile } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [connRes, sessRes, skillsRes] = await Promise.all([
        supabase
          .from('connections')
          .select('*, requester:profiles!connections_requester_id_fkey(*), receiver:profiles!connections_receiver_id_fkey(*), offered_skill:skills!connections_offered_skill_id_fkey(*), requested_skill:skills!connections_requested_skill_id_fkey(*)')
          .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('sessions')
          .select('*, teacher:profiles!sessions_teacher_id_fkey(*), learner:profiles!sessions_learner_id_fkey(*), skill:skills(*)')
          .or(`teacher_id.eq.${user.id},learner_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('user_skills')
          .select('*, skill:skills(*)')
          .eq('user_id', user.id),
      ]);

      setConnections(connRes.data as unknown as Connection[] ?? []);
      setSessions(sessRes.data as unknown as LearningSession[] ?? []);
      setUserSkills(skillsRes.data as unknown as UserSkill[] ?? []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const teachSkills = userSkills.filter((s) => s.type === 'teach');
  const learnSkills = userSkills.filter((s) => s.type === 'learn');
  const acceptedConnections = connections.filter((c) => c.status === 'accepted');
  const pendingRequests = connections.filter((c) => c.status === 'pending' && c.receiver_id === user?.id);
  const completedSessions = sessions.filter((s) => s.status === 'completed');

  const stats = [
    { label: 'Connections', value: acceptedConnections.length, icon: Users, color: 'from-blue-500 to-indigo-600' },
    { label: 'Sessions', value: sessions.length, icon: Video, color: 'from-rose-500 to-pink-600' },
    { label: 'Credits', value: profile?.credits ?? 0, icon: Coins, color: 'from-amber-500 to-orange-600' },
    { label: 'Rating', value: profile?.rating ?? 0, icon: Star, color: 'from-emerald-500 to-teal-600' },
  ];

  const statusConfig: Record<string, { icon: typeof CheckCircle; color: string }> = {
    pending: { icon: Clock, color: 'text-amber-500 bg-amber-50' },
    accepted: { icon: CheckCircle, color: 'text-success-600 bg-success-50' },
    rejected: { icon: XCircle, color: 'text-danger-600 bg-danger-50' },
    cancelled: { icon: XCircle, color: 'text-slate-500 bg-slate-100' },
    completed: { icon: CheckCircle, color: 'text-success-600 bg-success-50' },
    scheduled: { icon: Clock, color: 'text-primary-600 bg-primary-50' },
    live: { icon: Video, color: 'text-danger-600 bg-danger-50' },
  };

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-500 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-primary-600/20">
        <h1 className="text-2xl sm:text-3xl font-bold">Welcome back, {profile?.full_name?.split(' ')[0] ?? 'Student'}!</h1>
        <p className="mt-2 text-white/80">Ready to learn something new today?</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/discover" className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-all backdrop-blur-sm">
            <Sparkles size={16} />
            Discover Skills
          </Link>
          <Link to="/sessions" className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-all backdrop-blur-sm">
            <Video size={16} />
            My Sessions
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm card-hover">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-lg`}>
              <stat.icon size={20} className="text-white" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-sm text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent connections */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-900">Recent Activity</h2>
              <Link to="/connections" className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {connections.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Users size={32} className="mx-auto mb-2 text-slate-300" />
                  <p>No connections yet. Start discovering peers!</p>
                  <Link to="/discover" className="inline-flex items-center gap-1 mt-3 text-primary-600 font-medium text-sm">
                    Discover <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                connections.map((conn) => {
                  const otherUser = conn.requester_id === user?.id ? conn.receiver : conn.requester;
                  const isIncoming = conn.receiver_id === user?.id;
                  const sc = statusConfig[conn.status];
                  return (
                    <div key={conn.id} className="p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold text-sm">
                        {otherUser?.full_name?.charAt(0).toUpperCase() ?? '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{otherUser?.full_name ?? 'Unknown'}</p>
                        <p className="text-xs text-slate-500">
                          {isIncoming ? 'Wants to connect with you' : 'You sent a request'}
                          {conn.requested_skill && ` for ${conn.requested_skill.name}`}
                        </p>
                      </div>
                      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${sc.color}`}>
                        <sc.icon size={12} />
                        {conn.status}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Sidebar widgets */}
          <div className="space-y-6">
            {/* My skills summary */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="font-bold text-slate-900 mb-4">My Skills</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Teaching</p>
                  <div className="flex flex-wrap gap-1.5">
                    {teachSkills.length === 0 ? (
                      <p className="text-sm text-slate-400">No skills added yet</p>
                    ) : (
                      teachSkills.map((s) => (
                        <span key={s.id} className="skill-badge bg-primary-50 text-primary-700">{s.skill?.name}</span>
                      ))
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Learning</p>
                  <div className="flex flex-wrap gap-1.5">
                    {learnSkills.length === 0 ? (
                      <p className="text-sm text-slate-400">No skills added yet</p>
                    ) : (
                      learnSkills.map((s) => (
                        <span key={s.id} className="skill-badge bg-secondary-50 text-secondary-700">{s.skill?.name}</span>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <Link to="/profile" className="mt-4 text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
                Manage skills <ArrowRight size={14} />
              </Link>
            </div>

            {/* Pending requests */}
            {pendingRequests.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={18} className="text-amber-500" />
                  <h2 className="font-bold text-slate-900">Pending Requests</h2>
                </div>
                <p className="text-sm text-slate-500 mb-3">
                  You have {pendingRequests.length} pending request{pendingRequests.length > 1 ? 's' : ''}
                </p>
                <Link to="/connections" className="btn-secondary w-full text-sm">
                  Review Requests
                </Link>
              </div>
            )}

            {/* Recent sessions */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="font-bold text-slate-900 mb-4">Recent Sessions</h2>
              {sessions.length === 0 ? (
                <div className="text-center text-slate-400 py-4">
                  <Video size={28} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">No sessions yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sessions.slice(0, 3).map((sess) => {
                    const isTeacher = sess.teacher_id === user?.id;
                    const otherUser = isTeacher ? sess.learner : sess.teacher;
                    const sc = statusConfig[sess.status];
                    return (
                      <Link key={sess.id} to="/sessions" className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className={`w-2 h-2 rounded-full ${sc.color.split(' ')[0].replace('text-', 'bg-')}`} />
                        <span className="text-sm text-slate-700 flex-1 truncate">
                          {otherUser?.full_name ?? 'Session'}
                        </span>
                        <span className={`text-xs ${sc.color.split(' ')[0]}`}>{sess.status}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
