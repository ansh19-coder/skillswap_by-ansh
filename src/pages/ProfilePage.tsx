import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  GraduationCap,
  Coins,
  Calendar,
  Plus,
  X,
  Edit3,
  Save,
  Sparkles,
  ArrowLeft,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Profile, Skill, UserSkill, Connection } from '@/types';

export function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user, profile, refreshProfile } = useAuth();
  const isOwnProfile = !id || id === user?.id;
  const targetId = id ?? user?.id;

  const [targetProfile, setTargetProfile] = useState<Profile | null>(null);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [alreadyConnected, setAlreadyConnected] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editCollege, setEditCollege] = useState('');
  const [editBio, setEditBio] = useState('');

  const fetchProfile = useCallback(async () => {
    if (!targetId) return;
    const [profRes, skillsRes, allSkillsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', targetId).maybeSingle(),
      supabase.from('user_skills').select('*, skill:skills(*)').eq('user_id', targetId),
      supabase.from('skills').select('*').order('name'),
    ]);
    setTargetProfile(profRes.data as Profile | null);
    setUserSkills((skillsRes.data as unknown as UserSkill[]) ?? []);
    setSkills(allSkillsRes.data ?? []);
    if (isOwnProfile && profRes.data) {
      setEditName(profRes.data.full_name);
      setEditCollege(profRes.data.college ?? '');
      setEditBio(profRes.data.bio ?? '');
    }
    setLoading(false);
  }, [targetId, isOwnProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!user || !id || id === user.id) return;
    const checkConnection = async () => {
      const { data } = await supabase
        .from('connections')
        .select('id')
        .eq('requester_id', user.id)
        .eq('receiver_id', id)
        .maybeSingle();
      setAlreadyConnected(!!data);
    };
    checkConnection();
  }, [user, id]);

  const handleSaveProfile = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: editName,
        college: editCollege,
        bio: editBio,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
    if (!error) {
      await refreshProfile();
      await fetchProfile();
      setEditing(false);
    }
  };

  const handleAddSkill = async (skillId: string, type: 'teach' | 'learn', proficiency: string) => {
    if (!user) return;
    const { error } = await supabase.from('user_skills').insert({
      user_id: user.id,
      skill_id: skillId,
      type,
      proficiency,
    });
    if (!error) {
      await fetchProfile();
      setShowSkillModal(false);
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    if (!user) return;
    const { error } = await supabase.from('user_skills').delete().eq('id', skillId);
    if (!error) {
      await fetchProfile();
    }
  };

  const handleConnect = async () => {
    setShowRequestModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!targetProfile) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Profile not found</p>
        <Link to="/discover" className="mt-4 inline-flex text-primary-600 font-medium">Back to Discover</Link>
      </div>
    );
  }

  const teachSkills = userSkills.filter((s) => s.type === 'teach');
  const learnSkills = userSkills.filter((s) => s.type === 'learn');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {!isOwnProfile && (
        <Link to="/discover" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft size={16} /> Back to Discover
        </Link>
      )}

      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary-600 to-secondary-500" />
        <div className="px-6 sm:px-8 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-3xl shadow-xl border-4 border-white">
              {targetProfile.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              {editing ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-2xl font-bold text-slate-900 bg-transparent border-b border-slate-200 focus:border-primary-500 outline-none pb-1"
                />
              ) : (
                <h1 className="text-2xl font-bold text-slate-900">{targetProfile.full_name}</h1>
              )}
              <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-slate-500">
                {editing ? (
                  <input
                    value={editCollege}
                    onChange={(e) => setEditCollege(e.target.value)}
                    placeholder="College"
                    className="bg-transparent border-b border-slate-200 focus:border-primary-500 outline-none pb-0.5"
                  />
                ) : (
                  targetProfile.college && (
                    <span className="flex items-center gap-1">
                      <GraduationCap size={14} />
                      {targetProfile.college}
                    </span>
                  )
                )}
                <span className="flex items-center gap-1">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  {targetProfile.rating > 0 ? `${targetProfile.rating} (${targetProfile.rating_count} reviews)` : 'No reviews yet'}
                </span>
                <span className="flex items-center gap-1">
                  <Coins size={14} className="text-amber-500" />
                  {targetProfile.credits} credits
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  Joined {new Date(targetProfile.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            {isOwnProfile ? (
              editing ? (
                <button onClick={handleSaveProfile} className="btn-primary text-sm">
                  <Save size={16} /> Save
                </button>
              ) : (
                <button onClick={() => setEditing(true)} className="btn-secondary text-sm">
                  <Edit3 size={16} /> Edit Profile
                </button>
              )
            ) : (
              <button
                onClick={handleConnect}
                disabled={alreadyConnected}
                className="btn-primary text-sm disabled:opacity-50"
              >
                <MessageSquare size={16} />
                {alreadyConnected ? 'Requested' : 'Connect'}
              </button>
            )}
          </div>

          {/* Bio */}
          <div className="mt-6">
            {editing ? (
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Tell others about yourself..."
                rows={3}
                className="input-field resize-none"
              />
            ) : (
              targetProfile.bio ? (
                <p className="text-slate-600 leading-relaxed">{targetProfile.bio}</p>
              ) : (
                <p className="text-slate-400 text-sm italic">No bio added yet</p>
              )
            )}
          </div>
        </div>
      </div>

      {/* Skills section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-900">Skills</h2>
          {isOwnProfile && (
            <button onClick={() => setShowSkillModal(true)} className="btn-ghost text-sm text-primary-600">
              <Plus size={16} /> Add Skill
            </button>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Teaching */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                <Sparkles size={16} className="text-primary-600" />
              </div>
              <h3 className="font-semibold text-slate-700">Can Teach</h3>
            </div>
            {teachSkills.length === 0 ? (
              <p className="text-sm text-slate-400">No teaching skills added</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {teachSkills.map((s) => (
                  <div key={s.id} className="group flex items-center gap-1.5 skill-badge bg-primary-50 text-primary-700">
                    {s.skill?.name}
                    {isOwnProfile && (
                      <button onClick={() => handleRemoveSkill(s.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Learning */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-secondary-50 flex items-center justify-center">
                <GraduationCap size={16} className="text-secondary-600" />
              </div>
              <h3 className="font-semibold text-slate-700">Wants to Learn</h3>
            </div>
            {learnSkills.length === 0 ? (
              <p className="text-sm text-slate-400">No learning goals added</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {learnSkills.map((s) => (
                  <div key={s.id} className="group flex items-center gap-1.5 skill-badge bg-secondary-50 text-secondary-700">
                    {s.skill?.name}
                    {isOwnProfile && (
                      <button onClick={() => handleRemoveSkill(s.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add skill modal */}
      {showSkillModal && (
        <AddSkillModal
          skills={skills}
          existingSkillIds={userSkills.map((s) => s.skill_id)}
          onClose={() => setShowSkillModal(false)}
          onAdd={handleAddSkill}
        />
      )}

      {/* Request modal for other profiles */}
      {showRequestModal && !isOwnProfile && targetProfile && (
        <RequestModalSimple
          targetProfile={targetProfile}
          teachSkills={teachSkills}
          allSkills={skills}
          onClose={() => setShowRequestModal(false)}
          onSent={() => {
            setAlreadyConnected(true);
            setShowRequestModal(false);
          }}
        />
      )}
    </div>
  );
}

function AddSkillModal({
  skills,
  existingSkillIds,
  onClose,
  onAdd,
}: {
  skills: Skill[];
  existingSkillIds: string[];
  onClose: () => void;
  onAdd: (skillId: string, type: 'teach' | 'learn', proficiency: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [type, setType] = useState<'teach' | 'learn'>('teach');
  const [proficiency, setProficiency] = useState('intermediate');

  const available = skills.filter(
    (s) =>
      !existingSkillIds.includes(s.id) &&
      s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Add Skill</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setType('teach')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                type === 'teach' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Can Teach
            </button>
            <button
              onClick={() => setType('learn')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                type === 'learn' ? 'bg-secondary-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Want to Learn
            </button>
          </div>

          {type === 'teach' && (
            <select
              value={proficiency}
              onChange={(e) => setProficiency(e.target.value)}
              className="input-field"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          )}

          <input
            type="text"
            placeholder="Search skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            autoFocus
          />

          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {available.map((skill) => (
              <button
                key={skill.id}
                onClick={() => onAdd(skill.id, type, proficiency)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 transition-all text-left"
              >
                {skill.name}
              </button>
            ))}
          </div>
          {available.length === 0 && (
            <p className="text-center text-sm text-slate-400 py-4">No skills found</p>
          )}
        </div>
      </div>
    </div>
  );
}

function RequestModalSimple({
  targetProfile,
  teachSkills,
  allSkills,
  onClose,
  onSent,
}: {
  targetProfile: Profile;
  teachSkills: UserSkill[];
  allSkills: Skill[];
  onClose: () => void;
  onSent: () => void;
}) {
  const { user } = useAuth();
  const [requestedSkill, setRequestedSkill] = useState('');
  const [offeredSkill, setOfferedSkill] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

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
      receiver_id: targetProfile.id,
      offered_skill_id: offeredSkill || null,
      requested_skill_id: requestedSkill || null,
      message: message || null,
      status: 'pending',
    });
    if (!err) {
      await supabase.from('notifications').insert({
        user_id: targetProfile.id,
        type: 'connection_request',
        title: 'New skill exchange request',
        message: `Someone wants to connect with you`,
      });
    }
    setSending(false);
    if (err) setError(err.message);
    else onSent();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Connect with {targetProfile.full_name}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        {error && <div className="mb-4 px-4 py-3 bg-danger-50 text-danger-700 rounded-xl text-sm">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Skill you want to learn</label>
            <select value={requestedSkill} onChange={(e) => setRequestedSkill(e.target.value)} className="input-field">
              <option value="">Select a skill...</option>
              {teachSkills.map((s) => (
                <option key={s.id} value={s.skill_id}>{s.skill?.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Skill you can offer (optional)</label>
            <select value={offeredSkill} onChange={(e) => setOfferedSkill(e.target.value)} className="input-field">
              <option value="">Select a skill...</option>
              {allSkills.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Message (optional)</label>
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
          </button>
        </div>
      </div>
    </div>
  );
}
