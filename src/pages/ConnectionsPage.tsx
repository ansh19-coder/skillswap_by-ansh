import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Video,
  Star,
  Inbox,
  Send,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Connection } from '@/types';

type Tab = 'incoming' | 'outgoing' | 'active';

export function ConnectionsPage() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('incoming');

  const fetchConnections = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('connections')
      .select('*, requester:profiles!connections_requester_id_fkey(*), receiver:profiles!connections_receiver_id_fkey(*), offered_skill:skills!connections_offered_skill_id_fkey(*), requested_skill:skills!connections_requested_skill_id_fkey(*)')
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });
    setConnections((data as unknown as Connection[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const handleAccept = async (conn: Connection) => {
    const { error } = await supabase
      .from('connections')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', conn.id);
    if (!error) {
      await supabase.from('notifications').insert({
        user_id: conn.requester_id,
        type: 'connection_accepted',
        title: 'Connection accepted!',
        message: 'Your skill exchange request was accepted',
      });
      fetchConnections();
    }
  };

  const handleReject = async (conn: Connection) => {
    const { error } = await supabase
      .from('connections')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', conn.id);
    if (!error) fetchConnections();
  };

  const handleCancel = async (conn: Connection) => {
    const { error } = await supabase
      .from('connections')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', conn.id);
    if (!error) fetchConnections();
  };

  const handleStartSession = async (conn: Connection) => {
    if (!user) return;
    const isRequester = conn.requester_id === user.id;
    const teacherId = isRequester ? conn.receiver_id : conn.requester_id;
    const learnerId = user.id;
    const roomName = `skillswap-${conn.id.slice(0, 8)}`;

    const { data, error } = await supabase.from('sessions').insert({
      connection_id: conn.id,
      teacher_id: teacherId,
      learner_id: learnerId,
      skill_id: conn.requested_skill_id,
      room_name: roomName,
      status: 'scheduled',
      scheduled_at: new Date().toISOString(),
    }).select('*').single();

    if (!error && data) {
      await supabase.from('notifications').insert({
        user_id: teacherId,
        type: 'session_scheduled',
        title: 'New learning session',
        message: 'A learning session has been scheduled with you',
      });
    }
  };

  const incoming = connections.filter((c) => c.receiver_id === user?.id && c.status === 'pending');
  const outgoing = connections.filter((c) => c.requester_id === user?.id && (c.status === 'pending' || c.status === 'rejected'));
  const active = connections.filter((c) => c.status === 'accepted' && (c.requester_id === user?.id || c.receiver_id === user?.id));

  const tabs: { key: Tab; label: string; count: number; icon: typeof Inbox }[] = [
    { key: 'incoming', label: 'Incoming', count: incoming.length, icon: Inbox },
    { key: 'outgoing', label: 'Outgoing', count: outgoing.length, icon: Send },
    { key: 'active', label: 'Active', count: active.length, icon: Users },
  ];

  const currentList = tab === 'incoming' ? incoming : tab === 'outgoing' ? outgoing : active;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Connections</h1>
        <p className="mt-1 text-slate-500">Manage your skill exchange requests and active connections</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              tab === t.key
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <t.icon size={16} />
            {t.label}
            {t.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                tab === t.key ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : currentList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Users size={40} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700">
            {tab === 'incoming' ? 'No incoming requests' : tab === 'outgoing' ? 'No outgoing requests' : 'No active connections'}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {tab === 'incoming' ? 'When someone wants to connect, it will appear here' : 'Start by discovering students to connect with'}
          </p>
          {tab !== 'incoming' && (
            <Link to="/discover" className="inline-flex items-center gap-2 mt-4 btn-primary text-sm">
              Discover Students <ArrowRight size={14} />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {currentList.map((conn) => {
            const isIncoming = conn.receiver_id === user?.id;
            const otherUser = isIncoming ? conn.requester : conn.receiver;
            return (
              <div key={conn.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 card-hover">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <Link to={`/profile/${otherUser?.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {otherUser?.full_name?.charAt(0).toUpperCase() ?? '?'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">{otherUser?.full_name ?? 'Unknown'}</h3>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        {otherUser?.college && <span>{otherUser.college}</span>}
                        {otherUser && otherUser.rating > 0 && (
                          <span className="flex items-center gap-0.5">
                            <Star size={12} className="text-amber-400 fill-amber-400" />
                            {otherUser.rating}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Skill info */}
                    <div className="flex items-center gap-2 text-sm">
                      {conn.offered_skill && (
                        <span className="skill-badge bg-primary-50 text-primary-700">
                          Offers: {conn.offered_skill.name}
                        </span>
                      )}
                      {conn.requested_skill && (
                        <span className="skill-badge bg-secondary-50 text-secondary-700">
                          Wants: {conn.requested_skill.name}
                        </span>
                      )}
                    </div>

                    {/* Status / Actions */}
                    {conn.status === 'pending' && isIncoming && (
                      <>
                        <button onClick={() => handleAccept(conn)} className="inline-flex items-center gap-1.5 px-3 py-2 bg-success-500 text-white rounded-xl text-sm font-medium hover:bg-success-600 transition-all">
                          <CheckCircle size={16} /> Accept
                        </button>
                        <button onClick={() => handleReject(conn)} className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-danger-50 hover:text-danger-600 transition-all">
                          <XCircle size={16} /> Reject
                        </button>
                      </>
                    )}
                    {conn.status === 'pending' && !isIncoming && (
                      <>
                        <span className="flex items-center gap-1 text-sm text-amber-600">
                          <Clock size={14} /> Pending
                        </span>
                        <button onClick={() => handleCancel(conn)} className="text-sm text-danger-600 hover:text-danger-700 font-medium">
                          Cancel
                        </button>
                      </>
                    )}
                    {conn.status === 'accepted' && (
                      <>
                        <span className="flex items-center gap-1 text-sm text-success-600">
                          <CheckCircle size={14} /> Connected
                        </span>
                        <button
                          onClick={() => handleStartSession(conn)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-all"
                        >
                          <Video size={16} /> Start Session
                        </button>
                        <Link to="/sessions" className="text-sm text-primary-600 font-medium hover:text-primary-700">
                          View Sessions
                        </Link>
                      </>
                    )}
                    {conn.status === 'rejected' && (
                      <span className="flex items-center gap-1 text-sm text-danger-600">
                        <XCircle size={14} /> Rejected
                      </span>
                    )}
                    {conn.status === 'cancelled' && (
                      <span className="flex items-center gap-1 text-sm text-slate-500">
                        <XCircle size={14} /> Cancelled
                      </span>
                    )}
                  </div>
                </div>

                {conn.message && (
                  <p className="mt-3 text-sm text-slate-500 bg-slate-50 rounded-xl px-4 py-2.5">
                    "{conn.message}"
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
