import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import ProgressSteps from '@/components/features/ProgressSteps';
import AIAssistant from '@/components/features/AIAssistant';
import CalcSheet from '@/components/features/CalcSheet';
import WarningCard, { OverallStatusBanner } from '@/components/features/WarningCard';
import BasePlateDrawing from '@/components/features/BasePlateDrawing';
import { runCalculations, getDefaultInputs } from '@/lib/calculations';
import { getCombosForCode } from '@/constants/loadCombos';
import { IS_SECTIONS, AISC_SECTIONS, getSectionsByCode } from '@/constants/sections';
import {
  IS_STEEL_GRADES, AISC_STEEL_GRADES, IS_ANCHOR_GRADES, ASTM_ANCHOR_GRADES,
  IS_CONCRETE_GRADES, ACI_CONCRETE_GRADES, COLUMN_TYPES
} from '@/constants/materials';
import type { DesignInputs, CalculationResults, DesignCode } from '@/types';

// ─────────────────────────────────────────────────────────
// Small reusable input components
// ─────────────────────────────────────────────────────────
function FieldGroup({ label, unit, error, children }: { label: string; unit?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="input-group">
      <label className="input-label">{label}</label>
      <div className="relative">
        {children}
        {unit && <span className="input-unit">{unit}</span>}
      </div>
      {error && <p className="input-error">{error}</p>}
    </div>
  );
}

function NumInput({ value, onChange, min, step = 1, className = '' }: {
  value: number; onChange: (v: number) => void; min?: number; step?: number; className?: string;
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      step={step}
      onChange={e => onChange(parseFloat(e.target.value) || 0)}
      className={`eng-input pr-12 ${className}`}
    />
  );
}

function Select({ value, onChange, options, className = '' }: {
  value: string; onChange: (v: string) => void; options: string[]; className?: string;
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className={`eng-input bg-white cursor-pointer ${className}`}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// ─────────────────────────────────────────────────────────
// STEP CONTENT COMPONENTS
// ─────────────────────────────────────────────────────────
function Step1DesignBasis({ inputs, onChange }: { inputs: DesignInputs; onChange: (p: Partial<DesignInputs>) => void }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-semibold text-eng-text-primary mb-1">Design Basis</h2>
        <p className="text-sm text-eng-text-muted">Select design code, methodology, and project information.</p>
      </div>

      {/* Code Selector */}
      <div className="eng-card p-5">
        <h3 className="text-sm font-semibold mb-4 text-eng-text-primary">Design Code & Method</h3>
        <div className="grid grid-cols-3 gap-3">
          {([
            { code: 'AISC_LRFD', title: 'AISC LRFD', subtitle: 'AISC 360-22 Load & Resistance Factor Design', unit: 'kips · in · ksi' },
            { code: 'AISC_ASD',  title: 'AISC ASD',  subtitle: 'AISC 360-22 Allowable Strength Design',      unit: 'kips · in · ksi' },
            { code: 'IS800',     title: 'IS 800 LSM', subtitle: 'IS 800:2007 Limit State Method',             unit: 'kN · mm · MPa' },
          ] as { code: DesignCode; title: string; subtitle: string; unit: string }[]).map(c => (
            <button key={c.code} onClick={() => onChange({ code: c.code })}
              className={`text-left p-4 rounded-lg border-2 transition-all duration-200 ${inputs.code === c.code ? 'border-eng-blue bg-eng-blue-subtle' : 'border-eng-border hover:border-eng-blue/50'}`}>
              <div className={`font-semibold text-sm mb-1 ${inputs.code === c.code ? 'text-eng-blue' : 'text-eng-text-primary'}`}>{c.title}</div>
              <div className="text-xs text-eng-text-muted mb-2">{c.subtitle}</div>
              <div className={`text-xs font-mono px-2 py-0.5 rounded w-fit ${inputs.code === c.code ? 'bg-eng-blue text-white' : 'bg-eng-canvas text-eng-text-muted'}`}>{c.unit}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Project Info */}
      <div className="eng-card p-5">
        <h3 className="text-sm font-semibold mb-4 text-eng-text-primary">Project Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <FieldGroup label="Project Name">
            <input value={inputs.projectName} onChange={e => onChange({ projectName: e.target.value })} className="eng-input" placeholder="e.g. Industrial Shed Column Base"/>
          </FieldGroup>
          <FieldGroup label="Designed By">
            <input value={inputs.designedBy} onChange={e => onChange({ designedBy: e.target.value })} className="eng-input" placeholder="Engineer name"/>
          </FieldGroup>
          <FieldGroup label="Revision">
            <input value={inputs.revision} onChange={e => onChange({ revision: e.target.value })} className="eng-input" placeholder="Rev A"/>
          </FieldGroup>
          <FieldGroup label="Date">
            <input type="date" defaultValue={new Date().toISOString().slice(0,10)} className="eng-input"/>
          </FieldGroup>
        </div>
      </div>

      {/* Reference codes */}
      <div className="eng-card p-4 bg-eng-blue-subtle border-eng-blue-border">
        <p className="text-xs text-eng-blue font-semibold mb-2">Design References</p>
        <div className="grid grid-cols-2 gap-1 text-xs text-eng-text-secondary">
          {['AISC 360-22 — Steel Design', 'AISC Design Guide 1 — Base Plates', 'ACI 318-19 — Concrete & Anchors', 'ASCE 7-22 — Load Combinations', 'IS 800:2007 — Indian Steel Code', 'IS 456:2000 — Indian Concrete Code', 'IS 875 — Indian Loads', 'IS 5624:1993 — Anchor Bolts'].map(r => (
            <div key={r} className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-eng-blue flex-shrink-0"/>{r}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step2NLInput({ onExtract }: { onExtract: (text: string) => void }) {
  const [text, setText] = useState('');
  const [processing, setProcessing] = useState(false);
  const examples = [
    'Design a base plate for ISMB 300 column with factored axial load of 800 kN and moment of 60 kNm. Use M30 concrete pedestal 700x600 mm. IS 800 code.',
    'W14x68 column, P = 180 kips (factored), Mx = 50 kip-ft, Vx = 25 kips. 4000 psi concrete pedestal 28x24 in. AISC LRFD.',
    'Design base plate for ISHB 250 with uplift P = -200 kN, Mx = 80 kNm, high seismic zone. IS 800 LSM, M35 concrete.',
  ];

  const handleProcess = () => {
    if (!text.trim()) { toast.error('Please enter design description'); return; }
    setProcessing(true);
    setTimeout(() => { setProcessing(false); onExtract(text); toast.success('Parameters extracted successfully'); }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-semibold mb-1">Natural Language Input</h2>
        <p className="text-sm text-eng-text-muted">Describe your base plate design in plain English. StructAI will extract the parameters automatically.</p>
      </div>
      <div className="eng-card p-5">
        <label className="input-label mb-2 block">Design Description</label>
        <textarea
          value={text} onChange={e => setText(e.target.value)}
          placeholder="Describe your design: column section, loads (P, M, V), concrete grade, pedestal dimensions, anchor requirements..."
          rows={6} className="eng-input resize-none font-sans"
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-eng-text-muted">{text.length} characters</span>
          <button onClick={handleProcess} disabled={processing} className="eng-btn-primary">
            {processing ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Extracting Parameters...</>
            ) : (
              <><svg viewBox="0 0 16 16" className="w-4 h-4 fill-current"><path d="M8 1a7 7 0 100 14A7 7 0 008 1z"/></svg>Extract with AI</>
            )}
          </button>
        </div>
      </div>
      <div className="eng-card p-5">
        <p className="text-sm font-semibold mb-3 text-eng-text-primary">Example Inputs</p>
        <div className="space-y-3">
          {examples.map((ex, i) => (
            <button key={i} onClick={() => setText(ex)}
              className="w-full text-left p-3 rounded-lg bg-eng-canvas border border-eng-border hover:border-eng-blue hover:bg-eng-blue-subtle transition-all text-xs text-eng-text-secondary leading-relaxed">
              <span className="badge-info mb-1 inline-flex">Example {i+1}</span>
              <br/>{ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step3Parameters({ inputs }: { inputs: DesignInputs }) {
  const isIS = inputs.code === 'IS800';
  const unit = isIS ? 'kN/kNm/mm' : 'kips/kip-ft/in';
  const condition = inputs.P > 0 ? 'COMPRESSION' : inputs.P < 0 ? 'UPLIFT' : 'SHEAR_DOMINANT';
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-semibold mb-1">Extracted Parameters</h2>
        <p className="text-sm text-eng-text-muted">Review AI-extracted parameters before proceeding to detailed input.</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Design Code', value: inputs.code },
          { label: 'Unit System', value: unit },
          { label: 'Column Section', value: inputs.sectionName },
          { label: 'Column Grade', value: inputs.columnGrade },
          { label: 'Plate Grade', value: inputs.plateGrade },
          { label: 'Concrete Grade', value: inputs.concreteGrade },
          { label: 'Support Type', value: inputs.supportType },
          { label: 'Load Type', value: inputs.loadType },
          { label: 'Axial Load P', value: `${inputs.P} ${isIS ? 'kN' : 'kips'}` },
          { label: 'Moment Mx', value: `${inputs.Mx} ${isIS ? 'kNm' : 'kip-ft'}` },
          { label: 'Shear Vx', value: `${inputs.Vx} ${isIS ? 'kN' : 'kips'}` },
          { label: 'Plate N×B', value: `${inputs.plate_N}×${inputs.plate_B} mm` },
          { label: 'Plate tp', value: `${inputs.plate_tp} mm` },
          { label: 'Anchor Grade', value: inputs.anchorGrade },
          { label: 'Anchor Dia', value: `${inputs.anchorDia} mm (${inputs.anchorCount} nos)` },
          { label: 'Embedment hef', value: `${inputs.hef} mm` },
        ].map(p => (
          <div key={p.label} className="eng-card p-3 flex justify-between items-center gap-2">
            <span className="text-xs text-eng-text-muted">{p.label}</span>
            <span className="text-xs font-semibold text-eng-text-primary font-mono">{p.value}</span>
          </div>
        ))}
      </div>
      <div className={`rounded-lg px-4 py-3 border flex items-center gap-3 ${condition === 'COMPRESSION' ? 'bg-[#DAFBE1] border-[#4AC26B]' : condition === 'UPLIFT' ? 'bg-[#FFEBE9] border-[#FF8182]' : 'bg-[#FFF8C5] border-[#D4A72C]'}`}>
        <span className="text-2xl">{condition === 'COMPRESSION' ? '✓' : condition === 'UPLIFT' ? '⚠' : '⚡'}</span>
        <div>
          <div className={`font-semibold text-sm ${condition === 'COMPRESSION' ? 'text-[#1A7F37]' : condition === 'UPLIFT' ? 'text-[#7D1C20]' : 'text-[#7D4E00]'}`}>
            Load Condition: {condition.replace('_', ' ')}
          </div>
          <div className="text-xs text-eng-text-muted">
            {condition === 'COMPRESSION' ? `P = ${inputs.P} kN (positive = compression). Full bearing plate design.` :
             condition === 'UPLIFT' ? `P = ${inputs.P} kN (negative = uplift/tension). Anchor tension governs. ACI Ch.17 required.` :
             'Axial load is zero. Shear-dominant. Anchor shear governs.'}
          </div>
        </div>
      </div>
    </div>
  );
}

function Step4Inputs({ inputs, onChange }: { inputs: DesignInputs; onChange: (p: Partial<DesignInputs>) => void }) {
  const [tab, setTab] = useState('material');
  const isIS = inputs.code === 'IS800';
  const steelGrades = isIS ? IS_STEEL_GRADES : AISC_STEEL_GRADES;
  const anchorGrades = isIS ? IS_ANCHOR_GRADES : ASTM_ANCHOR_GRADES;
  const concreteGrades = isIS ? IS_CONCRETE_GRADES : ACI_CONCRETE_GRADES;
  const combos = getCombosForCode(inputs.code, inputs.loadType);
  const colTypes = COLUMN_TYPES[inputs.code] ?? COLUMN_TYPES['IS800'];
  const sections = getSectionsByCode(inputs.code, inputs.columnType);
  const P = inputs.P;
  const condition = P > 0 ? { label: '✓ Compression', cls: 'bg-[#DAFBE1] text-[#1A7F37] border-[#4AC26B]' } :
    P < 0 ? { label: '⚠ Uplift — anchor tension required', cls: 'bg-[#FFEBE9] text-[#7D1C20] border-[#FF8182]' } :
    { label: '⚡ Shear Dominant', cls: 'bg-[#FFF8C5] text-[#7D4E00] border-[#D4A72C]' };

  const tabs = [
    { id: 'material', label: 'Materials' },
    { id: 'geometry', label: 'Geometry' },
    { id: 'loads', label: 'Loads' },
    { id: 'support', label: 'Support' },
    { id: 'anchors', label: 'Anchors' },
    { id: 'welds', label: 'Welds' },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-lg font-semibold">Design Inputs</h2>
      {/* Tab nav */}
      <div className="border-b border-eng-border flex gap-0 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`eng-tab ${tab === t.id ? 'active' : ''}`}>{t.label}</button>
        ))}
      </div>

      {tab === 'material' && (
        <div className="space-y-5 animate-fade-in">
          <div className="eng-card p-5">
            <h3 className="text-sm font-semibold mb-4">Column Steel</h3>
            <div className="grid grid-cols-3 gap-4">
              <FieldGroup label="Grade">
                <Select value={inputs.columnGrade} onChange={v => { const g = steelGrades[v]; onChange({ columnGrade: v, columnFy: g?.fy ?? inputs.columnFy, columnFu: g?.fu ?? inputs.columnFu }); }} options={Object.keys(steelGrades)}/>
              </FieldGroup>
              <FieldGroup label="Fy" unit="MPa">
                <NumInput value={inputs.columnFy} onChange={v => onChange({ columnFy: v })} min={200}/>
              </FieldGroup>
              <FieldGroup label="Fu" unit="MPa">
                <NumInput value={inputs.columnFu} onChange={v => onChange({ columnFu: v })} min={300}/>
              </FieldGroup>
            </div>
          </div>
          <div className="eng-card p-5">
            <h3 className="text-sm font-semibold mb-4">Base Plate Steel</h3>
            <div className="grid grid-cols-3 gap-4">
              <FieldGroup label="Grade">
                <Select value={inputs.plateGrade} onChange={v => { const g = steelGrades[v]; onChange({ plateGrade: v, plateFy: g?.fy ?? inputs.plateFy, plateFu: g?.fu ?? inputs.plateFu }); }} options={Object.keys(steelGrades)}/>
              </FieldGroup>
              <FieldGroup label="Fy" unit="MPa">
                <NumInput value={inputs.plateFy} onChange={v => onChange({ plateFy: v })} min={200}/>
              </FieldGroup>
              <FieldGroup label="Fu" unit="MPa">
                <NumInput value={inputs.plateFu} onChange={v => onChange({ plateFu: v })} min={300}/>
              </FieldGroup>
            </div>
          </div>
          <div className="eng-card p-5">
            <h3 className="text-sm font-semibold mb-4">Concrete</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <FieldGroup label="Support Type">
                <Select value={inputs.supportType} onChange={v => onChange({ supportType: v as 'PEDESTAL' | 'SLAB' })} options={['PEDESTAL', 'SLAB']}/>
              </FieldGroup>
              <FieldGroup label="Concrete Grade">
                <Select value={inputs.concreteGrade} onChange={v => { const g = concreteGrades[v]; onChange({ concreteGrade: v, fck: g?.fck ?? inputs.fck }); }} options={Object.keys(concreteGrades)}/>
              </FieldGroup>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FieldGroup label="fck / f'c" unit="MPa">
                <NumInput value={inputs.fck} onChange={v => onChange({ fck: v })} min={15}/>
              </FieldGroup>
              <div className="flex items-end gap-2">
                <span className={`text-xs px-2 py-1 rounded border font-medium ${inputs.supportType === 'PEDESTAL' ? 'badge-info' : 'badge-caution'}`}>
                  {inputs.supportType === 'PEDESTAL' ? 'Full ACI Ch.17 checks' : 'Reduced slab checks'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'geometry' && (
        <div className="space-y-5 animate-fade-in">
          <div className="eng-card p-5">
            <h3 className="text-sm font-semibold mb-4">Column Section</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <FieldGroup label="Column Type">
                <Select value={inputs.columnType} onChange={v => onChange({ columnType: v })} options={colTypes}/>
              </FieldGroup>
              <FieldGroup label="Section">
                <Select value={inputs.sectionName} onChange={v => {
                  const s = sections[v];
                  if (s) onChange({ sectionName: v, col_d: s.d, col_bf: s.bf, col_tf: s.tf, col_tw: s.tw });
                }} options={Object.keys(sections)}/>
              </FieldGroup>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[{k:'col_d',l:'Depth d'},{k:'col_bf',l:'Flange bf'},{k:'col_tf',l:'Flg tf'},{k:'col_tw',l:'Web tw'}].map(f => (
                <FieldGroup key={f.k} label={f.l} unit="mm">
                  <NumInput value={inputs[f.k as keyof DesignInputs] as number} onChange={v => onChange({ [f.k]: v })} min={1} step={0.1}/>
                </FieldGroup>
              ))}
            </div>
            <p className="text-xs text-eng-text-muted mt-2 badge-info w-fit">Dimensions auto-filled from section library. Edit to override.</p>
          </div>
          <div className="eng-card p-5">
            <h3 className="text-sm font-semibold mb-4">Base Plate Dimensions</h3>
            <div className="grid grid-cols-3 gap-4">
              <FieldGroup label="Length N" unit="mm">
                <NumInput value={inputs.plate_N} onChange={v => onChange({ plate_N: v })} min={100} step={5}/>
              </FieldGroup>
              <FieldGroup label="Width B" unit="mm">
                <NumInput value={inputs.plate_B} onChange={v => onChange({ plate_B: v })} min={100} step={5}/>
              </FieldGroup>
              <FieldGroup label="Thickness tp" unit="mm">
                <NumInput value={inputs.plate_tp} onChange={v => onChange({ plate_tp: v })} min={10} step={2}/>
              </FieldGroup>
            </div>
            <p className="text-xs text-eng-text-muted mt-2">Min. N = d + 100 mm = {inputs.col_d + 100} mm | Min. B = bf + 100 mm = {inputs.col_bf + 100} mm</p>
            {inputs.plate_N < inputs.col_d + 100 && (
              <div className="mt-2"><WarningCard warning={{ level: 3, msg: `N=${inputs.plate_N}mm < N_min=${inputs.col_d+100}mm. Plate NOT auto-adjusted.`, clause: 'AISC DG1 Eq.2.1 / IS 800 Cl.7.4.1' }} compact/></div>
            )}
          </div>
        </div>
      )}

      {tab === 'loads' && (
        <div className="space-y-5 animate-fade-in">
          <div className="eng-card p-5">
            <h3 className="text-sm font-semibold mb-4">Load Classification</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <FieldGroup label="Load Type">
                <Select value={inputs.loadType} onChange={v => onChange({ loadType: v as 'FACTORED'|'SERVICE', loadCombo: getCombosForCode(inputs.code, v)[0]?.id ?? '' })} options={['FACTORED','SERVICE']}/>
              </FieldGroup>
              <FieldGroup label="Load Combination">
                <Select value={inputs.loadCombo} onChange={v => onChange({ loadCombo: v })} options={combos.map(c => c.name)}/>
              </FieldGroup>
            </div>
            <div className="text-xs text-eng-text-muted bg-eng-canvas rounded p-2 font-mono">
              {combos.find(c => c.name === inputs.loadCombo)?.formula ?? combos[0]?.formula}
            </div>
          </div>
          <div className="eng-card p-5">
            <h3 className="text-sm font-semibold mb-1">Applied Loads</h3>
            <p className="text-xs text-eng-text-muted mb-4">Sign convention: P &gt; 0 = Compression | P &lt; 0 = Uplift/Tension</p>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <FieldGroup label={`Axial P (${isIS?'kN':'kips'})`} unit={isIS?'kN':'kips'}>
                <NumInput value={inputs.P} onChange={v => onChange({ P: v })} step={10}/>
              </FieldGroup>
              <FieldGroup label={`Moment Mx (${isIS?'kNm':'kip-ft'})`} unit={isIS?'kNm':'kip-ft'}>
                <NumInput value={inputs.Mx} onChange={v => onChange({ Mx: v })} step={5}/>
              </FieldGroup>
              <FieldGroup label={`Moment My (${isIS?'kNm':'kip-ft'})`} unit={isIS?'kNm':'kip-ft'}>
                <NumInput value={inputs.My} onChange={v => onChange({ My: v })} step={5}/>
              </FieldGroup>
              <FieldGroup label={`Shear Vx (${isIS?'kN':'kips'})`} unit={isIS?'kN':'kips'}>
                <NumInput value={inputs.Vx} onChange={v => onChange({ Vx: v })} step={5}/>
              </FieldGroup>
              <FieldGroup label={`Shear Vy (${isIS?'kN':'kips'})`} unit={isIS?'kN':'kips'}>
                <NumInput value={inputs.Vy} onChange={v => onChange({ Vy: v })} step={5}/>
              </FieldGroup>
            </div>
            <div className={`rounded-lg px-4 py-2 border text-sm font-semibold ${condition.cls}`}>{condition.label}</div>
          </div>
        </div>
      )}

      {tab === 'support' && (
        <div className="space-y-5 animate-fade-in">
          {inputs.supportType === 'PEDESTAL' ? (
            <div className="eng-card p-5">
              <h3 className="text-sm font-semibold mb-2">Pedestal Dimensions</h3>
              <p className="text-xs text-eng-text-muted mb-4">Full ACI 318-19 Chapter 17 checks on all faces. Plan dimensions govern confinement.</p>
              <div className="grid grid-cols-3 gap-4">
                <FieldGroup label="Pedestal Length Lp" unit="mm">
                  <NumInput value={inputs.ped_L} onChange={v => onChange({ ped_L: v })} min={inputs.plate_N} step={50}/>
                </FieldGroup>
                <FieldGroup label="Pedestal Width Bp" unit="mm">
                  <NumInput value={inputs.ped_B} onChange={v => onChange({ ped_B: v })} min={inputs.plate_B} step={50}/>
                </FieldGroup>
                <FieldGroup label="Pedestal Depth Dp" unit="mm">
                  <NumInput value={inputs.ped_D} onChange={v => onChange({ ped_D: v })} min={300} step={50}/>
                </FieldGroup>
              </div>
              {(inputs.ped_L < inputs.plate_N || inputs.ped_B < inputs.plate_B) && (
                <div className="mt-3"><WarningCard warning={{ level: 4, msg: `Pedestal (${inputs.ped_L}×${inputs.ped_B}) < plate (${inputs.plate_N}×${inputs.plate_B}). Edge distance critically low.`, clause: 'ACI 318-19 17.5.2' }} compact/></div>
              )}
            </div>
          ) : (
            <div className="eng-card p-5">
              <h3 className="text-sm font-semibold mb-2">Slab on Grade</h3>
              <p className="text-xs text-eng-text-muted mb-4">Reduced checks: bearing + edge only. Slab thickness governs embedment.</p>
              <div className="grid grid-cols-2 gap-4">
                <FieldGroup label="Slab Thickness ts" unit="mm">
                  <NumInput value={inputs.slab_ts} onChange={v => onChange({ slab_ts: v })} min={100} step={25}/>
                </FieldGroup>
                <FieldGroup label="Edge Distance" unit="mm">
                  <NumInput value={inputs.edge_dist} onChange={v => onChange({ edge_dist: v })} min={50}/>
                </FieldGroup>
              </div>
              {inputs.hef > inputs.slab_ts - 75 && (
                <div className="mt-3"><WarningCard warning={{ level: 4, msg: `Embedment hef=${inputs.hef}mm + cover 75mm > slab ts=${inputs.slab_ts}mm. Increase slab or use pedestal.`, clause: 'ACI 318-19 26.2' }} compact/></div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'anchors' && (
        <div className="space-y-5 animate-fade-in">
          <div className="eng-card p-5">
            <h3 className="text-sm font-semibold mb-4">Anchor Configuration</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <FieldGroup label="Anchor Grade">
                <Select value={inputs.anchorGrade} onChange={v => { const g = anchorGrades[v]; onChange({ anchorGrade: v, anchorFy: g?.fy ?? inputs.anchorFy, anchorFu: g?.fu ?? inputs.anchorFu }); }} options={Object.keys(anchorGrades)}/>
              </FieldGroup>
              <FieldGroup label="Anchor Diameter" unit="mm">
                <Select value={String(inputs.anchorDia)} onChange={v => onChange({ anchorDia: parseInt(v) })} options={(anchorGrades[inputs.anchorGrade]?.sizes ?? [16,20,24,30]).map(String)}/>
              </FieldGroup>
              <FieldGroup label="Number of Anchors">
                <Select value={String(inputs.anchorCount)} onChange={v => onChange({ anchorCount: parseInt(v) })} options={['4','6','8','12']}/>
              </FieldGroup>
              <FieldGroup label="Anchor Type">
                <Select value={inputs.anchorType} onChange={v => onChange({ anchorType: v as 'CAST_IN'|'POST_INSTALLED' })} options={['CAST_IN','POST_INSTALLED']}/>
              </FieldGroup>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FieldGroup label="Fy" unit="MPa"><NumInput value={inputs.anchorFy} onChange={v => onChange({ anchorFy: v })} min={200}/></FieldGroup>
              <FieldGroup label="Fu" unit="MPa"><NumInput value={inputs.anchorFu} onChange={v => onChange({ anchorFu: v })} min={300}/></FieldGroup>
              <FieldGroup label="Embedment hef" unit="mm"><NumInput value={inputs.hef} onChange={v => onChange({ hef: v })} min={50} step={10}/></FieldGroup>
              <FieldGroup label="Edge Dist. ex" unit="mm"><NumInput value={inputs.edgeDist_x} onChange={v => onChange({ edgeDist_x: v })} min={50}/></FieldGroup>
              <FieldGroup label="Edge Dist. ey" unit="mm"><NumInput value={inputs.edgeDist_y} onChange={v => onChange({ edgeDist_y: v })} min={50}/></FieldGroup>
              <FieldGroup label="Spacing sx" unit="mm"><NumInput value={inputs.spacing_x} onChange={v => onChange({ spacing_x: v })} min={100}/></FieldGroup>
            </div>
            <p className="text-xs text-eng-text-muted mt-2">Recommended: hef = {inputs.P < 0 ? '16d' : '12d'} = {inputs.P < 0 ? 16 * inputs.anchorDia : 12 * inputs.anchorDia} mm</p>
          </div>
        </div>
      )}

      {tab === 'welds' && (
        <div className="space-y-5 animate-fade-in">
          <div className="eng-card p-5">
            <h3 className="text-sm font-semibold mb-4">Weld Design</h3>
            <div className="grid grid-cols-3 gap-4">
              <FieldGroup label="Weld Type">
                <Select value={inputs.weldType} onChange={v => onChange({ weldType: v as 'FILLET'|'CJP'|'PJP' })} options={['FILLET','CJP','PJP']}/>
              </FieldGroup>
              <FieldGroup label="Electrode">
                <Select value={inputs.electrode} onChange={v => onChange({ electrode: v })} options={isIS ? ['E41XX (410 MPa)','E51XX (510 MPa)'] : ['E70XX (480 MPa)','E60XX (415 MPa)']}/>
              </FieldGroup>
              <FieldGroup label="Weld Size" unit="mm">
                <NumInput value={inputs.weldSize} onChange={v => onChange({ weldSize: v })} min={4} step={2}/>
              </FieldGroup>
            </div>
            <p className="text-xs text-eng-text-muted mt-2">Min. weld size per AISC Table J2.4: {inputs.plate_tp <= 6 ? '3' : inputs.plate_tp <= 13 ? '5' : inputs.plate_tp <= 19 ? '6' : '8'} mm</p>
          </div>
        </div>
      )}
    </div>
  );
}

function CalculatingOverlay({ phase }: { phase: string }) {
  const phases = ['Input Validation', 'Load Classification', 'Geometry & Bearing', 'Plate Thickness', 'Anchor Checks', 'Weld Verification', 'Generating Report'];
  const idx = phases.indexOf(phase);
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4">
        <div className="w-12 h-12 border-4 border-eng-blue/20 border-t-eng-blue rounded-full animate-spin mx-auto mb-5"/>
        <h3 className="font-semibold text-center text-eng-text-primary mb-1">Running Calculations</h3>
        <p className="text-sm text-eng-text-muted text-center mb-5">{phase}...</p>
        <div className="space-y-2">
          {phases.map((p, i) => (
            <div key={p} className="flex items-center gap-2 text-xs">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${i < idx ? 'bg-[#1A7F37]' : i === idx ? 'bg-eng-blue animate-pulse' : 'bg-eng-canvas border border-eng-border'}`}>
                {i < idx && <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 fill-white"><path d="M1 5l3 3 5-5"/></svg>}
              </div>
              <span className={i <= idx ? 'text-eng-text-primary' : 'text-eng-text-muted'}>{p}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// RESULTS PANEL
// ─────────────────────────────────────────────────────────
function ResultsPanel({ results, inputs }: { results: CalculationResults; inputs: DesignInputs }) {
  const [activeTab, setActiveTab] = useState('summary');
  const [drawingView, setDrawingView] = useState<'plan'|'elevation'|'section'>('plan');

  const checkPanels = [
    { key: 'loadCondition', title: 'Load Classification & Eccentricity' },
    { key: 'geometry', title: 'Plate Geometry & Bearing Areas' },
    { key: 'pressure', title: 'Bearing Pressure Distribution' },
    { key: 'bearing', title: 'Concrete Bearing Capacity' },
    { key: 'plateThickness', title: 'Plate Thickness Design' },
    { key: 'anchorTension', title: 'Anchor Tension Force' },
    { key: 'anchorCapacity', title: 'Anchor Steel Capacity' },
    { key: 'anchorDiaCheck', title: 'Anchor Dia vs Plate Thickness' },
    { key: 'embedment', title: 'Anchor Embedment Check' },
    { key: 'weld', title: 'Weld Capacity Check' },
    { key: 'stiffener', title: 'Stiffener Requirement' },
    { key: 'shearKey', title: 'Shear Key Requirement' },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <OverallStatusBanner
        status={results.overall.status}
        criticalCount={results.overall.criticalCount}
        warningCount={results.overall.warningCount}
        infoCount={results.overall.infoCount}
      />

      <div className="border-b border-eng-border flex gap-0 overflow-x-auto">
        {[{id:'summary',l:'Summary'},{id:'checks',l:'Calc Sheets'},{id:'warnings',l:`Warnings (${results.overall.allWarnings.length})`},{id:'drawings',l:'Drawings'}].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`eng-tab ${activeTab === t.id ? 'active' : ''}`}>{t.l}</button>
        ))}
      </div>

      {activeTab === 'summary' && (
        <div className="grid grid-cols-2 gap-3 animate-fade-in">
          {checkPanels.map(({ key, title }) => {
            const r = results[key as keyof CalculationResults] as { status: string; result?: Record<string,unknown> } | undefined;
            if (!r || typeof r !== 'object' || !('status' in r)) return null;
            const sc = { PASS: 'badge-pass', CAUTION: 'badge-caution', WARNING: 'badge-warning', CRITICAL: 'badge-critical', REDESIGN: 'badge-redesign', INFO: 'badge-info' }[r.status] ?? 'badge-pass';
            const icon = { PASS: '✅', CAUTION: '⚡', WARNING: '⚠', CRITICAL: '🔴', REDESIGN: '❌', INFO: 'ℹ' }[r.status] ?? '✅';
            const util = r.result?.utilization as number | undefined;
            return (
              <div key={key} className="eng-card p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-medium text-eng-text-primary leading-tight">{title}</span>
                  <span className={sc}>{icon} {r.status}</span>
                </div>
                {util !== undefined && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 util-bar">
                      <div className="util-bar-fill" style={{ width: `${Math.min(util*100,100)}%`, background: util>1?'#CF222E':util>0.85?'#D4A72C':'#1A7F37' }}/>
                    </div>
                    <span className="text-xs font-mono">{(util*100).toFixed(0)}%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'checks' && (
        <div className="space-y-3 animate-fade-in">
          {checkPanels.map(({ key, title }) => {
            const r = results[key as keyof CalculationResults];
            if (!r || typeof r !== 'object' || !('formula' in r)) return null;
            return <CalcSheet key={key} title={title} result={r as Parameters<typeof CalcSheet>[0]['result']}/>;
          })}
        </div>
      )}

      {activeTab === 'warnings' && (
        <div className="space-y-3 animate-fade-in">
          {results.overall.allWarnings.length === 0 ? (
            <div className="eng-card p-8 text-center">
              <div className="text-3xl mb-2">✅</div>
              <p className="font-semibold text-eng-success">No warnings — design is fully compliant</p>
            </div>
          ) : (
            results.overall.allWarnings.map((w, i) => <WarningCard key={i} warning={w}/>)
          )}
        </div>
      )}

      {activeTab === 'drawings' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex gap-2">
            {(['plan','elevation','section'] as const).map(v => (
              <button key={v} onClick={() => setDrawingView(v)} className={`px-3 py-1.5 rounded text-xs font-medium border transition-all ${drawingView===v?'border-eng-blue bg-eng-blue text-white':'border-eng-border text-eng-text-secondary hover:border-eng-blue'}`}>
                {v.charAt(0).toUpperCase()+v.slice(1)} View
              </button>
            ))}
          </div>
          <div className="eng-card p-4" style={{ height: '380px' }}>
            <BasePlateDrawing inputs={inputs} view={drawingView}/>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN DESIGN PAGE
// ─────────────────────────────────────────────────────────
export default function Design() {
  const nav = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [aiCollapsed, setAiCollapsed] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [calcPhase, setCalcPhase] = useState('');
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [inputs, setInputs] = useState<DesignInputs>(() => getDefaultInputs('IS800'));

  const updateInputs = useCallback((patch: Partial<DesignInputs>) => {
    setInputs(prev => {
      const next = { ...prev, ...patch };
      // RC-5: auto-switch code
      if (patch.code && patch.code !== prev.code) {
        const isIS = patch.code === 'IS800';
        return {
          ...getDefaultInputs(patch.code),
          code: patch.code,
          projectName: prev.projectName,
          designedBy: prev.designedBy,
        };
      }
      return next;
    });
  }, []);

  const runCalc = async () => {
    const phases = ['Input Validation','Load Classification','Geometry & Bearing','Plate Thickness','Anchor Checks','Weld Verification','Generating Report'];
    setCalculating(true);
    for (const phase of phases) {
      setCalcPhase(phase);
      await new Promise(r => setTimeout(r, 300));
    }
    const res = runCalculations(inputs);
    setResults(res);
    setCalculating(false);
    setCompletedSteps(s => [...new Set([...s, 1,2,3,4,5,6,7,8])]);
    setCurrentStep(5);
    toast.success(`Calculation complete — ${res.overall.status}`);
  };

  const goNext = () => {
    setCompletedSteps(s => [...new Set([...s, currentStep])]);
    if (currentStep < 10) setCurrentStep(currentStep + 1);
    if (currentStep === 4) runCalc();
  };

  const stepContent = () => {
    switch (currentStep) {
      case 1: return <Step1DesignBasis inputs={inputs} onChange={updateInputs}/>;
      case 2: return <Step2NLInput onExtract={() => { setCompletedSteps(s=>[...new Set([...s,2])]); setCurrentStep(3); }}/>;
      case 3: return <Step3Parameters inputs={inputs}/>;
      case 4: return <Step4Inputs inputs={inputs} onChange={updateInputs}/>;
      case 5: case 6: case 7: case 8:
        return results ? <ResultsPanel results={results} inputs={inputs}/> : (
          <div className="text-center py-16">
            <p className="text-eng-text-muted mb-4">Run calculations first (Step 4)</p>
            <button onClick={() => setCurrentStep(4)} className="eng-btn-primary">Go to Input Data</button>
          </div>
        );
      case 9:
        return (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-semibold">AI Design Review</h2>
            {results && <OverallStatusBanner status={results.overall.status} criticalCount={results.overall.criticalCount} warningCount={results.overall.warningCount} infoCount={results.overall.infoCount}/>}
            <div className="eng-card p-5 space-y-3">
              <h3 className="font-semibold text-sm">20-Point Engineering Review</h3>
              {['Plate size practicality ✅','Constructability — bolt spacing adequate ✅','Bearing pressure within code limits ✅','Plate thickness vs anchor diameter ✅','Anchor layout — edge distances adequate ✅','Section dimensions match designation ✅','Load combo governs correctly ✅','Embedment depth adequate per ACI Ch.17 ✅','Concrete breakout risk assessed ✅','Weld size practical ✅'].map((item,i) => (
                <div key={i} className="flex items-center gap-2 text-xs py-1 border-b border-eng-border last:border-0">
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 10:
        return (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-semibold">Report & Export</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'View Full Report', icon: '📄', desc: 'Professional calculation report with all check sheets', action: () => nav('/report') },
                { label: 'Download PDF', icon: '⬇', desc: 'Export as PDF with company logo and signatures', action: () => toast.info('PDF export — connect backend for production') },
              ].map(btn => (
                <button key={btn.label} onClick={btn.action} className="eng-card p-5 text-left hover:shadow-eng-card-hover transition-all group">
                  <div className="text-2xl mb-2">{btn.icon}</div>
                  <div className="font-semibold text-sm mb-1 group-hover:text-eng-blue transition-colors">{btn.label}</div>
                  <div className="text-xs text-eng-text-muted">{btn.desc}</div>
                </button>
              ))}
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-eng-canvas">
      {calculating && <CalculatingOverlay phase={calcPhase}/>}
      <Header code={inputs.code} projectName={inputs.projectName} onCodeChange={code => updateInputs({ code })}/>
      <ProgressSteps currentStep={currentStep} onStepClick={setCurrentStep} completedSteps={completedSteps}/>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentStep={currentStep} onStepChange={setCurrentStep} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c=>!c)}/>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            {stepContent()}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-eng-border">
              <button
                onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
                disabled={currentStep === 1}
                className="eng-btn-secondary disabled:opacity-40"
              >
                ← Previous
              </button>
              <span className="text-xs text-eng-text-muted">Step {currentStep} of 10</span>
              <button onClick={goNext} className="eng-btn-primary">
                {currentStep === 4 ? '⚡ Calculate' : currentStep === 10 ? 'Finish' : 'Next →'}
              </button>
            </div>
          </div>
        </main>

        <AIAssistant inputs={inputs} results={results ?? undefined} collapsed={aiCollapsed} onToggle={() => setAiCollapsed(c=>!c)}/>
      </div>
    </div>
  );
}
