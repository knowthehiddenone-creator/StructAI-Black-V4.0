import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import heroImg from '@/assets/hero-structure.jpg';

const stats = [
  { value: '17', label: 'Calculation Modules' },
  { value: '3', label: 'Design Codes' },
  { value: '5', label: 'Warning Levels' },
  { value: '<30s', label: 'Full Report' },
];

const features = [
  {
    icon: (
      <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none">
        <rect x="8" y="28" width="24" height="4" rx="1" stroke="#0969DA" strokeWidth="2"/>
        <rect x="13" y="8" width="14" height="20" rx="1" stroke="#0969DA" strokeWidth="2"/>
        <line x1="10" y1="30" x2="10" y2="8" stroke="#54AEFF" strokeWidth="1" strokeDasharray="2 2"/>
        <line x1="30" y1="30" x2="30" y2="8" stroke="#54AEFF" strokeWidth="1" strokeDasharray="2 2"/>
        <circle cx="10" cy="30" r="2" fill="#0969DA"/>
        <circle cx="30" cy="30" r="2" fill="#0969DA"/>
        <circle cx="10" cy="20" r="2" fill="#0969DA"/>
        <circle cx="30" cy="20" r="2" fill="#0969DA"/>
      </svg>
    ),
    title: 'Multi-Code Compliance',
    desc: 'AISC 360-22, IS 800:2007, ACI 318-19, IS 456:2000 — automatic code-clause referencing for every calculation step.',
    tag: 'Engineering Accuracy',
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none">
        <rect x="6" y="6" width="28" height="28" rx="2" stroke="#0969DA" strokeWidth="2"/>
        <path d="M12 20h16M12 14h16M12 26h10" stroke="#54AEFF" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="30" cy="26" r="4" fill="#DAFBE1" stroke="#4AC26B" strokeWidth="1.5"/>
        <path d="M28 26l1.5 1.5 2-2.5" stroke="#1A7F37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Real-Time Validation',
    desc: '5-level warning system — from INFO to REDESIGN REQUIRED. Every input validated on blur. No silent auto-corrections.',
    tag: 'Quality Assurance',
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none">
        <rect x="6" y="4" width="28" height="32" rx="2" stroke="#0969DA" strokeWidth="2"/>
        <line x1="10" y1="12" x2="30" y2="12" stroke="#54AEFF" strokeWidth="1"/>
        <line x1="10" y1="18" x2="30" y2="18" stroke="#54AEFF" strokeWidth="1"/>
        <line x1="10" y1="24" x2="22" y2="24" stroke="#54AEFF" strokeWidth="1"/>
        <path d="M10 30h20" stroke="#0969DA" strokeWidth="1.5" strokeLinecap="round"/>
        <rect x="22" y="28" width="8" height="6" rx="1" fill="#DDF4FF" stroke="#54AEFF" strokeWidth="1"/>
        <path d="M24 31h4M24 33h2" stroke="#0969DA" strokeWidth="0.75"/>
      </svg>
    ),
    title: 'Transparent Calculations',
    desc: 'Every check rendered as a full calculation sheet — formula, variables, intermediate steps, code clause, pass/fail.',
    tag: 'Full Traceability',
  },
];

// Animated structural SVG
function StructuralScene() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPhase(p => (p + 1) % 360), 50);
    return () => clearInterval(id);
  }, []);
  const angle = (phase * Math.PI) / 180;
  const px = Math.sin(angle) * 2;
  const py = Math.cos(angle) * 2;

  return (
    <svg viewBox="-80 -120 160 260" className="w-full h-full" fill="none">
      {/* Grid */}
      {[-60,-40,-20,0,20,40,60].map(x => (
        <line key={`v${x}`} x1={x} y1="-100" x2={x} y2="140" stroke="rgba(9,105,218,0.08)" strokeWidth="0.5"/>
      ))}
      {[-100,-80,-60,-40,-20,0,20,40,60,80,100,120,140].map(y => (
        <line key={`h${y}`} x1="-80" y1={y} x2="80" y2={y} stroke="rgba(9,105,218,0.08)" strokeWidth="0.5"/>
      ))}
      {/* Ground */}
      <line x1="-70" y1="120" x2="70" y2="120" stroke="#30363D" strokeWidth="1.5"/>
      {/* Pedestal */}
      <rect x="-35" y="60" width="70" height="60" rx="1" stroke="#54AEFF" strokeWidth="1.5" strokeOpacity="0.6" fill="rgba(9,105,218,0.04)"/>
      {/* Plate */}
      <rect x="-28" y="52" width="56" height="8" rx="0.5" stroke="#0969DA" strokeWidth="2" fill="rgba(9,105,218,0.08)"/>
      {/* Column web */}
      <rect x="-3" y="-90" width="6" height="142" rx="0.5" stroke="#0969DA" strokeWidth="1.5" fill="rgba(9,105,218,0.06)"/>
      {/* Column flanges */}
      <rect x="-18" y="-90" width="36" height="6" rx="0.5" stroke="#0969DA" strokeWidth="1.5" fill="rgba(9,105,218,0.1)"/>
      <rect x="-18" y="46" width="36" height="6" rx="0.5" stroke="#0969DA" strokeWidth="1.5" fill="rgba(9,105,218,0.1)"/>
      <rect x="-16" y="-30" width="32" height="4" rx="0.5" stroke="#54AEFF" strokeWidth="1" fill="rgba(84,174,255,0.06)"/>
      {/* Anchor bolts */}
      {[[-20,68],[20,68],[-20,108],[20,108]].map(([ax, ay], i) => (
        <g key={i}>
          <line x1={ax} y1="52" x2={ax} y2={ay} stroke="#9A6700" strokeWidth="1.5"/>
          <circle cx={ax} cy={ay} r="3" fill="#9A6700" fillOpacity="0.7"/>
          <circle cx={ax} cy="54" r="2.5" fill="#D4A72C" fillOpacity="0.9"/>
        </g>
      ))}
      {/* Weld lines */}
      <path d="M-18 52 L18 52" stroke="#CF222E" strokeWidth="1" strokeDasharray="3 2"/>
      {/* Dim lines */}
      <line x1="-45" y1="52" x2="-45" y2="120" stroke="#656D76" strokeWidth="0.75" strokeDasharray="2 2"/>
      <line x1="-50" y1="52" x2="-40" y2="52" stroke="#656D76" strokeWidth="0.75"/>
      <line x1="-50" y1="120" x2="-40" y2="120" stroke="#656D76" strokeWidth="0.75"/>
      <text x="-60" y="88" fill="#656D76" fontSize="5" textAnchor="middle" transform="rotate(-90,-60,88)">H_ped</text>
      {/* Floating particles */}
      {[0,60,120,180,240,300].map((baseAngle, i) => {
        const a = ((baseAngle + phase * 0.5) * Math.PI) / 180;
        const r = 55 + i * 5;
        const x = Math.cos(a) * r * 0.6;
        const y = Math.sin(a) * r * 0.4 - 20;
        return <circle key={i} cx={x} cy={y} r="1.5" fill="#0969DA" fillOpacity={0.3 + (i % 3) * 0.2}/>;
      })}
      {/* Force arrow */}
      <line x1={px} y1={-105 + py} x2={px} y2={-92 + py} stroke="#CF222E" strokeWidth="2" strokeLinecap="round"/>
      <polygon points={`${px},-90 ${px-3},-96 ${px+3},-96`} fill="#CF222E" transform={`translate(${px * 0.1},${py * 0.1})`}/>
      <text x={px + 6} y={-98 + py} fill="#CF222E" fontSize="5" fontWeight="600">Pu</text>
      {/* Moment arc */}
      <path d="M 8 -50 A 10 10 0 0 1 -8 -50" stroke="#7C3AED" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <text x="12" y="-48" fill="#7C3AED" fontSize="5" fontWeight="600">Mx</text>
    </svg>
  );
}

export default function Landing() {
  const nav = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const featRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0D1117] text-white overflow-x-hidden">
      {/* Top Nav */}
      <header className={`fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-6 transition-all duration-300 ${scrolled ? 'bg-[#0D1117]/95 backdrop-blur border-b border-[#21262D]' : 'bg-transparent'}`}>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-7 h-7 rounded bg-[#0969DA] flex items-center justify-center">
            <svg viewBox="0 0 16 16" className="w-4 h-4 fill-white">
              <path d="M3 12h10v1H3zm1-2h8v1H4zm2-2h4v1H6zM2 4h12v1H2zm1 2h10v1H3z"/>
            </svg>
          </div>
          <span className="font-bold text-[15px] tracking-tight text-white">StructAI</span>
          <span className="text-[#656D76] text-xs ml-1">BasePlate</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-[#8B949E]">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#codes" className="hover:text-white transition-colors">Design Codes</a>
          <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
        </nav>
        <div className="flex-1 flex justify-end">
          <button onClick={() => nav('/design')} className="eng-btn-primary text-sm py-1.5 px-4">
            Launch App →
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* BG Image */}
        <div className="absolute inset-0">
          <img src={heroImg} alt="Structural engineering visualization" className="w-full h-full object-cover opacity-20"/>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0D1117]/60 via-[#0D1117]/40 to-[#0D1117]"/>
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid opacity-40"/>

        {/* 3D SVG Scene */}
        <div className="absolute right-8 lg:right-16 xl:right-24 top-1/2 -translate-y-1/2 w-72 h-80 opacity-80 hidden lg:block animate-fade-in">
          <StructuralScene />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center lg:text-left lg:mx-0 lg:ml-16 xl:ml-24">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#0969DA]/40 bg-[#0969DA]/10 text-[#54AEFF] text-xs font-medium tracking-widest uppercase mb-6 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0969DA] animate-pulse-subtle"/>
            LTTS Engineering Intelligence Hackathon 2026
          </div>

          {/* Headline */}
          <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 animate-fade-in" style={{animationDelay:'0.1s'}}>
            StructAI
            <span className="block text-[#0969DA]">BasePlate</span>
          </h1>

          <p className="text-xl text-[#8B949E] leading-relaxed mb-8 max-w-xl animate-fade-in" style={{animationDelay:'0.2s'}}>
            AI-powered structural steel base plate design. Real-time code compliance, transparent calculations, enterprise-grade reports.
          </p>

          {/* Code Badges */}
          <div className="flex flex-wrap gap-2 mb-10 justify-center lg:justify-start animate-fade-in" style={{animationDelay:'0.3s'}}>
            {['AISC 360-22', 'IS 800:2007', 'ACI 318-19', 'IS 456:2000', 'ASCE 7-22'].map(code => (
              <span key={code} className="px-3 py-1 rounded-full text-xs font-semibold border border-[#54AEFF]/40 bg-[#DDF4FF]/10 text-[#54AEFF]">
                {code}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex gap-3 flex-wrap justify-center lg:justify-start animate-fade-in" style={{animationDelay:'0.4s'}}>
            <button
              onClick={() => nav('/design')}
              className="eng-btn-primary text-base px-8 py-3 shadow-eng-blue"
            >
              Start New Design
              <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button
              onClick={() => nav('/report')}
              className="eng-btn-secondary border-[#30363D] bg-transparent text-[#E6EDF3] hover:bg-[#1C2128] text-base px-6 py-3"
            >
              View Sample Report
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[#656D76] text-xs animate-pulse-subtle flex flex-col items-center gap-2">
          <span>Scroll to explore</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16"><path d="M8 3v10M4 9l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#161B22] border-y border-[#21262D] py-12">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center animate-fade-in" style={{animationDelay:`${i*0.1}s`}}>
              <div className="text-3xl font-bold text-[#0969DA] mb-1">{s.value}</div>
              <div className="text-sm text-[#8B949E]">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#0969DA] text-xs font-semibold tracking-widest uppercase mb-3">Engineered for professionals</p>
            <h2 className="text-3xl font-bold text-white mb-4">Enterprise-Grade Structural Design</h2>
            <p className="text-[#8B949E] max-w-xl mx-auto">Built for practicing structural engineers who need speed, accuracy, and complete auditability in every calculation.</p>
          </div>
          <div ref={featRef} className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i}
                className="eng-card-hover bg-[#161B22] border-[#30363D] rounded-xl p-6 group"
                style={{animationDelay:`${i*0.15}s`}}>
                <div className="mb-4">{f.icon}</div>
                <div className="badge-info mb-3 w-fit">{f.tag}</div>
                <h3 className="text-[#E6EDF3] font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-[#8B949E] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Design Codes Section */}
      <section id="codes" className="py-16 bg-[#161B22] border-y border-[#21262D]">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Supported Design Standards</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { code: 'AISC 360-22', title: 'Steel Construction Manual', body: 'Full LRFD & ASD methods. Design Guide 1 — Base Plate and Anchor Rod Design. Section J8 bearing, J2.4 welds.', color: '#0969DA' },
              { code: 'IS 800:2007', title: 'Indian Standard — Steel', body: 'LSM methodology per IS 800. Plate sizing Cl.7.4.1, thickness Cl.7.4.3. IS 456:2000 bearing Cl.34.4.', color: '#7C3AED' },
              { code: 'ACI 318-19', title: 'Building Code for Concrete', body: 'Chapter 17 anchor design — steel, concrete breakout, pullout, pryout, side-face blowout, interaction.', color: '#1A7F37' },
              { code: 'ASCE 7-22', title: 'Minimum Design Loads', body: 'Full LRFD & ASD load combinations. Auto-populated combos with govening load identification.', color: '#9A6700' },
            ].map((c, i) => (
              <div key={i} className="border border-[#30363D] rounded-lg p-5 bg-[#0D1117]">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-mono text-sm font-bold px-2 py-0.5 rounded" style={{background: `${c.color}20`, color: c.color, border: `1px solid ${c.color}40`}}>{c.code}</span>
                  <span className="text-[#E6EDF3] font-medium text-sm">{c.title}</span>
                </div>
                <p className="text-[#8B949E] text-sm leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-bold text-white mb-3">10-Step Design Workflow</h2>
            <p className="text-[#8B949E]">Guided step-by-step process from project setup to final report</p>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { n:'01', t:'Design Code & Project', d:'Select AISC or IS 800, set project metadata' },
              { n:'02', t:'Natural Language Input', d:'Describe your design in plain English' },
              { n:'03', t:'Parameter Review', d:'AI-extracted parameters with sign convention' },
              { n:'04', t:'Material & Geometry', d:'Section library, plate sizing, load combinations' },
              { n:'05', t:'Geometry & Bearing', d:'Plate area, CF confinement, bearing pressure' },
              { n:'06', t:'Plate Thickness', d:'AISC DG1 cantilever method / IS 800 Cl.7.4.3' },
              { n:'07', t:'Anchor & Embedment', d:'ACI 318-19 Ch.17 / IS 800 Cl.10.3 full checks' },
              { n:'08', t:'Weld & Stiffeners', d:'Fillet weld capacity, shear key, stiffener need' },
              { n:'09', t:'AI Design Review', d:'20-point engineering review with recommendations' },
              { n:'10', t:'Report & Export', d:'Professional PDF with full calculation sheets' },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-lg border border-[#21262D] bg-[#161B22] hover:border-[#0969DA]/40 transition-colors group">
                <span className="font-mono text-[#0969DA] font-bold text-sm w-8 flex-shrink-0 group-hover:text-[#54AEFF] transition-colors">{step.n}</span>
                <div>
                  <div className="text-[#E6EDF3] font-medium text-sm mb-0.5">{step.t}</div>
                  <div className="text-[#656D76] text-xs">{step.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-r from-[#0D1117] via-[#0969DA]/10 to-[#0D1117]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to design your base plate?</h2>
          <p className="text-[#8B949E] mb-8">Professional calculations, code compliance, and detailed reports in under 30 seconds.</p>
          <button onClick={() => nav('/design')} className="eng-btn-primary text-base px-10 py-4 shadow-eng-blue">
            Start New Design — Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#21262D] py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[#656D76] text-xs">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#0969DA] flex items-center justify-center">
              <svg viewBox="0 0 16 16" className="w-3 h-3 fill-white"><path d="M3 12h10v1H3zm1-2h8v1H4zm2-2h4v1H6zM2 4h12v1H2zm1 2h10v1H3z"/></svg>
            </div>
            <span className="text-[#E6EDF3] font-medium">StructAI BasePlate</span>
            <span className="text-[#656D76]">v4.0</span>
          </div>
          <div className="flex gap-6">
            <span>AISC 360-22 · IS 800:2007 · ACI 318-19</span>
          </div>
          <span>LTTS Engineering Intelligence Hackathon 2026</span>
        </div>
      </footer>
    </div>
  );
}
