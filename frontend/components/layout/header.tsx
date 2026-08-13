import * as React from "react";
import {
  Search,
  Bell,
  Command,
  Settings,
  User,
  LogOut,
  Stethoscope,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  CircleHelp,
  Phone,
  Send,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  X,
  Map,
  ZoomIn,
  ZoomOut,
  Users,
  MapPin,
  RefreshCw,
  Sparkles,
  Calendar,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLoading } from "@/lib/loading-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { API_URL, authFetch } from "@/lib/api";

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

function getHeaderCoords(addr?: string, idx: number = 0, onExactResolved?: (coords: { lat: number; lng: number }) => void) {
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

  const fallbackResult = {
    lat: Number((baseCoords.lat + latOffset).toFixed(6)),
    lng: Number((baseCoords.lng + lngOffset).toFixed(6)),
  };

  if (typeof window !== "undefined" && a.length > 3) {
    const query = a.includes("việt nam") ? a : a + ", Việt Nam";
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
      headers: { "Accept-Language": "vi" }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0 && data[0].lat && data[0].lon) {
          const exact = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
          saveGeoCache(cacheKey, exact);
          if (onExactResolved) onExactResolved(exact);
        }
      })
      .catch(() => {});
  }

  return fallbackResult;
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

function BodyPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  const { createPortal } = require("react-dom");
  return createPortal(children, document.body);
}

interface NotificationLog {
  id: string;
  userId?: string;
  visitId?: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  time: string;
  userName?: string;
  userEmail?: string;
}

export function Header() {
  const { user, login, register, logout } = useAuth();
  const { show, hide } = useLoading();
  const router = useRouter();

  // Auth Dialog state inside header
  const [isOpen, setIsOpen] = React.useState(false);
  const [authTab, setAuthTab] = React.useState<"login" | "register">("login");
  const [showPass, setShowPass] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("");

  // Help dialog state
  const [helpOpen, setHelpOpen] = React.useState(false);
  const [helpTopic, setHelpTopic] = React.useState("");
  const [helpEmail, setHelpEmail] = React.useState("");
  const [helpPhone, setHelpPhone] = React.useState("");
  const [helpMessage, setHelpMessage] = React.useState("");
  const [helpSubmitted, setHelpSubmitted] = React.useState(false);

  // Notification Popover State for Admin
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<NotificationLog[]>([]);
  const notifRef = React.useRef<HTMLDivElement>(null);

  const fetchNotifications = React.useCallback(() => {
    const isStaffOrAdmin = user?.role === "admin" || user?.role === "vltl" || user?.role === "chuyen_gia" || user?.role === "dieu_duong";
    if (isStaffOrAdmin) {
      authFetch(`${API_URL}/notifications`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) setNotifications(data);
        })
        .catch(() => {});
    }
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await authFetch(`${API_URL}/notifications/mark-all-read`, { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 8000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmitHelp = (e: React.FormEvent) => {
    e.preventDefault();
    setHelpSubmitted(true);
    setTimeout(() => {
      setHelpSubmitted(false);
      setHelpTopic("");
      setHelpEmail("");
      setHelpPhone("");
      setHelpMessage("");
      setHelpOpen(false);
    }, 2000);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    show("ĐANG ĐĂNG NHẬP HỆ THỐNG...");
    try {
      const u = await login(email, password);
      setIsOpen(false);
      const isStaffOrAdmin = u?.role === "admin" || u?.role === "vltl" || u?.role === "chuyen_gia" || u?.role === "dieu_duong";
      if (isStaffOrAdmin) {
        router.push("/admin");
      } else {
        router.push("/lich-hen");
      }
    } catch (err: any) {
      setErrorMsg("Tài khoản hoặc mật khẩu không chính xác");
    } finally {
      hide();
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    show("ĐANG TẠO TÀI KHOẢN...");
    try {
      await register({ email, password, fullName, phone });
      setIsOpen(false);
      router.push("/lich-hen");
    } catch (err: any) {
      setErrorMsg(err.message || "Đăng ký thất bại");
    } finally {
      hide();
    }
  };

  // GPS Map fullscreen state
  const [isMapOpen, setIsMapOpen] = React.useState(false);
  const [mapStyle, setMapStyle] = React.useState<"voyager" | "dark">("voyager");
  const [mapSearchQuery, setMapSearchQuery] = React.useState("");
  const [mapActiveTab, setMapActiveTab] = React.useState<"staff" | "visits">("staff");
  const [mapStaffList, setMapStaffList] = React.useState<any[]>([]);
  const [mapVisits, setMapVisits] = React.useState<any[]>([]);
  const [isMapLoaded, setIsMapLoaded] = React.useState(false);
  const markersRef = React.useRef<Record<string, any>>({});
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<any>(null);
  const isInitialFitRef = React.useRef(true);

  // Reset initial fit flag khi đóng/mở lại map
  React.useEffect(() => {
    if (isMapOpen) {
      isInitialFitRef.current = true;
    }
  }, [isMapOpen]);

  // Load Leaflet & Map Data khi map mở
  React.useEffect(() => {
    if (!isMapOpen) return;
    const fetchMapData = () => {
      fetch(`${API_URL}/staff`).then(r => r.json()).then(d => { if (Array.isArray(d)) setMapStaffList(d.filter((s: any) => s.id !== "PENDING")); }).catch(() => {});
      authFetch(`${API_URL}/visits?dispatch=true`).then(r => r.json()).then(d => { if (Array.isArray(d)) setMapVisits(d); }).catch(() => {});
    };
    fetchMapData();
    const interval = setInterval(fetchMapData, 5000);

    if ((window as any).L) { setIsMapLoaded(true); }
    else {
      if (!document.getElementById("leaflet-css")) {
        const l = document.createElement("link"); l.id = "leaflet-css"; l.rel = "stylesheet";
        l.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"; document.head.appendChild(l);
      }
      if (!document.getElementById("leaflet-js")) {
        const s = document.createElement("script"); s.id = "leaflet-js";
        s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"; s.onload = () => setIsMapLoaded(true);
        document.body.appendChild(s);
      }
    }

    return () => clearInterval(interval);
  }, [isMapOpen]);

  // Khởi tạo & Cập nhật Leaflet map khi fullscreen mở
  React.useEffect(() => {
    if (!isMapOpen || !isMapLoaded || !mapContainerRef.current) return;
    const container = mapContainerRef.current;
    const L = (window as any).L;
    if (!L) return;

    let map = mapInstanceRef.current;

    if (!map) {
      map = L.map(container, { center: [10.4573, 105.6338], zoom: 10, zoomControl: false, attributionControl: false });
      const tileUrl = mapStyle === "dark" ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
      L.tileLayer(tileUrl, { maxZoom: 19, subdomains: "abcd" }).addTo(map);
      mapInstanceRef.current = map;
      (map as any)._tileLayerUrl = tileUrl;
    } else {
      const tileUrl = mapStyle === "dark" ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
      if ((map as any)._tileLayerUrl !== tileUrl) {
        map.eachLayer((layer: any) => {
          if (layer._url) map.removeLayer(layer);
        });
        L.tileLayer(tileUrl, { maxZoom: 19, subdomains: "abcd" }).addTo(map);
        (map as any)._tileLayerUrl = tileUrl;
      }
    }

    // Xóa bớt ghim cũ để cập nhật ghim mới mà không ảnh hưởng góc nhìn của người dùng
    Object.values(markersRef.current).forEach((item: any) => {
      if (item?.marker) map.removeLayer(item.marker);
    });
    markersRef.current = {};

    const bounds: [number, number][] = [];
    const activeVisits = mapVisits.filter((v: any) => {
      const s = (v.status || "").toLowerCase().trim();
      if (s.includes("hủy") || s.includes("hoàn tất") || s.includes("cancel") || s.includes("complete")) {
        return false;
      }
      return isTodayVisit(v.date);
    });

    mapStaffList.forEach((st, idx) => {
      const isAvail = st.available !== false && !st.status?.toLowerCase().includes("bận");
      const c = getHeaderCoords(st.location || st.serviceArea, idx, (exactCoords) => {
        if (markersRef.current[`staff-${st.id}`]?.marker) {
          markersRef.current[`staff-${st.id}`].marker.setLatLng([exactCoords.lat, exactCoords.lng]);
          markersRef.current[`staff-${st.id}`].coords = exactCoords;
        }
      });
      bounds.push([c.lat, c.lng]);
      const badgeColor = isAvail ? "#16A34A" : "#D97706";
      const avatarUrl = st.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(st.name)}&background=10b981&color=fff`;
      const icon = L.divIcon({
        html: `<div style="position:relative;width:40px;height:48px"><div style="position:absolute;top:0;left:0;right:0;background:white;border-radius:9999px;width:40px;height:40px;box-shadow:0 10px 25px -5px rgba(0,0,0,0.3);border:2.5px solid ${badgeColor};display:flex;align-items:center;justify-content:center"><img src="${avatarUrl}" style="width:32px;height:32px;border-radius:9999px;object-fit:cover"/><div style="position:absolute;bottom:-2px;right:-2px;width:12px;height:12px;background:${badgeColor};border:2px solid white;border-radius:9999px"></div></div><div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid ${badgeColor}"></div></div>`,
        className: "", iconSize: [40, 48], iconAnchor: [20, 48],
      });
      const staffAddress = (st.location || st.serviceArea || "Đồng Tháp, Việt Nam") + ", Việt Nam";
      const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(staffAddress)}`;
      const marker = L.marker([c.lat, c.lng], { icon }).addTo(map)
        .bindPopup(`<div style="font-family:system-ui;padding:8px;min-width:220px"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><img src="${avatarUrl}" style="width:40px;height:40px;border-radius:10px;object-fit:cover;border:2px solid ${badgeColor}"/><div><b style="font-size:13px;display:block">${st.name}</b><span style="font-size:10px;color:#059669;font-weight:700">${st.role || 'Chuyên gia'}</span></div></div><div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:7px;font-size:11px;margin-bottom:8px;line-height:1.5"><div>📍 <strong>Địa chỉ:</strong> ${staffAddress}</div><div>📌 <strong>Trạng thái:</strong> <span style="color:${badgeColor};font-weight:800">${isAvail ? 'Sẵn sàng nhận lịch' : 'Đang bận'}</span></div></div><a href="${gmapsUrl}" target="_blank" style="display:flex;align-items:center;justify-content:center;gap:6px;background:#0F172A;color:white;padding:8px;border-radius:8px;font-size:10px;font-weight:800;text-decoration:none;letter-spacing:0.05em">🧭 Chỉ đường Google Maps</a></div>`, { maxWidth: 280 });
      markersRef.current[`staff-${st.id}`] = { marker, coords: c };
    });

    activeVisits.forEach((v, idx) => {
      const addr = v.address || v.customerArea || "Đồng Tháp";
      const c = getHeaderCoords(addr, idx + 10, (exactCoords) => {
        if (markersRef.current[`visit-${v.id}`]?.marker) {
          markersRef.current[`visit-${v.id}`].marker.setLatLng([exactCoords.lat, exactCoords.lng]);
          markersRef.current[`visit-${v.id}`].coords = exactCoords;
        }
      });
      bounds.push([c.lat, c.lng]);
      const icon = L.divIcon({
        html: `<div style="position:relative;width:34px;height:40px"><div style="position:absolute;top:0;left:0;background:#2563EB;color:white;border-radius:9999px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 20px rgba(37,99,235,0.4);border:2.5px solid white;font-size:14px">🏥</div><div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid #2563EB"></div></div>`,
        className: "", iconSize: [34, 40], iconAnchor: [17, 40],
      });
      const statusText = v.status || 'Chờ duyệt';
      const isPending = statusText === 'Chờ duyệt';
      const isConfirmed = statusText === 'Đã xác nhận';
      const isCompleted = statusText === 'Đã hoàn tất';
      const statusColor = isPending ? '#d97706' : isConfirmed ? '#2563eb' : isCompleted ? '#059669' : '#dc2626';
      const statusBg = isPending ? '#fef3c7' : isConfirmed ? '#dbeafe' : isCompleted ? '#d1fae5' : '#fee2e2';
      const visitAddress = addr + (addr.toLowerCase().includes("việt nam") ? "" : ", Việt Nam");
      const visitMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(visitAddress)}`;

      const marker = L.marker([c.lat, c.lng], { icon }).addTo(map)
        .bindPopup(`<div style="font-family:system-ui;padding:8px;min-width:220px"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px"><span style="background:#dbeafe;color:#1e40af;font-size:9px;font-weight:800;padding:2px 6px;border-radius:6px">LỊCH HẸN KHÁM</span><span style="color:${statusColor};background:${statusBg};font-size:9px;font-weight:800;padding:2px 6px;border-radius:6px">${statusText}</span></div><b style="font-size:13px">${v.patientName || v.userName || 'Bệnh nhân'}</b><div style="background:#eff6ff;border:1px solid #bfdbfe;padding:6px 8px;border-radius:8px;font-size:11px;margin:6px 0;line-height:1.5">📍 <strong>Địa chỉ:</strong> ${visitAddress}<br/>🩺 <strong>Yêu cầu:</strong> ${v.type || v.serviceName || 'Chăm sóc sức khỏe'}</div><a href="${visitMapsUrl}" target="_blank" style="display:block;text-align:center;background:#2563EB;color:white;padding:8px;border-radius:8px;font-size:10px;font-weight:800;text-decoration:none">🗺️ Mở Google Maps Chỉ đường</a></div>`, { maxWidth: 280 });
      markersRef.current[`visit-${v.id}`] = { marker, coords: c };
    });

    // CHỈ fitBounds duy nhất 1 lần khi người dùng mới mở bản đồ
    if (isInitialFitRef.current && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      isInitialFitRef.current = false;
    }
    setTimeout(() => map.invalidateSize(), 150);
  }, [isMapOpen, isMapLoaded, mapStaffList, mapVisits, mapStyle]);

  // Cleanup khi component unmount
  React.useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersRef.current = {};
    };
  }, []);

  // Lọc chỉ hiển thị lịch hẹn HÔM NAY active (Đang thực hiện, Chờ duyệt, Đã xác nhận)
  const activeMapVisits = mapVisits.filter((v: any) => {
    const s = (v.status || "").toLowerCase().trim();
    if (s.includes("hủy") || s.includes("hoàn tất") || s.includes("cancel") || s.includes("complete")) {
      return false;
    }
    return isTodayVisit(v.date);
  });

  const filteredMapStaff = mapStaffList.filter(s => !mapSearchQuery || s.name?.toLowerCase().includes(mapSearchQuery.toLowerCase()) || s.location?.toLowerCase().includes(mapSearchQuery.toLowerCase()));
  const filteredMapVisits = activeMapVisits.filter(v => !mapSearchQuery || v.patientName?.toLowerCase().includes(mapSearchQuery.toLowerCase()) || v.address?.toLowerCase().includes(mapSearchQuery.toLowerCase()));

  return (
    <>
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-hairline px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-8 flex-1">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-tertiary group-focus-within:text-primary transition-colors" />
          <Input
            type="text"
            placeholder="Tìm kiếm nhanh... (⌘ + K)"
            className="w-full bg-surface-secondary border-transparent focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 outline-hidden rounded-2xl py-2 pl-11 pr-12 text-sm transition-all h-11 shadow-none"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white border border-hairline px-1.5 py-0.5 rounded-lg shadow-xs pointer-events-none">
            <Command className="w-2.5 h-2.5 text-on-surface-tertiary" />
            <span className="text-[10px] font-bold text-on-surface-tertiary uppercase">
              K
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="hidden md:flex items-center gap-2.5 bg-surface-tinted/50 px-4 py-2 rounded-2xl border border-primary/10"
        >
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(24,190,102,0.5)]"></div>
          <span className="text-[11px] font-black text-primary-strong uppercase tracking-wider">
            Hệ thống ổn định
          </span>
        </motion.div>

        {/* Nút Bản đồ GPS Toàn Màn hình - truy cập nhanh từ Header */}
        <button
          onClick={() => setIsMapOpen(true)}
          className="hidden md:flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-2xl text-[11px] font-extrabold uppercase tracking-wide transition-all shadow-md hover:shadow-lg border border-slate-700 cursor-pointer shrink-0"
          title="Mở Bản đồ GPS Điều phối Toàn màn hình"
        >
          <Map className="w-4 h-4 text-emerald-400" />
          <span>Bản đồ GPS</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Notifications Bell Dropdown */}
          <div ref={notifRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setNotifOpen(!notifOpen);
                if (!notifOpen) fetchNotifications();
              }}
              className="relative w-11 h-11 rounded-2xl hover:bg-surface-secondary flex items-center justify-center transition-colors group cursor-pointer"
            >
              <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              {notifications.some((n) => !n.isRead) && (
                <span className="absolute top-2 right-2 min-w-[18px] h-[18px] flex items-center justify-center bg-rose-500 text-white text-[9px] font-black rounded-full border-2 border-white shadow-sm px-0.5 animate-pulse">
                  {notifications.filter((n) => !n.isRead).length > 9 ? "9+" : notifications.filter((n) => !n.isRead).length}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-14 w-80 md:w-[400px] bg-white border border-slate-200 rounded-[28px] shadow-2xl z-[120] overflow-hidden text-left text-slate-900"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Thông báo khách hàng</h4>
                      <span className="text-[10px] font-bold text-white bg-rose-500 px-2 py-0.5 rounded-full">
                        {notifications.filter((n) => !n.isRead).length} mới
                      </span>
                    </div>
                    {notifications.some((n) => !n.isRead) && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                      >
                        Đọc tất cả
                      </button>
                    )}
                  </div>

                  {/* List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`px-5 py-4 hover:bg-slate-50 transition-all cursor-default ${!n.isRead ? "bg-rose-50/40" : ""}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${!n.isRead ? "bg-rose-500" : "bg-slate-200"}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-[11px] font-black text-slate-900 leading-snug">{n.title}</span>
                                <span className="text-[9px] font-mono font-bold text-slate-400 shrink-0">{n.time}</span>
                              </div>
                              <p className="text-[11px] font-medium text-slate-600 leading-relaxed">{n.message}</p>
                              {n.userName && (
                                <p className="text-[10px] font-bold text-slate-400 mt-1">👤 {n.userName}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-10 text-center text-xs font-bold text-slate-400">
                        🔔 Chưa có thông báo mới nào
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 text-center">
                      <span className="text-[10px] font-bold text-slate-400">{notifications.length} thông báo tổng cộng</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-6 w-px bg-hairline mx-3"></div>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-3 p-1 rounded-2xl hover:bg-surface-secondary transition-all outline-hidden group cursor-pointer">
                <div className="relative">
                  <Avatar className="w-9 h-9 border border-hairline rounded-xl shadow-xs transition-transform group-hover:scale-105">
                    <AvatarImage
                      src={`https://i.pravatar.cc/150?u=${user.id}`}
                      className="object-cover"
                    />
                    <AvatarFallback className="font-black text-xs bg-primary text-white uppercase">
                      {user.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-white shadow-sm" />
                </div>
                <div className="hidden lg:block text-left pr-2">
                  <p className="text-[11px] font-black text-foreground leading-none uppercase tracking-tight">
                    {user.fullName}
                  </p>
                  <p className="text-[9px] text-on-surface-tertiary font-bold uppercase tracking-[0.2em] mt-1">
                    {user.role}
                  </p>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 p-2 rounded-[24px] shadow-2xl border-hairline mt-3 animate-in fade-in zoom-in-95 duration-200"
              >
                <div className="px-3 py-3 mb-1">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 rounded-xl border border-hairline">
                      <AvatarImage
                        src={`https://i.pravatar.cc/150?u=${user.id}`}
                        className="object-cover"
                      />
                      <AvatarFallback className="font-black text-xs bg-primary text-white uppercase">
                        {user.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-black text-foreground uppercase tracking-tight">
                        {user.fullName}
                      </p>
                      <p className="text-[10px] text-on-surface-tertiary font-bold uppercase tracking-[0.2em]">
                        {user.role}
                      </p>
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-hairline/50 my-1" />
                <DropdownMenuGroup>
                  <Link href="/admin/settings">
                    <DropdownMenuItem className="rounded-xl gap-3 cursor-pointer px-3 py-3 focus:bg-surface-tinted focus:text-primary-strong transition-colors">
                      <User className="w-4 h-4" />{" "}
                      <span className="font-bold text-xs uppercase tracking-wider">
                        Hồ sơ & Cài đặt
                      </span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem
                    onClick={() => setHelpOpen(true)}
                    className="rounded-xl gap-3 cursor-pointer px-3 py-3 focus:bg-surface-tinted focus:text-primary-strong transition-colors"
                  >
                    <CircleHelp className="w-4 h-4" />{" "}
                    <span className="font-bold text-xs uppercase tracking-wider">
                      Trợ giúp
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-hairline/50 my-1" />
                <DropdownMenuItem
                  onClick={() => {
                    show("ĐANG ĐĂNG XUẤT HỆ THỐNG...");
                    setTimeout(() => {
                      logout();
                      router.push("/");
                      hide();
                    }, 400);
                  }}
                  className="rounded-xl gap-3 cursor-pointer px-3 py-3 text-red-500 focus:bg-red-50 focus:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />{" "}
                  <span className="font-bold text-xs uppercase tracking-wider">
                    Đăng xuất an toàn
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger
                render={
                  <Button className="bg-primary hover:bg-primary-strong text-white rounded-2xl px-6 h-11 text-xs font-black uppercase tracking-widest shadow-md">
                    <LogIn className="w-4 h-4 mr-2" /> Đăng nhập
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-[420px] rounded-[32px] border border-slate-200/80 shadow-2xl p-8 bg-white text-slate-900 overflow-hidden">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-strong rounded-2xl flex items-center justify-center shadow-lg text-white mb-3">
                    <Stethoscope className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-blue-950">
                    MINTCARE PORTAL
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    Xác thực hệ thống an toàn
                  </p>
                </div>

                <div className="flex bg-slate-100 rounded-xl p-1 mb-5">
                  <button
                    onClick={() => {
                      setAuthTab("login");
                      setErrorMsg("");
                    }}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${authTab === "login" ? "bg-white text-primary shadow-xs" : "text-slate-400"}`}
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => {
                      setAuthTab("register");
                      setErrorMsg("");
                    }}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${authTab === "register" ? "bg-white text-primary shadow-xs" : "text-slate-400"}`}
                  >
                    Đăng ký
                  </button>
                </div>

                {errorMsg && (
                  <motion.div
                    key="header-error"
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                    className="mb-4 flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-50 border border-red-200"
                  >
                    <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center shrink-0 shadow-md shadow-red-500/30">
                      <X className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    </div>
                    <span className="text-sm font-semibold text-red-700 leading-tight">{errorMsg}</span>
                  </motion.div>
                )}

                {authTab === "login" ? (
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <Label className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                        Email
                      </Label>
                      <Input
                        type="email"
                        required
                        placeholder="admin@mintcare.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                        Mật khẩu
                      </Label>
                      <div className="relative">
                        <Input
                          type={showPass ? "text" : "password"}
                          required
                          placeholder="••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="rounded-xl pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPass ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    {errorMsg && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                        <span>{errorMsg}</span>
                      </div>
                    )}
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary-strong text-white rounded-xl py-5 text-xs font-black uppercase tracking-widest mt-2"
                    >
                      Đăng nhập
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleRegisterSubmit} className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                        Họ và tên
                      </Label>
                      <Input
                        type="text"
                        required
                        placeholder="Nguyễn Văn A"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                        Gmail
                      </Label>
                      <Input
                        type="email"
                        required
                        placeholder="ten@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                        Số điện thoại
                      </Label>
                      <Input
                        type="tel"
                        placeholder="0901234567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                        Mật khẩu
                      </Label>
                      <Input
                        type="password"
                        required
                        placeholder="Ít nhất 6 ký tự"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    {errorMsg && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                        <span>{errorMsg}</span>
                      </div>
                    )}
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary-strong text-white rounded-xl py-5 text-xs font-black uppercase tracking-widest mt-2"
                    >
                      Đăng ký tài khoản
                    </Button>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </header>

    {/* Help Dialog */}
    <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
      <DialogContent className="sm:max-w-[520px] rounded-[32px] border border-slate-200/80 shadow-2xl p-0 bg-white overflow-hidden">
        {helpSubmitted ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 space-y-5">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-black text-foreground uppercase tracking-tight text-center">
              Gửi thành công!
            </h3>
            <p className="text-xs text-on-surface-tertiary font-semibold text-center leading-relaxed">
              Yêu cầu hỗ trợ của bạn đã được gửi. Đội ngũ IT sẽ phản hồi trong vòng 24 giờ.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitHelp}>
            {/* Header */}
            <div className="bg-primary/5 px-8 pt-8 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-foreground">
                    Trung tâm hỗ trợ
                  </h3>
                  <p className="text-[10px] font-bold text-on-surface-tertiary uppercase tracking-widest mt-0.5">
                    MintCare IT Helpdesk
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-2">
                <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-slate-100">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-bold text-foreground">1900 8198</span>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-slate-100">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-bold text-foreground">it@mintcare.com</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="px-8 py-6 space-y-5">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-on-surface-tertiary">
                  Chủ đề hỗ trợ
                </Label>
                <Select value={helpTopic} onValueChange={(v) => setHelpTopic(v ?? "")}>
                  <SelectTrigger className="rounded-xl h-11 border-slate-200 text-xs font-semibold">
                    <SelectValue placeholder="Chọn vấn đề bạn gặp phải..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-2xl p-2 bg-white">
                    <SelectItem value="login" className="rounded-lg py-2.5 font-semibold text-xs">Lỗi đăng nhập / tài khoản</SelectItem>
                    <SelectItem value="booking" className="rounded-lg py-2.5 font-semibold text-xs">Vấn đề đặt lịch hẹn</SelectItem>
                    <SelectItem value="payment" className="rounded-lg py-2.5 font-semibold text-xs">Thanh toán & hóa đơn</SelectItem>
                    <SelectItem value="schedule" className="rounded-lg py-2.5 font-semibold text-xs">Lịch trực & phân công</SelectItem>
                    <SelectItem value="patient" className="rounded-lg py-2.5 font-semibold text-xs">Quản lý bệnh nhân</SelectItem>
                    <SelectItem value="report" className="rounded-lg py-2.5 font-semibold text-xs">Báo cáo & thống kê</SelectItem>
                    <SelectItem value="other" className="rounded-lg py-2.5 font-semibold text-xs">Vấn đề khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-on-surface-tertiary">
                    Email liên hệ
                  </Label>
                  <Input
                    type="email"
                    required
                    placeholder="email@mintcare.com"
                    value={helpEmail}
                    onChange={(e) => setHelpEmail(e.target.value)}
                    className="rounded-xl h-11 text-xs font-semibold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-on-surface-tertiary">
                    Số điện thoại
                  </Label>
                  <Input
                    type="tel"
                    placeholder="0901 234 567"
                    value={helpPhone}
                    onChange={(e) => setHelpPhone(e.target.value)}
                    className="rounded-xl h-11 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-on-surface-tertiary">
                  Mô tả vấn đề
                </Label>
                <Textarea
                  required
                  placeholder="Nhập chi tiết vấn đề bạn đang gặp phải..."
                  value={helpMessage}
                  onChange={(e) => setHelpMessage(e.target.value)}
                  className="rounded-xl border-slate-200 min-h-[120px] text-xs font-semibold resize-none"
                  rows={4}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] text-on-surface-tertiary font-semibold">
                <MessageSquare className="w-3.5 h-3.5" />
                Phản hồi trong 24 giờ
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setHelpOpen(false)}
                  className="rounded-xl h-10 px-5 text-[10px] font-bold border-slate-200"
                >
                  Đóng
                </Button>
                <Button
                  type="submit"
                  disabled={!helpTopic || !helpEmail || !helpMessage}
                  className="bg-primary hover:bg-primary-strong text-white rounded-xl h-10 px-6 text-[10px] font-black uppercase tracking-widest shadow-md shadow-primary/20 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5 mr-2" />
                  Gửi yêu cầu
                </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>

    {/* FULLSCREEN GPS MAP OVERLAY - Portal vào body, phủ 100% màn hình */}
    <BodyPortal>
      {isMapOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99999, backgroundColor: "rgba(2,6,23,0.97)", display: "flex", flexDirection: "column", padding: "20px", gap: "16px", overflow: "hidden" }}>
          
          {/* Header GPS Map */}
          <div className="flex items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-3xl shadow-2xl shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block">Trung tâm điều phối quốc gia</span>
                <h2 className="text-xl font-black text-white tracking-tight">BẢN ĐỒ GPS ĐIỀU PHỐI • MINTCARE COMMAND CENTER</h2>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-slate-800 p-1 rounded-2xl flex items-center gap-1 border border-slate-700 text-xs font-bold text-slate-300">
                <button onClick={() => setMapStyle("voyager")} className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${mapStyle === "voyager" ? "bg-emerald-600 text-white font-black" : "hover:text-white"}`}>Vệ tinh / Phố</button>
                <button onClick={() => setMapStyle("dark")} className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${mapStyle === "dark" ? "bg-slate-950 text-white font-black border border-slate-700" : "hover:text-white"}`}>Chế độ Tối</button>
              </div>
              <button onClick={() => { if (mapInstanceRef.current) { mapInstanceRef.current.setView([10.4573, 105.6338], 10); setTimeout(() => mapInstanceRef.current?.invalidateSize(), 100); } }} className="px-4 py-2 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 rounded-2xl text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-md" title="Đặt lại bản đồ theo lịch hôm nay">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Lịch Hôm Nay ({new Date().toLocaleDateString("vi-VN")})</span>
              </button>
              <button onClick={() => { if (mapInstanceRef.current) { mapInstanceRef.current.setView([10.4573, 105.6338], 10); setTimeout(() => mapInstanceRef.current?.invalidateSize(), 100); } }} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl text-xs font-extrabold flex items-center gap-2 cursor-pointer">
                <RefreshCw className="w-4 h-4 text-emerald-400" />Đồng Tháp
              </button>
              <button onClick={() => { setIsMapOpen(false); if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } }} className="w-11 h-11 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 rounded-2xl flex items-center justify-center cursor-pointer" title="Đóng (Esc)">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Body: Sidebar + Map */}
          <div className="flex-1 flex gap-4 min-h-0">
            {/* Sidebar trái */}
            <div className="w-80 md:w-96 bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex flex-col shadow-2xl shrink-0">
              <div className="relative mb-4">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input type="text" value={mapSearchQuery} onChange={e => setMapSearchQuery(e.target.value)} placeholder="Tìm nhân viên, bệnh nhân, địa điểm..." className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-400 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold focus:outline-none focus:border-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-2 bg-slate-800/80 p-1 rounded-2xl border border-slate-700 mb-4 text-xs font-extrabold">
                <button onClick={() => setMapActiveTab("staff")} className={`py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer ${mapActiveTab === "staff" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"}`}>
                  <Users className="w-3.5 h-3.5" /><span>Nhân viên ({filteredMapStaff.length})</span>
                </button>
                <button onClick={() => setMapActiveTab("visits")} className={`py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer ${mapActiveTab === "visits" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"}`}>
                  <MapPin className="w-3.5 h-3.5" /><span>Lịch hẹn ({filteredMapVisits.length})</span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {mapActiveTab === "staff" ? filteredMapStaff.map((st, idx) => {
                  const isAvail = st.available !== false && !st.status?.toLowerCase().includes("bận");
                  return (
                    <div key={st.id || idx} onClick={() => {
                      const c = getHeaderCoords(st.location || st.serviceArea, idx);
                      mapInstanceRef.current?.flyTo([c.lat, c.lng], 16, { duration: 1.2 });
                      setTimeout(() => markersRef.current[`staff-${st.id}`]?.marker?.openPopup(), 1300);
                    }} className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 rounded-2xl cursor-pointer flex items-center justify-between group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <img src={st.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(st.name)}&background=10b981&color=fff`} className="w-10 h-10 rounded-xl object-cover border border-slate-600" />
                          <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${isAvail ? "bg-emerald-500" : "bg-amber-500"}`} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 truncate">{st.name}</h4>
                          <p className="text-[10px] text-slate-400 truncate">{st.role || "Chuyên gia"}</p>
                          <p className="text-[9px] text-emerald-400/90 truncate mt-0.5">📍 {st.location || "Đồng Tháp"}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 group-hover:text-white bg-slate-700/60 px-2 py-1 rounded-lg shrink-0">Định vị ➔</span>
                    </div>
                  );
                }) : filteredMapVisits.map((v, idx) => {
                  const statusText = v.status || "Chờ duyệt";
                  const badgeStyle = statusText === "Chờ duyệt" ? "text-amber-400 bg-amber-950/60 border-amber-700" :
                                     statusText === "Đã xác nhận" ? "text-blue-400 bg-blue-950/60 border-blue-700" :
                                     statusText === "Đã hoàn tất" ? "text-emerald-400 bg-emerald-950/60 border-emerald-700" :
                                     "text-rose-400 bg-rose-950/60 border-rose-700";
                  return (
                    <div key={v.id || idx} onClick={() => {
                      const c = getHeaderCoords(v.address || v.customerArea, idx + 10);
                      mapInstanceRef.current?.flyTo([c.lat, c.lng], 16, { duration: 1.2 });
                      setTimeout(() => markersRef.current[`visit-${v.id}`]?.marker?.openPopup(), 1300);
                    }} className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/50 rounded-2xl cursor-pointer flex items-center justify-between group">
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[9px] font-mono text-blue-300 bg-blue-900/60 px-1.5 py-0.5 rounded border border-blue-700">#{v.id}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${badgeStyle}`}>{statusText}</span>
                        </div>
                        <h4 className="text-xs font-bold text-white group-hover:text-blue-400 truncate">{v.patientName || v.userName || "Bệnh nhân"}</h4>
                        <p className="text-[10px] text-slate-300 truncate mt-0.5">📍 {v.address || "Đồng Tháp"}</p>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 group-hover:text-white bg-slate-700/60 px-2 py-1 rounded-lg shrink-0">Định vị ➔</span>
                    </div>
                  );
                })}
              </div>
              <div className="pt-3 border-t border-slate-800 mt-2 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                <span>Mạng lưới MintCare GPS</span>
                <span className="text-emerald-400">● Hoạt động 100%</span>
              </div>
            </div>

            {/* Bản đồ Leaflet */}
            <div className="flex-1 bg-slate-900 rounded-3xl relative overflow-hidden border border-slate-800 shadow-2xl">
              <div ref={mapContainerRef} className="absolute inset-0 w-full h-full bg-slate-900" />
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-1">
                <div className="bg-slate-900/90 backdrop-blur border border-slate-700 p-1.5 rounded-2xl shadow-xl flex flex-col gap-1">
                  <button onClick={() => mapInstanceRef.current?.zoomIn()} className="w-10 h-10 rounded-xl hover:bg-slate-800 flex items-center justify-center text-white cursor-pointer"><ZoomIn className="w-5 h-5" /></button>
                  <div className="h-px bg-slate-800 mx-1" />
                  <button onClick={() => mapInstanceRef.current?.zoomOut()} className="w-10 h-10 rounded-xl hover:bg-slate-800 flex items-center justify-center text-white cursor-pointer"><ZoomOut className="w-5 h-5" /></button>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </BodyPortal>

    </>
  );
}
