import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, ArrowLeftRight } from 'lucide-react';
import { Logo } from '@/components/Logo';

export function Footer() {
  const sections = [
    {
      title: 'Platform',
      links: ['Discover', 'How It Works', 'Live Sessions', 'Credit System'],
    },
    {
      title: 'Company',
      links: ['About Us', 'Careers', 'Blog', 'Contact'],
    },
    {
      title: 'Resources',
      links: ['Help Center', 'Community', 'Privacy Policy', 'Terms of Service'],
    },
  ];

  return (
    <footer className="bg-slate-950 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <Logo size={36} textClassName="text-xl text-white" />
            <p className="mt-4 text-sm leading-relaxed max-w-xs">
              Learn. Teach. Connect. The peer-to-peer skill exchange platform for students.
            </p>
            <div className="flex gap-3 mt-6">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-primary-600 transition-colors"
                >
                  <Icon size={18} className="text-slate-300" />
                </a>
              ))}
            </div>
          </div>

          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="text-white font-semibold text-sm mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <Link to="#" className="text-sm hover:text-primary-400 transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © 2026 SkillSwap. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ArrowLeftRight size={14} className="text-primary-500" />
            <span>Built for students, by students</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
