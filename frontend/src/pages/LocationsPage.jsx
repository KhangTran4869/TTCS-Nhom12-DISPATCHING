import { useState, useEffect } from 'react';
import { Loader2, AlertTriangle, MapPin, Navigation } from 'lucide-react';
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '../components/ui/Table';
import Button from '../components/ui/Button';
import { apiGetDriverLocations } from '../api';

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  const fetchLocations = async () => {
    try {
      setPageError('');
      const result = await apiGetDriverLocations();
      setLocations(result.data || []);
    } catch (err) {
      setPageError(err.message);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => { fetchLocations(); }, []);

  if (pageLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 size={32} className="text-primary-500 animate-spin-slow" /></div>;
  }

  if (pageError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="flex items-center gap-2 text-red-600"><AlertTriangle size={24} /><p className="text-sm font-medium">{pageError}</p></div>
        <Button variant="secondary" onClick={() => { setPageLoading(true); fetchLocations(); }}>Retry</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Driver Locations</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time GPS tracking of active drivers</p>
      </div>

      {/* Map Placeholder */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 mb-6 shadow-sm text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-50 mb-4">
          <MapPin size={32} className="text-primary-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700 mb-2">Map Integration Coming Soon</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Interactive map with real-time driver positions will be integrated with Google Maps or Leaflet.
          Below is the location data from the API.
        </p>
      </div>

      {/* Location Records */}
      {locations.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <Navigation size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No location data yet</p>
          <p className="text-sm text-slate-400 mt-1">Driver locations will appear here when drivers start trips.</p>
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableHeader>Driver</TableHeader>
            <TableHeader>Latitude</TableHeader>
            <TableHeader>Longitude</TableHeader>
            <TableHeader className="hidden md:table-cell">Speed</TableHeader>
            <TableHeader>Recorded At</TableHeader>
          </TableHead>
          <TableBody>
            {locations.map((loc) => (
              <TableRow key={loc._id}>
                <TableCell className="font-medium text-sm text-slate-900">
                  {loc.driver_id?.user_id?.full_name || loc.driver_id?._id || '—'}
                </TableCell>
                <TableCell className="font-mono text-xs">{loc.lat?.toFixed(6) || '—'}</TableCell>
                <TableCell className="font-mono text-xs">{loc.lng?.toFixed(6) || '—'}</TableCell>
                <TableCell className="hidden md:table-cell">{loc.speed != null ? `${loc.speed} km/h` : '—'}</TableCell>
                <TableCell className="text-xs text-slate-500">
                  {loc.recorded_at ? new Date(loc.recorded_at).toLocaleString('vi-VN') : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
