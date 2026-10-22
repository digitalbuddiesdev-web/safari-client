import React from 'react';
import { Check, Clock, ChevronRight, HelpCircle } from 'lucide-react';
import { WEBSITE_5_STEPS, getStepForStatus } from '../../lib/crm';

interface WorkflowStepperProps {
  currentStep?: number;
  status?: string;
  interactive?: boolean;
  onStepClick?: (stepNumber: number) => void;
  compact?: boolean;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  currentStep: propStep,
  status,
  interactive = false,
  onStepClick,
  compact = false
}) => {
  const activeStep = propStep ?? getStepForStatus(status);

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 py-1 text-xs">
        {WEBSITE_5_STEPS.map((s) => {
          const isDone = s.number < activeStep;
          const isCurrent = s.number === activeStep;

          return (
            <div
              key={s.number}
              onClick={() => interactive && onStepClick?.(s.number)}
              title={`${s.name}: ${s.subtitle}`}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold transition ${
                isDone
                  ? 'bg-emerald-100 text-emerald-800'
                  : isCurrent
                  ? 'bg-gold text-forest shadow-xs'
                  : 'bg-sand/60 text-forest/40'
              } ${interactive ? 'cursor-pointer hover:opacity-80' : ''}`}
            >
              <span>{isDone ? '✓' : s.number}</span>
              <span className="hidden sm:inline font-sans uppercase tracking-wider">{s.name.split(' ')[0]}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-sand-warm/60 border border-forest/15 rounded-2xl p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-earth flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-gold" />
          <span>Website 5-Step Enquiry &amp; Booking Pipeline</span>
        </span>
        <span className="text-[11px] font-semibold text-forest/70">
          Step {activeStep} of 5 &bull; <strong className="text-forest">{WEBSITE_5_STEPS[activeStep - 1]?.name}</strong>
        </span>
      </div>

      {/* 5 Step Track */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
        {WEBSITE_5_STEPS.map((s) => {
          const isDone = s.number < activeStep;
          const isCurrent = s.number === activeStep;

          return (
            <div
              key={s.number}
              onClick={() => interactive && onStepClick?.(s.number)}
              className={`p-2.5 rounded-xl border text-xs transition relative flex flex-col justify-between ${
                isCurrent
                  ? 'bg-white border-gold shadow-md ring-2 ring-gold/30'
                  : isDone
                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                  : 'bg-white/40 border-forest/10 text-forest/50'
              } ${interactive ? 'cursor-pointer hover:border-gold/60' : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                    isCurrent
                      ? 'bg-gold text-forest font-bold'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-forest/10 text-forest/60'
                  }`}
                >
                  {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : s.number}
                </span>

                <span
                  className={`text-[9px] uppercase font-bold tracking-wider ${
                    isCurrent
                      ? 'text-amber-800'
                      : isDone
                      ? 'text-emerald-700'
                      : 'text-forest/40'
                  }`}
                >
                  {isDone ? 'Completed' : isCurrent ? 'Active Now' : `Step ${s.number}`}
                </span>
              </div>

              <div>
                <strong className={`block text-[11px] leading-tight font-serif ${isCurrent ? 'text-forest font-bold' : isDone ? 'text-forest' : 'text-forest/60'}`}>
                  {s.name}
                </strong>
                <p className="text-[10px] text-forest/60 leading-tight mt-0.5 line-clamp-1">
                  {s.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active step guide banner */}
      <div className="p-3 bg-white rounded-xl border border-gold/30 text-xs flex items-start gap-2.5 shadow-xs">
        <div className="w-5 h-5 rounded-full bg-gold/20 text-earth flex items-center justify-center shrink-0 mt-0.5 font-bold text-[11px]">
          {activeStep}
        </div>
        <div className="flex-1 text-[11px] leading-relaxed text-forest/80">
          <strong className="text-forest font-bold mr-1">
            {WEBSITE_5_STEPS[activeStep - 1]?.name}:
          </strong>
          {WEBSITE_5_STEPS[activeStep - 1]?.description}
        </div>
      </div>
    </div>
  );
};

export default WorkflowStepper;
