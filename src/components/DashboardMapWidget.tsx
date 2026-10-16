import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { UnifiedPendampingan } from '../types';
import { Baby, ExternalLink, Eye, Heart, MapPin, Navigation, ShieldAlert, ShieldCheck, Users } from 'lucide-react';

interface DashboardMapWidgetProps {
  data: UnifiedPendampingan[];
  onOpenDetailModal?: (record: UnifiedPendampingan) => void;
  selectedKemantren: string;
  selectedKelurahan: string;
}

// Component to dynamically re-center map when data or filters change
function MapCenterController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export const DashboardMapWidget: React.FC<DashboardMapWidgetProps> = ({
  data,
  onOpenDetailModal,
  selectedKemantren,
  selectedKelurahan,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'risiko' | 'catin' | 'bumil' | 'bufas'>('all');

  // Filter data that has valid GPS coordinates
  const mappedData = useMemo(() => {
    return data.filter(item => {
      const hasCoords = item.latitude !== undefined && item.longitude !== undefined && !isNaN(item.latitude) && !isNaN(item.longitude);
      if (!hasCoords) return false;

      // Filter by kemantren/kelurahan if selected
      if (selectedKelurahan !== 'all' && String(item.kelurahan_id) !== selectedKelurahan) {
        return false;
      }
      if (selectedKemantren !== 'all' && item.kemantren?.toLowerCase() !== selectedKemantren.toLowerCase()) {
        return false;
      }

      // Filter by tab
      if (activeTab === 'risiko' && !item.is_risiko_stunting) return false;
      if (activeTab === 'catin' && item.jenis_sasaran !== 'CATIN') return false;
      if (activeTab === 'bumil' && item.jenis_sasaran !== 'IBU_HAMIL') return false;
      if (activeTab === 'bufas' && item.jenis_sasaran !== 'BUFAS') return false;

      return true;
    });
  }, [data, selectedKemantren, selectedKelurahan, activeTab]);

  // Default center: Yogyakarta (-7.7956, 110.3695)
  const defaultCenter: [number, number] = [-7.7956, 110.3695];
  
  // Calculate center based on mapped data if available
  const mapCenter = useMemo<[number, number]>(() => {
    if (mappedData.length === 0) return defaultCenter;
    const lats = mappedData.map(d => d.latitude as number);
    const lngs = mappedData.map(d => d.longitude as number);
    const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
    return [avgLat, avgLng];
  }, [mappedData]);

  const mapZoom = mappedData.length > 0 ? (selectedKelurahan !== 'all' ? 15 : 13) : 12;

  // Create custom HTML markers for Leaflet using divIcon
  const createMarkerIcon = (item: UnifiedPendampingan) => {
    let bgColor = '#0d9488'; // teal-600 default
    let iconEmoji = '👤';

    if (item.is_risiko_stunting) {
      bgColor = '#dc2626'; // red-600 for stunting risk
      iconEmoji = '⚠️';
    } else if (item.jenis_sasaran === 'CATIN') {
      bgColor = '#e11d48'; // rose-600
      iconEmoji = '💍';
    } else if (item.jenis_sasaran === 'BUFAS') {
      bgColor = '#d97706'; // amber-600
      iconEmoji = '👶';
    } else if (item.jenis_sasaran === 'IBU_HAMIL') {
      bgColor = '#2563eb'; // blue-600
      iconEmoji = '🤰';
    }

    return L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="
          background-color: ${bgColor};
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.35);
          border: 2px solid #ffffff;
          transform: translate(-16px, -16px);
          transition: transform 0.2s;
        ">
          ${iconEmoji}
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -18],
    });
  };

  const totalWithGpsCount = useMemo(() => {
    return data.filter(item => item.latitude !== undefined && item.longitude !== undefined && !isNaN(item.latitude)).length;
  }, [data]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Peta Sebaran Sasaran &amp; Titik Koordinat GPS Lapangan
              </h2>
              <p className="text-xs text-slate-500">
                Menampilkan {mappedData.length} dari {totalWithGpsCount} sasaran dengan koordinat GPS terverifikasi di database
              </p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({totalWithGpsCount})
          </button>
          <button
            onClick={() => setActiveTab('risiko')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
              activeTab === 'risiko' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-red-700'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Risiko Stunting</span>
          </button>
          <button
            onClick={() => setActiveTab('catin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
              activeTab === 'catin' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-rose-700'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Catin</span>
          </button>
          <button
            onClick={() => setActiveTab('bumil')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
              activeTab === 'bumil' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-blue-700'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Bumil</span>
          </button>
          <button
            onClick={() => setActiveTab('bufas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
              activeTab === 'bufas' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-amber-800'
            }`}
          >
            <Baby className="w-3.5 h-3.5" />
            <span>Bufas</span>
          </button>
        </div>
      </div>

      {/* Map Container Body */}
      <div className="relative w-full h-[450px] sm:h-[500px] z-10">
        {mappedData.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 p-6 text-center z-20">
            <MapPin className="w-12 h-12 text-slate-300 mb-3 animate-bounce" />
            <h3 className="text-sm font-bold text-slate-700">Tidak ada data koordinat GPS pada filter ini</h3>
            <p className="text-xs text-slate-500 max-w-md mt-1">
              Belum ada sasaran pendampingan dengan koordinat GPS yang tersimpan untuk wilayah atau kategori yang dipilih. Lakukan update log via DetailModal untuk merekam koordinat GPS lapangan.
            </p>
          </div>
        ) : null}

        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={false}
          style={{ width: '100%', height: '100%' }}
        >
          <MapCenterController center={mapCenter} zoom={mapZoom} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {mappedData.map(item => {
            const lat = item.latitude as number;
            const lng = item.longitude as number;
            return (
              <Marker key={item.id} position={[lat, lng]} icon={createMarkerIcon(item)}>
                <Popup>
                  <div className="p-2 min-w-[220px] max-w-[280px] font-sans text-slate-800 space-y-2">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                      <div>
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-800 uppercase tracking-wide">
                          {item.jenis_sasaran}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 mt-1">{item.nama}</h4>
                      </div>
                      {item.is_risiko_stunting && (
                        <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 flex items-center gap-0.5">
                          <ShieldAlert className="w-3 h-3" /> Risiko
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{item.kelurahan_nama}, {item.kemantren}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                        <Navigation className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>{lat.toFixed(5)}, {lng.toFixed(5)}</span>
                      </div>
                      {item.gps_accuracy && (
                        <div className="text-[10px] text-teal-700 font-medium">
                          Akurasi GPS: ±{item.gps_accuracy.toFixed(1)} meter
                        </div>
                      )}
                      {item.lokasi_label && (
                        <div className="text-[10px] text-slate-500 italic">
                          "{item.lokasi_label}"
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex items-center gap-2 border-t border-slate-100">
                      {onOpenDetailModal && (
                        <button
                          onClick={() => onOpenDetailModal(item)}
                          className="flex-1 py-1.5 px-3 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail &amp; Log</span>
                        </button>
                      )}
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                        title="Buka di Google Maps"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Footer Info Legend */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-semibold text-slate-700">Legenda Peta:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-600 inline-block"></span> Risiko Stunting
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-600 inline-block"></span> Catin
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span> Ibu Hamil
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-600 inline-block"></span> Ibu Nifas
          </span>
        </div>
        <div className="text-slate-400 text-[11px]">
          Peta Interaktif OpenStreetMap &amp; Leaflet
        </div>
      </div>
    </div>
  );
};
