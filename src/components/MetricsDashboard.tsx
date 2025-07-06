import React from 'react';
import { TrendingUp, DollarSign, Users, ShoppingCart, Building2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MetricsData {
  totalOpportunity: string;
  amazonSpend: string;
  redundantPrimeFees: string;
  vendorCount: string;
  userCount: string;
  storeTrips: string;
  storeTripsCost: string;
}

interface MetricsDashboardProps {
  metrics: MetricsData;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ metrics }) => {
  const metricCards = [
    {
      title: 'Total Addressable Opportunity',
      value: metrics.totalOpportunity,
      icon: DollarSign,
      description: 'Total spend that can be consolidated',
      variant: 'primary' as const,
      gradient: 'from-primary to-primary-glow'
    },
    {
      title: 'Amazon Spend Consolidation',
      value: metrics.amazonSpend,
      icon: ShoppingCart,
      description: 'Current Amazon.com spending',
      variant: 'success' as const,
      gradient: 'from-success to-emerald-400'
    },
    {
      title: 'Redundant Prime Fees',
      value: metrics.redundantPrimeFees,
      icon: AlertTriangle,
      description: 'Wasted on duplicate memberships',
      variant: 'warning' as const,
      gradient: 'from-warning to-orange-400'
    },
    {
      title: 'Vendors to Consolidate',
      value: metrics.vendorCount,
      icon: Building2,
      description: 'Number of suppliers',
      variant: 'secondary' as const,
      gradient: 'from-slate-600 to-slate-500'
    },
    {
      title: 'Active Users',
      value: metrics.userCount,
      icon: Users,
      description: 'Users making purchases',
      variant: 'secondary' as const,
      gradient: 'from-blue-600 to-blue-500'
    },
    {
      title: 'Store Trips Cost',
      value: metrics.storeTripsCost,
      icon: TrendingUp,
      description: `${metrics.storeTrips} trips to physical stores`,
      variant: 'destructive' as const,
      gradient: 'from-destructive to-red-400'
    }
  ];

  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'primary':
        return 'border-primary/20 bg-gradient-to-br from-primary/5 to-primary-glow/5 hover:shadow-glow/20';
      case 'success':
        return 'border-success/20 bg-gradient-to-br from-success/5 to-emerald-400/5 hover:shadow-success/20';
      case 'warning':
        return 'border-warning/20 bg-gradient-to-br from-warning/5 to-orange-400/5 hover:shadow-warning/20';
      case 'destructive':
        return 'border-destructive/20 bg-gradient-to-br from-destructive/5 to-red-400/5 hover:shadow-destructive/20';
      default:
        return 'border-border bg-gradient-card hover:shadow-md';
    }
  };

  const getIconStyles = (variant: string, gradient: string) => {
    return `bg-gradient-to-r ${gradient} text-white shadow-lg`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Analysis Results</h2>
        <p className="text-muted-foreground text-lg">
          Key insights from your supplier spend analysis
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {metricCards.map((card, index) => {
          const IconComponent = card.icon;
          
          return (
            <Card
              key={card.title}
              className={`group transition-all duration-300 hover:scale-[1.02] cursor-pointer ${getVariantStyles(card.variant)} animate-in fade-in-0 slide-in-from-bottom-4`}
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${getIconStyles(card.variant, card.gradient)}`}>
                  <IconComponent className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {card.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};