import { X } from 'lucide-react';

type TourProps = {
  open: boolean;
  step: number;
  total: number;
  title: string;
  description: string;
  onNext: () => void;
  onClose: () => void;
};

export function OnboardingTour({
  open,
  step,
  total,
  title,
  description,
  onNext,
  onClose,
}: TourProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 md:items-center">
      <div className="w-full max-w-md rounded-2xl border border-white/20 bg-white p-5 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
            Onboarding {step}/{total}
          </p>
          <button onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <h3 className="mb-2 text-xl font-bold text-slate-900">{title}</h3>
        <p className="mb-5 text-sm text-slate-600">{description}</p>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">
            Skip
          </button>
          <button onClick={onNext} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
            {step === total ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
