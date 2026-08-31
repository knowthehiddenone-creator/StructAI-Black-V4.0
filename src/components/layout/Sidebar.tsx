import { useState } from 'react';

interface SidebarProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  collapsed: boolean;
  onToggle: () => void;
}

const menuGroups = [
  {
    label: 'DESIGN TOOL',
    items: [
      { id: 0, label: 'Dashboard', icon: 'M2 2h5v5H2zm7 0h5v5H9zm-7 7h5v5H2zm7 0h5v5H9z' },
      { id: 1, label: 'Design Basis', icon: 'M1 1h14v2H1zm0 4h14v2H1zm0 4h14v2H1zm0 4h8v2H1z', step: true },
      { id: 2, label: 'NL Input', icon: 'M3 4h10v1H3zm-1 3h12v1H2zm1 3h7v1H3z', step: true },
      { id: 3, label: 'Parameters', icon: 'M8 2l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4z', step: true },
    ],
  },
  {
    label: 'STRUCTURAL',
    items: [
      { id: 4, label: 'Steel Design', icon: 'M2 12h12v2H2zm2-4h8v2H4zm2-4h4v2H6z', step: true },
      { id: 5, label: 'Base Plate', icon: 'M1 13h14v1H1zm1-3h12v1H2zm2-3h8v1H4zm3-3h2v1H7z', step: true },
      { id: 6, label: 'Concrete', icon: 'M2 2h12l1 1v12l-1 1H2l-1-1V3zm0 13h12V3H2z', step: true },
      { id: 7, label: 'Anchor Design', icon: 'M8 1a7 7 0 100 14A7 7 0 008 1zm0 1a6 6 0 110 12A6 6 0 018 2zm0 3a3 3 0 100 6 3 3 0 000-6z', step: true },
    ],
  },
  {
    label: 'ANALYSIS',
    items: [
      { id: 8, label: 'Load Combinations', icon: 'M1 3h14v2H1zm2 4h10v2H3zm2 4h6v2H5z' },
      { id: 9, label: 'Materials', icon: 'M8 1L2 5v6l6 4 6-4V5z' },
      { id: 10, label: 'Sections', icon: 'M3 1v14M13 1v14M3 8h10' },
      { id: 11, label: 'Optimization', icon: 'M2 14L8 2l6 12z' },
    ],
  },
  {
    label: 'OUTPUT',
    items: [
      { id: 12, label: 'Review', icon: 'M14 2H2v12h12zM4 6h8M4 9h8M4 12h4', step: true },
      { id: 13, label: 'Reports', icon: 'M3 1h8l4 4v10H3zm7 0v4h4' },
      { id: 14, label: 'Drawings', icon: 'M1 1h14v14H1zm2 2h10v10H3z' },
      { id: 15, label: 'History', icon: 'M8 1a7 7 0 100 14A7 7 0 008 1zm.5 3v4.5l3 1.8' },
      { id: 16, label: 'Templates', icon: 'M4 1h8l3 3v11H1V4z' },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { id: 17, label: 'Settings', icon: 'M8 5a3 3 0 100 6 3 3 0 000-6zM1.5 6.5h1M13.5 6.5h1M8 1v1M8 14v1' },
      { id: 18, label: 'Help', icon: 'M8 1a7 7 0 100 14A7 7 0 008 1zm0 10v1m0-6a2 2 0 011.7 3c-.4.5-1.7 1-1.7 2' },
    ],
  },
];

const STEPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // step IDs

export default function Sidebar({ currentStep, onStepChange, collapsed, onToggle }: SidebarProps) {
  const [expanded, setExpanded] = useState<string[]>(['DESIGN TOOL', 'STRUCTURAL', 'ANALYSIS', 'OUTPUT']);

  const toggleGroup = (label: string) => {
    setExpanded(e => e.includes(label) ? e.filter(x => x !== label) : [...e, label]);
  };

  return (
    <aside className={`flex-shrink-0 bg-eng-sidebar border-r border-[#21262D] flex flex-col transition-all duration-300 overflow-hidden ${collapsed ? 'w-12' : 'w-56'}`}>
      {/* Toggle */}
      <div className="h-10 flex items-center justify-end px-2 border-b border-[#21262D]">
        <button onClick={onToggle} className="w-7 h-7 rounded flex items-center justify-center text-[#656D76] hover:text-[#E6EDF3] hover:bg-[#1C2128] transition-all">
          <svg viewBox="0 0 16 16" className="w-4 h-4 fill-current">
            {collapsed
              ? <path d="M5 3l5 5-5 5V3z"/>
              : <path d="M11 3L6 8l5 5V3z"/>
            }
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {menuGroups.map(group => (
          <div key={group.label} className="mb-1">
            {!collapsed && (
              <button
                onClick={() => toggleGroup(group.label)}
                className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] font-semibold text-[#656D76] tracking-widest uppercase hover:text-[#8B949E] transition-colors"
              >
                {group.label}
                <svg viewBox="0 0 16 16" className={`w-3 h-3 fill-current transition-transform ${expanded.includes(group.label) ? 'rotate-0' : '-rotate-90'}`}>
                  <path d="M4 6l4 4 4-4z"/>
                </svg>
              </button>
            )}
            {(collapsed || expanded.includes(group.label)) && (
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const isActive = item.step && currentStep === item.id;
                  const isStep = item.step;
                  const stepNum = isStep ? STEPS.indexOf(item.id) + 1 : null;
                  return (
                    <button
                      key={item.id}
                      onClick={() => isStep ? onStepChange(item.id) : null}
                      className={`sidebar-item w-full ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
                      title={collapsed ? item.label : undefined}
                    >
                      <svg viewBox="0 0 16 16" className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <path d={item.icon}/>
                      </svg>
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left truncate">{item.label}</span>
                          {isStep && stepNum && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isActive ? 'bg-white/20 text-white' : 'bg-[#21262D] text-[#656D76]'}`}>
                              {stepNum.toString().padStart(2,'0')}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      {!collapsed && (
        <div className="border-t border-[#21262D] p-3">
          <div className="text-[10px] text-[#656D76] text-center">
            StructAI BasePlate v4.0
            <div className="text-[#30363D] mt-0.5">LTTS EI Hackathon 2026</div>
          </div>
        </div>
      )}
    </aside>
  );
}
