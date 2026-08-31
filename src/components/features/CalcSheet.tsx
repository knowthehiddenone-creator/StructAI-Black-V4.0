import type { CheckResult } from '@/types';

interface CalcSheetProps {
  title: string;
  result: CheckResult;
  expanded?: boolean;
}

const statusConfig = {
  PASS: { label: '✅ SAFE', cls: 'badge-pass' },
  CAUTION: { label: '⚡ CAUTION', cls: 'badge-caution' },
  WARNING: { label: '⚠ WARNING', cls: 'badge-warning' },
  CRITICAL: { label: '🔴 CRITICAL', cls: 'badge-critical' },
  REDESIGN: { label: '❌ REDESIGN', cls: 'badge-redesign' },
  INFO: { label: 'ℹ INFO', cls: 'badge-info' },
};

function formatValue(v: unknown): string {
  if (typeof v === 'number') {
    if (Math.abs(v) > 10000) return v.toLocaleString('en-US', { maximumFractionDigits: 0 });
    if (Math.abs(v) > 100) return v.toFixed(2);
    if (Math.abs(v) > 1) return v.toFixed(4);
    return v.toFixed(6);
  }
  if (typeof v === 'boolean') return v ? '✓ Yes' : '✗ No';
  return String(v);
}

export default function CalcSheet({ title, result, expanded = false }: CalcSheetProps) {
  const sc = statusConfig[result.status] ?? statusConfig.PASS;
  const utilization = (result.result.utilization as number) ?? (result.result.utilization_hef as number) ?? null;

  return (
    <div className="eng-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-eng-border bg-eng-canvas">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm text-eng-text-primary">{title}</span>
          <span className={sc.cls}>{sc.label}</span>
        </div>
        {utilization !== null && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-eng-text-muted">Util.</span>
            <div className="w-24 util-bar">
              <div
                className="util-bar-fill transition-all duration-700"
                style={{
                  width: `${Math.min(utilization * 100, 100)}%`,
                  background: utilization > 1 ? '#CF222E' : utilization > 0.85 ? '#D4A72C' : '#1A7F37',
                }}
              />
            </div>
            <span className={`text-xs font-mono font-bold ${utilization > 1 ? 'text-eng-danger' : utilization > 0.85 ? 'text-eng-warning' : 'text-eng-success'}`}>
              {(utilization * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Formula */}
      <div className="px-4 py-2.5 border-b border-eng-border">
        <div className="text-xs text-eng-text-muted mb-0.5">Formula</div>
        <code className="text-xs text-[#0969DA] font-mono">{result.formula}</code>
        <div className="text-xs text-eng-text-muted mt-0.5 font-mono">Ref: {result.clause}</div>
      </div>

      {/* Inputs / Intermediate */}
      <div className="calc-sheet mx-0 rounded-none border-0 border-b border-[#21262D]">
        <div className="px-4 py-2 border-b border-[#21262D]">
          <span className="text-[10px] text-[#8B949E] uppercase tracking-widest font-semibold">Intermediate Values</span>
        </div>
        {Object.entries(result.intermediate).map(([key, val]) => (
          <div key={key} className="calc-row">
            <span className="calc-label">{key.replace(/_/g, ' ')}</span>
            <span className="calc-value">{formatValue(val)}</span>
          </div>
        ))}
      </div>

      {/* Results */}
      <div className="calc-sheet mx-0 rounded-none border-0">
        <div className="px-4 py-2 border-b border-[#21262D]">
          <span className="text-[10px] text-[#56D364] uppercase tracking-widest font-semibold">Results</span>
        </div>
        {Object.entries(result.result).map(([key, val]) => (
          <div key={key} className="calc-row">
            <span className="calc-label">{key.replace(/_/g, ' ')}</span>
            <span className={typeof val === 'boolean' ? (val ? 'calc-result' : 'calc-error') : 'calc-result'}>
              {formatValue(val)}
            </span>
          </div>
        ))}
      </div>

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="border-t border-eng-border">
          {result.warnings.map((w, i) => (
            <div key={i} className={`px-4 py-2.5 text-xs border-b last:border-0 flex items-start gap-2 ${
              w.level >= 5 ? 'bg-[#1F2328] text-white' :
              w.level >= 4 ? 'bg-[#FFEBE9] text-[#7D1C20]' :
              w.level >= 3 ? 'bg-[#FFEBE9] text-[#7D1C20]' :
              w.level >= 2 ? 'bg-[#FFF8C5] text-[#7D4E00]' :
              'bg-[#DDF4FF] text-[#0969DA]'
            }`}>
              <span className="flex-shrink-0">{w.level >= 5 ? '❌' : w.level >= 4 ? '🔴' : w.level >= 3 ? '⚠' : w.level >= 2 ? '⚡' : 'ℹ'}</span>
              <span>{w.msg}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
