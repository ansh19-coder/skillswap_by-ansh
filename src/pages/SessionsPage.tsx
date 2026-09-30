import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Video,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Coins,
  Play,
  ArrowRight,
  Calendar,
  Users,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { LearningSession, Rating } from '@/types';

// Jitsi external API script
declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (domain: string, options: Record<string, unknown>) => JitsiMeetExternalAPIInstance;
  }
}

interface JitsiMeetExternalAPIInstance {
  dispose: () => void;
  executeCommand: (command: string, ...args: unknown[]) => void;
  addEventListener: (event: string, callback: (payload: unknown) => void) => void;
}

type Tab = 'upcoming' | 'live' | 'completed';

export function SessionsPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('upcoming');
  const [activeSession, setActiveSession] = useState<LearningSession | null>(null);
  const [ratingModal, setRatingModal] = useState<LearningSession | null>(null);
  const jitsiRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<JitsiMeetExternalAPIInstance | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('sessions')
      .select('*, teacher:profiles!sessions_teacher_id_fkey(*), learner:profiles!sessions_learner_id_fkey(*), skill:skills(*)')
      .or(`teacher_id.eq.${user.id},learner_id.eq.${user.id}`)
      .order('created_at', { ascending: false });
    setSessions((data as unknown as LearningSession[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Load Jitsi script
  useEffect(() => {
    if (activeSession && !window.JitsiMeetExternalAPI) {
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, [activeSession]);

  // Initialize Jitsi when active session
  useEffect(() => {
    if (!activeSession || !jitsiRef.current || !window.JitsiMeetExternalAPI) return;

    const domain = 'meet.jit.si';
    const options = {
      roomName: activeSession.room_name,
      width: '100%',
      height: '100%',
      parentNode: jitsiRef.current,
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
      },
      userInfo: {
        displayName: user?.email ?? 'Student',
      },
    };

    apiRef.current = new window.JitsiMeetExternalAPI(domain, options);

    apiRef.current.addEventListener('videoConferenceLeft', () => {
      handleLeaveSession();
    });

    // Update session status to live
    supabase
      .from('sessions')
      .update({ status: 'live', started_at: new Date().toISOString() })
      .eq('id', activeSession.id)
      .then(() => fetchSessions());

    return () => {
      apiRef.current?.dispose();
      apiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSession]);

  const handleLeaveSession = async () => {
    if (!activeSession) return;
    await supabase
      .from('sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', activeSession.id);

    // Transfer credits: learner pays 5, teacher earns 5
    if (activeSession.teacher_id && activeSession.learner_id) {
      // Deduct from learner
      await supabase.rpc('transfer_credits', {
        p_user_id: activeSession.learner_id,
        p_amount: -5,
      }).then(() => {});
      // Add to teacher
      await supabase.rpc('transfer_credits', {
        p_user_id: activeSession.teacher_id,
        p_amount: 5,
      }).then(() => {});
    }

    setActiveSession(null);
    apiRef.current?.dispose();
    apiRef.current = null;
    fetchSessions();
  };

  const handleJoinSession = (session: LearningSession) => {
    setActiveSession(session);
  };

  const upcoming = sessions.filter((s) => s.status === 'scheduled' || s.status === 'live');
  const live = sessions.filter((s) => s.status === 'live');
  const completed = sessions.filter((s) => s.status === 'completed');

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'upcoming', label: 'Upcoming', count: upcoming.length },
    { key: 'live', label: 'Live Now', count: live.length },
    { key: 'completed', label: 'Completed', count: completed.length },
  ];

  const currentList = tab === 'upcoming' ? upcoming : tab === 'live' ? live : completed;

  // Full-screen Jitsi view
  if (activeSession) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950">
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 rounded-xl bg-danger-500 flex items-center justify-center animate-pulse">
              <Video size={18} />
            </div>
            <div>
              <p className="font-semibold text-sm">Live Session</p>
              <p className="text-xs text-slate-400">
                {activeSession.skill?.name ?? 'Skill Session'} • Room: {activeSession.room_name}
              </p>
            </div>
          </div>
          <button
            onClick={handleLeaveSession}
            className="inline-flex items-center gap-2 px-4 py-2 bg-danger-600 text-white rounded-xl text-sm font-medium hover:bg-danger-700 transition-all"
          >
            <XCircle size={16} /> Leave Session
          </button>
        </div>
        <div ref={jitsiRef} className="w-full h-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Learning Sessions</h1>
        <p className="mt-1 text-slate-500">Join live classrooms and track your learning progress</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              tab === t.key ? 'border-primary-600 text-primary-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
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
          <Video size={40} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700">
            {tab === 'live' ? 'No live sessions right now' : tab === 'completed' ? 'No completed sessions yet' : 'No upcoming sessions'}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {tab === 'completed' ? 'Complete a session to see it here' : 'Connect with a student and start a session'}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {currentList.map((session) => {
            const isTeacher = session.teacher_id === user?.id;
            const otherUser = isTeacher ? session.learner : session.teacher;
            const hasRating = session.status === 'completed';
            return (
              <div key={session.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 card-hover">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {otherUser?.full_name?.charAt(0).toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{otherUser?.full_name ?? 'Unknown'}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        isTeacher ? 'bg-primary-50 text-primary-700' : 'bg-secondary-50 text-secondary-700'
                      }`}>
                        {isTeacher ? 'You are teaching' : 'You are learning'}
                      </span>
                      {session.skill && <span className="text-xs">• {session.skill.name}</span>}
                    </div>
                  </div>
                  {session.status === 'live' && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-danger-50 text-danger-600 rounded-full text-xs font-bold">
                      <span className="w-1.5 h-1.5 bg-danger-500 rounded-full animate-pulse" />
                      LIVE
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {session.scheduled_at ? new Date(session.scheduled_at).toLocaleDateString() : 'Scheduled'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {session.scheduled_at ? new Date(session.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                  {session.credits_transferred > 0 && (
                    <span className="flex items-center gap-1">
                      <Coins size={12} className="text-amber-500" />
                      {session.credits_transferred} credits
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  {session.status === 'scheduled' && (
                    <button
                      onClick={() => handleJoinSession(session)}
                      className="flex-1 btn-primary text-sm py-2.5"
                    >
                      <Play size={16} /> Join Now
                    </button>
                  )}
                  {session.status === 'live' && (
                    <button
                      onClick={() => handleJoinSession(session)}
                      className="flex-1 btn-primary text-sm py-2.5"
                    >
                      <Video size={16} /> Rejoin
                    </button>
                  )}
                  {session.status === 'completed' && (
                    <>
                      <span className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-success-50 text-success-700 rounded-xl text-sm font-medium">
                        <CheckCircle size={16} /> Completed
                      </span>
                      <button
                        onClick={() => setRatingModal(session)}
                        className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-amber-50 text-amber-700 rounded-xl text-sm font-medium hover:bg-amber-100 transition-all"
                      >
                        <Star size={16} /> Rate
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rating modal */}
      {ratingModal && (
        <RatingModal
          session={ratingModal}
          onClose={() => setRatingModal(null)}
          onRated={() => {
            setRatingModal(null);
            fetchSessions();
          }}
        />
      )}
    </div>
  );
}

function RatingModal({
  session,
  onClose,
  onRated,
}: {
  session: LearningSession;
  onClose: () => void;
  onRated: () => void;
}) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [existingRating, setExistingRating] = useState<Rating | null>(null);

  const rateeId = session.teacher_id === user?.id ? session.learner_id : session.teacher_id;

  useEffect(() => {
    if (!user) return;
    const checkExisting = async () => {
      const { data } = await supabase
        .from('ratings')
        .select('*')
        .eq('session_id', session.id)
        .eq('rater_id', user.id)
        .maybeSingle();
      if (data) {
        setExistingRating(data as Rating);
        setRating(data.rating);
        setReview(data.review ?? '');
      }
    };
    checkExisting();
  }, [user, session.id]);

  const handleSubmit = async () => {
    if (!user || rating === 0) return;
    setSubmitting(true);

    if (existingRating) {
      await supabase
        .from('ratings')
        .update({ rating, review })
        .eq('id', existingRating.id);
    } else {
      await supabase.from('ratings').insert({
        session_id: session.id,
        rater_id: user.id,
        ratee_id: rateeId,
        rating,
        review: review || null,
      });
    }

    setSubmitting(false);
    onRated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Rate your session</h2>
        <p className="text-sm text-slate-500 mb-6">
          How was your experience{session.skill ? ` learning ${session.skill.name}` : ''}?
        </p>

        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={36}
                className={`${(hover || rating) >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
              />
            </button>
          ))}
        </div>

        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Share your experience (optional)..."
          rows={3}
          className="input-field resize-none mb-4"
        />

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 btn-secondary text-sm">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
            className="flex-1 btn-primary text-sm disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : existingRating ? 'Update' : 'Submit Rating'}
            {!submitting && <ArrowRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
