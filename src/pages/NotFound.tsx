import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
      <div className="text-center">
        <div className="text-7xl font-bold text-[#21262D] mb-4 font-mono">404</div>
        <h1 className="text-xl font-semibold text-white mb-2">Page Not Found</h1>
        <p className="text-[#8B949E] mb-6">The requested engineering resource does not exist.</p>
        <button onClick={() => nav('/')} className="eng-btn-primary">← Return to StructAI</button>
      </div>
    </div>
  );
}
