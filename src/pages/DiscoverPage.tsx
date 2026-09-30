import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Star,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Filter,
  X,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Profile, Skill, UserSkill, Connection } from '@/types';

interface StudentWithSkills extends Profile {
  user_skills?: UserSkill[];
}

export function DiscoverPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentWithSkills[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState<StudentWithSkills | null>(null);
  const [existingConnections, setExistingConnections] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    const [studentsRes, skillsRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('*, user_skills(*, skill:skills(*))')
        .neq('id', user?.id ?? ''),
      supabase.from('skills').select('*').order('name'),
    ]);

    setStudents((studentsRes.data as unknown as StudentWithSkills[]) ?? []);
    setSkills(skillsRes.data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!user) return;
    const fetchConnections = async () => {
      const { data } = await supabase
        .from('connections')
        .select('receiver_id, status')
        .eq('requester_id', user.id);
      if (data) {
        setExistingConnections(new Set(data.map((c) => c.receiver_id)));
      }
    };
    fetchConnections();
  }, [user]);

  const filtered = students.filter((s) => {
    const matchesSearch =
      !searchQuery ||
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.college?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSkill =
      !selectedSkill ||
      s.user_skills?.some((us) => us.skill_id === selectedSkill && us.type === 'teach');

    return matchesSearch && matchesSkill;
  });

  const skillCategories = [...new Set(skills.map((s) => s.category).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Discover Students</h1>
        <p className="mt-1 text-slate-500">Find peers who can teach what you want to learn</p>
      </div>

      {/* Search bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or college..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-12"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          )}
        </div>
        {selectedSkill && (
          <button
            onClick={() => setSelectedSkill(null)}
            className="inline-flex items-center gap-2 px-4 py-3 bg-primary-50 text-primary-700 rounded-xl text-sm font-medium hover:bg-primary-100"
          >
            <Filter size={16} />
            {skills.find((s) => s.id === selectedSkill)?.name}
            <X size={14} />
          </button>
        )}
      </div>

      {/* Skill filter chips */}
      <div className="flex flex-wrap gap-2">
        {skills.slice(0, 20).map((skill) => (
          <button
            key={skill.id}
            onClick={() => setSelectedSkill(selectedSkill === skill.id ? null : skill.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              selectedSkill === skill.id
                ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-300 hover:text-primary-700'
            }`}
          >
            {skill.name}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Search size={40} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700">No students found</h3>
          <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((student) => {
            const teachSkills = student.user_skills?.filter((s) => s.type === 'teach') ?? [];
            const learnSkills = student.user_skills?.filter((s) => s.type === 'learn') ?? [];
            const alreadyConnected = existingConnections.has(student.id);
            return (
              <div key={student.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm card-hover overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {student.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">{student.full_name}</h3>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        {student.college && (
                          <span className="flex items-center gap-1">
                            <GraduationCap size={13} />
                            {student.college}
                          </span>
                        )}
                        <span className="flex items-center gap-0.5">
                          <Star size={13} className="text-amber-400 fill-amber-400" />
                          {student.rating > 0 ? student.rating : 'New'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {student.bio && (
                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">{student.bio}</p>
                  )}

                  {teachSkills.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-slate-400 uppercase mb-1.5">Can teach</p>
                      <div className="flex flex-wrap gap-1.5">
                        {teachSkills.slice(0, 4).map((s) => (
                          <span key={s.id} className="skill-badge bg-primary-50 text-primary-700">{s.skill?.name}</span>
                        ))}
                        {teachSkills.length > 4 && (
                          <span className="skill-badge bg-slate-100 text-slate-500">+{teachSkills.length - 4}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {learnSkills.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-slate-400 uppercase mb-1.5">Wants to learn</p>
                      <div className="flex flex-wrap gap-1.5">
                        {learnSkills.slice(0, 3).map((s) => (
                          <span key={s.id} className="skill-badge bg-secondary-50 text-secondary-700">{s.skill?.name}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-3 border-t border-slate-50">
                    <Link
                      to={`/profile/${student.id}`}
                      className="flex-1 btn-secondary text-sm py-2"
                    >
                      View Profile
                    </Link>
                    <button
                      onClick={() => setShowRequestModal(student)}
                      disabled={alreadyConnected}
                      className="flex-1 btn-primary text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {alreadyConnected ? 'Requested' : 'Connect'}
                      {!alreadyConnected && <ArrowRight size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Request modal */}
      {showRequestModal && (
        <RequestModal
          student={showRequestModal}
          skills={skills}
          myLearnSkills={undefined}
          onClose={() => setShowRequestModal(null)}
          onSent={() => {
            setExistingConnections((prev) => new Set([...prev, showRequestModal.id]));
            setShowRequestModal(null);
          }}
        />
      )}
    </div>
  );
}

function RequestModal({
  student,
  skills,
  onClose,
  onSent,
}: {
  student: StudentWithSkills;
  skills: Skill[];
  myLearnSkills?: UserSkill[];
  onClose: () => void;
  onSent: () => void;
}) {
  const { user } = useAuth();
  const [offeredSkill, setOfferedSkill] = useState('');
  const [requestedSkill, setRequestedSkill] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const teachSkills = student.user_skills?.filter((s) => s.type === 'teach') ?? [];

  const handleSend = async () => {
    if (!user) return;
    if (!requestedSkill) {
      setError('Please select a skill you want to learn');
      return;
    }
    setSending(true);
    setError('');

    const { error: err } = await supabase.from('connections').insert({
      requester_id: user.id,
      receiver_id: student.id,
      offered_skill_id: offeredSkill || null,
      requested_skill_id: requestedSkill || null,
      message: message || null,
      status: 'pending',
    });

    // Create notification for receiver
    if (!err) {
      await supabase.from('notifications').insert({
        user_id: student.id,
        type: 'connection_request',
        title: 'New skill exchange request',
        message: `${user.email} wants to connect with you`,
      });
    }

    setSending(false);
    if (err) {
      setError(err.message);
    } else {
      onSent();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Connect with {student.full_name}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-danger-50 text-danger-700 rounded-xl text-sm">{error}</div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Skill you want to learn
            </label>
            <select
              value={requestedSkill}
              onChange={(e) => setRequestedSkill(e.target.value)}
              className="input-field"
            >
              <option value="">Select a skill...</option>
              {teachSkills.map((s) => (
                <option key={s.id} value={s.skill_id}>{s.skill?.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Skill you can offer (optional)
            </label>
            <select
              value={offeredSkill}
              onChange={(e) => setOfferedSkill(e.target.value)}
              className="input-field"
            >
              <option value="">Select a skill...</option>
              {skills.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi! I'd love to learn from you..."
              rows={3}
              className="input-field resize-none"
            />
          </div>

          <button onClick={handleSend} disabled={sending} className="btn-primary w-full">
            {sending ? 'Sending...' : 'Send Request'}
            {!sending && <MessageSquare size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
