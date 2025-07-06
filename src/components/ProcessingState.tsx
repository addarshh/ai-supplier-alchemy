import React from 'react';
import { Loader2, Brain, Database, FileText, TrendingUp } from 'lucide-react';

interface ProcessingStateProps {
  currentStep: number;
  totalSteps: number;
  currentStepName: string;
}

export const ProcessingState: React.FC<ProcessingStateProps> = ({ 
  currentStep, 
  totalSteps, 
  currentStepName 
}) => {
  const steps = [
    { name: 'Loading Files', icon: FileText, description: 'Reading transaction data and MCC templates' },
    { name: 'Enriching Data', icon: Database, description: 'Processing and categorizing transactions' },
    { name: 'Running Analysis', icon: TrendingUp, description: 'Generating insights and pivot tables' },
    { name: 'AI Processing', icon: Brain, description: 'Creating executive summary with AI' },
    { name: 'Generating Report', icon: FileText, description: 'Compiling final Excel report' }
  ];

  return (
    <div className="min-h-[500px] flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-primary rounded-full blur-xl opacity-30 animate-pulse" />
            <div className="relative bg-gradient-primary rounded-full p-6 shadow-glow">
              <Loader2 className="h-12 w-12 text-primary-foreground animate-spin" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-foreground mt-6 mb-2">
            Processing Your Analysis
          </h2>
          <p className="text-muted-foreground text-lg">
            Our AI is analyzing your supplier data to generate actionable insights
          </p>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div
                key={step.name}
                className={`relative flex items-center p-4 rounded-xl border-2 transition-all duration-500 ${
                  isActive
                    ? 'bg-primary/5 border-primary shadow-md'
                    : isCompleted
                    ? 'bg-success/5 border-success/30'
                    : 'bg-surface border-border'
                }`}
              >
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full mr-4 transition-all duration-300 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-glow'
                      : isCompleted
                      ? 'bg-success text-success-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isActive ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <StepIcon className="h-6 w-6" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h3
                    className={`font-semibold ${
                      isActive
                        ? 'text-primary'
                        : isCompleted
                        ? 'text-success'
                        : 'text-foreground'
                    }`}
                  >
                    {step.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>

                {isActive && (
                  <div className="absolute inset-0 bg-gradient-primary rounded-xl opacity-5 animate-pulse" />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>{currentStepName}</span>
            <span>{currentStep + 1} of {totalSteps}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-gradient-primary h-2 rounded-full transition-all duration-1000 ease-out shadow-sm"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};