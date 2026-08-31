import type { DesignWarning } from '@/types';

interface WarningCardProps {
  warning: DesignWarning;
  compact?: boolean;
}

const levelConfig = {
  1: { label: 'INFO', icon: 'ℹ', cls: 'warning-info', textCls: 'text-[#0969DA]' },
  2: { label: 'CAUTION', icon: '⚡', cls: 'warning-caution', textCls: 'text-[#7D4E00]' },
  3: { label: 'WARNING', icon: '⚠', cls: 'warning-warning', textCls: 'text-[#7D1C20]' },
  4: { label: 'CRITICAL', icon: '🔴', cls: 'warning-critical', textCls: 'text-white' },
  5: { label: 'REDESIGN', icon: '❌', cls: 'warning-redesign', textCls: 'text-white' },
};

export default function WarningCard({ warning, compact = false }: WarningCardProps) {
  const cfg = levelConfig[warning.level] ?? levelConfig[1];

  if (compact) {
    return (
      <div className={`${cfg.cls} py-2 px-3 flex items-start gap-2`}>
        <span className="text-sm flex-shrink-0">{cfg.icon}</span>
        <div className="min-w-0">
          <span className={`text-xs font-bold ${cfg.textCls} mr-1.5`}>{cfg.label}</span>
          <span className={`text-xs ${cfg.textCls} opacity-90`}>{warning.msg}</span>
          {warning.clause && <div className={`text-xs mt-0.5 opacity-70 font-mono ${cfg.textCls}`}>{warning.clause}</div>}
        </div>
      </div>
    );
  }

  const fixes = Array.isArray(warning.fix) ? warning.fix : warning.fix ? [warning.fix] : [];

  return (
    <div className={`${cfg.cls}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0 leading-none">{cfg.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-bold tracking-wider ${cfg.textCls}`}>{cfg.label}</span>
            {warning.module && (
              <span className={`text-xs opacity-60 font-mono ${cfg.textCls}`}>[{warning.module}]</span>
            )}
          </div>
          <p className={`text-sm ${cfg.textCls} leading-relaxed`}>{warning.msg}</p>
          {warning.clause && (
            <p className={`text-xs mt-1.5 font-mono opacity-70 ${cfg.textCls}`}>Ref: {warning.clause}</p>
          )}
          {fixes.length > 0 && (
            <div className="mt-2">
              <p className={`text-xs font-semibold ${cfg.textCls} mb-1`}>Recommended action:</p>
              <ul className={`text-xs space-y-0.5 ${cfg.textCls} opacity-90`}>
                {fixes.map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="flex-shrink-0 mt-0.5">→</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function OverallStatusBanner({ status, criticalCount, warningCount, infoCount }: {
  status: string; criticalCount: number; warningCount: number; infoCount: number;
}) {
  const config = {
    PASS: { label: 'Design SAFE', icon: '✅', cls: 'bg-[#DAFBE1] border-[#4AC26B] text-[#1A7F37]' },
    CAUTION: { label: 'Design — Review Advised', icon: '⚡', cls: 'bg-[#FFF8C5] border-[#D4A72C] text-[#7D4E00]' },
    WARNING: { label: 'Design Concerns Present', icon: '⚠', cls: 'bg-[#FFEBE9] border-[#FF8182] text-[#7D1C20]' },
    CRITICAL: { label: 'Critical Issues Found', icon: '🔴', cls: 'bg-[#CF222E] border-[#A01020] text-white' },
    REDESIGN: { label: 'REDESIGN REQUIRED', icon: '❌', cls: 'bg-[#1F2328] border-[#CF222E] text-white' },
    INFO: { label: 'Design Safe — Notes', icon: 'ℹ', cls: 'bg-[#DDF4FF] border-[#54AEFF] text-[#0969DA]' },
  };
  const cfg = config[status as keyof typeof config] ?? config.PASS;

  return (
    <div className={`border-2 rounded-xl p-5 ${cfg.cls}`}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{cfg.icon}</span>
        <div>
          <div className="font-bold text-lg">{cfg.label}</div>
          <div className="text-sm opacity-80">Overall Design Status</div>
        </div>
      </div>
      <div className="flex gap-4 text-sm">
        <span>🔴 {criticalCount} Critical</span>
        <span>⚠ {warningCount} Warning</span>
        <span>ℹ {infoCount} Info</span>
      </div>
    </div>
  );
}
