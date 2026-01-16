import { useState, useEffect } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MapPin,
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Phone,
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
};

const FilterSidebar = ({ filters, onFiltersChange }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [stats, setStats] = useState({
    totalLakes: 0,
    highRiskLakes: 0,
    lastUpdated: new Date(),
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch lake statistics from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('https://glacier-backend-1.onrender.com/lakereport', {
          credentials: 'include'
        });
        const data = await res.json();
        
        if (data.success && data.data) {
          const lakes = data.data;
          const totalLakes = lakes.length;
          const highRiskLakes = lakes.filter(lake => lake.riskLevel === 'HIGH').length;
          
          setStats({
            totalLakes,
            highRiskLakes,
            lastUpdated: new Date(),
          });
        }
      } catch (err) {
        console.error('Error fetching lake stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  const riskOptions = [
    {
      id: 'HIGH',
      label: 'High',
      color: 'bg-destructive',
      textColor: 'text-destructive',
      icon: AlertTriangle,
      description: 'Immediate attention required',
      glow: 'shadow-[0_0_12px_hsl(4,90%,58%,0.5)]',
    },
    {
      id: 'MEDIUM',
      label: 'Medium',
      color: 'bg-warning',
      textColor: 'text-warning',
      icon: AlertCircle,
      description: 'Monitor closely',
      glow: 'shadow-[0_0_8px_hsl(32,95%,50%,0.4)]',
    },
    {
      id: 'LOW',
      label: 'Low',
      color: 'bg-safe',
      textColor: 'text-safe',
      icon: CheckCircle,
      description: 'Stable conditions',
      glow: 'shadow-[0_0_8px_hsl(195,100%,50%,0.3)]',
    },
  ];

  const handleRiskToggle = (riskId) => {
    const newRiskLevels = filters.riskLevels.includes(riskId)
      ? filters.riskLevels.filter((r) => r !== riskId)
      : [...filters.riskLevels, riskId];

    onFiltersChange({ ...filters, riskLevels: newRiskLevels });
  };

  const handleSearchChange = (value) => {
    onFiltersChange({ ...filters, searchQuery: value });
  };

  return (
    <div
      className={`fixed top-14 left-0 bottom-0 z-30 transition-all duration-300 ease-out ${
        collapsed ? 'w-14' : 'w-72'
      }`}
    >
      {/* ⬇️ ONLY CHANGE IS HERE */}
      <div className="h-full bg-black border-r border-border/40 flex flex-col relative">
        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-background border border-border/50 hover:bg-secondary shadow-lg"
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </Button>

        {/* COLLAPSED MODE */}
        {collapsed && (
          <div className="flex flex-col items-center py-6 gap-4">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <div className="w-8 h-px bg-border/50" />

            {riskOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleRiskToggle(option.id)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  filters.riskLevels.includes(option.id)
                    ? 'bg-secondary/80'
                    : 'bg-transparent hover:bg-secondary/40'
                }`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full ${option.color} ${
                    filters.riskLevels.includes(option.id)
                      ? 'opacity-100'
                      : 'opacity-40'
                  }`}
                />
              </button>
            ))}
            <div className="w-8 h-px bg-border/50" />
            
            {/* Contact Us in collapsed mode */}
            <div className="flex flex-col items-center gap-1" title="To Report Contact At: +17653398142">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20">
                <Phone className="w-4 h-4 text-primary" />
              </div>
              <span className="text-[10px] text-muted-foreground">+17653398142</span>
            </div>
          </div>
        )}

        {/* EXPANDED MODE */}
        {!collapsed && (
          <div className="flex flex-col h-full">
            <div className="p-5 space-y-6 overflow-y-auto scrollbar-thin">
             

              {/* Risk Level Filter */}
              <div className="space-y-3">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Risk Level
                </label>

                <div className="flex gap-2">
                  {riskOptions.map((option) => {
                    const isActive = filters.riskLevels.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleRiskToggle(option.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border transition-all ${
                          isActive
                            ? 'bg-secondary/60 border-border/60'
                            : 'bg-transparent border-border/30 opacity-50 hover:opacity-80'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${option.color}`} />
                        <span
                          className={`text-xs font-medium ${
                            isActive
                              ? option.textColor
                              : 'text-muted-foreground'
                          }`}
                        >
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-3">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Overview
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-secondary/30 rounded-lg p-3 border border-border/30">
                    <div className="text-lg font-bold text-foreground">
                      {loadingStats ? '-' : stats.totalLakes}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Total Lakes
                    </div>
                  </div>

                  <div className="bg-destructive/10 rounded-lg p-3 border border-destructive/20">
                    <div className="text-lg font-bold text-destructive">
                      {loadingStats ? '-' : stats.highRiskLakes}
                    </div>
                    <div className="text-[10px] text-destructive/70">
                      High Risk
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity */}
              <div className="pt-4 border-t border-border/30">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="text-[11px]">
                    {loadingStats ? 'Loading...' : `Last updated ${getTimeAgo(stats.lastUpdated)}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="border-t border-border/30 p-4 space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Risk Classification
              </h3>

              {riskOptions.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${item.color} ${item.glow}`}
                    />
                    <div className="flex-1">
                      <div className={`text-xs font-medium ${item.textColor}`}>
                        {item.label}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {item.description}
                      </div>
                    </div>
                    <Icon
                      className={`w-4 h-4 ${item.textColor} opacity-50`}
                    />
                  </div>
                );
              })}
            </div>

            {/* Contact Us Section */}
            <div className="border-t border-border/30 p-4 bg-secondary/20">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    To Report Contact At
                  </div>
                  <div className="text-sm font-medium text-foreground truncate">
                    +17653398142
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterSidebar;
