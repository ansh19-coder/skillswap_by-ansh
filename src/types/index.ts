export interface Profile {
  id: string;
  full_name: string;
  college: string | null;
  bio: string | null;
  avatar_url: string | null;
  credits: number;
  rating: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string | null;
  icon: string | null;
  created_at: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  type: 'teach' | 'learn';
  proficiency: string;
  created_at: string;
  skill?: Skill;
}

export type ConnectionStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface Connection {
  id: string;
  requester_id: string;
  receiver_id: string;
  offered_skill_id: string | null;
  requested_skill_id: string | null;
  message: string | null;
  status: ConnectionStatus;
  created_at: string;
  updated_at: string;
  requester?: Profile;
  receiver?: Profile;
  offered_skill?: Skill;
  requested_skill?: Skill;
}

export type SessionStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';

export interface LearningSession {
  id: string;
  connection_id: string | null;
  teacher_id: string;
  learner_id: string;
  skill_id: string | null;
  room_name: string;
  status: SessionStatus;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  credits_transferred: number;
  created_at: string;
  teacher?: Profile;
  learner?: Profile;
  skill?: Skill;
}

export interface Rating {
  id: string;
  session_id: string;
  rater_id: string;
  ratee_id: string;
  rating: number;
  review: string | null;
  created_at: string;
  rater?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  data: Record<string, unknown> | null;
  read: boolean;
  created_at: string;
}
