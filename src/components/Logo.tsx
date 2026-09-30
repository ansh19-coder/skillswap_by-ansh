import { ArrowLeftRight } from 'lucide-react';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

export function Logo({ size = 32, className = '', showText = true, textClassName = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-secondary-500 shadow-lg shadow-primary-600/30"
        style={{ width: size, height: size }}
      >
        <ArrowLeftRight size={size * 0.55} className="text-white" strokeWidth={2.5} />
      </div>
      {showText && (
        <span className={`font-bold tracking-tight ${textClassName}`} style={{ fontSize: size * 0.5 }}>
          Skill<span className="gradient-text">Swap</span>
        </span>
      )}
    </div>
  );
}
