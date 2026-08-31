import { useState, useRef, useEffect } from 'react';
import type { CalculationResults, DesignInputs } from '@/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

const SUGGESTIONS = [
  'What is the governing failure mode?',
  'How can I reduce plate thickness?',
  'Should I add stiffener plates?',
  'Explain the anchor breakout check',
  'What load combination governs?',
  'Recommend optimization options',
];

const MOCK_RESPONSES: Record<string, string> = {
  'governing failure': 'Based on the current design, the **governing check** is plate bending thickness (AISC DG1 Eq.2.6). The critical projection length l = max(m, n, λn\') controls the required thickness. Consider adding stiffener plates if tp_required > 40mm.',
  'reduce plate': 'To reduce base plate thickness:\n1. **Add stiffener plates** on both sides of the column web — reduces effective cantilever length m and n\n2. **Increase plate plan dimensions** N and B — reduces bearing pressure fp\n3. **Use higher-strength plate** (A572-Gr50 vs A36 increases Fy from 248 to 345 MPa)\n4. **Increase column section** — reduces projection m = (N - 0.95d)/2',
  'stiffener': 'Stiffener plates are recommended when:\n• **tp_required > 40mm** — plate too thick (practicality)\n• **Anchor dia > plate tp** — prying action risk\n• **Large plate projection** m or n > 100mm\n\nSizing rule: t_stiff ≥ 0.75×tp, height ≥ 0.5×plate_N, weld both sides to column and plate.',
  'anchor breakout': 'ACI 318-19 Ch.17 concrete breakout in tension:\n**Nb = kc × λ × √f\'c × hef^1.5**\nwhere kc = 24 (cast-in headed), λ = 1.0 (NW concrete)\n\nModified by:\n• ψ_ed: edge distance factor (< 1.0 if ca < 1.5hef)\n• ψ_c: cracked/uncracked (1.25 uncracked)\n• ANc/ANco: area ratio for group effects\n\nφNcb = φ × ψ_ed × ψ_c × Nb (φ = 0.70)',
  'load combination': 'The governing load combination depends on your code:\n• **AISC LRFD**: ASCE 7-22 Combo 2 (1.2D+1.6L) typically governs for gravity\n• **AISC LRFD**: Combo 5 (0.9D+1.0W) governs for uplift check\n• **IS 800 LSM**: IS 875 Combo 1 (1.5DL+1.5IL) for gravity\n• **IS 800 LSM**: Combo 4 (0.9DL+1.5WL) for uplift\n\nAlways check all combos — use batch run to find worst case.',
  'optimization': 'Design optimization suggestions:\n1. **Plate size**: Start with minimum N_min = d+100mm, B_min = bf+100mm\n2. **Anchor layout**: 4-bolt preferred; 6+ only if tension governs\n3. **Embedment**: hef = 12d for compression, 16d for uplift — don\'t over-embed\n4. **Weld size**: Match to plate thickness — 0.7×tp typical starting point\n5. **Stiffeners**: Often more economical than increasing tp > 32mm',
};

function getMockResponse(query: string): string {
  const q = query.toLowerCase();
  for (const [key, resp] of Object.entries(MOCK_RESPONSES)) {
    if (q.includes(key)) return resp;
  }
  return `Engineering analysis in progress...\n\nFor the current design (${Math.random() > 0.5 ? 'AISC LRFD' : 'IS 800:2007'}), the AI assistant recommends reviewing the governing check. Key parameters to consider:\n\n• Verify bearing pressure is within code limits\n• Confirm anchor embedment depth (hef ≥ 12d)\n• Check plate thickness against calculated requirement\n• Review weld size for shear demand\n\nFor detailed code clause references, refer to the calculation sheets in Steps 5–8.`;
}

interface AIAssistantProps {
  inputs?: DesignInputs;
  results?: CalculationResults;
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function AIAssistant({ inputs, results, collapsed = false, onToggle }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your StructAI engineering assistant. I can explain calculations, recommend optimizations, reference code clauses, and help interpret results. What would you like to know?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(m => [...m, { role: 'user', content: text, time }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, { role: 'assistant', content: getMockResponse(text), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 900 + Math.random() * 600);
  };

  if (collapsed) {
    return (
      <div className="w-10 bg-white border-l border-eng-border flex flex-col items-center py-3 gap-3">
        <button onClick={onToggle} className="w-7 h-7 rounded bg-eng-blue text-white flex items-center justify-center" title="Open AI Assistant">
          <svg viewBox="0 0 16 16" className="w-4 h-4 fill-current"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 10v1m0-6a2 2 0 011.7 3c-.4.5-1.7 1-1.7 2"/></svg>
        </button>
        <span className="text-[8px] text-eng-text-muted text-center rotate-90 whitespace-nowrap mt-4">AI Assistant</span>
      </div>
    );
  }

  return (
    <div className="w-72 bg-white border-l border-eng-border flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="h-10 flex items-center justify-between px-3 border-b border-eng-border bg-eng-canvas flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-eng-blue flex items-center justify-center">
            <svg viewBox="0 0 16 16" className="w-3 h-3 fill-white"><path d="M8 1a7 7 0 100 14A7 7 0 008 1z"/></svg>
          </div>
          <span className="text-xs font-semibold text-eng-text-primary">AI Engineering Assistant</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#1A7F37] animate-pulse-subtle"/>
        </div>
        <button onClick={onToggle} className="text-eng-text-muted hover:text-eng-text-primary transition-colors">
          <svg viewBox="0 0 16 16" className="w-4 h-4 fill-current"><path d="M4 4l8 8M12 4l-8 8"/></svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${msg.role === 'assistant' ? 'bg-eng-blue text-white' : 'bg-eng-canvas border border-eng-border text-eng-text-secondary'}`}>
              {msg.role === 'assistant' ? 'AI' : 'SE'}
            </div>
            <div className={`max-w-[85%] rounded-lg px-3 py-2 ${msg.role === 'assistant' ? 'bg-eng-canvas border border-eng-border' : 'bg-eng-blue text-white'}`}>
              <p className={`text-xs leading-relaxed whitespace-pre-line ${msg.role === 'user' ? 'text-white' : 'text-eng-text-primary'}`}>{msg.content}</p>
              <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-white/60' : 'text-eng-text-muted'}`}>{msg.time}</p>
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-eng-blue flex items-center justify-center text-[10px] font-bold text-white">AI</div>
            <div className="bg-eng-canvas border border-eng-border rounded-lg px-3 py-2">
              <div className="flex gap-1">
                {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-eng-blue animate-pulse-subtle" style={{animationDelay:`${i*0.2}s`}}/>)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Quick suggestions */}
      <div className="border-t border-eng-border p-2">
        <p className="text-[10px] text-eng-text-muted mb-1.5 px-1">Suggested questions:</p>
        <div className="flex flex-wrap gap-1">
          {SUGGESTIONS.slice(0, 3).map(s => (
            <button key={s} onClick={() => sendMessage(s)} className="text-[10px] px-2 py-1 rounded border border-eng-border hover:border-eng-blue hover:text-eng-blue hover:bg-eng-blue-subtle transition-all text-eng-text-secondary">
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-eng-border p-2 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
          placeholder="Ask engineering question..."
          className="eng-input flex-1 text-xs py-1.5"
        />
        <button onClick={() => sendMessage(input)} disabled={!input.trim()} className="eng-btn-primary px-2.5 py-1.5 text-xs">
          <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current"><path d="M1 1l14 7-14 7V9l10-1-10-1z"/></svg>
        </button>
      </div>
    </div>
  );
}
