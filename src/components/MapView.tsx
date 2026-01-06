import { useEffect, useRef } from 'react';
import maplibregl, { GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export interface LakeData {
  id: number;
  lakeName: string;
  latitude: number;
  longitude: number;
  region: string;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  Lake_Area_km2: number;
  Dam_Slope_deg: number;
  Lake_Temp_C: number;
  Elevation_m: number;
  observationDate: string;
  confidence: number;
  assessedAt: string;
  verificationStatus: string;
  verifiedById: number | null;
  verifiedAt: string | null;
  declineById: number | null;
  declinedAt: string | null;
  createdAt: string;
  uploadedBy: {
    id: number;
    name: string;
    email: string;
    position: string;
    department: string;
    photo: string | null;
  };
  verifiedBy?: {
    id: number;
    name: string;
    email: string;
    position: string;
    department: string;
    photo: string | null;
  };
}

interface MapViewProps {
  filters: {
    riskLevels: string[];
    yearRange: [number, number];
    searchQuery: string;
  };
  onLakeSelect: (lake: LakeData) => void;
  selectedLake: LakeData | null;
  lakes: LakeData[];
  isLoading?: boolean;
}

const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

const MAP_STYLE = `https://maps.geoapify.com/v1/styles/osm-bright-smooth/style.json?apiKey=${GEOAPIFY_API_KEY}`;

const MapView = ({ filters, onLakeSelect, selectedLake, lakes }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  /* -------------------------------------------------- */
  /* FILTER LAKES */
  /* -------------------------------------------------- */
  const filteredLakes = lakes.filter(lake => {
    // Case-insensitive risk level comparison
    const lakeRiskLower = lake.riskLevel.toLowerCase();
    const isRiskMatch = filters.riskLevels.some(
      level => level.toLowerCase() === lakeRiskLower
    );
    if (!isRiskMatch) return false;

    if (
      filters.searchQuery &&
      !lake.lakeName.toLowerCase().includes(filters.searchQuery.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  /* -------------------------------------------------- */
  /* INIT MAP */
  /* -------------------------------------------------- */
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    if (!GEOAPIFY_API_KEY) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: [86.6, 27.9],
      zoom: 8,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on('load', () => {
      /* ---------------- SOURCE ---------------- */
      map.addSource('glacier-lakes', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      /* ---------------- BASE DOTS ---------------- */
      map.addLayer({
        id: 'glacier-lake-dots',
        type: 'circle',
        source: 'glacier-lakes',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            6, 4,
            9, 6,
            12, 9,
          ],
          'circle-color': [
            'match',
            ['get', 'riskLevel'],
            'HIGH', '#ff3b30',
            'MEDIUM', '#ff9500',
            'LOW', '#00c2ff',
            '#999999',
          ],
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#0b1220',
          'circle-opacity': 0.95,
        },
      });

      /* ---------------- PULSE LAYER (HIGH RISK ONLY) ---------------- */
      map.addLayer({
        id: 'glacier-lake-pulse',
        type: 'circle',
        source: 'glacier-lakes',
        filter: ['==', ['get', 'riskLevel'], 'HIGH'],
        paint: {
          'circle-radius': 10,
          'circle-color': '#ff3b30',
          'circle-opacity': 0.0,
        },
      });

      /* ---------------- INTERACTION ---------------- */
      map.on('mouseenter', 'glacier-lake-dots', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'glacier-lake-dots', () => {
        map.getCanvas().style.cursor = '';
      });

      map.on('click', 'glacier-lake-dots', e => {
        console.log('Map click event fired');
        const feature = e.features?.[0];
        if (!feature) {
          console.log('No feature found at click location');
          return;
        }

        const lakeId = feature.properties?.id;
        console.log('Feature properties:', feature.properties);
        console.log('Clicked lake ID:', lakeId);

        // Use loose equality to handle string/number type mismatches
        const lake = lakes.find(l => l.id == lakeId);
        console.log('Found lake:', lake);

        if (lake) {
          console.log('Lake found in array, calling onLakeSelect with full lake data');
          onLakeSelect(lake);

          map.flyTo({
            center: [lake.longitude, lake.latitude],
            zoom: 11,
            duration: 1000,
          });
        } else {
          // Lake not in array, create a minimal lake object with just the ID
          // This will trigger the API fetch in the parent component
          console.log('Lake not found in lakes array, creating minimal lake object for API fetch');
          const minimalLake: LakeData = {
            id: Number(lakeId),
            lakeName: '',
            latitude: 0,
            longitude: 0,
            region: '',
            riskLevel: feature.properties?.riskLevel || 'UNKNOWN',
            Lake_Area_km2: 0,
            Dam_Slope_deg: 0,
            Lake_Temp_C: 0,
            Elevation_m: 0,
            observationDate: '',
            confidence: feature.properties?.confidence || 0,
            assessedAt: '',
            verificationStatus: '',
            verifiedById: null,
            verifiedAt: null,
            declineById: null,
            declinedAt: null,
            createdAt: '',
            uploadedBy: {
              id: 0,
              name: '',
              email: '',
              position: '',
              department: '',
              photo: null,
            },
          };
          console.log('Calling onLakeSelect with minimal lake data (will trigger API fetch):', minimalLake);
          onLakeSelect(minimalLake);
        }
      });

      /* ---------------- PULSE ANIMATION ---------------- */
      let radius = 10;
      let opacity = 0.6;
      let expanding = true;

      const animatePulse = () => {
        if (!map.getLayer('glacier-lake-pulse')) return;

        if (expanding) {
          radius += 0.35;
          opacity -= 0.012;
          if (radius > 26) expanding = false;
        } else {
          radius -= 0.35;
          opacity += 0.012;
          if (radius < 10) expanding = true;
        }

        map.setPaintProperty(
          'glacier-lake-pulse',
          'circle-radius',
          [
            'interpolate',
            ['linear'],
            ['zoom'],
            6, radius + 6,
            10, radius,
          ]
        );

        map.setPaintProperty(
          'glacier-lake-pulse',
          'circle-opacity',
          Math.max(opacity, 0)
        );

        requestAnimationFrame(animatePulse);
      };

      animatePulse();
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  /* -------------------------------------------------- */
  /* UPDATE DATA */
  /* -------------------------------------------------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const source = map.getSource('glacier-lakes') as GeoJSONSource;
    if (!source) return;

    console.log('MapView - Received lakes:', lakes.length);
    console.log('MapView - Filtered lakes:', filteredLakes.length);

    const geojsonData = {
      type: 'FeatureCollection',
      features: filteredLakes.map(lake => ({
        type: 'Feature',
        properties: {
          id: lake.id,
          riskLevel: lake.riskLevel,
          name: lake.lakeName,
          confidence: lake.confidence,
        },
        geometry: {
          type: 'Point',
          coordinates: [lake.longitude, lake.latitude],
        },
      })),
    };

    console.log('MapView - GeoJSON features:', geojsonData.features.length);
    source.setData(geojsonData);
  }, [filteredLakes, lakes]);

  /* -------------------------------------------------- */
  /* RENDER */
  /* -------------------------------------------------- */
  return (
    <div className="fixed inset-0 w-screen h-screen">
      <div ref={mapContainer} className="absolute inset-0" />

      {!GEOAPIFY_API_KEY && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-md text-sm z-50">
          Geoapify API key not configured
        </div>
      )}

      {/* Loading Overlay */}
      {lakes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-40 pointer-events-none">
          <div className="bg-background/90 backdrop-blur-sm px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Loading lake data...</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {lakes.length > 0 && filteredLakes.length === 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-600/90 text-white px-4 py-2 rounded-md text-sm z-50">
          No lakes match current filters
        </div>
      )}
    </div>
  );
};

export default MapView;
