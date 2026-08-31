interface Step {
  id: number;
  label: string;
  sublabel: string;
}

const STEPS: Step[] = [
  { id: 1, label: 'Design Basis', sublabel: 'Code & Project' },
  { id: 2, label: 'NL Input', sublabel: 'Description' },
  { id: 3, label: 'Parameters', sublabel: 'AI Extract' },
  { id: 4, label: 'Input Data', sublabel: 'Materials & Loads' },
  { id: 5, label: 'Geometry', sublabel: 'Bearing Check' },
  { id: 6, label: 'Plate Thickness', sublabel: 'Bending Design' },
  { id: 7, label: 'Anchors', sublabel: 'ACI Ch.17' },
  { id: 8, label: 'Welds', sublabel: 'Connections' },
  { id: 9, label: 'Review', sublabel: 'AI Review' },
  { id: 10, label: 'Report', sublabel: 'Export' },
];

interface ProgressStepsProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  completedSteps: number[];
}

export default function ProgressSteps({ currentStep, onStepClick, completedSteps }: ProgressStepsProps) {
  return (
    <div className="bg-white border-b border-eng-border px-4 py-2 overflow-x-auto flex-shrink-0">
      <div className="flex items-center min-w-max gap-0">
        {STEPS.map((step, i) => {
          const completed = completedSteps.includes(step.id);
          const active = currentStep === step.id;
          const accessible = completed || active || (step.id <= Math.max(...completedSteps, 1) + 1);
          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => accessible ? onStepClick(step.id) : null}
                className={`flex flex-col items-center gap-1 px-2 py-1 rounded-md transition-all duration-200 ${accessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'} ${active ? 'bg-eng-blue-subtle' : 'hover:bg-eng-canvas'}`}
              >
                <div className={`step-circle text-[10px] ${completed ? 'completed' : active ? 'active' : 'pending'}`}>
                  {completed ? (
                    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current">
                      <path d="M2 8l4 4 8-8"/>
                    </svg>
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                <div className="text-center">
                  <div className={`text-[10px] font-semibold whitespace-nowrap ${active ? 'text-eng-blue' : completed ? 'text-eng-text-secondary' : 'text-eng-text-muted'}`}>
                    {step.label}
                  </div>
                  <div className="text-[9px] text-eng-text-muted whitespace-nowrap">{step.sublabel}</div>
                </div>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`w-6 h-0.5 flex-shrink-0 transition-colors duration-300 ${completedSteps.includes(step.id) ? 'bg-eng-blue' : 'bg-eng-border'}`}/>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
