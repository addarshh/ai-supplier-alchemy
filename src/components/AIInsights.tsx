import React from 'react';
import { Brain, Lightbulb, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AIInsightsProps {
  insights: string;
  topVendors: string;
  topSpenders: string;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ insights, topVendors, topSpenders }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-primary rounded-full blur-lg opacity-30" />
            <div className="relative bg-gradient-primary rounded-full p-3 shadow-glow">
              <Brain className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-2">AI-Generated Executive Summary</h2>
        <p className="text-muted-foreground text-lg">
          Strategic insights powered by advanced AI analysis
        </p>
      </div>

      <Card className="bg-gradient-card border-primary/20 shadow-lg hover:shadow-glow/20 transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Lightbulb className="h-5 w-5" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-slate max-w-none">
            <div className="text-foreground leading-relaxed whitespace-pre-line">
              {insights}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-gradient-card border-success/20 shadow-md hover:shadow-success/20 transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-success">
              <TrendingUp className="h-5 w-5" />
              Top Vendors to Consolidate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topVendors.split(';').map((vendor, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-success/5 rounded-lg">
                  <span className="text-sm font-medium text-foreground">
                    {vendor.split('(')[0].trim()}
                  </span>
                  <span className="text-sm font-bold text-success">
                    {vendor.includes('(') ? vendor.split('(')[1].replace(')', '') : ''}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-primary/20 shadow-md hover:shadow-primary/20 transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Users className="h-5 w-5" />
              Top Spenders to Onboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topSpenders.split(';').map((spender, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-primary/5 rounded-lg">
                  <span className="text-sm font-medium text-foreground">
                    {spender.split('(')[0].trim()}
                  </span>
                  <span className="text-sm font-bold text-primary">
                    {spender.includes('(') ? spender.split('(')[1].replace(')', '') : ''}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};