import React, { useState } from 'react';
import { Download, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload } from './FileUpload';
import { ProcessingState } from './ProcessingState';
import { MetricsDashboard } from './MetricsDashboard';
import { AIInsights } from './AIInsights';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

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
  reportPath?: string;
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

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', files.rawData!);
      formData.append('mcc_template', files.mccTemplate!);

      // Update processing steps
      const steps = [
        'Loading Files',
        'Enriching Data', 
        'Running Analysis',
        'AI Processing',
        'Generating Report'
      ];

      // Simulate progress updates
      for (let i = 0; i < steps.length; i++) {
        setProcessingStep(i);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Send files to backend for analysis
      const response = await axios.post('http://localhost:5000/api/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minutes timeout
      });

      if (response.data.success) {
        const backendResults: AnalysisResults = {
          metrics: response.data.metrics,
          aiInsights: response.data.aiInsights,
          topVendors: response.data.topVendors,
          topSpenders: response.data.topSpenders,
          reportPath: response.data.reportPath
        };

        setResults(backendResults);
        setState('results');

        toast({
          title: "Analysis Complete",
          description: "Your supplier analysis has been successfully generated.",
          variant: "default"
        });
      } else {
        throw new Error(response.data.error || 'Analysis failed');
      }
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error.response?.data?.error || error.message || "An error occurred during analysis.",
        variant: "destructive"
      });
      setState('upload');
    }
  };

  const handleDownloadReport = async () => {
    try {
      toast({
        title: "Download Started",
        description: "Your comprehensive analysis report is being downloaded.",
        variant: "default"
      });
      
      // Get the filename from the backend response
      const filename = results?.reportPath?.split('/').pop() || `Supplier_Analysis_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Download the file from backend
      const response = await axios.get(`http://localhost:5000/api/download/${filename}`, {
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download the report. Please try again.",
        variant: "destructive"
      });
    }
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
                <p className="text-sm text-muted-foreground">Amazon Supplier Analysis Intelligence Tool</p>
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
                Upload your transaction data and MCC reference template and let AI generate comprehensive insights, 
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