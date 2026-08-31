import { useNavigate } from 'react-router-dom';
import { getDefaultInputs } from '@/lib/calculations';
import { runCalculations } from '@/lib/calculations';
import CalcSheet from '@/components/features/CalcSheet';
import { OverallStatusBanner } from '@/components/features/WarningCard';
import BasePlateDrawing from '@/components/features/BasePlateDrawing';
import type { CalculationResults, DesignInputs } from '@/types';

function ReportSection({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-eng-blue">
        <span className="w-8 h-8 rounded bg-eng-blue text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{num}</span>
        <h2 className="text-base font-bold text-eng-text-primary">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function Report() {
  const nav = useNavigate();
  const inputs: DesignInputs = getDefaultInputs('IS800');
  const results: CalculationResults = runCalculations(inputs);
  const date = new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' });

  const checkPanels = [
    { key: 'loadCondition', title: 'Load Classification & Eccentricity' },
    { key: 'geometry', title: 'Plate Geometry & Bearing Areas' },
    { key: 'pressure', title: 'Bearing Pressure Distribution' },
    { key: 'bearing', title: 'Concrete Bearing Capacity' },
    { key: 'plateThickness', title: 'Plate Thickness Design' },
    { key: 'anchorTension', title: 'Anchor Tension Force Calculation' },
    { key: 'anchorCapacity', title: 'Anchor Steel Capacity (IS 800:2007)' },
    { key: 'anchorDiaCheck', title: 'Anchor Diameter vs Plate Thickness' },
    { key: 'embedment', title: 'Anchor Embedment — ACI 318-19 Ch.17' },
    { key: 'weld', title: 'Weld Capacity — IS 800:2007 Cl.10.5.7' },
    { key: 'stiffener', title: 'Stiffener Plate Requirement' },
    { key: 'shearKey', title: 'Shear Key / Shear Lug Check' },
  ];

  const checksTable = checkPanels.map(({ key, title }) => {
    const r = results[key as keyof CalculationResults] as { status: string; result?: Record<string,unknown> } | undefined;
    if (!r) return null;
    const util = r.result?.utilization as number | undefined;
    const sc: Record<string,string> = { PASS:'✅ SAFE', CAUTION:'⚡ CAUTION', WARNING:'⚠ WARNING', CRITICAL:'🔴 CRITICAL', REDESIGN:'❌ REDESIGN', INFO:'ℹ INFO' };
    return { title, status: r.status, label: sc[r.status]??'✅', util };
  }).filter(Boolean);

  return (
    <div className="min-h-screen bg-[#F6F8FA]">
      {/* Print toolbar */}
      <div className="print:hidden bg-white border-b border-eng-border px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => nav('/design')} className="eng-btn-secondary text-xs">← Back to Design</button>
          <span className="text-sm font-semibold text-eng-text-primary">Calculation Report — {inputs.projectName}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="eng-btn-primary text-xs">
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current"><path d="M4 1h8v3H4zM1 5h14v7H1zm3 9h8v1H4zM3 7v2h2V7H3z"/></svg>
            Print / PDF
          </button>
        </div>
      </div>

      {/* Report document */}
      <div className="max-w-4xl mx-auto p-8 print:p-0">
        <div className="bg-white shadow-eng-card rounded-lg overflow-hidden print:shadow-none">

          {/* Cover */}
          <div className="bg-gradient-to-br from-[#0D1117] to-[#1C2128] text-white p-10">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-[#0969DA] flex items-center justify-center">
                  <svg viewBox="0 0 16 16" className="w-6 h-6 fill-white"><path d="M3 12h10v1H3zm1-2h8v1H4zm2-2h4v1H6zM2 4h12v1H2zm1 2h10v1H3z"/></svg>
                </div>
                <div>
                  <div className="font-bold text-lg">StructAI BasePlate</div>
                  <div className="text-[#8B949E] text-xs">Engineering Calculation Report</div>
                </div>
              </div>
              <div className="text-right text-xs text-[#8B949E]">
                <div>v4.0 — LTTS EI Hackathon 2026</div>
                <div>{date}</div>
              </div>
            </div>

            <h1 className="text-3xl font-bold mb-2">{inputs.projectName}</h1>
            <p className="text-[#8B949E] mb-6">Structural Steel Base Plate Design — {inputs.code === 'IS800' ? 'IS 800:2007 LSM' : inputs.code === 'AISC_LRFD' ? 'AISC 360-22 LRFD' : 'AISC 360-22 ASD'}</p>

            <div className="grid grid-cols-3 gap-4 text-sm">
              {[
                { l: 'Project', v: inputs.projectName },
                { l: 'Designer', v: inputs.designedBy },
                { l: 'Revision', v: inputs.revision },
                { l: 'Design Code', v: inputs.code === 'IS800' ? 'IS 800:2007' : 'AISC 360-22' },
                { l: 'Load Combination', v: inputs.loadCombo },
                { l: 'Support Type', v: inputs.supportType },
                { l: 'Sign Convention', v: '+P = Compression, −P = Uplift' },
                { l: 'Column Section', v: inputs.sectionName },
                { l: 'Date', v: date },
              ].map(p => (
                <div key={p.l} className="bg-white/10 rounded p-2">
                  <div className="text-[#8B949E] text-xs">{p.l}</div>
                  <div className="font-medium text-sm">{p.v}</div>
                </div>
              ))}
            </div>

            {/* Overall status */}
            <div className="mt-6 flex items-center gap-3 bg-white/10 rounded-lg p-3">
              <span className="text-2xl">{results.overall.status === 'PASS' ? '✅' : results.overall.status === 'REDESIGN' ? '❌' : '⚠'}</span>
              <div>
                <div className="font-bold">Overall Design Status: {results.overall.status}</div>
                <div className="text-xs text-[#8B949E]">{results.overall.criticalCount} critical · {results.overall.warningCount} warnings · {results.overall.infoCount} info</div>
              </div>
            </div>
          </div>

          {/* Report body */}
          <div className="p-8">

            {/* Section 1 — Summary Table */}
            <ReportSection num="01" title="Design Summary">
              <div className="overflow-hidden rounded-lg border border-eng-border">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-eng-canvas border-b border-eng-border">
                      <th className="text-left px-3 py-2 font-semibold text-eng-text-secondary">Check</th>
                      <th className="text-center px-3 py-2 font-semibold text-eng-text-secondary">Status</th>
                      <th className="text-right px-3 py-2 font-semibold text-eng-text-secondary">Utilisation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checksTable.map((c, i) => c && (
                      <tr key={i} className="border-b border-eng-border last:border-0 hover:bg-eng-canvas">
                        <td className="px-3 py-2 font-medium text-eng-text-primary">{c.title}</td>
                        <td className="px-3 py-2 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            c.status === 'PASS' ? 'bg-[#DAFBE1] text-[#1A7F37]' :
                            c.status === 'REDESIGN' ? 'bg-[#CF222E] text-white' :
                            c.status === 'WARNING' || c.status === 'CRITICAL' ? 'bg-[#FFEBE9] text-[#7D1C20]' :
                            'bg-[#FFF8C5] text-[#7D4E00]'
                          }`}>{c.label}</span>
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {c.util !== undefined ? `${(c.util*100).toFixed(1)}%` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ReportSection>

            {/* Section 2 — Design Inputs */}
            <ReportSection num="02" title="Design Inputs">
              <div className="grid grid-cols-3 gap-3 text-xs">
                {[
                  { group: 'Column', items: [
                    { l:'Section', v: inputs.sectionName }, { l:'d', v:`${inputs.col_d} mm`},
                    { l:'bf', v:`${inputs.col_bf} mm`}, { l:'tf', v:`${inputs.col_tf} mm`},
                    { l:'Grade', v: inputs.columnGrade}, { l:'Fy', v:`${inputs.columnFy} MPa`},
                  ]},
                  { group: 'Base Plate', items: [
                    { l:'N', v:`${inputs.plate_N} mm`}, { l:'B', v:`${inputs.plate_B} mm`},
                    { l:'tp', v:`${inputs.plate_tp} mm`}, { l:'Grade', v: inputs.plateGrade},
                    { l:'Fy', v:`${inputs.plateFy} MPa`}, { l:'Fu', v:`${inputs.plateFu} MPa`},
                  ]},
                  { group: 'Loads', items: [
                    { l:'P', v:`${inputs.P} kN`}, { l:'Mx', v:`${inputs.Mx} kNm`},
                    { l:'Vx', v:`${inputs.Vx} kN`}, { l:'Combo', v: inputs.loadCombo},
                    { l:'Condition', v: inputs.P>0?'Compression':inputs.P<0?'Uplift':'Shear'},
                    { l:'Type', v: inputs.loadType},
                  ]},
                  { group: 'Concrete', items: [
                    { l:'Grade', v: inputs.concreteGrade}, { l:'fck', v:`${inputs.fck} MPa`},
                    { l:'Type', v: inputs.supportType}, { l:'Ped L', v:`${inputs.ped_L} mm`},
                    { l:'Ped B', v:`${inputs.ped_B} mm`}, { l:'Ped D', v:`${inputs.ped_D} mm`},
                  ]},
                  { group: 'Anchors', items: [
                    { l:'Grade', v: inputs.anchorGrade}, { l:'Dia', v:`${inputs.anchorDia} mm`},
                    { l:'Count', v:`${inputs.anchorCount} nos`}, { l:'hef', v:`${inputs.hef} mm`},
                    { l:'Fu', v:`${inputs.anchorFu} MPa`}, { l:'Type', v: inputs.anchorType},
                  ]},
                  { group: 'Welds', items: [
                    { l:'Type', v: inputs.weldType}, { l:'Size', v:`${inputs.weldSize} mm`},
                    { l:'Electrode', v: inputs.electrode}, { l:'', v:''},
                    { l:'', v:''}, { l:'', v:''},
                  ]},
                ].map(g => (
                  <div key={g.group} className="eng-card p-3">
                    <div className="font-semibold text-xs mb-2 text-eng-blue">{g.group}</div>
                    {g.items.filter(i=>i.l).map(item => (
                      <div key={item.l} className="flex justify-between py-0.5 border-b border-eng-border last:border-0">
                        <span className="text-eng-text-muted">{item.l}</span>
                        <span className="font-mono font-medium text-eng-text-primary">{item.v}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </ReportSection>

            {/* Section 3 — Drawing */}
            <ReportSection num="03" title="Base Plate Drawing — Plan View">
              <div className="eng-card p-4" style={{ height: '320px' }}>
                <BasePlateDrawing inputs={inputs} view="plan"/>
              </div>
            </ReportSection>

            {/* Section 4 — Elevation */}
            <ReportSection num="04" title="Base Plate Drawing — Elevation View">
              <div className="eng-card p-4" style={{ height: '320px' }}>
                <BasePlateDrawing inputs={inputs} view="elevation"/>
              </div>
            </ReportSection>

            {/* Sections 5-16 — Calculation Sheets */}
            {checkPanels.map(({ key, title }, i) => {
              const r = results[key as keyof CalculationResults];
              if (!r || typeof r !== 'object' || !('formula' in r)) return null;
              return (
                <ReportSection key={key} num={String(i+5).padStart(2,'0')} title={title}>
                  <CalcSheet title={title} result={r as Parameters<typeof CalcSheet>[0]['result']}/>
                </ReportSection>
              );
            })}

            {/* Section 17 — Engineering Notes */}
            <ReportSection num="17" title="Engineering Notes & Disclaimer">
              <div className="eng-card p-5 space-y-3 text-xs text-eng-text-secondary leading-relaxed">
                <p><strong className="text-eng-text-primary">Plate Auto-Size:</strong> Plate dimensions were NOT automatically adjusted. All dimensions as entered by the engineer. Any under-sized plate is flagged as a warning requiring explicit engineer decision.</p>
                <p><strong className="text-eng-text-primary">Sign Convention:</strong> Axial load P &gt; 0 = compression; P &lt; 0 = uplift/tension. Current design: {inputs.P > 0 ? 'COMPRESSION' : 'UPLIFT'} (P = {inputs.P} kN).</p>
                <p><strong className="text-eng-text-primary">Load Combination:</strong> {inputs.loadCombo} ({inputs.loadType}) per {inputs.code === 'IS800' ? 'IS 875:2015' : 'ASCE 7-22'}.</p>
                <p><strong className="text-eng-text-primary">Support Type:</strong> {inputs.supportType}. {inputs.supportType === 'PEDESTAL' ? 'Full ACI 318-19 Chapter 17 checks applied on all anchor faces.' : 'Reduced slab-on-grade checks per ACI 318-19 Section 26.2.'}</p>
                <p><strong className="text-eng-text-primary">Disclaimer:</strong> This calculation has been generated by StructAI BasePlate v4.0. Results must be reviewed and approved by a licensed Professional Engineer. The engineer of record is responsible for all final design decisions.</p>
              </div>
            </ReportSection>

            {/* Footer */}
            <div className="border-t border-eng-border pt-6 flex justify-between items-end text-xs text-eng-text-muted">
              <div>
                <div className="font-semibold text-eng-text-primary">{inputs.designedBy}</div>
                <div>Structural Engineer</div>
                <div className="mt-4 border-t border-eng-text-muted pt-1 w-32 text-center">Signature</div>
              </div>
              <div className="text-right">
                <div>StructAI BasePlate v4.0</div>
                <div>Generated: {date}</div>
                <div>{inputs.code === 'IS800' ? 'IS 800:2007 | IS 456:2000 | IS 875' : 'AISC 360-22 | ACI 318-19 | ASCE 7-22'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
