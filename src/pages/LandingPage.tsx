import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Code,
  Palette,
  Database,
  Brain,
  Video,
  Star,
  ArrowLeftRight,
  GraduationCap,
  Coins,
  Users,
} from 'lucide-react';

const floatingSkills = [
  { label: 'React', icon: Code, color: 'from-blue-500 to-cyan-500', delay: 0, position: 'top-0 left-1/2 -translate-x-1/2' },
  { label: 'JavaScript', icon: Code, color: 'from-yellow-500 to-orange-500', delay: 0.5, position: 'top-20 left-0' },
  { label: 'Python', icon: Brain, color: 'from-green-500 to-teal-500', delay: 1, position: 'top-20 right-0' },
  { label: 'UI/UX', icon: Palette, color: 'from-pink-500 to-rose-500', delay: 1.5, position: 'bottom-20 left-0' },
  { label: 'MongoDB', icon: Database, color: 'from-emerald-500 to-green-600', delay: 2, position: 'bottom-20 right-0' },
  { label: 'Video Edit', icon: Video, color: 'from-purple-500 to-indigo-500', delay: 2.5, position: 'bottom-0 left-1/2 -translate-x-1/2' },
];

const stats = [
  { value: '10K+', label: 'Students', icon: Users },
  { value: '500+', label: 'Skills', icon: Sparkles },
  { value: '25K+', label: 'Skill Exchanges', icon: ArrowLeftRight },
  { value: '4.9', label: 'Average Rating', icon: Star },
];

const steps = [
  {
    num: '01',
    title: 'Create Your Profile',
    desc: 'Add your skills, interests, college, and bio. Tell the community what you know and what you want to learn.',
    icon: GraduationCap,
  },
  {
    num: '02',
    title: 'Discover Skills',
    desc: 'Find students who can teach what you want to learn. Browse profiles, skills, and ratings.',
    icon: Sparkles,
  },
  {
    num: '03',
    title: 'Exchange Knowledge',
    desc: 'Send skill-exchange requests, connect with peers, and start a learning partnership.',
    icon: ArrowLeftRight,
  },
  {
    num: '04',
    title: 'Learn Together',
    desc: 'Join a live classroom, exchange credits, rate each other, and build your reputation.',
    icon: Video,
  },
];

const features = [
  { icon: GraduationCap, title: 'Learn From Students', desc: 'Learn directly from peers who already mastered the skill.', color: 'bg-blue-500' },
  { icon: Sparkles, title: 'Teach Your Skills', desc: 'Turn your knowledge into value and help others grow.', color: 'bg-purple-500' },
  { icon: ArrowLeftRight, title: 'Skill Exchange', desc: 'Knowledge moves in both directions — teach and learn simultaneously.', color: 'bg-cyan-500' },
  { icon: Coins, title: 'Earn Credits', desc: 'Teach skills and earn learning credits to unlock more sessions.', color: 'bg-amber-500' },
  { icon: Video, title: 'Live Learning', desc: 'Join live video sessions through integrated virtual classrooms.', color: 'bg-rose-500' },
  { icon: Star, title: 'Build Reputation', desc: 'Earn ratings and build a standout student profile.', color: 'bg-emerald-500' },
];

const previewStudents = [
  { name: 'Rahul Sharma', college: 'GCET', rating: 4.8, teach: ['React', 'JavaScript'], learn: ['Python', 'MongoDB'], avatar: 'RS', color: 'from-blue-500 to-indigo-600' },
  { name: 'Priya Patel', college: 'IIT Delhi', rating: 4.9, teach: ['UI/UX', 'Figma'], learn: ['Machine Learning'], avatar: 'PP', color: 'from-pink-500 to-rose-600' },
  { name: 'Arjun Kumar', college: 'NIT Trichy', rating: 4.7, teach: ['Python', 'Data Science'], learn: ['React', 'Docker'], avatar: 'AK', color: 'from-emerald-500 to-teal-600' },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-hero-pattern">
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-sm font-medium mb-6">
                <Sparkles size={14} />
                Peer-to-peer skill exchange
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Learn something new.
                <br />
                <span className="gradient-text">Teach what you know.</span>
              </h1>
              <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-lg">
                SkillSwap helps students learn from each other, share their expertise,
                and build meaningful connections through peer-to-peer skill exchange.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/signup" className="btn-primary">
                  Start Learning
                  <ArrowRight size={18} />
                </Link>
                <Link to="/discover" className="btn-secondary">
                  Explore Skills
                </Link>
              </div>
            </motion.div>

            {/* Floating skill network */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative h-[400px] hidden lg:block"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Center node */}
                <div className="relative w-72 h-72">
                  {/* Connection lines */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 288 288">
                    <line x1="144" y1="144" x2="144" y2="0" stroke="rgba(99,102,241,0.2)" strokeWidth="2" strokeDasharray="4 4" />
                    <line x1="144" y1="144" x2="0" y2="80" stroke="rgba(6,182,212,0.2)" strokeWidth="2" strokeDasharray="4 4" />
                    <line x1="144" y1="144" x2="288" y2="80" stroke="rgba(99,102,241,0.2)" strokeWidth="2" strokeDasharray="4 4" />
                    <line x1="144" y1="144" x2="0" y2="200" stroke="rgba(6,182,212,0.2)" strokeWidth="2" strokeDasharray="4 4" />
                    <line x1="144" y1="144" x2="288" y2="200" stroke="rgba(99,102,241,0.2)" strokeWidth="2" strokeDasharray="4 4" />
                    <line x1="144" y1="144" x2="144" y2="288" stroke="rgba(6,182,212,0.2)" strokeWidth="2" strokeDasharray="4 4" />
                  </svg>

                  {/* Center */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-500 flex items-center justify-center shadow-xl shadow-primary-600/30">
                      <ArrowLeftRight size={28} className="text-white" />
                    </div>
                  </div>

                  {/* Floating skill cards */}
                  {floatingSkills.map((skill) => (
                    <motion.div
                      key={skill.label}
                      className={`absolute ${skill.position}`}
                      animate={{ y: [0, -12, 0] }}
                      transition={{ duration: 4, repeat: Infinity, delay: skill.delay, ease: 'easeInOut' }}
                    >
                      <div className="flex flex-col items-center gap-1.5">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${skill.color} flex items-center justify-center shadow-lg`}>
                          <skill.icon size={22} className="text-white" />
                        </div>
                        <span className="text-xs font-semibold text-slate-700 bg-white/80 px-2 py-0.5 rounded-full">
                          {skill.label}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-50 mb-3">
                  <stat.icon size={22} className="text-primary-600" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">How It Works</h2>
            <p className="mt-4 text-lg text-slate-500">Four simple steps to start your skill exchange journey</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 card-hover">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl font-bold text-slate-100">{step.num}</span>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                      <step.icon size={22} className="text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-primary-300 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950/40 via-slate-950 to-slate-950" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">Everything you need to grow</h2>
            <p className="mt-4 text-lg text-slate-400">Powerful features designed for student collaboration</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-dark rounded-2xl p-6 card-hover border border-slate-800"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <feature.icon size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Discover Preview */}
      <section id="about" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">Meet our students</h2>
            <p className="mt-4 text-lg text-slate-500">Discover talented peers ready to exchange skills</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {previewStudents.map((student, i) => (
              <motion.div
                key={student.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 card-hover"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${student.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    {student.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{student.name}</h3>
                    <p className="text-sm text-slate-500">{student.college}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star size={14} className="text-amber-400 fill-amber-400" />
                      <span className="text-sm font-medium text-slate-600">{student.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase mb-1.5">Can teach</p>
                    <div className="flex flex-wrap gap-1.5">
                      {student.teach.map((s) => (
                        <span key={s} className="skill-badge bg-primary-50 text-primary-700">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase mb-1.5">Wants to learn</p>
                    <div className="flex flex-wrap gap-1.5">
                      {student.learn.map((s) => (
                        <span key={s} className="skill-badge bg-secondary-50 text-secondary-700">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/signup" className="btn-primary">
              Join SkillSwap Today
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
