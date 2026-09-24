"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type StepProgressProps = {
  currentStep: number;
  onStepClick?: (step: number) => void;
};

export function StepProgress({ currentStep, onStepClick }: StepProgressProps) {
  const steps = [
    { label: "Clinic" },
    { label: "Condition" },
    { label: "Doctor" },
    { label: "Time" },
    { label: "Details" },
    { label: "Confirm" }
  ];

  return (
    <div className="max-w-3xl mx-auto mb-8 px-4 w-full">
      <div className="flex items-center justify-between relative">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;
          const isUpcoming = stepNum > currentStep;

          return (
            <div key={step.label} className="flex flex-col items-center relative z-10 flex-1">
              <button
                disabled={!isCompleted && !onStepClick}
                onClick={() => isCompleted && onStepClick && onStepClick(stepNum)}
                className={cn(
                  "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                  isCompleted ? "bg-secondary text-on-secondary cursor-pointer hover:bg-secondary/90" : 
                  isActive ? "bg-primary text-on-primary shadow-md scale-110" : 
                  "bg-surface-high text-on-surface-variant cursor-not-allowed"
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : stepNum}
              </button>
              <span className={cn(
                "hidden sm:block text-xs mt-2 font-medium transition-colors",
                isActive ? "text-primary font-bold" : "text-on-surface-variant"
              )}>
                {step.label}
              </span>
            </div>
          );
        })}

        {/* Connecting Lines */}
        <div className="absolute top-4 md:top-5 left-0 right-0 h-0.5 bg-surface-high -z-10 px-8">
          <div 
            className="h-full bg-secondary transition-all duration-300"
            style={{ width: `${Math.max(0, (currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
