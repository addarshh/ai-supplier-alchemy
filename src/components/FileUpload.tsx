import React, { useCallback, useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFilesChange: (files: { rawData: File | null; mccTemplate: File | null }) => void;
  files: { rawData: File | null; mccTemplate: File | null };
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesChange, files }) => {
  const [dragActive, setDragActive] = useState({ rawData: false, mccTemplate: false });

  const handleDrag = useCallback((e: React.DragEvent, type: 'rawData' | 'mccTemplate') => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(prev => ({ ...prev, [type]: true }));
    } else if (e.type === "dragleave") {
      setDragActive(prev => ({ ...prev, [type]: false }));
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, type: 'rawData' | 'mccTemplate') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: false }));

    const droppedFiles = Array.from(e.dataTransfer.files);
    const file = droppedFiles[0];
    
    if (file) {
      const expectedExtension = type === 'rawData' ? '.xlsx' : '.xlsb';
      if (file.name.toLowerCase().endsWith(expectedExtension)) {
        onFilesChange({
          ...files,
          [type]: file
        });
      }
    }
  }, [files, onFilesChange]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: 'rawData' | 'mccTemplate') => {
    const file = e.target.files?.[0];
    if (file) {
      onFilesChange({
        ...files,
        [type]: file
      });
    }
  }, [files, onFilesChange]);

  const FileUploadZone = ({ 
    type, 
    title, 
    description, 
    acceptedFormats, 
    file 
  }: {
    type: 'rawData' | 'mccTemplate';
    title: string;
    description: string;
    acceptedFormats: string;
    file: File | null;
  }) => (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 bg-gradient-card",
        dragActive[type] 
          ? "border-primary bg-primary/5 shadow-glow" 
          : file 
            ? "border-success bg-success/5" 
            : "border-muted hover:border-primary/50 hover:bg-primary/5",
        "group cursor-pointer"
      )}
      onDragEnter={(e) => handleDrag(e, type)}
      onDragLeave={(e) => handleDrag(e, type)}
      onDragOver={(e) => handleDrag(e, type)}
      onDrop={(e) => handleDrop(e, type)}
      onClick={() => document.getElementById(`file-${type}`)?.click()}
    >
      <input
        id={`file-${type}`}
        type="file"
        accept={acceptedFormats}
        onChange={(e) => handleFileInput(e, type)}
        className="hidden"
      />
      
      <div className="flex flex-col items-center justify-center space-y-4">
        {file ? (
          <CheckCircle2 className="h-12 w-12 text-success" />
        ) : (
          <Upload className={cn(
            "h-12 w-12 transition-colors duration-300",
            dragActive[type] ? "text-primary" : "text-muted-foreground group-hover:text-primary"
          )} />
        )}
        
        <div className="text-center">
          <h3 className="font-semibold text-lg text-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground mb-2">{description}</p>
          
          {file ? (
            <div className="flex items-center justify-center space-x-2 text-success">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">{file.name}</span>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm text-primary font-medium">
                Click to browse or drag & drop
              </p>
              <p className="text-xs text-muted-foreground">
                Accepted formats: {acceptedFormats}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Upload Your Files</h2>
        <p className="text-muted-foreground">
          Upload your transaction data and MCC reference template to begin the analysis
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <FileUploadZone
          type="rawData"
          title="Transaction Data"
          description="Upload your raw transaction data file"
          acceptedFormats=".xlsx"
          file={files.rawData}
        />
        
        <FileUploadZone
          type="mccTemplate"
          title="MCC Reference Template"
          description="Upload your MCC reference template file"
          acceptedFormats=".xlsb"
          file={files.mccTemplate}
        />
      </div>

      {(!files.rawData || !files.mccTemplate) && (
        <div className="bg-accent/50 border border-accent rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-foreground">Files Required</p>
            <p className="text-muted-foreground">
              Please upload both files to proceed with the analysis. The transaction data should be in .xlsx format, 
              and the MCC reference template should be in .xlsb format.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};