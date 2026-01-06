import { useEffect, useState } from 'react';
import {
  X,
  Check,
  User,
  MapPin,
  Mountain,
  Ruler,
  Calendar,
  Thermometer,
  Clock,
  Loader2,
  Shield,
  ShieldCheck,
  Mail,
  Briefcase,
  Building,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import RiskTag from './RiskTag';
import { LakeData } from './MapView';

/* ------------------------------------------------------------------ */
/* COMPONENT */
/* ------------------------------------------------------------------ */

interface LakeDetailPanelProps {
  lake: LakeData | null;
  onClose: () => void;
  isLoading?: boolean;
}

const LakeDetailPanel = ({ lake, onClose, isLoading }: LakeDetailPanelProps) => {
  const [resolvedLocation, setResolvedLocation] = useState<string | null>(null);

  /* -------------------- GEOAPIFY (ALWAYS CALLED) -------------------- */

  useEffect(() => {
    if (!lake) return;

    fetch(
      `https://api.geoapify.com/v1/geocode/reverse?lat=${lake.latitude}&lon=${lake.longitude}&format=json&apiKey=${import.meta.env.VITE_GEOAPIFY_API_KEY}`
    )
      .then(res => res.json())
      .then(data => {
        if (data.results?.length) {
          const result = data.results[0];
          setResolvedLocation(result.formatted || null);
        }
      })
      .catch(() => setResolvedLocation(null));
  }, [lake]);

  /* -------------------- LOADING STATE -------------------- */
  if (isLoading) {
    console.log('LakeDetailPanel: Showing loading state');
    return (
      <div className="fixed top-16 right-0 bottom-0 w-full sm:w-[420px] z-50 slide-in-right">
        <div className="h-full glass-panel border-l border-glass rounded-none flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading lake details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!lake) {
    console.log('LakeDetailPanel: No lake data, returning null');
    return null;
  }

  console.log('LakeDetailPanel: Rendering with lake:', lake.lakeName);

  const getVerificationBadgeColor = (status: string) => {
    switch (status) {
      case 'VERIFIED': return 'text-green-400 bg-green-400/10';
      case 'REJECTED': return 'text-red-400 bg-red-400/10';
      default: return 'text-yellow-400 bg-yellow-400/10';
    }
  };

  return (
    <div className="fixed top-16 right-0 bottom-0 w-full sm:w-[420px] z-50 slide-in-right">
      <div className="h-full glass-panel border-l border-glass rounded-none flex flex-col">

        {/* HEADER */}
        <div className="p-4 border-b border-border flex items-start justify-between">
          <div className="flex-1 pr-2">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-lg font-bold text-foreground line-clamp-2">
                {lake.lakeName}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <RiskTag 
                level={lake.riskLevel.toLowerCase() as 'high' | 'medium' | 'low'} 
                score={lake.confidence / 100} 
              />
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getVerificationBadgeColor(lake.verificationStatus)}`}>
                {lake.verificationStatus}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* CONTENT */}
        <ScrollArea className="flex-1 scrollbar-thin">
          <div className="p-4 space-y-6">

            {/* OVERVIEW */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <div className="w-1 h-3 bg-primary rounded-full" />
                Lake Overview
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {/* Coordinates */}
                <div className="glass-panel p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-xs">Coordinates</span>
                  </div>
                  <p className="text-sm font-mono">
                    {lake.latitude.toFixed(4)}°N
                  </p>
                  <p className="text-sm font-mono">
                    {lake.longitude.toFixed(4)}°E
                  </p>
                  {resolvedLocation && (
                    <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                      {resolvedLocation}
                    </p>
                  )}
                </div>

                {/* Elevation */}
                <div className="glass-panel p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Mountain className="w-3.5 h-3.5" />
                    <span className="text-xs">Elevation</span>
                  </div>
                  <p className="text-sm font-medium">
                    {lake.Elevation_m.toLocaleString()} m
                  </p>
                </div>

                {/* Area */}
                <div className="glass-panel p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Ruler className="w-3.5 h-3.5" />
                    <span className="text-xs">Surface Area</span>
                  </div>
                  <p className="text-sm font-medium">
                    {lake.Lake_Area_km2} km²
                  </p>
                </div>

                {/* Temperature */}
                <div className="glass-panel p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Thermometer className="w-3.5 h-3.5" />
                    <span className="text-xs">Temperature</span>
                  </div>
                  <p className="text-sm font-medium">
                    {lake.Lake_Temp_C}°C
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* DAM & SLOPE */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <div className="w-1 h-3 bg-primary rounded-full" />
                Dam Characteristics
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="glass-panel p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Mountain className="w-3.5 h-3.5" />
                    <span className="text-xs">Dam Slope</span>
                  </div>
                  <p className="text-sm font-medium">
                    {lake.Dam_Slope_deg}°
                  </p>
                </div>
                <div className="glass-panel p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-xs">Region</span>
                  </div>
                  <p className="text-sm font-medium">
                    {lake.region}
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* METADATA */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <div className="w-1 h-3 bg-primary rounded-full" />
                Metadata
              </h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Observation Date</span>
                  </div>
                  <span className="font-medium">
                    {new Date(lake.observationDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Uploaded</span>
                  </div>
                  <span className="font-medium">
                    {new Date(lake.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {lake.verifiedAt && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verified At</span>
                    </div>
                    <span className="font-medium">
                      {new Date(lake.verifiedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </section>

            {/* UPLOADED BY */}
            {lake.uploadedBy && (
              <>
                <Separator />
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <div className="w-1 h-3 bg-primary rounded-full" />
                    Uploaded By
                  </h3>
                  <div className="glass-panel p-3 rounded-lg space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={lake.uploadedBy.photo} />
                        <AvatarFallback>
                          <User className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {lake.uploadedBy.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {lake.uploadedBy.position}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building className="w-3.5 h-3.5" />
                        <span>{lake.uploadedBy.department}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="truncate">{lake.uploadedBy.email}</span>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* VERIFIED BY */}
            {lake.verifiedBy && (
              <>
                <Separator />
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <div className="w-1 h-3 bg-green-500 rounded-full" />
                    Verified By
                  </h3>
                  <div className="glass-panel p-3 rounded-lg space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={lake.verifiedBy.photo} />
                        <AvatarFallback>
                          <Shield className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {lake.verifiedBy.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {lake.verifiedBy.position}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building className="w-3.5 h-3.5" />
                        <span>{lake.verifiedBy.department}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="truncate">{lake.verifiedBy.email}</span>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}

          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default LakeDetailPanel;
