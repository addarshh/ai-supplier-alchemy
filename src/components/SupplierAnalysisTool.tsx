import React, { useState } from 'react';
import { Download, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload } from './FileUpload';
import { ProcessingState } from './ProcessingState';
import { MetricsDashboard } from './MetricsDashboard';
import { AIInsights } from './AIInsights';
import { useToast } from '@/hooks/use-toast';

type AppState = 'upload' | 'processing' | 'results';

interface AnalysisResults {
  metrics: {
    totalOpportunity: string;
    amazonSpend: string;
    redundantPrimeFees: string;
    vendorCount: string;
    userCount: string;
    storeTrips: string;
    storeTripsCost: string;
  };
  aiInsights: string;
  topVendors: string;
  topSpenders: string;
}

export const SupplierAnalysisTool: React.FC = () => {
  const [state, setState] = useState<AppState>('upload');
  const [files, setFiles] = useState<{ rawData: File | null; mccTemplate: File | null }>({
    rawData: null,
    mccTemplate: null
  });
  const [processingStep, setProcessingStep] = useState(0);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const { toast } = useToast();

  const canProceed = files.rawData && files.mccTemplate;

  const handleStartAnalysis = async () => {
    if (!canProceed) {
      toast({
        title: "Files Required",
        description: "Please upload both transaction data and MCC template files.",
        variant: "destructive"
      });
      return;
    }

    setState('processing');
    setProcessingStep(0);

    // Simulate processing steps (since we can't run Python backend)
    const steps = [
      'Loading Files',
      'Enriching Data', 
      'Running Analysis',
      'AI Processing',
      'Generating Report'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
      setProcessingStep(i);
    }

    // Simulate analysis results
    const mockResults: AnalysisResults = {
      metrics: {
        totalOpportunity: '$2,847,592.34',
        amazonSpend: '$1,234,567.89',
        redundantPrimeFees: '$45,780.00',
        vendorCount: '247',
        userCount: '156',
        storeTrips: '1,234',
        storeTripsCost: '$567,890.12'
      },
      aiInsights: `Based on the comprehensive analysis of your organization's supplier spend data, here are the key strategic opportunities:

• **Massive Consolidation Opportunity**: With $2.8M in addressable spend across 247 vendors, there's significant potential for cost savings through vendor consolidation. The fragmented supplier base indicates inefficient procurement processes.

• **Amazon Business Migration**: Your organization already spends $1.2M on Amazon.com, demonstrating strong adoption. Migrating this spend to Amazon Business could unlock bulk pricing, better payment terms, and enhanced procurement controls.

• **Prime Membership Optimization**: $45,780 in redundant Prime fees represents immediate cost savings. Implementing centralized Amazon Business accounts would eliminate duplicate memberships while providing enhanced features.

• **Digital Transformation Impact**: 1,234 store trips costing $567K in soft costs (employee time, travel) could be eliminated through strategic e-commerce adoption. This represents both direct savings and productivity gains.

**Recommendation**: Prioritize onboarding your top 156 active users to Amazon Business, consolidate the top 20 vendors (representing 80% of spend), and implement procurement policies to reduce physical store visits. This could result in 15-25% cost savings plus significant operational efficiency gains.`,
      topVendors: 'Home Depot ($456,789.12); Staples ($234,567.89); Best Buy ($189,432.10); Walmart ($167,890.45); Target ($145,678.23)',
      topSpenders: 'John Smith ($89,456.78); Sarah Johnson ($76,543.21); Mike Chen ($65,432.19); Lisa Rodriguez ($54,321.87); David Wilson ($43,210.65)'
    };

    await new Promise(resolve => setTimeout(resolve, 1000));
    setResults(mockResults);
    setState('results');

    toast({
      title: "Analysis Complete",
      description: "Your supplier analysis has been successfully generated.",
      variant: "default"
    });
  };

  const handleDownloadReport = () => {
    // In a real app, this would download the actual Excel file
    toast({
      title: "Download Started",
      description: "Your comprehensive analysis report is being downloaded.",
      variant: "default"
    });
    
    // Create a mock download
    const element = document.createElement('a');
    element.href = 'data:text/plain;charset=utf-8,Mock Analysis Report - In production, this would be an Excel file with all your data and insights.';
    element.download = `AI_Supplier_Analysis_Report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleStartOver = () => {
    setState('upload');
    setFiles({ rawData: null, mccTemplate: null });
    setProcessingStep(0);
    setResults(null);
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Header */}
      <header className="bg-surface/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-primary rounded-lg p-2 shadow-glow">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">AI Supplier Analysis</h1>
                <p className="text-sm text-muted-foreground">Amazon Business Intelligence Tool</p>
              </div>
            </div>
            
            {state === 'results' && (
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  onClick={handleStartOver}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Start New Analysis
                </Button>
                <Button 
                  variant="hero" 
                  onClick={handleDownloadReport}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Report
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {state === 'upload' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Transform Your Supplier Spend Analysis
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Upload your transaction data and let AI generate comprehensive insights, 
                cost-saving opportunities, and executive-ready reports in minutes.
              </p>
            </div>

            <FileUpload files={files} onFilesChange={setFiles} />
            
            <div className="flex justify-center mt-12">
              <Button
                variant="hero"
                size="xl"
                onClick={handleStartAnalysis}
                disabled={!canProceed}
                className="flex items-center gap-3"
              >
                <Sparkles className="h-5 w-5" />
                Generate AI Analysis
              </Button>
            </div>
          </div>
        )}

        {state === 'processing' && (
          <ProcessingState
            currentStep={processingStep}
            totalSteps={5}
            currentStepName={['Loading Files', 'Enriching Data', 'Running Analysis', 'AI Processing', 'Generating Report'][processingStep]}
          />
        )}

        {state === 'results' && results && (
          <div className="space-y-12">
            <MetricsDashboard metrics={results.metrics} />
            
            <div className="border-t border-border/50 pt-12">
              <AIInsights
                insights={results.aiInsights}
                topVendors={results.topVendors}
                topSpenders={results.topSpenders}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};