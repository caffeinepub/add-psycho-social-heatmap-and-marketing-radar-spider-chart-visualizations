import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, AlertCircle } from 'lucide-react';
import { useGeoDistribution } from '../hooks/useQueries';
import { useMemo } from 'react';
import { getVisualizationState, safe2DArrayAccess, validateMatrixDimensions, getEmotionDisplayLabel } from '../lib/visualizationState';

// Whitelist of valid Indonesian regions
const VALID_INDONESIAN_REGIONS = [
  'Jakarta',
  'Jawa Barat',
  'Jawa Tengah',
  'Jawa Timur',
  'Bali',
  'Sumatera Utara',
  'Sumatera Selatan',
  'Sumatera Barat',
  'Kalimantan Timur',
  'Kalimantan Selatan',
  'Kalimantan Barat',
  'Sulawesi Selatan',
  'Sulawesi Utara',
  'Papua',
  'Maluku',
  'Nusa Tenggara',
  'North Java',
  'South Kalimantan',
];

export function GeoEmotionMap() {
  const { data: geoData, isLoading } = useGeoDistribution();

  // Filter and validate geographic data
  const { validLocations, validEmotions, validData } = useMemo(() => {
    if (!geoData || !geoData.locations || !geoData.emotions || !geoData.data) {
      return { validLocations: [], validEmotions: [], validData: [] };
    }

    // Filter locations to only include valid Indonesian regions
    const locationIndices: number[] = [];
    const filteredLocations: string[] = [];
    
    geoData.locations.forEach((location, index) => {
      const isValid = VALID_INDONESIAN_REGIONS.some(
        validRegion => location.toLowerCase().includes(validRegion.toLowerCase()) ||
                      validRegion.toLowerCase().includes(location.toLowerCase())
      );
      
      // Explicitly exclude non-Indonesian regions
      const isExcluded = ['india', 'bhutan', 'singapore', 'malaysia', 'korea'].some(
        excluded => location.toLowerCase().includes(excluded)
      );
      
      if (isValid && !isExcluded) {
        locationIndices.push(index);
        filteredLocations.push(location);
      }
    });

    // Filter data matrix to only include valid locations
    const filteredData = geoData.data
      .filter((_, index) => locationIndices.includes(index))
      .map(row => row || []);

    return {
      validLocations: filteredLocations,
      validEmotions: geoData.emotions || [],
      validData: filteredData,
    };
  }, [geoData]);

  // Validate matrix dimensions
  const isValidMatrix = useMemo(() => {
    return validateMatrixDimensions(
      validData,
      validLocations.length,
      validEmotions.length
    );
  }, [validData, validLocations, validEmotions]);

  // Determine visualization state
  const vizState = getVisualizationState(
    !!geoData,
    validLocations.length > 0 && validEmotions.length > 0 && isValidMatrix,
    'Tidak ada data lokasi Indonesia yang valid'
  );

  // Get color intensity based on value
  const getColorIntensity = (value: number, maxValue: number) => {
    if (maxValue === 0) return 'bg-muted';
    const intensity = Math.min(Math.max(value / maxValue, 0), 1);
    if (intensity > 0.75) return 'bg-chart-1';
    if (intensity > 0.5) return 'bg-chart-2';
    if (intensity > 0.25) return 'bg-chart-3';
    return 'bg-chart-4/30';
  };

  // Calculate max value for color scaling
  const maxValue = useMemo(() => {
    if (!isValidMatrix || validData.length === 0) return 1;
    return Math.max(...validData.flat().map(v => Math.abs(Number(v) || 0)));
  }, [validData, isValidMatrix]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Distribusi Geografis Emosi
          </CardTitle>
          <CardDescription>Peta emosi berdasarkan lokasi di Indonesia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[400px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (vizState.status !== 'ready') {
    const message = vizState.status === 'no-dataset'
      ? 'Upload dataset untuk melihat distribusi geografis'
      : (vizState.status === 'insufficient-data' && vizState.message)
        ? vizState.message
        : 'Data lokasi tidak tersedia';

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Distribusi Geografis Emosi
          </CardTitle>
          <CardDescription>Peta emosi berdasarkan lokasi di Indonesia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[400px] flex-col items-center justify-center gap-4 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground/50" />
            <div>
              <p className="text-lg font-semibold text-muted-foreground">
                {vizState.status === 'no-dataset' ? 'Tidak ada data aktif' : 'Data tidak mencukupi'}
              </p>
              <p className="text-sm text-muted-foreground/70">
                {message}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Distribusi Geografis Emosi
        </CardTitle>
        <CardDescription>Peta emosi berdasarkan lokasi di Indonesia</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Heatmap Grid */}
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="grid gap-1" style={{ gridTemplateColumns: `120px repeat(${validEmotions.length}, 1fr)` }}>
                {/* Header row */}
                <div className="font-semibold text-xs" />
                {validEmotions.map((emotion) => (
                  <div key={emotion} className="text-center text-xs font-semibold p-2">
                    {getEmotionDisplayLabel(emotion)}
                  </div>
                ))}
                
                {/* Data rows */}
                {validLocations.map((location, rowIndex) => (
                  <div key={location} className="contents">
                    <div className="text-xs font-medium p-2 truncate" title={location}>
                      {location}
                    </div>
                    {validEmotions.map((_, colIndex) => {
                      const value = safe2DArrayAccess(validData, rowIndex, colIndex, 0);
                      return (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className={`flex items-center justify-center rounded p-2 text-xs font-medium ${getColorIntensity(value, maxValue)}`}
                          title={`${location} - ${getEmotionDisplayLabel(validEmotions[colIndex])}: ${value.toFixed(1)}`}
                        >
                          {value.toFixed(1)}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-xs">
            <span className="text-muted-foreground">Intensitas:</span>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-chart-4/30" />
              <span>Rendah</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-chart-3" />
              <span>Sedang</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-chart-1" />
              <span>Tinggi</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
