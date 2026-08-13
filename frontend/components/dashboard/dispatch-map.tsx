"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Maximize2, MapPin, RefreshCw, ZoomIn, ZoomOut, Search, Compass, X, Sparkles } from "lucide-react"
import { API_URL, authFetch } from "@/lib/api"

// Component Portal gắn trực tiếp vào document.body
function BodyPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  const { createPortal } = require("react-dom");
  return createPortal(children, document.body);
}

// Từ điển tọa độ cho các Tỉnh / Thành phố / Quận Huyện chuẩn tại Việt Nam
const BASE_REGIONS: Record<string, { lat: number; lng: number }> = {
  "tân hồng": { lat: 10.9234, lng: 105.4298 },
  "hồng ngự": { lat: 10.8256, lng: 105.2891 },
  "cao lãnh": { lat: 10.4573, lng: 105.6338 },
  "sa đéc": { lat: 10.2974, lng: 105.7573 },
  "tam nông": { lat: 10.6698, lng: 105.5187 },
  "thanh bình": { lat: 10.5512, lng: 105.4831 },
  "lấp vò": { lat: 10.3341, lng: 105.5398 },
  "lai vung": { lat: 10.2312, lng: 105.6421 },
  "châu thành": { lat: 10.2689, lng: 105.8112 },
  "đồng tháp": { lat: 10.4573, lng: 105.6338 },
  
  "hà nội": { lat: 21.0285, lng: 105.8542 },
  "huế": { lat: 16.4637, lng: 107.5909 },
  "đà nẵng": { lat: 16.0544, lng: 108.2022 },
  "hồ chí minh": { lat: 10.7769, lng: 106.7009 },
  "sài gòn": { lat: 10.7769, lng: 106.7009 },
  "quận 1": { lat: 10.7756, lng: 106.7004 },
  "quận 3": { lat: 10.7801, lng: 106.6853 },
  "quận 7": { lat: 10.7325, lng: 106.7176 },
  "cần thơ": { lat: 10.0452, lng: 105.7469 },
  "an giang": { lat: 10.5216, lng: 105.1259 },
  "bình dương": { lat: 11.0505, lng: 106.6710 },
  "tiền giang": { lat: 10.4285, lng: 106.3532 },
  "vĩnh long": { lat: 10.2537, lng: 105.9722 },
  "bến tre": { lat: 10.2431, lng: 106.3756 },
};

function stringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const EXACT_PRESET_GEOCODING: Record<string, { lat: number; lng: number }> = {
  "47 lý thường kiệt, tân hồng, đồng tháp": { lat: 10.92385, lng: 105.42991 },
  "40 nguyễn trãi, tân hồng, đồng tháp": { lat: 10.92488, lng: 105.43120 },
  "319 nguyễn huệ, tân hồng, đồng tháp": { lat: 10.92420, lng: 105.43080 },
  "hẻm 42 cống quỳnh, quận 1, hà nội": { lat: 21.02780, lng: 105.85390 },
  "hẻm 42 cống quỳnh, quận 1": { lat: 10.76840, lng: 106.69480 },
  "hẻm 42 cống quỳnh": { lat: 10.76840, lng: 106.69480 },
  "tân hồng, đồng tháp": { lat: 10.92340, lng: 105.42980 },
  "tân hồng": { lat: 10.92340, lng: 105.42980 },
  "hồng ngự, đồng tháp": { lat: 10.82560, lng: 105.28910 },
  "cao lãnh, đồng tháp": { lat: 10.45730, lng: 105.63380 },
  "sa đéc, đồng tháp": { lat: 10.29740, lng: 105.75730 },
  "đồng tháp": { lat: 10.45730, lng: 105.63380 },
  "hà nội": { lat: 21.02850, lng: 105.85420 },
  "huế": { lat: 16.46370, lng: 107.59090 },
  "đà nẵng": { lat: 16.05440, lng: 108.20220 },
  "hồ chí minh": { lat: 10.77690, lng: 106.70090 },
  "sài gòn": { lat: 10.77690, lng: 106.70090 },
  "cần thơ": { lat: 10.04520, lng: 105.74690 },
  "an giang": { lat: 10.52160, lng: 105.12590 },
};

const geoCache: Record<string, { lat: number; lng: number }> = {};

if (typeof window !== "undefined") {
  try {
    const saved = localStorage.getItem("mintcare_geo_cache");
    if (saved) Object.assign(geoCache, JSON.parse(saved));
  } catch {}
}

function saveGeoCache(key: string, coords: { lat: number; lng: number }) {
  geoCache[key] = coords;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("mintcare_geo_cache", JSON.stringify(geoCache));
    } catch {}
  }
}

function getExactLocationCoords(addr?: string, idx: number = 0) {
  if (!addr) return { lat: 10.4573 + (idx % 5) * 0.003, lng: 105.6338 + Math.floor(idx / 5) * 0.003 };
  const a = addr.toLowerCase().trim();
  const cacheKey = a;

  for (const [key, coords] of Object.entries(EXACT_PRESET_GEOCODING)) {
    if (a.includes(key)) return coords;
  }

  if (geoCache[cacheKey]) return geoCache[cacheKey];

  let baseCoords = { lat: 10.4573, lng: 105.6338 };

  const priorityKeys = ["hà nội", "huế", "đà nẵng", "tân hồng", "hồng ngự", "cao lãnh", "sa đéc", "hồ chí minh", "sài gòn", "cần thơ", "an giang"];
  let matchedKey = priorityKeys.find(k => a.includes(k));
  if (!matchedKey) {
    matchedKey = Object.keys(BASE_REGIONS).find(k => a.includes(k));
  }

  if (matchedKey && BASE_REGIONS[matchedKey]) {
    baseCoords = BASE_REGIONS[matchedKey];
  }

  const hashVal = stringHash(a + "-" + idx);
  const latOffset = (((hashVal % 100) - 50) / 100) * 0.006;
  const lngOffset = ((((Math.floor(hashVal / 100)) % 100) - 50) / 100) * 0.006;

  const result = {
    lat: Number((baseCoords.lat + latOffset).toFixed(6)),
    lng: Number((baseCoords.lng + lngOffset).toFixed(6)),
  };

  // Tự động truy vấn tọa độ thực tế từ OpenStreetMap Nominatim
  if (typeof window !== "undefined" && a.length > 3) {
    const query = a.includes("việt nam") ? a : a + ", Việt Nam";
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
      headers: { "Accept-Language": "vi" }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0 && data[0].lat && data[0].lon) {
          saveGeoCache(cacheKey, { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        }
      })
      .catch(() => {});
  }

  return result;
}

function isTodayVisit(dateStr?: any): boolean {
  if (!dateStr) return true;
  const d = String(dateStr).trim();
  if (!d || d === "null" || d === "undefined") return true;

  const now = new Date();
  const year = now.getFullYear();
  const monthNum = now.getMonth() + 1;
  const dayNum = now.getDate();
  const month = String(monthNum).padStart(2, "0");
  const day = String(dayNum).padStart(2, "0");

  const todayIso = `${year}-${month}-${day}`;
  const todayVn = `${day}/${month}/${year}`;
  const todayShortVn = `${dayNum}/${monthNum}/${year}`;

  if (d.includes(todayIso) || d.includes(todayVn) || d.includes(todayShortVn)) return true;

  try {
    const parsed = new Date(d);
    if (!isNaN(parsed.getTime())) {
      const matchLocal = parsed.getFullYear() === year && parsed.getMonth() + 1 === monthNum && parsed.getDate() === dayNum;
      const matchUtc = parsed.getUTCFullYear() === year && parsed.getUTCMonth() + 1 === monthNum && parsed.getUTCDate() === dayNum;
      return matchLocal || matchUtc;
    }
  } catch {}

  return true;
}


export function DispatchMap() {
  const [staffList, setStaffList] = React.useState<any[]>([]);
  const [pendingVisits, setPendingVisits] = React.useState<any[]>([]);
  const [isMapLoaded, setIsMapLoaded] = React.useState(false);
  const [mapStyle, setMapStyle] = React.useState<"voyager" | "dark" | "osm">("voyager");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"staff" | "visits">("staff");

  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const fullMapContainerRef = React.useRef<HTMLDivElement>(null);

  const mapInstanceRef = React.useRef<any>(null);
  const fullMapInstanceRef = React.useRef<any>(null);

  const tileLayerRef = React.useRef<any>(null);
  const fullTileLayerRef = React.useRef<any>(null);

  const markersRef = React.useRef<Record<string, any>>({});

  // Tải Leaflet CDN
  React.useEffect(() => {
    if ((window as any).L) {
      setIsMapLoaded(true);
      return;
    }

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    if (!document.getElementById("leaflet-js")) {
      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => setIsMapLoaded(true);
      document.body.appendChild(script);
    }
  }, []);

  // Polling lấy dữ liệu từ Backend
  React.useEffect(() => {
    const fetchData = () => {
      fetch(`${API_URL}/staff`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setStaffList(data.filter((s: any) => s.id !== "PENDING"));
          }
        })
        .catch(() => {});

      authFetch(`${API_URL}/visits?dispatch=true`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setPendingVisits(data);
          }
        })
        .catch(() => {});
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Hàm tạo Map Instance dùng chung
  const setupMapInstance = (container: HTMLDivElement, isFull: boolean) => {
    const L = (window as any).L;
    if (!L || !container) return null;

    const map = L.map(container, {
      center: [10.4573, 105.6338],
      zoom: isFull ? 10 : 9,
      zoomControl: false,
      attributionControl: false,
    });

    let tileUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    if (mapStyle === "dark") tileUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    if (mapStyle === "osm") tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    const layer = L.tileLayer(tileUrl, { maxZoom: 19, subdomains: "abcd" }).addTo(map);

    const bounds: [number, number][] = [];

    // 1. Ghim vị trí Nhân viên y tế
    staffList.forEach((st, idx) => {
      const isAvailable = st.available !== false && !st.status?.toLowerCase().includes("bận") && !st.status?.toLowerCase().includes("khóa");
      const coords = getExactLocationCoords(st.location || st.serviceArea, idx);
      bounds.push([coords.lat, coords.lng]);

      const badgeColor = isAvailable ? "#16A34A" : "#D97706";
      const statusText = isAvailable ? "Sẵn sàng nhận lịch" : (st.status || "Đang bận");
      const avatarUrl = st.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(st.name)}&background=10b981&color=fff`;

      const iconHtml = `
        <div style="position:relative;width:40px;height:48px">
          <div style="position:absolute;top:0;left:0;width:40px;height:40px;background:white;border-radius:9999px;box-shadow:0 10px 25px -5px rgba(0,0,0,0.3);border:2.5px solid ${badgeColor};display:flex;align-items:center;justify-content:center">
            <img src="${avatarUrl}" style="width:32px;height:32px;border-radius:9999px;object-fit:cover" />
            <div style="position:absolute;bottom:-2px;right:-2px;width:12px;height:12px;background:${badgeColor};border:2px solid white;border-radius:9999px"></div>
          </div>
          <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid ${badgeColor}"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "leaflet-custom-staff-pin",
        iconSize: [40, 48],
        iconAnchor: [20, 48],
      });

      const staffAddrText = (st.location || st.serviceArea || "Đồng Tháp") + ", Việt Nam";
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(staffAddrText)}`;

      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; padding: 6px; min-width: 230px;">
          <div style="display: flex; items-center; gap: 10px; margin-bottom: 8px;">
            <img src="${avatarUrl}" style="width: 44px; height: 44px; border-radius: 12px; object-fit: cover; border: 2px solid ${badgeColor}; shadow: 0 4px 10px rgba(0,0,0,0.1);" />
            <div>
              <h4 style="margin: 0; font-size: 14px; font-weight: 800; color: #0F172A; line-height: 1.2;">${st.name}</h4>
              <span style="font-size: 10px; font-weight: 800; color: #059669; text-transform: uppercase; background: #ECFDF5; padding: 2px 6px; border-radius: 6px; display: inline-block; margin-top: 3px;">${st.role || st.specialty || 'Chuyên gia'}</span>
            </div>
          </div>
          
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 8px; border-radius: 10px; font-size: 11px; color: #334155; margin-bottom: 8px; line-height: 1.5;">
            <div style="margin-bottom: 2px;">📍 <strong>Vị trí:</strong> <span style="color: #0F172A; font-weight: 600;">${st.location || 'Đồng Tháp'}</span></div>
            <div style="margin-bottom: 2px;">📞 <strong>SĐT:</strong> <span style="font-family: monospace; font-weight: 700;">${st.phone || 'Chưa cập nhật'}</span></div>
            <div>📌 <strong>Trạng thái:</strong> <span style="color: ${badgeColor}; font-weight: 800;">${statusText}</span></div>
          </div>

          <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; gap: 6px; background: #0F172A; color: white; text-decoration: none; padding: 8px 12px; border-radius: 10px; font-size: 11px; font-weight: 800; text-transform: uppercase; tracking: 0.05em;">
            🧭 Chỉ đường Google Maps
          </a>
        </div>
      `;

      const marker = L.marker([coords.lat, coords.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(popupContent, { className: "custom-leaflet-popup-card", maxWidth: 280 });

      if (isFull) {
        markersRef.current[`staff-${st.id}`] = { marker, coords };
      }
    });

    // 2. Ghim Lịch hẹn bệnh nhân (Chỉ lấy HÔM NAY & đang khám / chờ duyệt / đã xác nhận)
    const activeVisits = pendingVisits.filter((v: any) => {
      const s = (v.status || "").toLowerCase().trim();
      if (s.includes("hủy") || s.includes("hoàn tất") || s.includes("cancel") || s.includes("complete")) {
        return false;
      }
      return isTodayVisit(v.date);
    });

    activeVisits.forEach((v, idx) => {
      const addressStr = v.address || v.customerArea || "Đồng Tháp";
      const coords = getExactLocationCoords(addressStr, idx + 10);
      bounds.push([coords.lat, coords.lng]);

      const patientIconHtml = `
        <div style="position:relative;width:34px;height:40px">
          <div style="position:absolute;top:0;left:0;background:#2563EB;color:white;border-radius:9999px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 20px rgba(37,99,235,0.4);border:2.5px solid white;font-size:14px">
            🏥
          </div>
          <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid #2563EB"></div>
        </div>
      `;

      const patientIcon = L.divIcon({
        html: patientIconHtml,
        className: "leaflet-custom-patient-pin",
        iconSize: [34, 40],
        iconAnchor: [17, 40],
      });

      const statusText = v.status || 'Chờ duyệt';
      const isPending = statusText === 'Chờ duyệt';
      const isConfirmed = statusText === 'Đã xác nhận';
      const isCompleted = statusText === 'Đã hoàn tất';
      const statusColor = isPending ? '#D97706' : isConfirmed ? '#2563EB' : isCompleted ? '#059669' : '#DC2626';

      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; padding: 6px; min-width: 220px;">
          <div style="display: flex; items-center; justify-content: space-between; margin-bottom: 4px;">
            <span style="background: #DBEAFE; color: #1E40AF; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 6px;">LỊCH HẸN KHÁM #${v.id}</span>
            <span style="color: ${statusColor}; font-size: 10px; font-weight: 800;">${statusText}</span>
          </div>
          <h4 style="margin: 4px 0 2px 0; font-size: 13px; font-weight: 800; color: #0F172A;">${v.patientName || v.userName || 'Bệnh nhân'}</h4>
          <div style="background: #EFF6FF; border: 1px solid #BFDBFE; padding: 6px 8px; border-radius: 8px; font-size: 11px; color: #1E3A8A; margin: 6px 0; line-height: 1.4;">
            📍 <strong>Địa chỉ:</strong> ${addressStr}<br/>
            🩺 <strong>Yêu cầu:</strong> ${v.type || 'Chăm sóc sức khỏe'}
          </div>
          <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressStr + ', Việt Nam')}" target="_blank" rel="noopener noreferrer" style="display: block; text-align: center; background: #2563EB; color: white; text-decoration: none; padding: 7px 0; border-radius: 8px; font-size: 10px; font-weight: 800;">
            🗺️ MỞ GOOGLE MAPS CHỈ ĐƯỜNG
          </a>
        </div>
      `;

      const marker = L.marker([coords.lat, coords.lng], { icon: patientIcon })
        .addTo(map)
        .bindPopup(popupContent, { maxWidth: 260 });

      if (isFull) {
        markersRef.current[`visit-${v.id}`] = { marker, coords };
      }
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }

    setTimeout(() => map.invalidateSize(), 250);

    return { map, layer };
  };

  // Khởi tạo Map trên Card chính
  React.useEffect(() => {
    if (!isMapLoaded || !mapContainerRef.current) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    const result = setupMapInstance(mapContainerRef.current, false);
    if (result) {
      mapInstanceRef.current = result.map;
      tileLayerRef.current = result.layer;
    }
  }, [isMapLoaded, staffList, pendingVisits, mapStyle]);

  // Khởi tạo Map trong Modal Toàn màn hình
  React.useEffect(() => {
    if (!isFullScreen || !isMapLoaded) return;
    setTimeout(() => {
      if (fullMapContainerRef.current) {
        if (fullMapInstanceRef.current) {
          fullMapInstanceRef.current.remove();
          fullMapInstanceRef.current = null;
        }
        const result = setupMapInstance(fullMapContainerRef.current, true);
        if (result) {
          fullMapInstanceRef.current = result.map;
          fullTileLayerRef.current = result.layer;
        }
      }
    }, 150);
  }, [isFullScreen, isMapLoaded, staffList, pendingVisits, mapStyle]);

  // FlyTo nhân viên/bệnh nhân khi chọn từ Sidebar Toàn màn hình
  const handleFlyToTarget = (key: string, locationStr?: string, index: number = 0) => {
    const targetMap = isFullScreen ? fullMapInstanceRef.current : mapInstanceRef.current;
    if (!targetMap) return;

    const targetObj = markersRef.current[key];
    const coords = targetObj?.coords ?? getExactLocationCoords(locationStr, index);
    targetMap.flyTo([coords.lat, coords.lng], 17, { duration: 1.2 });
    if (targetObj?.marker) {
      setTimeout(() => targetObj.marker.openPopup(), 1300);
    }
  };

  // Đổi Map Tile Style
  const handleChangeMapStyle = (style: "voyager" | "dark" | "osm") => {
    setMapStyle(style);
  };

  const handleRecenter = () => {
    const map = isFullScreen ? fullMapInstanceRef.current : mapInstanceRef.current;
    if (map) {
      map.setView([10.4573, 105.6338], 10);
      setTimeout(() => map.invalidateSize(), 100);
    }
  };

  const handleZoomIn = () => {
    const map = isFullScreen ? fullMapInstanceRef.current : mapInstanceRef.current;
    map?.zoomIn();
  };

  const handleZoomOut = () => {
    const map = isFullScreen ? fullMapInstanceRef.current : mapInstanceRef.current;
    map?.zoomOut();
  };

  // Lọc tìm kiếm nhân viên & lịch hẹn HÔM NAY
  const activeVisits = pendingVisits.filter((v: any) => {
    const s = (v.status || "").toLowerCase().trim();
    if (s.includes("hủy") || s.includes("hoàn tất") || s.includes("cancel") || s.includes("complete")) {
      return false;
    }
    return isTodayVisit(v.date);
  });

  const filteredStaff = staffList.filter(s => !searchQuery || s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || s.location?.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredVisits = activeVisits.filter(v => !searchQuery || v.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) || v.userName?.toLowerCase().includes(searchQuery.toLowerCase()) || v.address?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <section className="lg:col-span-2">
      <div className="bg-white border border-hairline rounded-[32px] p-6 md:p-8 overflow-hidden relative h-full flex flex-col shadow-xs group/card">
        
        {/* Header Card chính */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="eyebrow text-[11px]">Bản đồ Định vị GPS Thực tế</span>
            </div>
            <h2 className="text-xl font-bold tight-tracking text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-600 animate-spin-slow" />
              Trung Tâm Điều Phối Bản Đồ Lưu Động
            </h2>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Đổi Layer Map */}
            <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 border border-slate-200 text-[10px] font-bold">
              <button
                onClick={() => handleChangeMapStyle("voyager")}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  mapStyle === "voyager" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Vệ tinh / Phố
              </button>
              <button
                onClick={() => handleChangeMapStyle("dark")}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  mapStyle === "dark" ? "bg-slate-900 text-white shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Chế độ Tối
              </button>
            </div>

            <button
              onClick={handleRecenter}
              title="Định vị về Đồng Tháp"
              className="px-3 py-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
              <span>Đồng Tháp</span>
            </button>

            {/* Nút Bật Toàn Màn Hình */}
            <button
              onClick={() => setIsFullScreen(true)}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0 border border-emerald-500"
              title="Xem đầy đủ toàn màn hình với bộ công cụ điều phối"
            >
              <Maximize2 className="w-4 h-4 animate-bounce-subtle" />
              <span>Mở Toàn Màn Hình</span>
            </button>
          </div>
        </div>

        {/* Khung bản đồ nhỏ ở Card chính */}
        <div className="flex-1 w-full bg-slate-100 rounded-[24px] relative overflow-hidden border border-slate-200 min-h-[440px] shadow-inner flex flex-col">
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0 bg-slate-100" />

          {!isMapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50/90 backdrop-blur-md z-20">
              <div className="flex items-center gap-3 bg-white px-6 py-3.5 rounded-2xl shadow-2xl border border-slate-200">
                <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin" />
                <span className="text-xs font-bold text-slate-800">Đang tải bản đồ định vị Apple/Grab Maps...</span>
              </div>
            </div>
          )}

          {/* Thanh chú thích phía dưới */}
          <div className="absolute bottom-4 left-4 z-10 pointer-events-auto max-w-full">
            <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-4 text-[10px] font-extrabold text-slate-700">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-emerald-100"></span>
                <span>Sẵn sàng ({staffList.filter((s) => s.available !== false && !s.status?.includes("bận")).length})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-100"></span>
                <span>Đang bận ({staffList.filter((s) => s.available === false || s.status?.includes("bận")).length})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100"></span>
                <span>Bệnh nhân ({pendingVisits.length})</span>
              </div>
            </div>
          </div>

          {/* Controls Zoom bên phải */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5 pointer-events-auto">
            <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-1.5 rounded-2xl shadow-xl flex flex-col gap-1">
              <button onClick={handleZoomIn} className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-700 cursor-pointer" title="Phóng to">
                <ZoomIn className="w-4.5 h-4.5" />
              </button>
              <div className="h-px bg-slate-200 mx-1" />
              <button onClick={handleZoomOut} className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-700 cursor-pointer" title="Thu nhỏ">
                <ZoomOut className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* MODAL BẢN ĐỒ TOÀN MÀN HÌNH (FULLSCREEN COMMAND CENTER - PORTAL VÀO BODY) */}
      <BodyPortal>
        <AnimatePresence>
        {isFullScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ position: "fixed", inset: 0, zIndex: 99999, backgroundColor: "rgba(2,6,23,0.97)", display: "flex", flexDirection: "column", padding: "20px", overflow: "hidden", gap: "16px", userSelect: "none" }}
          >
            {/* Header Toàn Màn Hình */}
            <div className="flex items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-3xl shadow-2xl shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Sparkles className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block">Trung tâm điều phối quốc gia</span>
                  <h2 className="text-lg md:text-xl font-black text-white tracking-tight leading-tight flex items-center gap-2">
                    BẢN ĐỒ GPS TOÀN MÀN HÌNH • MINTCARE COMMAND CENTER
                  </h2>
                </div>
              </div>

              {/* Thanh Công Cụ Điều Khiển Top */}
              <div className="flex items-center gap-3">
                {/* Đổi Layer Map */}
                <div className="bg-slate-800 p-1 rounded-2xl flex items-center gap-1 border border-slate-700 text-xs font-bold text-slate-300">
                  <button
                    onClick={() => handleChangeMapStyle("voyager")}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      mapStyle === "voyager" ? "bg-emerald-600 text-white font-black shadow-md" : "hover:text-white"
                    }`}
                  >
                    Vệ tinh / Phố
                  </button>
                  <button
                    onClick={() => handleChangeMapStyle("dark")}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      mapStyle === "dark" ? "bg-slate-950 text-white font-black shadow-md border border-slate-700" : "hover:text-white"
                    }`}
                  >
                    Chế độ Tối
                  </button>
                </div>

                <button
                  onClick={handleRecenter}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-emerald-400" />
                  <span>Đồng Tháp</span>
                </button>

                {/* Nút Thoát Toàn Màn Hình */}
                <button
                  onClick={() => setIsFullScreen(false)}
                  className="w-11 h-11 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-lg"
                  title="Đóng toàn màn hình (Esc)"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Thân Bố Cục Toàn Màn Hình (Sidebar Bên Trái + Map Rộng Bên Phải) */}
            <div className="flex-1 flex gap-4 min-h-0 relative">
              
              {/* SIDEBAR BÊN TRÁI TOÀN MÀN HÌNH: Danh sách & Tìm kiếm */}
              <div className="w-80 md:w-96 bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex flex-col shadow-2xl shrink-0 z-20">
                
                {/* Ô Tìm kiếm nhanh */}
                <div className="relative mb-4">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm tên nhân viên, bệnh nhân, Đồng Tháp..."
                    className="w-full bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold focus:outline-none focus:border-emerald-500 transition-all"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold">
                      ✕
                    </button>
                  )}
                </div>

                {/* Tab chọn Chuyên gia vs Lịch hẹn */}
                <div className="grid grid-cols-2 gap-2 bg-slate-800/80 p-1 rounded-2xl border border-slate-700 mb-4 text-xs font-extrabold">
                  <button
                    onClick={() => setActiveTab("staff")}
                    className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === "staff" ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Nhân viên ({filteredStaff.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("visits")}
                    className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === "visits" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Lịch hẹn ({filteredVisits.length})</span>
                  </button>
                </div>

                {/* Danh sách cuộn chọn nhân viên / bệnh nhân để flyTo */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
                  {activeTab === "staff" ? (
                    filteredStaff.length > 0 ? (
                      filteredStaff.map((st, idx) => {
                        const isAvailable = st.available !== false && !st.status?.toLowerCase().includes("bận") && !st.status?.toLowerCase().includes("khóa");
                        return (
                          <div
                            key={st.id || idx}
                            onClick={() => handleFlyToTarget(`staff-${st.id}`, st.location || st.serviceArea, idx)}
                            className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 rounded-2xl transition-all cursor-pointer flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="relative shrink-0">
                                <img
                                  src={st.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(st.name)}&background=10b981&color=fff`}
                                  className="w-10 h-10 rounded-xl object-cover border border-slate-600"
                                />
                                <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${isAvailable ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate">{st.name}</h4>
                                <p className="text-[10px] text-slate-400 truncate">{st.role || st.specialty || 'Chuyên gia'}</p>
                                <p className="text-[9px] text-emerald-400/90 font-medium truncate mt-0.5">📍 {st.location || 'Đồng Tháp'}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 group-hover:text-white bg-slate-700/60 px-2 py-1 rounded-lg shrink-0">
                              Định vị ➔
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-center text-xs text-slate-400 py-8">Không tìm thấy nhân viên phù hợp</p>
                    )
                  ) : (
                    filteredVisits.length > 0 ? (
                      filteredVisits.map((v, idx) => {
                        const statusText = v.status || "Chờ duyệt";
                        const badgeStyle = statusText === "Chờ duyệt" ? "text-amber-400 bg-amber-950/60 border-amber-700" :
                                           statusText === "Đã xác nhận" ? "text-blue-400 bg-blue-950/60 border-blue-700" :
                                           statusText === "Đã hoàn tất" ? "text-emerald-400 bg-emerald-950/60 border-emerald-700" :
                                           "text-rose-400 bg-rose-950/60 border-rose-700";
                        return (
                          <div
                            key={v.id || idx}
                            onClick={() => handleFlyToTarget(`visit-${v.id}`, v.address || v.customerArea, idx + 10)}
                            className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/50 rounded-2xl transition-all cursor-pointer flex items-center justify-between group"
                          >
                            <div className="min-w-0 pr-2">
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-[9px] font-mono font-black text-blue-300 bg-blue-900/60 px-1.5 py-0.5 rounded border border-blue-700">#{v.id}</span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${badgeStyle}`}>{statusText}</span>
                              </div>
                              <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors truncate">{v.patientName || v.userName || 'Bệnh nhân'}</h4>
                              <p className="text-[10px] text-slate-300 truncate mt-0.5">📍 {v.address || v.customerArea || 'Đồng Tháp'}</p>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 group-hover:text-white bg-slate-700/60 px-2 py-1 rounded-lg shrink-0">
                              Định vị ➔
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-center text-xs text-slate-400 py-8">Không có lịch hẹn đang chờ</p>
                    )
                  )}
                </div>

                {/* Chú thích dưới đáy Sidebar */}
                <div className="pt-3 border-t border-slate-800 mt-2 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                  <span>Mạng lưới MintCare GPS</span>
                  <span className="text-emerald-400">● Hoạt động 100%</span>
                </div>
              </div>

              {/* BẢN ĐỒ TOÀN MÀN HÌNH CHÍNH (Right Container) */}
              <div className="flex-1 bg-slate-900 rounded-3xl relative overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
                <div ref={fullMapContainerRef} className="absolute inset-0 w-full h-full z-0 bg-slate-900" />

                {/* Floating Map Zoom Controls cho Fullscreen */}
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5 pointer-events-auto">
                  <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-1.5 rounded-2xl shadow-2xl flex flex-col gap-1">
                    <button onClick={handleZoomIn} className="w-10 h-10 rounded-xl hover:bg-slate-800 flex items-center justify-center text-white cursor-pointer" title="Phóng to">
                      <ZoomIn className="w-5 h-5" />
                    </button>
                    <div className="h-px bg-slate-800 mx-1" />
                    <button onClick={handleZoomOut} className="w-10 h-10 rounded-xl hover:bg-slate-800 flex items-center justify-center text-white cursor-pointer" title="Thu nhỏ">
                      <ZoomOut className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </motion.div>
        )}
        </AnimatePresence>
      </BodyPortal>

    </section>
  )
}
