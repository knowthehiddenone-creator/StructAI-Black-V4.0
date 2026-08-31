import { useNavigate } from 'react-router-dom';
import type { DesignCode } from '@/types';

interface HeaderProps {
  code: DesignCode;
  projectName: string;
  onCodeChange?: (code: DesignCode) => void;
}

export default function Header({ code, projectName, onCodeChange }: HeaderProps) {
  const nav = useNavigate();

  const codeLabel = code === 'IS800' ? 'IS 800:2007' : code === 'AISC_LRFD' ? 'AISC LRFD' : 'AISC ASD';
  const unitLabel = code === 'IS800' ? 'SI (kN, mm, MPa)' : 'US (kips, in, ksi)';

  const navItems = [
    { label: 'Project', icon: 'M3 5h10v1H3zm0 4h10v1H3zm0 4h7v1H3z' },
    { label: 'Calculations', icon: 'M2 3h12v10H2zm2 2v6h8V5z' },
    { label: 'Design Modules', icon: 'M8 2l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4z' },
    { label: 'Reports', icon: 'M3 1h8l4 4v10H3zm7 0v4h4' },
    { label: 'AI Assistant', icon: 'M8 2C4.7 2 2 4.7 2 8s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm0 10c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z' },
    { label: 'Drawings', icon: 'M1 1h14v14H1zm3 3h8v8H4z' },
  ];

  return (
    <header className="h-14 bg-white border-b border-eng-border flex items-center px-4 gap-4 sticky top-0 z-40 flex-shrink-0">
      {/* Logo */}
      <button onClick={() => nav('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
        <div className="w-7 h-7 rounded bg-eng-blue flex items-center justify-center">
          <svg viewBox="0 0 16 16" className="w-4 h-4 fill-white">
            <path d="M3 12h10v1H3zm1-2h8v1H4zm2-2h4v1H6zM2 4h12v1H2zm1 2h10v1H3z"/>
          </svg>
        </div>
        <div>
          <div className="font-bold text-sm text-eng-text-primary leading-none">StructAI</div>
          <div className="text-[10px] text-eng-text-muted leading-none">BasePlate</div>
        </div>
      </button>

      <div className="w-px h-6 bg-eng-border"/>

      {/* Nav items */}
      <nav className="hidden lg:flex items-center gap-0.5">
        {navItems.map((item) => (
          <button key={item.label} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-eng-text-secondary hover:text-eng-text-primary hover:bg-eng-canvas rounded transition-all duration-150">
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current opacity-70">
              <path d={item.icon}/>
            </svg>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="flex-1"/>

      {/* Project info */}
      <div className="hidden md:flex items-center gap-2 text-xs text-eng-text-secondary">
        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current opacity-50">
          <path d="M2 1h12l1 1v12l-1 1H2l-1-1V2zm0 13h12V2H2z"/>
        </svg>
        <span className="max-w-[140px] truncate font-medium text-eng-text-primary">{projectName}</span>
      </div>

      {/* Code toggle */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1 text-xs text-eng-text-muted">
          <span className="font-mono">{unitLabel}</span>
        </div>
        <div className="flex items-center rounded-md border border-eng-border overflow-hidden">
          {(['AISC_LRFD', 'AISC_ASD', 'IS800'] as DesignCode[]).map(c => (
            <button
              key={c}
              onClick={() => onCodeChange?.(c)}
              className={`px-2.5 py-1 text-xs font-medium transition-colors border-r last:border-0 border-eng-border ${
                code === c ? 'bg-eng-blue text-white' : 'text-eng-text-secondary hover:bg-eng-canvas'
              }`}
            >
              {c === 'AISC_LRFD' ? 'AISC LRFD' : c === 'AISC_ASD' ? 'AISC ASD' : 'IS 800'}
            </button>
          ))}
        </div>
      </div>

      {/* Code badge */}
      <span className="badge-info hidden md:flex">{codeLabel}</span>

      {/* Profile */}
      <button className="w-8 h-8 rounded-full bg-eng-blue text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
        SE
      </button>
    </header>
  );
}
