import { useState, useRef, ChangeEvent } from 'react';
import { Upload, MapPin, Check, Loader2, Thermometer, Mountain, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/* -------------------- TYPES -------------------- */

interface GeoapifyResult {
  place_id: string;
  lat: number;
  lon: number;
  formatted: string;
  address_line1?: string;
  address_line2?: string;
  result_type?: string;
  rank?: {
    confidence?: number;
  };
}

/* -------------------- COMPONENT -------------------- */

const UploadDataPage = () => {
  const [locationQuery, setLocationQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeoapifyResult[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<GeoapifyResult | null>(null);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // New fields for lake data
  const [lakeAreaKm2, setLakeAreaKm2] = useState<number>(0.0);
  const [damSlopeDeg, setDamSlopeDeg] = useState<number>(0.0);
  const [lakeTempC, setLakeTempC] = useState<number>(0.0);
  const [elevationM, setElevationM] = useState<number>(0.0);

  const abortControllerRef = useRef<AbortController | null>(null);

  /* -------------------- LOCATION SEARCH -------------------- */

  const handleLocationInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocationQuery(value);
    setSelectedLocation(null);

    if (!value || value.length < 3) {
      setSuggestions([]);
      return;
    }

    setShowSuggestions(true);

    // Abort previous request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsSearching(true);

    const params = new URLSearchParams({
      text: value,
      type: 'locality',
      limit: '5',
      format: 'json',
      bias: 'countrycode:np,in',
      apiKey: import.meta.env.VITE_GEOAPIFY_API_KEY,
    });

    fetch(`https://api.geoapify.com/v1/geocode/search?${params}`, {
      signal: controller.signal,
    })
      .then(res => res.json())
      .then(data => {
        setSuggestions(data.results || []);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error('Geoapify error:', err);
        }
      })
      .finally(() => setIsSearching(false));
  };

  const handleLocationSelect = (place: GeoapifyResult) => {
    setSelectedLocation(place);
    setLocationQuery(place.formatted);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  /* -------------------- SUBMIT -------------------- */

  const handleSubmit = async () => {
    if (!selectedLocation) return;

    const payload = {
      lakeName: selectedLocation.formatted,
      latitude: selectedLocation.lat,
      longitude: selectedLocation.lon,
      region: selectedLocation.address_line2 || 'Unknown',
      Lake_Area_km2: lakeAreaKm2,
      Dam_Slope_deg: damSlopeDeg,
      Lake_Temp_C: lakeTempC,
      Elevation_m: elevationM
    };

    setIsSubmitting(true);
    try {
      const res = await fetch('https://glacier-backend-1.onrender.com/lakereport/uploaddata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        credentials: 'include' // Include cookies
      });
      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(true);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error uploading data');
    }
    setIsSubmitting(false);
  };

  const isFormValid = Boolean(selectedLocation);

  /* -------------------- UI -------------------- */

  return (
    <div className="flex items-center justify-center min-h-full p-6">
      <div className="glass-panel p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Upload Data</h2>

        {/* LOCATION */}
        <div className="mb-8 relative">
          <label className="block text-sm font-medium mb-3">
            <MapPin className="inline w-4 h-4 mr-2" />
            Location
          </label>

          <Input
            value={locationQuery}
            onChange={handleLocationInputChange}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search glacier lake location..."
          />

          {showSuggestions && !selectedLocation && (
            <div className="absolute z-10 w-full mt-2 bg-card border rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {isSearching && (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  Searching...
                </div>
              )}

              {!isSearching &&
                suggestions.map(place => (
                  <button
                    key={place.place_id}
                    onClick={() => handleLocationSelect(place)}
                    className="w-full px-4 py-3 text-left hover:bg-secondary"
                  >
                    <p className="text-sm font-medium">
                      {place.address_line1 ?? place.formatted}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {place.address_line2}
                    </p>
                  </button>
                ))}

              {!isSearching && suggestions.length === 0 && (
                <div className="px-4 py-4 text-sm text-muted-foreground text-center">
                  No locations found
                </div>
              )}
            </div>
          )}
        </div>

        {/* LAKE DATA FIELDS */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-4">
            Lake Data
          </label>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Lake Area km² */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Lake Area (km²)
              </label>
              <Input
                type="number"
                step="0.01"
                value={lakeAreaKm2}
                onChange={(e) => setLakeAreaKm2(parseFloat(e.target.value) || 0.0)}
                className="bg-secondary/50"
              />
            </div>

            {/* Dam Slope (deg) */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Dam Slope (deg)
              </label>
              <Input
                type="number"
                step="0.01"
                value={damSlopeDeg}
                onChange={(e) => setDamSlopeDeg(parseFloat(e.target.value) || 0.0)}
                className="bg-secondary/50"
              />
            </div>

            {/* Lake Temp (°C) */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground flex items-center gap-1">
                <Thermometer className="w-3 h-3" />
                Lake Temp (°C)
              </label>
              <Input
                type="number"
                step="0.01"
                value={lakeTempC}
                onChange={(e) => setLakeTempC(parseFloat(e.target.value) || 0.0)}
                className="bg-secondary/50"
              />
            </div>

            {/* Elevation (m) */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground flex items-center gap-1">
                <Mountain className="w-3 h-3" />
                Elevation (m)
              </label>
              <Input
                type="number"
                step="0.01"
                value={elevationM}
                onChange={(e) => setElevationM(parseFloat(e.target.value) || 0.0)}
                className="bg-secondary/50"
              />
            </div>
          </div>
        </div>

        {/* SUBMIT */}
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          className="w-full h-12"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : submitSuccess ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Uploaded
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Submit Data
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default UploadDataPage;

