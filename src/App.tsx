/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  Heart, 
  School, 
  Lock, 
  Menu, 
  Bell, 
  Search, 
  Home, 
  Navigation, 
  Car, 
  User, 
  History, 
  Settings, 
  Headphones, 
  LogOut, 
  CreditCard,
  Plus,
  ArrowRight,
  Info,
  MapPin,
  Check,
  CheckCircle2,
  X,
  MessageCircle,
  Users,
  Train,
  Store,
  ShoppingCart,
  Timer,
  AlertTriangle,
  Share2,
  ChevronRight,
  Wallet,
  Smartphone,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ViewType, Party, RideHistoryItem, PaymentMethod, NotificationItem } from './types';

// Moata Logo Component (Car outline with 'M' bottom)
const MoataLogo = ({ 
  className = "w-6 h-6", 
  fill = "none",
  stroke = "currentColor",
  strokeWidth = 7 
}: { 
  className?: string; 
  fill?: string; 
  stroke?: string; 
  strokeWidth?: number 
}) => (
  <svg
    viewBox="15 45 395 200"
    className={className}
    fill={fill}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M 33,226 L 33,139 Q 33,118 52,111 L 94,104 Q 106,102 112,91 L 124,73 Q 137,58 156,58 L 280,58 Q 300,58 312,73 L 324,91 Q 330,102 343,104 L 376,111 Q 393,115 393,139 L 393,226 L 311,226 L 303,171 L 218,214 L 124,171 L 115,226 Z"
      fill={fill === "none" ? "none" : fill}
      stroke={stroke}
      strokeWidth={strokeWidth > 1 ? strokeWidth * 2.8 : strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fillRule="evenodd"
    />
  </svg>
);

// GPS Coordinates & Taxi Fare Calculation Engine
interface LocationCoords {
  lat: number;
  lng: number;
  name: string;
}

const LANDMARKS: { [key: string]: LocationCoords } = {
  '정문': { lat: 34.9681, lng: 127.4792, name: '순천대학교 정문' },
  '후문': { lat: 34.9698, lng: 127.4815, name: '순천대학교 후문' },
  '도서관': { lat: 34.9686, lng: 127.4795, name: '순천대학교 도서관' },
  '공과대학': { lat: 34.9675, lng: 127.4805, name: '공과대학' },
  '학생회관': { lat: 34.9690, lng: 127.4788, name: '학생회관' },
  '순천역': { lat: 34.9457, lng: 127.5034, name: '순천역' },
  '시내': { lat: 34.9585, lng: 127.4831, name: '중앙동 (시내)' },
  '중앙동': { lat: 34.9585, lng: 127.4831, name: '중앙동 (시내)' },
  '연향동': { lat: 34.9510, lng: 127.5140, name: '연향동' },
  '조례동': { lat: 34.9580, lng: 127.5270, name: '조례동' },
  '국가정원': { lat: 34.9315, lng: 127.5020, name: '순천만 국가정원' },
  '습지': { lat: 34.8970, lng: 127.5090, name: '순천만 습지' },
  '이마트': { lat: 34.9485, lng: 127.5115, name: '이마트' },
  '홈플러스': { lat: 34.9535, lng: 127.5180, name: '홈플러스' },
  '메가박스': { lat: 34.9560, lng: 127.5120, name: '메가박스' },
  '호수공원': { lat: 34.9650, lng: 127.5150, name: '조례 호수공원' },
  '웃장': { lat: 34.9595, lng: 127.4800, name: '웃장' },
  '아랫장': { lat: 34.9490, lng: 127.4855, name: '아랫장' },
  '법원': { lat: 34.9610, lng: 127.5210, name: '법원 사거리' }
};

const DEFAULT_ORIGIN = { lat: 34.9681, lng: 127.4792, name: '순천대학교 정문' };
const DEFAULT_DESTINATION = { lat: 34.9457, lng: 127.5034, name: '순천역' };

function findCoords(text: string, isOrigin = true): LocationCoords {
  if (!text) return isOrigin ? DEFAULT_ORIGIN : DEFAULT_DESTINATION;
  for (const key of Object.keys(LANDMARKS)) {
    if (text.toLowerCase().includes(key)) {
      return LANDMARKS[key];
    }
  }
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  const latOffset = Math.abs(hash % 100) / 2500;
  const lngOffset = Math.abs((hash >> 4) % 100) / 2000;
  const base = isOrigin ? DEFAULT_ORIGIN : DEFAULT_DESTINATION;
  return {
    lat: base.lat + latOffset - 0.02,
    lng: base.lng + lngOffset - 0.025,
    name: text
  };
}

const REAL_ROUTE_DATA: { [key: string]: { [key: string]: { distance: number, fare: number, time: number } } } = {
  '정문': {
    '순천역': { distance: 4.2, fare: 6400, time: 10 },
    '시내': { distance: 1.6, fare: 4300, time: 5 },
    '중앙동': { distance: 1.6, fare: 4300, time: 5 },
    '연향동': { distance: 5.1, fare: 7500, time: 12 },
    '조례동': { distance: 5.8, fare: 8300, time: 13 },
    '국가정원': { distance: 6.8, fare: 9500, time: 15 },
    '습지': { distance: 11.2, fare: 14800, time: 22 },
    '이마트': { distance: 4.9, fare: 7300, time: 11 },
    '홈플러스': { distance: 5.3, fare: 7700, time: 12 },
    '메가박스': { distance: 4.8, fare: 7100, time: 11 },
    '호수공원': { distance: 4.5, fare: 6800, time: 10 },
    '웃장': { distance: 1.0, fare: 4300, time: 3 },
    '아랫장': { distance: 3.1, fare: 5600, time: 8 },
    '법원': { distance: 5.5, fare: 8000, time: 13 },
  },
  '후문': {
    '순천역': { distance: 4.5, fare: 6800, time: 11 },
    '시내': { distance: 1.9, fare: 4300, time: 6 },
    '중앙동': { distance: 1.9, fare: 4300, time: 6 },
    '연향동': { distance: 4.9, fare: 7300, time: 12 },
    '조례동': { distance: 5.5, fare: 8000, time: 13 },
    '국가정원': { distance: 7.1, fare: 9800, time: 16 },
    '습지': { distance: 11.5, fare: 15200, time: 23 },
    '이마트': { distance: 5.1, fare: 7500, time: 12 },
    '홈플러스': { distance: 5.1, fare: 7500, time: 12 },
    '메가박스': { distance: 4.5, fare: 6800, time: 10 },
    '호수공원': { distance: 4.2, fare: 6400, time: 10 },
    '웃장': { distance: 1.3, fare: 4300, time: 4 },
    '아랫장': { distance: 3.4, fare: 6000, time: 9 },
    '법원': { distance: 5.2, fare: 7700, time: 12 },
  },
  '도서관': {
    '순천역': { distance: 4.3, fare: 6500, time: 10 },
    '시내': { distance: 1.7, fare: 4300, time: 5 },
    '중앙동': { distance: 1.7, fare: 4300, time: 5 },
    '연향동': { distance: 5.0, fare: 7400, time: 12 },
    '조례동': { distance: 5.7, fare: 8200, time: 13 },
    '국가정원': { distance: 6.9, fare: 9600, time: 15 },
    '습지': { distance: 11.3, fare: 14900, time: 22 },
    '이마트': { distance: 5.0, fare: 7400, time: 11 },
    '홈플러스': { distance: 5.2, fare: 7600, time: 12 },
    '메가박스': { distance: 4.7, fare: 7000, time: 11 },
    '호수공원': { distance: 4.4, fare: 6700, time: 10 },
    '웃장': { distance: 1.1, fare: 4300, time: 3 },
    '아랫장': { distance: 3.2, fare: 5700, time: 8 },
    '법원': { distance: 5.4, fare: 7900, time: 13 },
  },
  '공과대학': {
    '순천역': { distance: 4.1, fare: 6300, time: 10 },
    '시내': { distance: 1.5, fare: 4300, time: 5 },
    '중앙동': { distance: 1.5, fare: 4300, time: 5 },
    '연향동': { distance: 5.2, fare: 7600, time: 12 },
    '조례동': { distance: 5.9, fare: 8400, time: 14 },
    '국가정원': { distance: 6.7, fare: 9400, time: 14 },
    '습지': { distance: 11.1, fare: 14700, time: 21 },
    '이마트': { distance: 4.8, fare: 7200, time: 11 },
    '홈플러스': { distance: 5.4, fare: 7800, time: 13 },
    '메가박스': { distance: 4.9, fare: 7200, time: 11 },
    '호수공원': { distance: 4.6, fare: 6900, time: 11 },
    '웃장': { distance: 0.9, fare: 4300, time: 3 },
    '아랫장': { distance: 3.0, fare: 5500, time: 8 },
    '법원': { distance: 5.6, fare: 8100, time: 13 },
  },
  '학생회관': {
    '순천역': { distance: 4.4, fare: 6600, time: 11 },
    '시내': { distance: 1.8, fare: 4300, time: 6 },
    '중앙동': { distance: 1.8, fare: 4300, time: 6 },
    '연향동': { distance: 4.9, fare: 7300, time: 12 },
    '조례동': { distance: 5.6, fare: 8100, time: 13 },
    '국가정원': { distance: 7.0, fare: 9700, time: 16 },
    '습지': { distance: 11.4, fare: 15100, time: 23 },
    '이마트': { distance: 5.0, fare: 7400, time: 12 },
    '홈플러스': { distance: 5.1, fare: 7500, time: 12 },
    '메가박스': { distance: 4.6, fare: 6900, time: 10 },
    '호수공원': { distance: 4.3, fare: 6500, time: 10 },
    '웃장': { distance: 1.2, fare: 4300, time: 4 },
    '아랫장': { distance: 3.3, fare: 5900, time: 9 },
    '법원': { distance: 5.3, fare: 7800, time: 12 },
  }
};

export function getKakaoMapUrl(originText: string, destText: string): string {
  const start = originText || '순천대학교 정문';
  const end = destText || '순천역';
  return `https://map.kakao.com/?sName=${encodeURIComponent(start)}&eName=${encodeURIComponent(end)}`;
}

export function calculateTaxiMetrics(originText: string, destText: string) {
  const origin = findCoords(originText, true);
  const dest = findCoords(destText, false);

  // Look for exact/substring matches in of our precalculated highly accurate real Kakao Map routes
  let matchedOriginKey = '';
  let matchedDestKey = '';

  for (const originKey of Object.keys(REAL_ROUTE_DATA)) {
    if (originText.toLowerCase().includes(originKey)) {
      matchedOriginKey = originKey;
      break;
    }
  }

  // If no landmarks match starting point but keywords are SCNU, key off '정문'
  if (!matchedOriginKey && (originText.toLowerCase().includes('순천대') || originText.toLowerCase().includes('학교'))) {
    matchedOriginKey = '정문';
  }

  if (matchedOriginKey) {
    const destDb = REAL_ROUTE_DATA[matchedOriginKey];
    for (const destKey of Object.keys(destDb)) {
      if (destText.toLowerCase().includes(destKey)) {
        matchedDestKey = destKey;
        break;
      }
    }
    if (matchedDestKey) {
      const match = destDb[matchedDestKey];
      return {
        origin,
        dest,
        distance: match.distance,
        totalFare: match.fare,
        travelTime: match.time,
        isPrecise: true
      };
    }
  }

  const R = 6371; // Earth radius in km
  const dLat = (dest.lat - origin.lat) * Math.PI / 180;
  const dLon = (dest.lng - origin.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(origin.lat * Math.PI / 180) * Math.cos(dest.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const straightDistance = R * c;
  const roadDistance = Math.max(0.3, straightDistance * 1.38); // driving path coefficient
  
  const baseFare = 4300;
  const baseDistance = 2.0; 
  const distanceRate = 130; 
  const fareRate = 100;
  
  let totalFare = baseFare;
  if (roadDistance > baseDistance) {
    const extraDistanceMeters = (roadDistance - baseDistance) * 1000;
    const extraCharge = Math.ceil(extraDistanceMeters / distanceRate) * fareRate;
    totalFare += extraCharge;
  }
  if (roadDistance > 1.5) {
    totalFare = totalFare * 1.08;
  }
  totalFare = Math.round(totalFare / 100) * 100;
  const averageSpeedKmh = 26;
  const travelTimeMinutes = Math.max(2, Math.round((roadDistance / averageSpeedKmh) * 60 + 2));
  
  return {
    origin,
    dest,
    distance: Number(roadDistance.toFixed(2)),
    totalFare,
    travelTime: travelTimeMinutes,
    isPrecise: false
  };
}

// Mock Data
const MOCK_PARTIES: Party[] = [
  {
    id: '1',
    destination: '순천역',
    icon: 'train',
    mannerIndex: 92,
    members: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
    ],
    maxMembers: 4,
    currentMembers: 3,
    estimatedPrice: 2000,
    status: '3/4 명 탑승 중'
  },
  {
    id: '2',
    destination: '시내 (중앙동)',
    icon: 'store',
    mannerIndex: 88,
    members: [
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
    ],
    maxMembers: 4,
    currentMembers: 2,
    estimatedPrice: 2200,
    status: '2/4 Full'
  },
  {
    id: '3',
    destination: '이마트',
    icon: 'shopping-cart',
    mannerIndex: 98,
    members: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop'
    ],
    maxMembers: 4,
    currentMembers: 1,
    estimatedPrice: 6200,
    status: '1/4 Full'
  }
];

const MOCK_HISTORY: RideHistoryItem[] = [
  {
    id: 'h1',
    date: '11.02 (목)',
    time: '22:30',
    origin: 'SCNU Main Gate',
    destination: 'Suncheon Station',
    members: 3,
    price: 1500,
    status: 'completed'
  },
  {
    id: 'h2',
    date: '10.28 (토)',
    time: '19:15',
    origin: 'SCNU Library',
    destination: 'E-mart Suncheon',
    members: 4,
    price: 1200,
    status: 'completed'
  },
  {
    id: 'h3',
    date: '10.15 (일)',
    time: '23:50',
    origin: 'Yeonhyang-dong',
    destination: 'SCNU Dormitory',
    members: 2,
    price: 2000,
    status: 'completed'
  }
];

export const SidebarContext = React.createContext<{ 
  openSidebar: () => void;
  openNotifications: () => void;
  unreadCount: number;
}>({
  openSidebar: () => {},
  openNotifications: () => {},
  unreadCount: 0,
});

// Layout Components
const Header = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const { openSidebar, openNotifications, unreadCount } = React.useContext(SidebarContext);
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-surface-container-high">
      <div className="max-w-5xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
        <button onClick={onMenuClick || openSidebar} className="p-2 hover:bg-surface-container transition-colors rounded-full">
          <Menu size={24} className="text-outline" />
        </button>
        <div className="flex items-center text-primary select-none">
          <MoataLogo className="w-8 h-6" strokeWidth={8.5} fill="none" />
        </div>
        <button 
          onClick={openNotifications}
          className="p-2 hover:bg-surface-container transition-colors rounded-full relative active:scale-95 transition-transform"
        >
          <Bell size={24} className="text-outline" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[15px] h-[15px] px-1 bg-error rounded-full border border-white text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

const LeftDrawer = ({ 
  isOpen, 
  onClose, 
  setView, 
  currentView 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  setView: (v: ViewType) => void;
  currentView: ViewType;
}) => {
  const menuItems = [
    { id: 'home', label: '공동 지출 홈', icon: Home },
    { id: 'history', label: '이용 내역', icon: History },
    { id: 'payment', label: '결제 수단 관리', icon: Wallet },
    { id: 'profile', label: '마이 페이지', icon: User },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] pointer-events-none">
          <div className="max-w-5xl mx-auto h-full relative pointer-events-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 z-40 backdrop-blur-xs"
              onClick={onClose}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="absolute top-0 bottom-0 left-0 w-4/5 max-w-[280px] bg-white z-50 flex flex-col shadow-2xl border-r border-surface-container-high"
            >
              {/* Profile Header */}
              <div className="p-6 bg-gradient-to-b from-primary/5 to-transparent border-b border-surface-container-high relative">
                <button 
                  onClick={onClose}
                  className="absolute top-4 right-4 w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center text-outline hover:text-on-surface transition-colors"
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
                
                <div className="flex items-center gap-3 mt-4 mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" 
                    className="w-12 h-12 rounded-full border border-white shadow-md object-cover" 
                    alt="Profile" 
                  />
                  <div>
                    <h4 className="text-base font-black text-on-surface">김순천</h4>
                    <p className="text-[10px] text-outline font-bold flex items-center gap-0.5 mt-0.5">
                      <School size={10} /> Business Admin
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-3 flex justify-between items-center border border-surface-container shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                      <Smartphone size={12} />
                    </div>
                    <span className="text-[10px] font-bold text-on-surface">모아타 지수</span>
                  </div>
                  <span className="text-xs font-black text-secondary">36.5°C</span>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="flex-1 py-4 px-3 space-y-1">
                {menuItems.map((item) => {
                  const isActive = currentView === item.id || (item.id === 'home' && currentView === 'parties');
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setView(item.id as ViewType);
                        onClose();
                      }}
                      className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all ${
                        isActive 
                          ? 'bg-primary/5 text-primary font-black shadow-inner-sm' 
                          : 'text-on-surface-variant hover:bg-surface-container-low font-bold hover:text-on-surface'
                      }`}
                    >
                      <Icon size={20} className={isActive ? 'text-primary' : 'text-outline'} />
                      <span className="text-sm">{item.label}</span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 bg-primary rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 bg-surface-container-low/50 border-t border-surface-container mt-auto">
                <button
                  onClick={() => {
                     setView('profile');
                     onClose();
                  }}
                  className="w-full bg-white hover:bg-surface-container-high border border-surface-container-highest px-3 py-2.5 rounded-xl flex items-center justify-center gap-2 text-outline hover:text-on-surface transition-all text-xs font-bold shadow-sm"
                >
                  <Settings size={14} />
                  설정 및 로그아웃
                </button>
                <p className="text-[9px] text-[#A2A4B0] text-center mt-3 font-medium select-none">
                  Moata v1.1.0 • 함께타는 순천 택시
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

const NotificationsDrawer = ({ 
  isOpen, 
  onClose, 
  notifications,
  onRemove,
  onMarkRead,
  onClearAll 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  notifications: NotificationItem[];
  onRemove: (id: string) => void;
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] pointer-events-none">
          <div className="max-w-5xl mx-auto h-full relative pointer-events-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 z-40 backdrop-blur-xs"
              onClick={onClose}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="absolute top-0 bottom-0 right-0 w-11/12 max-w-[340px] bg-white z-50 flex flex-col shadow-2xl border-l border-surface-container-high"
            >
              {/* Header */}
              <div className="p-5 border-b border-surface-container-high flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-on-surface">알림 내역</h3>
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="bg-error/10 text-error px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse">
                      {notifications.filter(n => !n.isRead).length}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <button 
                      onClick={onClearAll}
                      className="text-xs font-bold text-outline hover:text-error transition-colors px-1.5 py-1 rounded-md hover:bg-error/5"
                    >
                      모두 지우기
                    </button>
                  )}
                  <button 
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-outline hover:text-on-surface transition-colors"
                  >
                    <X size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                <AnimatePresence initial={false}>
                  {notifications.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="h-[80%] flex flex-col items-center justify-center text-center py-12 px-4"
                    >
                      <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-outline/40 mb-4 animate-bounce">
                        <Bell size={28} className="text-outline-variant" />
                      </div>
                      <p className="text-sm font-black text-on-surface">새로운 알림이 없습니다</p>
                      <p className="text-xs text-outline mt-1.5 max-w-[200px] leading-relaxed">
                        모아타의 파티 매칭 및 공동 정산 소식을 여기서 편리하게 받아보세요!
                      </p>
                    </motion.div>
                  ) : (
                    notifications.map((item) => {
                      const isUnread = !item.isRead;
                      
                      // Icon selection
                      let IconComponent = Info;
                      let iconColor = 'text-primary bg-primary/5';
                      if (item.type === 'party') {
                        IconComponent = Users;
                        iconColor = 'text-secondary bg-secondary/5';
                      } else if (item.type === 'success') {
                        IconComponent = CheckCircle2;
                        iconColor = 'text-tertiary bg-tertiary/5';
                      } else if (item.type === 'warning') {
                        IconComponent = AlertTriangle;
                        iconColor = 'text-error bg-error/5';
                      }

                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, x: 50, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => onMarkRead(item.id)}
                          className={`p-4 rounded-2xl border transition-all relative flex gap-3 h-fit cursor-pointer ${
                            isUnread 
                              ? 'bg-gradient-to-br from-primary/[0.03] to-transparent border-primary/20 shadow-xs' 
                              : 'bg-white border-surface-container hover:bg-surface-container-low/70'
                          }`}
                        >
                          {/* Left Icon */}
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${iconColor}`}>
                            <IconComponent size={18} />
                          </div>

                          {/* Center Content */}
                          <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className={`text-xs font-black truncate text-on-surface`}>
                                {item.title}
                              </h4>
                              {isUnread && (
                                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                              )}
                            </div>
                            <p className="text-[11px] font-semibold text-outline mt-1 leading-relaxed">
                              {item.description}
                            </p>
                            <span className="text-[9px] font-black text-outline-variant mt-2 block">
                              {item.time}
                            </span>
                          </div>

                          {/* Right Action: Delete Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemove(item.id);
                            }}
                            className="absolute top-3 right-3 w-5 h-5 rounded-full hover:bg-surface-container flex items-center justify-center text-outline hover:text-on-surface transition-colors"
                          >
                            <X size={10} strokeWidth={2.5} />
                          </button>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-surface-container bg-surface-container-low/30 text-center text-[10px] text-outline font-medium select-none">
                안내된 알림 내역은 안전 기기로 보호됩니다.
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

const BottomNav = ({ active, setView }: { active: ViewType; setView: (v: ViewType) => void }) => {
  const items = [
    { id: 'home', label: '홈', icon: Home },
    { id: 'history', label: '이용내역', icon: History },
    { id: 'profile', label: '마이페이지', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-surface-container shadow-[0_-4px_12px_rgba(0,0,0,0.05)] rounded-t-2xl">
      <div className="max-w-2xl mx-auto px-4 pb-6 pt-2 flex justify-around items-center">
        {items.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setView(id as ViewType)}
            className={`flex flex-col items-center justify-center px-3 py-1 transition-all ${
              active === id || (id === 'home' && (active === 'parties' || active === 'home'))
                ? 'text-primary bg-primary/5 rounded-xl' 
                : 'text-outline hover:text-primary transition-colors'
            }`}
          >
            <Icon size={24} className="mb-0.5" />
            <span className="text-[11px] font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

// Screen Components
const LandingScreen = ({ onStart }: { onStart: () => void }) => (
  <div className="min-h-screen bg-white flex flex-col items-center p-8 relative font-sans overflow-hidden">
    {/* SCNU Branding Background */}
    <div className="absolute top-0 left-0 w-full h-[50%] bg-[#3D5AFE] rounded-b-[40px] shadow-2xl flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Decorative patterns */}
      <div className="absolute top-[-10%] right-[-20%] w-80 h-80 bg-white/5 rounded-full" />
      <div className="absolute bottom-[-10%] left-[-20%] w-64 h-64 bg-white/5 rounded-full" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 z-10"
      >
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl mb-2 p-1">
          <MoataLogo className="w-[58px] h-[44px] text-[#3D5AFE]" strokeWidth={8.5} fill="none" />
        </div>
        <div className="text-center flex flex-col items-center">
          <div className="flex items-end justify-center gap-[2px] mb-2 text-white">
            <MoataLogo className="w-14 h-10 text-white relative -bottom-[2px]" strokeWidth={8.5} fill="none" />
            <h1 className="text-[42px] font-black tracking-tighter leading-none lowercase">oata</h1>
          </div>
          <div className="h-0.5 w-10 bg-white/30 mx-auto mb-2" />
          <p className="text-white/80 text-[11px] font-bold tracking-[0.2em] uppercase">SCNU SAFE RIDE</p>
        </div>
      </motion.div>
    </div>

    <div className="flex-1 flex flex-col items-center justify-end w-full max-w-[340px] space-y-8 mb-12 z-20">
      {/* Social Login Icons Section */}
      <div className="w-full flex flex-col items-center space-y-10">
        <div className="flex items-center justify-center gap-6">
          {/* Kakao Circle */}
          <button 
            onClick={onStart}
            className="w-14 h-14 bg-[#FAE100] rounded-full flex items-center justify-center shadow-lg shadow-amber-200/40 active:scale-90 transition-all"
          >
            <MessageCircle size={24} className="text-[#3C1E1E]" fill="currentColor" />
          </button>

          {/* Naver Circle */}
          <button 
            onClick={onStart}
            className="w-14 h-14 bg-[#03C75A] rounded-full flex items-center justify-center shadow-lg shadow-green-200/40 active:scale-90 transition-all"
          >
            <span className="text-white font-black text-2xl leading-none">N</span>
          </button>

          {/* Google Circle */}
          <button 
            onClick={onStart}
            className="w-14 h-14 bg-white border border-surface-container-high rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
          </button>
        </div>

        {/* Action Links */}
        <div className="flex flex-col items-center space-y-6">
          <div className="flex items-center gap-6 text-[13px] font-bold text-outline">
            <button onClick={onStart} className="hover:text-[#3D5AFE] transition-colors">이메일로 로그인</button>
            <div className="w-px h-3 bg-surface-container-high" />
            <button onClick={onStart} className="hover:text-[#3D5AFE] transition-colors">이메일로 가입</button>
          </div>

          <button className="text-[12px] font-bold text-outline/40 hover:text-outline transition-colors italic">
            로그인에 문제가 있으신가요?
          </button>
        </div>
      </div>
    </div>

    {/* Footer */}
    <div className="mt-auto pb-6 text-center">
      <p className="text-[10px] text-outline/30 font-bold uppercase tracking-widest">
        순천대학교 안전 귀가 모아타
      </p>
    </div>
  </div>
);

const MOCK_DESTINATIONS = [
  '순천역', '중앙동 (시내)', '연향동', '조례동', 
  '순천만 국가정원', '순천만 습지', '이마트', '홈플러스', '메가박스',
  '순천대학교 도서관', '공과대학', '학생회관', '조례 호수공원',
  '웃장', '아랫장', '순천대학교 후문', '법원 사거리'
];

const MOCK_STATUSES = [
  { text: '곧 출발 (2분 남음)', type: 'urgent' },
  { text: '곧 출발 (5분 남음)', type: 'urgent' },
  { text: '여유 (12분 뒤)', type: 'relaxed' },
  { text: '모집 중 (15분 뒤)', type: 'relaxed' }
];

const HomeScreen = ({ setView, selectedZone, setSelectedZone, selectedDestination, setSelectedDestination }: { setView: (v: ViewType) => void, selectedZone: string, setSelectedZone: (s: string) => void, selectedDestination: string, setSelectedDestination: (d: string) => void }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  const [searchTerm, setSearchTerm] = useState('');
  const [searchZone, setSearchZone] = useState('');
  const [searchDestination, setSearchDestination] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  
  const [apiMetrics, setApiMetrics] = useState<{
    distance: number;
    travelTime: number;
    totalFare: number;
    isRealApi: boolean;
    isPreprocessorMapped: boolean;
  } | null>(null);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchApiFare = async (origin: string, dest: string) => {
    setIsApiLoading(true);
    setApiError(null);
    try {
      const response = await fetch(`/api/fare-estimate?originText=${encodeURIComponent(origin)}&destText=${encodeURIComponent(dest)}`);
      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.message || '서버 호출 실패');
      }
      const data = await response.json();
      if (data.status === 'success') {
        setApiMetrics({
          distance: data.metrics.distance,
          travelTime: data.metrics.travelTime,
          totalFare: data.metrics.totalFare,
          isRealApi: data.metrics.isRealApi,
          isPreprocessorMapped: data.destination.isPreprocessorMapped
        });
      } else {
        throw new Error(data.message || '요금 정보를 정산하지 못했습니다.');
      }
    } catch (err: any) {
      console.warn('[API Fetch Web Request Error]', err);
      const errMsg = err.message || '';
      
      // If it is an expected user-input/validation error from backend, display it directly in UI
      if (errMsg.includes('장소명') || errMsg.includes('동일') || errMsg.includes('출발') || errMsg.includes('도착')) {
        setApiError(errMsg);
        setApiMetrics(null);
      } else {
        // Only trigger client-side driving simulator calculation as a network/server failure fallback
        const fallback = calculateTaxiMetrics(origin, dest);
        setApiMetrics({
          distance: fallback.distance,
          travelTime: fallback.travelTime,
          totalFare: fallback.totalFare,
          isRealApi: false,
          isPreprocessorMapped: dest.replace(/\s+/g, '').includes('순천대') || dest.replace(/\s+/g, '').includes('국립순천대학교')
        });
      }
    } finally {
      setIsApiLoading(false);
    }
  };
  
  const [parties, setParties] = useState([
    {
      id: 'init-1',
      destination: '순천역',
      status: '곧 출발 (3분 남음)',
      statusType: 'urgent',
      current: 3,
      max: 4,
      price: 2000,
    },
    {
      id: 'init-2',
      destination: '시내 (중앙동)',
      status: '여유 (10분 뒤)',
      statusType: 'relaxed',
      current: 2,
      max: 4,
      price: 2200,
    },
    {
      id: 'init-3',
      destination: '이마트',
      status: '곧 출발 (5분 남음)',
      statusType: 'urgent',
      current: 1,
      max: 4,
      price: 6200,
    }
  ]);

  const handleRefresh = (forcedSearchTerm?: string | React.MouseEvent) => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    
    // Normalize search term: check if the argument is a string (provided manually) or an event (from onClick)
    const actualSearchTerm = typeof forcedSearchTerm === 'string' ? forcedSearchTerm : searchTerm;
    const searchToUse = (actualSearchTerm || '').trim();

    setTimeout(() => {
      const timestamp = Date.now();
      
      // Always generate 3-5 parties for Variety
      const count = searchToUse ? 3 : 4;
      const newParties = [...Array(count)].map((_, i) => {
        const originCoords = findCoords(selectedZone || '순천대학교 정문', true);
        const destCoordsForSearch = searchToUse ? findCoords(searchToUse, false) : null;
        const isSearchTooClose = destCoordsForSearch ? (Math.abs(originCoords.lat - destCoordsForSearch.lat) + Math.abs(originCoords.lng - destCoordsForSearch.lng) < 0.0015) : true;

        // If searching, the first one ALWAYS matches, unless it is identical/too close to the origin
        if (i === 0 && searchToUse && !isSearchTooClose) {
          const metrics = calculateTaxiMetrics(selectedZone, searchToUse);
          const currentCount = Math.floor(Math.random() * 2) + 1; // 1 or 2
          return {
            id: `search-${timestamp}-${i}`,
            destination: searchToUse,
            status: '방금 생성됨 (곧 출발)',
            statusType: 'urgent',
            current: currentCount,
            max: 4,
            price: Math.round((metrics.totalFare / currentCount) / 100) * 100
          };
        }

        const pickedStatus = MOCK_STATUSES[Math.floor(Math.random() * MOCK_STATUSES.length)];
        let dest = MOCK_DESTINATIONS[Math.floor(Math.random() * MOCK_DESTINATIONS.length)];
        
        // Ensure not too many duplicates of the search term
        if (dest === searchToUse && i > 0) {
          dest = MOCK_DESTINATIONS[(MOCK_DESTINATIONS.indexOf(dest) + 1) % MOCK_DESTINATIONS.length];
        }

        // Ensure destination has different coordinates and is not too close to the starting zone
        let attempts = 0;
        let destCoords = findCoords(dest, false);
        let distDiff = Math.abs(originCoords.lat - destCoords.lat) + Math.abs(originCoords.lng - destCoords.lng);
        while ((dest === searchToUse || distDiff < 0.0015) && attempts < MOCK_DESTINATIONS.length) {
          const nextIndex = (MOCK_DESTINATIONS.indexOf(dest) + 1) % MOCK_DESTINATIONS.length;
          dest = MOCK_DESTINATIONS[nextIndex];
          destCoords = findCoords(dest, false);
          distDiff = Math.abs(originCoords.lat - destCoords.lat) + Math.abs(originCoords.lng - destCoords.lng);
          attempts++;
        }

        const metrics = calculateTaxiMetrics(selectedZone, dest);
        const currentCount = Math.floor(Math.random() * 3) + 1; // 1 to 3
        return {
          id: `ref-${timestamp}-${i}`,
          destination: dest,
          status: pickedStatus.text,
          statusType: pickedStatus.type,
          current: currentCount,
          max: 4,
          price: Math.round((metrics.totalFare / currentCount) / 100) * 100
        };
      });

      setParties(newParties);
      setLastUpdated(new Date().toLocaleTimeString());
      setIsRefreshing(false);
    }, 800);
  };

  const filteredParties = parties.filter(p => {
    // 1. Search term matching
    if (searchTerm && !p.destination.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    // 2. Prevent same origin/destination coordinate collision
    const originCc = findCoords(selectedZone || '순천대학교 정문', true);
    const destCc = findCoords(p.destination, false);
    const diffLat = Math.abs(originCc.lat - destCc.lat);
    const diffLng = Math.abs(originCc.lng - destCc.lng);
    if (diffLat < 0.0015 && diffLng < 0.0015) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen pb-24 bg-background">
      <Header />
      <main className="max-w-5xl mx-auto px-5 md:px-8 pt-6 space-y-8">
        
        {/* 1. Greeting */}
        <section className="space-y-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-black text-on-surface">김순천님,</h2>
            <p className="text-xl font-bold text-on-surface-variant">오늘 어디로 가시나요? 🚕</p>
          </div>
        </section>

        {/* 1.5. Search Bar (Dual Input) */}
        <section className="relative space-y-3">
          <div className="bg-white rounded-3xl shadow-md border border-surface-container-high p-4 flex flex-col gap-3 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center text-primary flex-shrink-0">
                <MapPin size={20} />
              </div>
              <div className="flex-grow flex flex-col">
                <label className="text-[10px] font-black text-outline uppercase tracking-wider">출발지</label>
                <input 
                  type="text" 
                  placeholder="출발지 검색" 
                  className="bg-transparent border-none focus:ring-0 text-sm font-bold p-0"
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                />
              </div>
            </div>
            
            <div className="h-px bg-surface-container-high w-full ml-10" />

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-secondary/5 flex items-center justify-center text-secondary flex-shrink-0">
                <Navigation size={20} />
              </div>
              <div className="flex-grow flex flex-col">
                <label className="text-[10px] font-black text-outline uppercase tracking-wider">도착지</label>
                <input 
                  type="text" 
                  placeholder="도착지 검색" 
                  className="bg-transparent border-none focus:ring-0 text-sm font-bold p-0"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                onClick={() => {
                  if (selectedZone && searchTerm) {
                    setSearchZone(selectedZone);
                    setSearchDestination(searchTerm);
                    setHasSearched(true);
                    fetchApiFare(selectedZone, searchTerm);
                  } else {
                    setHasSearched(false);
                  }
                  if (searchTerm) setSelectedDestination(searchTerm);
                  handleRefresh(searchTerm);
                }}
              >
                <Search size={22} strokeWidth={3} />
              </button>
            </div>
          </div>
          
          {(isRefreshing || (selectedZone && parties.length > 0)) && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={selectedZone + searchTerm}
              className="text-center"
            >
              <span className="text-[10px] font-black text-secondary bg-secondary/10 px-3 py-1.5 rounded-full border border-secondary/20 shadow-sm animate-pulse">
                {isRefreshing ? '가장 가까운 모아타 존 찾는 중...' : `'${selectedZone}' 근처 모아타 존 활성화됨 ✨`}
              </span>
            </motion.div>
          )}
        </section>

        {/* Route Details & Taxi Fare Calculator Section */}
        {hasSearched && searchZone && searchDestination && (
          isApiLoading ? (
            <motion.section 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 shadow-md border border-primary/10 flex flex-col items-center justify-center py-10 space-y-3"
            >
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-xs font-black text-on-surface">카카오모빌리티 실시간 주행 경로 요금 계산 중...</p>
              <p className="text-[10px] text-outline">출발지: {searchZone} | 도착지: {searchDestination}</p>
            </motion.section>
          ) : apiError ? (
            <motion.section 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50/75 border border-red-200 rounded-3xl p-6 shadow-md flex flex-col items-center justify-center text-center py-10 space-y-3"
            >
              <div className="h-10 w-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shadow-sm">
                <AlertTriangle size={22} />
              </div>
              <p className="text-sm font-black text-red-800">{apiError}</p>
              <p className="text-[10px] text-red-500">출발지 또는 목적지 입력에 실패했습니다. 올바른 이름인지 확인해 주세요.</p>
            </motion.section>
          ) : apiMetrics ? (
            <motion.section 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-5 shadow-md border border-primary/20 bg-gradient-to-br from-white to-primary/[0.01] space-y-4"
            >
              <div className="flex justify-between items-center border-b border-surface-container pb-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${apiMetrics.isRealApi ? 'bg-emerald-500 animate-pulse' : 'bg-primary'}`} />
                  <span className="text-[11px] font-black tracking-wider text-primary uppercase">
                    {apiMetrics.isRealApi ? '카카오모빌리티 실시간 자동차 경로' : '실시간 최적 경로 요금 예측'}
                  </span>
                </div>
                <span className={`text-[9px] ${apiMetrics.isPreprocessorMapped ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'} px-2.5 py-1 rounded-full font-black flex items-center gap-1`}>
                  {apiMetrics.isPreprocessorMapped ? '🎯 순천대 랜드마크 보정 완료' : '정밀 계산 완료'}
                </span>
              </div>
              
              <div className="flex items-center justify-between gap-1">
                <div className="flex flex-col">
                  <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-0.5">최단 주행거리</p>
                  <p className="text-xl font-black text-on-surface whitespace-nowrap">{apiMetrics.distance} <span className="text-xs font-bold text-outline">km</span></p>
                </div>
                <div className="h-8 w-px bg-surface-container" />
                <div className="flex flex-col">
                  <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-0.5">예상 주행시간</p>
                  <p className="text-xl font-black text-on-surface whitespace-nowrap">약 {apiMetrics.travelTime} <span className="text-xs font-bold text-outline">분</span></p>
                </div>
                <div className="h-8 w-px bg-surface-container" />
                <div className="flex flex-col text-right">
                  <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-0.5">총 예상 택시 요금</p>
                  <p className="text-xl font-black text-primary whitespace-nowrap">₩{apiMetrics.totalFare.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="bg-primary/5 rounded-2xl p-3 flex flex-col gap-1.5 text-[11px] border border-primary/10">
                <div className="flex justify-between items-center text-outline">
                  <span>기본 요금 (2.0km 기준)</span>
                  <span className="font-bold text-on-surface">₩4,300</span>
                </div>
                {apiMetrics.distance > 2.0 ? (
                  <div className="flex justify-between items-center text-outline">
                    <span>거리 초과 요금 (130m당 ₩100 및 시간운임 배율)</span>
                    <span className="font-bold text-on-surface">₩{(apiMetrics.totalFare - 4300).toLocaleString()}</span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center text-outline">
                    <span>거리 초과 요금</span>
                    <span className="font-bold text-on-surface-variant">₩0 (기본구간 이내)</span>
                  </div>
                )}
                {apiMetrics.isPreprocessorMapped && (
                  <div className="text-[10px] text-secondary font-bold text-center mt-1 py-1 rounded-lg bg-secondary/5 border border-secondary/10">
                    * 캠퍼스 중앙 대신 '순천대학교 정문 앞 택시 승강장'의 실제 주행 경로로 계산되었습니다.
                  </div>
                )}
                <div className="h-px bg-primary/10 my-1" />
                <div className="flex justify-between items-center text-primary font-black">
                  <span>동승시 1인 부담액 (4인 분할시)</span>
                  <span>약 ₩{Math.round((apiMetrics.totalFare / 4) / 100 * 100).toLocaleString()}</span>
                </div>
              </div>
            </motion.section>
          ) : null
        )}

        <div className="h-px bg-surface-container-high w-full" />

        {/* 3. Live Party Feed */}
        <section className="space-y-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-black text-on-surface">실시간 파티 피드</h3>
              <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`p-1.5 rounded-full hover:bg-primary/5 transition-colors active:scale-90 ${isRefreshing ? 'text-primary' : 'text-outline hover:text-primary'}`}
              >
                <motion.div
                  animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
                  transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: 'linear' } : { duration: 0.3 }}
                >
                  <RefreshCw size={18} strokeWidth={3} />
                </motion.div>
              </button>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded font-black">Live</span>
              <span className="text-[8px] text-outline mt-1 font-bold">Updated: {lastUpdated}</span>
            </div>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
            {filteredParties.length > 0 ? (
              filteredParties.map((party) => (
              <motion.article 
                layout
                key={party.id} 
                className="bg-white rounded-2xl p-4 shadow-sm border border-surface-container-high flex flex-col gap-4 relative group active:scale-[0.99] transition-all"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        party.statusType === 'urgent' 
                          ? 'bg-error/10 text-error' 
                          : 'bg-tertiary/10 text-tertiary'
                      }`}>
                        {party.statusType === 'urgent' ? '곧 출발' : '모집중'}
                      </div>
                      <span className="text-[10px] font-bold text-outline">{party.status}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-outline truncate max-w-[100px]">
                        {selectedZone || '순천대학교 정문'}
                      </span>
                      <ArrowRight size={10} className="text-outline/40" />
                      <h4 className="text-lg font-black text-on-surface tracking-tight">{party.destination}</h4>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-[9px] text-outline font-bold mb-0.5 uppercase tracking-wider">1인 예상</span>
                    <p className="text-lg font-black text-primary leading-none">₩{party.price.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex-grow flex items-center gap-2">
                    <div className="flex-grow h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <motion.div 
                        key={`${party.id}-${party.current}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(party.current / party.max) * 100}%` }}
                        className={`h-full rounded-full ${party.current === party.max ? 'bg-secondary' : 'bg-primary'}`}
                      />
                    </div>
                    <span className="text-[10px] font-black text-on-surface-variant flex-shrink-0">{party.current}/{party.max}명</span>
                  </div>
                  <button 
                    disabled={isRefreshing}
                    onClick={() => {
                      setSelectedDestination(party.destination);
                      setView('join');
                    }}
                    className="bg-primary hover:bg-primary-container text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-primary/5 transition-colors disabled:opacity-50"
                  >
                    합류 <ChevronRight size={14} strokeWidth={3} />
                  </button>
                </div>
              </motion.article>
            ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-surface-container/30 rounded-2xl p-12 text-center border border-dashed border-outline-variant"
              >
                <Search size={32} className="mx-auto text-outline/30 mb-3" />
                <p className="text-sm font-bold text-outline">파티가 없습니다.</p>
                <p className="text-[10px] text-outline/60 mt-1 uppercase tracking-widest font-black">새로운 파티를 기다리거나 검색해보세요</p>
              </motion.div>
            )}
          </div>

          {/* Bottom Padding */}
          <div className="py-8 text-center">
            <p className="text-[10px] text-outline font-black uppercase tracking-[0.2em] opacity-30">SCNU SAFETY TAXI SERVICE</p>
          </div>
        </section>
      </main>
    </div>
  );
};

const PartyListScreen = ({ setView, setSelectedDestination }: { setView: (v: ViewType) => void, setSelectedDestination?: (d: string) => void }) => (
  <div className="min-h-screen pb-24 bg-background">
    <Header />
    <main className="max-w-5xl mx-auto px-5 md:px-8 pt-6 flex flex-col gap-6">
      <div className="bg-secondary-container/20 text-on-secondary-container rounded-xl p-4 flex gap-3 border border-secondary/10">
        <Info size={20} className="flex-shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <p className="font-bold mb-1">1/N 자동 가승인 안내</p>
          <p className="opacity-80">모든 파티는 탑승 후 실제 요금 기반으로 1/N 자동 정산됩니다. 예상 요금은 참고용입니다.</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-on-surface">참여 가능한 파티</h2>
        <button className="flex items-center gap-1.5 text-primary bg-primary/5 px-3 py-1.5 rounded-full text-xs font-bold">
          <Settings size={14} /> 필터
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_PARTIES.map(party => (
          <article key={party.id} className="bg-white rounded-2xl p-5 shadow-sm border border-surface-container-high flex flex-col gap-5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-container" />
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-outline font-bold block mb-1">도착지</span>
                <div className="flex items-center gap-2">
                  {party.icon === 'train' && <Train size={18} className="text-primary" />}
                  {party.icon === 'store' && <Store size={18} className="text-primary" />}
                  {party.icon === 'shopping-cart' && <ShoppingCart size={18} className="text-primary" />}
                  <h3 className="text-xl font-bold">{party.destination}</h3>
                </div>
              </div>
              <div className="bg-surface-container px-2 py-1 rounded text-[10px] font-black text-on-surface-variant flex items-center gap-1">
                <CheckCircle2 size={12} /> 매너 지수 {party.mannerIndex}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {party.members.map((m, i) => (
                    <img key={i} src={m} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" />
                  ))}
                  {[...Array(party.maxMembers - party.currentMembers)].map((_, i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white border-dashed bg-surface-container flex items-center justify-center text-outline">
                      <Plus size={14} />
                    </div>
                  ))}
                </div>
                <span className="text-[10px] font-bold text-secondary bg-secondary/5 px-2 py-0.5 rounded">{party.status}</span>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-outline font-bold">예상 요금</p>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-lg font-black text-primary">₩{party.estimatedPrice.toLocaleString()}</span>
                  <span className="text-xs text-on-surface-variant">/p</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                if (setSelectedDestination) {
                  setSelectedDestination(party.destination);
                }
                setView('join');
              }}
              className="w-full bg-primary text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 group-hover:bg-primary/95 transition-colors shadow-lg shadow-primary/10"
            >
              파티 참여하기 <ArrowRight size={18} />
            </button>
          </article>
        ))}
      </div>
    </main>
  </div>
);

const PartyJoinScreen = ({ 
  setView, 
  selectedZone, 
  selectedDestination,
  paymentMethods,
  selectedPaymentMethodId,
  setSelectedPaymentMethodId
}: { 
  setView: (v: ViewType) => void; 
  selectedZone: string; 
  selectedDestination: string;
  paymentMethods: PaymentMethod[];
  selectedPaymentMethodId: string;
  setSelectedPaymentMethodId: (id: string) => void;
}) => {
  const [isJoined, setIsJoined] = useState(false);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);

  useEffect(() => {
    if (isJoined) {
      const timer = setTimeout(() => {
        setView('tracking');
      }, 3000); // 3 seconds delay
      return () => clearTimeout(timer);
    }
  }, [isJoined, setView]);

  const metrics = calculateTaxiMetrics(selectedZone, selectedDestination || '순천역');
  const userCount = 3; // 3-way split
  const myShare = Math.round((metrics.totalFare / userCount) / 100) * 100;

  const selectedPayment = paymentMethods.find(m => m.id === selectedPaymentMethodId) || paymentMethods[0] || { id: 'x', type: 'card', name: '등록된 카드 없음', digits: '0000' };
  const isKakao = selectedPayment.type === 'kakaopay';

  return (
    <div className="min-h-screen pb-24 bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-5 md:px-8 pt-6 flex flex-col gap-8">
        <section className="bg-surface-container rounded-2xl p-5 relative overflow-hidden border border-surface-container-high">
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center mt-1">
              <div className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/10" />
              <div className="w-0.5 h-10 bg-outline-variant/30 my-1 rounded-full border-dashed border-l-2" />
              <MapPin size={20} className="text-secondary fill-secondary/10" />
            </div>
            <div className="flex-1 flex flex-col gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-outline font-bold mb-1">출발</p>
                <p className="font-bold text-sm">{selectedZone || '지정되지 않음'}</p>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-outline font-bold mb-1">도착</p>
                  <p className="font-bold text-sm">{selectedDestination || '지정되지 않음'}</p>
                </div>
                <div className="bg-tertiary-container/10 border border-tertiary-container/30 px-3 py-1 rounded-lg">
                  <span className="text-[11px] font-bold text-tertiary">오전 08:30 출발</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col items-center">
          <div className="flex -space-x-3 mb-4">
            <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop" className="w-12 h-12 rounded-full border-4 border-background object-cover shadow-sm" alt="User" />
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" className="w-12 h-12 rounded-full border-4 border-background object-cover shadow-sm z-10" alt="User" />
            <div className="w-12 h-12 rounded-full border-4 border-background bg-primary-container flex items-center justify-center text-white z-20 shadow-sm">
              <Plus size={20} />
            </div>
          </div>
          <div className="bg-secondary/5 text-secondary px-3 py-1 rounded-full text-xs font-bold mb-2 flex items-center gap-1">
            <Check size={14} /> 1/N 정산 ({userCount}인 분할)
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-sm text-outline line-through font-medium">₩{metrics.totalFare.toLocaleString()}</span>
            <span className="text-4xl font-black text-secondary">₩{myShare.toLocaleString()}</span>
          </div>
          <p className="text-[11px] text-on-surface-variant text-center leading-relaxed">
            * 출발지 '<strong>{selectedZone || '정문'}</strong>'에서 '<strong>{selectedDestination || '순천역'}</strong>'까지 최단거리 {metrics.distance} km 기준 요금입니다.<br/>
            (하차 시 실제 미터기 요금에 따라 1/N 정산하여 분할 수납됩니다.)
          </p>
        </section>

        <div className="h-0.5 bg-surface-container-highest rounded-full w-24 mx-auto" />

        <section className="flex items-center justify-between bg-white rounded-2xl p-4 border border-surface-container-high shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
              isKakao ? 'bg-[#FEE500] text-[#191919]' : 'bg-primary/5 text-primary'
            }`}>
              {isKakao ? <Smartphone size={24} /> : <CreditCard size={24} />}
            </div>
            <div>
              <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-0.5">결제 수단</p>
              <p className="text-sm font-bold">{selectedPayment.name} (**** {selectedPayment.digits})</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => setShowPaymentSheet(true)}
            className="text-xs font-black text-primary bg-primary/10 hover:bg-primary/20 px-4 py-2.5 rounded-xl transition-all active:scale-95"
          >
            변경
          </button>
        </section>

        <section className="bg-error-container/30 rounded-xl p-4 border border-error/10">
          <div className="flex gap-3">
            <Check size={18} className="text-error mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-on-error-container flex items-center gap-1 mb-1">
                <AlertTriangle size={14} className="text-error" /> [필수] 결제 및 페널티 정책 동의
              </h4>
              <p className="text-[11px] text-on-error-container/80 leading-relaxed">
                노쇼(No-show) 또는 3분 이상 지각 시, 동승자 피해 보상을 위해 예상 요금 100%(₩{myShare.toLocaleString()})가 위약금으로 자동 결제됨에 동의합니다.
              </p>
            </div>
          </div>
        </section>

        <AnimatePresence>
          {isJoined ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-secondary/10 border border-secondary/20 p-6 rounded-2xl text-center space-y-2"
            >
              <div className="w-12 h-12 bg-secondary text-white rounded-full flex items-center justify-center mx-auto mb-2">
                <Check size={24} strokeWidth={3} />
              </div>
              <h3 className="text-lg font-black text-secondary">파티 합류 성공!</h3>
              <p className="text-sm font-bold text-on-surface-variant">잠시 후 이동 화면으로 전환됩니다...</p>
            </motion.div>
          ) : (
            <button 
              onClick={() => setIsJoined(true)}
              className="w-full bg-secondary text-white font-black py-5 rounded-2xl shadow-xl shadow-secondary/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform mt-4"
            >
              ₩{myShare.toLocaleString()} 가승인하고 파티 합류하기 <ArrowRight size={20} />
            </button>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Sheet for changing payment option */}
      <AnimatePresence>
        {showPaymentSheet && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={() => setShowPaymentSheet(false)} />
            
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="bg-white w-full max-w-md rounded-t-[32px] p-6 shadow-2xl relative z-10 border-t border-surface-container-high"
            >
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h3 className="text-xl font-black text-on-surface">결제 수단 선택</h3>
                  <p className="text-xs text-outline font-medium mt-1">이 파티 탑승 시 사용할 결제 카드를 선택하세요.</p>
                </div>
                <button 
                  onClick={() => setShowPaymentSheet(false)}
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-outline hover:text-on-surface transition-colors"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>

              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                {paymentMethods.map((pm) => {
                  const isCurActive = pm.id === selectedPayment.id;
                  const isPmKakao = pm.type === 'kakaopay';
                  
                  return (
                    <button
                      type="button"
                      key={pm.id}
                      onClick={() => {
                        setSelectedPaymentMethodId(pm.id);
                        setShowPaymentSheet(false);
                      }}
                      className={`w-full text-left p-4 rounded-2xl border flex items-center justify-between transition-all active:scale-[0.99] ${
                        isCurActive 
                          ? 'border-primary bg-primary/[0.02] ring-2 ring-primary/10 font-bold' 
                          : 'border-surface-container hover:bg-surface-container-low text-on-surface-variant'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          isPmKakao ? 'bg-[#FEE500]/20 text-[#191919]' : 'bg-primary/5 text-primary'
                        }`}>
                          {isPmKakao ? <Smartphone size={18} /> : <CreditCard size={18} />}
                        </div>
                        <div>
                          <p className={`text-sm ${isCurActive ? 'font-bold text-on-surface' : 'font-medium text-on-surface-variant'}`}>{pm.name}</p>
                          <p className="text-xs text-outline font-mono mt-0.5">**** {pm.digits}</p>
                        </div>
                      </div>
                      
                      {isCurActive && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 pt-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentSheet(false);
                    setView('payment');
                  }}
                  className="w-full bg-surface-container hover:bg-surface-container-highest text-primary font-bold py-3.5 rounded-xl text-xs text-center transition-all"
                >
                  새 카드 추가 및 관리하러 가기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ActiveRideScreen = ({ setView, selectedZone, selectedDestination }: { setView: (v: ViewType) => void, selectedZone: string, selectedDestination: string }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      setView('complete');
    }, 4000); 
    return () => clearTimeout(timer);
  }, [setView]);

  const metrics = calculateTaxiMetrics(selectedZone, selectedDestination || '순천역');
  const now = new Date();
  now.setMinutes(now.getMinutes() + metrics.travelTime);
  const arrivalTime = now.toTimeString().slice(0, 5);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="max-w-3xl mx-auto px-5 md:px-8 pt-6 flex-1 flex flex-col relative overflow-hidden">
        {/* Subtle background motion */}
        <motion.div 
          animate={{ x: [-20, 20, -20], y: [-20, 20, -20] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"
        />

        <div className="flex-grow flex flex-col items-center justify-center text-center space-y-8 z-10">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-2"
          >
            <div className="bg-secondary/10 px-4 py-1.5 rounded-full inline-flex items-center gap-2 border border-secondary/20 mb-4">
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary">안전하게 이동 중</span>
            </div>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-outline">도착 예정 시간</h2>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-7xl font-black tracking-tighter text-on-surface">{arrivalTime}</span>
              <span className="text-xl font-bold text-outline">도착</span>
            </div>
            <p className="text-2xl font-black text-primary">약 {metrics.travelTime}분 남음</p>
          </motion.div>

          {/* Real-time Route Indicators */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-surface-container-high shadow-md w-full max-w-[320px] text-center space-y-2">
            <div className="flex justify-between text-xs text-outline font-bold px-1">
              <span className="truncate max-w-[120px]">출발: {selectedZone || '순천대학교 정문'}</span>
              <ArrowRight size={14} className="mt-0.5 text-outline/40 flex-shrink-0" />
              <span className="truncate max-w-[120px]">도착: {selectedDestination || '순천역'}</span>
            </div>
            <div className="h-px bg-surface-container-high w-full" />
            <div className="flex justify-around items-center pt-1 font-sans">
              <div>
                <p className="text-[9px] font-bold text-outline uppercase tracking-wider">주행 최단거리</p>
                <p className="text-base font-black text-[#3D5AFE]">{metrics.distance} km</p>
              </div>
              <div className="h-6 w-px bg-surface-container-high" />
              <div>
                <p className="text-[9px] font-bold text-outline uppercase tracking-wider">예상 총 요금</p>
                <p className="text-base font-black text-primary">₩{metrics.totalFare.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-surface-container-high max-w-[200px]" />

          <div className="space-y-6 w-full">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-primary/5 rounded-3xl flex items-center justify-center border border-primary/10">
                <Car size={32} className="text-primary" />
              </div>
              <div className="text-center">
                <p className="text-xl font-black tracking-tight text-on-surface font-sans">경남 12바 3456</p>
                <p className="text-xs font-bold text-outline">SCNU 안심 택시 서비스</p>
              </div>
            </div>

            <div className="flex justify-center -space-x-2">
              <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=80&h=80&fit=crop" className="w-10 h-10 rounded-full border-2 border-background object-cover shadow-sm" alt="Driver" />
              <div className="w-10 h-10 rounded-full border-2 border-background bg-surface-container-high flex items-center justify-center text-[10px] font-black text-outline">
                +2
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-3 mt-auto z-10 pb-4">
          <button 
            onClick={() => setView('complete')}
            className="col-span-4 bg-primary text-white h-16 rounded-2xl flex items-center justify-center gap-3 font-black shadow-xl shadow-primary/20 active:scale-95 transition-all text-sm"
          >
            <Share2 size={20} /> 안심 귀가 공유하기
          </button>
          <button className="h-16 bg-error text-white rounded-2xl flex items-center justify-center shadow-xl shadow-error/10 active:scale-95 transition-all">
            <AlertTriangle size={24} fill="currentColor" />
          </button>
        </div>
      </main>
    </div>
  );
};

const RideCompleteScreen = ({ setView, selectedZone, selectedDestination }: { setView: (v: ViewType) => void, selectedZone: string, selectedDestination: string }) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(['조용히 이동했어요']);

  const tags = ['시간 약속을 잘 지켜요', '조용히 이동했어요', '친절해요'];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const metrics = calculateTaxiMetrics(selectedZone, selectedDestination || '순천역');
  const userCount = 4; // split 4 ways for final
  const myFinalShare = Math.round((metrics.totalFare / userCount) / 100) * 100;

  return (
    <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="min-h-screen pb-24 bg-background">
      <Header />
      <main className="max-w-3xl mx-auto px-5 md:px-8 pt-12 flex flex-col items-center">
        <div className="w-20 h-20 bg-secondary-container rounded-full flex items-center justify-center mb-6 shadow-xl shadow-secondary/10">
          <CheckCircle2 size={40} className="text-on-secondary-container" />
        </div>
        <h2 className="text-3xl font-black mb-2">하차 완료</h2>
        <p className="text-outline mb-10 text-center">안전하게 목적지에 도착했습니다.</p>
  
        <section className="w-full bg-white rounded-2xl p-6 shadow-sm border border-surface-container-high mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <h3 className="text-xs font-black text-outline uppercase tracking-widest mb-4">결제 내역</h3>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-on-surface-variant font-medium">이동 구간</span>
              <span className="font-bold text-xs truncate max-w-[180px]">{selectedZone || '순천대학교 정문'} ➔ {selectedDestination || '순천역'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-on-surface-variant font-medium">최단 이동거리</span>
              <span className="font-bold">{metrics.distance} km</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-on-surface-variant font-medium">총 택시 요금</span>
              <span className="font-bold text-[#3D5AFE]">₩{metrics.totalFare.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-on-surface-variant font-medium">탑승 인원 (1/N)</span>
              <span className="font-bold">{userCount}명</span>
            </div>
            <div className="w-full h-px bg-surface-container-high my-1" />
            <div className="flex justify-between items-end">
              <span className="text-lg font-bold">나의 결제 금액</span>
              <span className="text-3xl font-black text-primary">₩{myFinalShare.toLocaleString()}</span>
            </div>
          </div>
        </section>
  
        <section className="w-full bg-white rounded-2xl p-6 shadow-sm border border-surface-container-high">
          <div className="flex items-center gap-2 mb-2">
            <Heart size={20} className="text-tertiary fill-tertiary/10" />
            <h3 className="text-xl font-bold">익명 매너 평가</h3>
          </div>
          <p className="text-xs text-outline mb-6">함께 탑승한 학우들의 매너는 어땠나요?</p>
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <button 
                key={tag} 
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2.5 rounded-full text-xs font-bold border transition-all active:scale-95 ${
                  selectedTags.includes(tag) 
                    ? 'bg-primary-container/10 border-primary text-primary shadow-sm' 
                    : 'bg-surface-bright border-surface-container-high text-outline hover:border-outline-variant'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </section>
  
        <button onClick={() => setView('home')} className="w-full max-w-lg mt-10 bg-primary text-white font-bold py-5 rounded-2xl shadow-xl shadow-primary/20 active:scale-[0.98] transition-all">
          평가 완료 및 닫기
        </button>
      </main>
    </motion.div>
  );
};

const HistoryScreen = ({ setView }: { setView: (v: ViewType) => void }) => (
  <div className="min-h-screen pb-32 bg-background">
    <Header />
    <main className="max-w-4xl mx-auto px-5 md:px-8 pt-8">
      <div className="mb-8">
        <h2 className="text-3xl font-black leading-tight">이용 내역</h2>
        <span className="text-xl font-bold text-outline">활동 내역</span>
      </div>

      <div className="relative ml-2">
        <div className="absolute left-[15px] top-8 bottom-0 w-[2px] bg-surface-container-highest rounded-full" />
        
        {/* Simple grouping by month */}
        <div className="mb-10 relative">
          <h3 className="text-[10px] font-black text-outline uppercase tracking-[0.2em] mb-6 ml-12">November 2023</h3>
          
          {MOCK_HISTORY.slice(0, 1).map(item => (
            <div key={item.id} className="relative pl-12 mb-6">
              <div className="absolute left-0 top-2 w-8 h-8 rounded-full bg-primary-container flex items-center justify-center z-10 shadow-sm border-4 border-background">
                <Check size={16} className="text-white" />
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-surface-container-high relative overflow-hidden transition-transform active:scale-[0.99]">
                 <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full" />
                 <div className="flex justify-between items-center mb-4 text-[11px] font-bold">
                    <span className="text-outline">{item.date} {item.time}</span>
                    <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">완료</span>
                 </div>
                 <div className="flex flex-col gap-3 relative mb-4">
                    <div className="absolute left-[7px] top-2 bottom-2 w-px border-l border-dashed border-outline-variant" />
                    <div className="flex items-center gap-3">
                       <div className="w-[14px] h-[14px] rounded-full bg-primary ring-4 ring-primary/10 z-10" />
                       <p className="text-sm font-bold">{item.origin}</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="flex items-center justify-center w-[14px] z-10 bg-white">
                          <MapPin size={14} className="text-outline" />
                       </div>
                       <p className="text-sm font-bold">{item.destination}</p>
                    </div>
                 </div>
                 <div className="border-t border-surface-container-high pt-4 flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-outline">
                       <Users size={16} />
                       <span className="text-xs font-bold">{item.members}명</span>
                    </div>
                    <span className="text-lg font-black text-primary">₩{item.price.toLocaleString()}</span>
                 </div>
              </div>
            </div>
          ))}
        </div>

        <div className="relative">
          <h3 className="text-[10px] font-black text-outline uppercase tracking-[0.2em] mb-6 ml-12">October 2023</h3>
          {MOCK_HISTORY.slice(1).map(item => (
            <div key={item.id} className="relative pl-12 mb-6">
              <div className="absolute left-0 top-2 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center z-10 border-4 border-background">
                <History size={16} className="text-outline" />
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-surface-container-high opacity-80">
                 <div className="flex justify-between items-center mb-4 text-[11px] font-bold">
                    <span className="text-outline">{item.date} {item.time}</span>
                    <span className="bg-surface-container text-outline px-2 py-0.5 rounded-full">완료</span>
                 </div>
                 <div className="flex flex-col gap-3 mb-4">
                    <div className="flex items-center gap-3">
                       <div className="w-[10px] h-[10px] rounded-full bg-outline-variant" />
                       <p className="text-sm font-medium">{item.origin}</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <MapPin size={14} className="text-outline" />
                       <p className="text-sm font-medium">{item.destination}</p>
                    </div>
                 </div>
                 <div className="border-t border-surface-container-high pt-4 flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-outline">
                       <Users size={16} />
                       <span className="text-xs font-bold">{item.members}명</span>
                    </div>
                    <span className="text-lg font-bold">₩{item.price.toLocaleString()}</span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  </div>
);

const ProfileScreen = ({ setView }: { setView: (v: ViewType) => void }) => (
  <div className="min-h-screen pb-32 bg-background">
    <Header />
    <main className="max-w-4xl mx-auto px-5 md:px-8 pt-8 flex flex-col gap-6">
      <div className="mb-2">
        <h2 className="text-3xl font-black leading-tight">마이페이지</h2>
        <p className="text-sm font-medium text-outline mt-1">내 정보 인트라넷 및 신뢰 지수를 관리하세요.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
        <section className="md:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-surface-container pb-8 relative h-fit">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="flex flex-col items-center relative z-10">
            <div className="relative mb-4">
              <img 
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop" 
                className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover" 
                alt="Profile" 
              />
              <div className="absolute bottom-0 right-0 bg-secondary text-white w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                <CheckCircle2 size={16} fill="currentColor" />
              </div>
            </div>
            <h2 className="text-2xl font-black mb-1">김순천</h2>
            <p className="text-sm text-outline font-bold flex items-center gap-1">
              <School size={14} /> Business Administration
            </p>
          </div>
          
          <div className="mt-8 bg-surface-container-low rounded-xl p-4 flex justify-between items-center border border-surface-container">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <Smartphone size={20} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-outline uppercase tracking-widest">신뢰 지수</p>
                 <p className="text-sm font-bold">모아타 지수</p>
              </div>
            </div>
            <div className="flex items-baseline gap-1 bg-surface-container-highest px-4 py-1.5 rounded-full">
              <span className="text-lg font-black text-secondary">36.5</span>
              <span className="text-[11px] font-bold text-outline">°C</span>
            </div>
          </div>
        </section>

        <div className="md:col-span-7 flex flex-col gap-6">
          <section className="bg-white rounded-2xl shadow-sm border border-surface-container overflow-hidden">
            <div className="flex flex-col">
              {[
                { id: 'payment', label: '결제 수단 관리', icon: Wallet, color: 'text-primary', bg: 'bg-primary/5' },
                { id: 'history', label: '이용 내역', icon: History, color: 'text-tertiary', bg: 'bg-tertiary/5' },
                { id: 'support', label: '고객센터', icon: Headphones, color: 'text-secondary', bg: 'bg-secondary/5' },
              ].map((item, idx, arr) => (
                <button 
                  key={item.id}
                  onClick={() => { if(item.id !== 'support') setView(item.id as ViewType) }}
                  className={`flex items-center gap-4 p-5 hover:bg-surface-container transition-all active:scale-[0.99] group ${idx !== arr.length - 1 ? 'border-b border-surface-container-low' : ''}`}
                >
                  <div className={`w-12 h-12 rounded-full ${item.bg} flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                     <item.icon size={22} />
                  </div>
                  <span className="flex-1 text-base font-bold text-on-surface text-left">{item.label}</span>
                  <ChevronRight size={20} className="text-outline" />
                </button>
              ))}
            </div>
          </section>

          <button onClick={() => setView('landing')} className="w-full py-4 rounded-xl border border-outline-variant font-bold text-on-surface-variant hover:bg-white hover:text-error hover:border-error/20 flex items-center justify-center gap-2 transition-all">
            <LogOut size={18} /> 로그아웃
          </button>

          <div className="text-center opacity-30 text-[10px] font-bold tracking-widest uppercase">
            Version 1.2.0
          </div>
        </div>
      </div>
    </main>
  </div>
);

const PaymentScreen = ({ 
  setView, 
  paymentMethods, 
  setPaymentMethods,
  selectedPaymentMethodId,
  setSelectedPaymentMethodId
}: { 
  setView: (v: ViewType) => void;
  paymentMethods: PaymentMethod[];
  setPaymentMethods: React.Dispatch<React.SetStateAction<PaymentMethod[]>>;
  selectedPaymentMethodId: string;
  setSelectedPaymentMethodId: (id: string) => void;
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const popularCards = ['국민카드', '신한카드', '현대카드', '삼성카드', '우리카드', '하나카드', '토스카드', '농협카드'];

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) {
      value = value.slice(0, 16);
    }
    const matches = value.match(/\d{1,4}/g);
    const formatted = matches ? matches.join(' - ') : '';
    setCardNumber(formatted);
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName.trim()) {
      setErrorMsg('카드사명을 입력하거나 선택해 주세요.');
      return;
    }
    const cleanNum = cardNumber.replace(/\D/g, '');
    if (cleanNum.length < 15) {
      setErrorMsg('올바른 카드 번호(15~16자리)를 입력해 주세요.');
      return;
    }

    const lastFour = cleanNum.slice(-4);
    const newMethod: PaymentMethod = {
      id: `custom-${Date.now()}`,
      type: 'card',
      name: cardName.trim(),
      digits: lastFour,
      isPrimary: paymentMethods.length === 0,
    };

    const updated = [...paymentMethods, newMethod];
    setPaymentMethods(updated);
    if (paymentMethods.length === 1) {
      setSelectedPaymentMethodId(newMethod.id);
    }

    // Reset states
    setCardName('');
    setCardNumber('');
    setErrorMsg('');
    setShowAddModal(false);
  };

  const handleMakePrimary = (id: string) => {
    const updated = paymentMethods.map(m => ({
      ...m,
      isPrimary: m.id === id,
    }));
    setPaymentMethods(updated);
    setSelectedPaymentMethodId(id);
  };

  const handleDeleteCard = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (paymentMethods.length <= 1) {
      return;
    }
    const updated = paymentMethods.filter(m => m.id !== id);
    setPaymentMethods(updated);
    if (selectedPaymentMethodId === id) {
      const remainingPrimary = updated.find(m => m.isPrimary) || updated[0];
      if (remainingPrimary) {
        setSelectedPaymentMethodId(remainingPrimary.id);
      }
    }
  };

  return (
    <div className="min-h-screen pb-32 bg-background relative">
      <Header />
      <main className="max-w-4xl mx-auto px-5 md:px-8 pt-8">
        <div className="mb-8">
          <h2 className="text-3xl font-black mb-2">결제 수단 관리</h2>
          <p className="text-sm font-medium text-outline">안전하고 편리한 탑승을 위해 결제 수단을 관리하세요.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {paymentMethods.map((item) => {
            const isActive = item.id === selectedPaymentMethodId;
            const isKakao = item.type === 'kakaopay';
            
            return (
              <div 
                key={item.id}
                onClick={() => handleMakePrimary(item.id)}
                className={`bg-white rounded-2xl p-5 shadow-sm border relative overflow-hidden cursor-pointer active:scale-[0.99] transition-all ${
                  isActive ? 'border-primary ring-2 ring-primary/10' : 'border-surface-container-high'
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                )}
                
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isKakao ? 'bg-[#FEE500]/10 text-[#191919]' : 'bg-primary/5 text-primary'
                  }`}>
                    {isKakao ? <Smartphone size={20} /> : <CreditCard size={20} />}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {item.isPrimary ? (
                      <span className="bg-secondary/10 text-secondary text-[10px] font-black px-3 py-1 rounded-full border border-secondary/10">주 결제수단</span>
                    ) : (
                      <span className="text-[10px] text-outline bg-surface-container px-2.5 py-1 rounded-full font-bold">일반 결제</span>
                    )}
                    {paymentMethods.length > 1 && (
                      <button 
                        onClick={(e) => handleDeleteCard(item.id, e)}
                        className="p-1 hover:bg-error/10 hover:text-error text-outline rounded transition-colors"
                        title="결제수단 삭제"
                      >
                        <X size={14} strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <h3 className="text-xl font-bold mb-1">{item.name}</h3>
                  <p className="text-sm font-mono text-outline tracking-[0.3em]">
                    {isKakao ? '**** ' + item.digits : '**** **** **** ' + item.digits}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="w-full bg-white border-2 border-dashed border-primary/20 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-primary hover:bg-primary/5 hover:border-primary/40 transition-all active:scale-[0.99]"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Plus size={24} />
          </div>
          <span className="text-sm font-bold">+ 새 카드 등록하기</span>
        </button>
      </main>

      {/* Add Card Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm">
            {/* Modal Backdrop Click */}
            <div className="absolute inset-0" onClick={() => setShowAddModal(false)} />
            
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="bg-white w-full max-w-md rounded-t-[32px] p-6 shadow-2xl relative z-10 border-t border-surface-container-high"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-black text-on-surface">새 카드 등록하기</h3>
                  <p className="text-xs text-outline font-medium mt-1">간편 간동 정산을 위한 신용/체크카드를 등록하세요.</p>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-outline hover:text-on-surface transition-colors"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>

              <form onSubmit={handleAddCard} className="space-y-5">
                {/* Popular Cards Selectors */}
                <div>
                  <label className="text-[11px] font-black text-outline uppercase tracking-wider block mb-2">자주 쓰는 카드사</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {popularCards.map((cName) => (
                      <button
                        type="button"
                        key={cName}
                        onClick={() => {
                          setCardName(cName);
                          setErrorMsg('');
                        }}
                        className={`py-2 px-1 text-[11px] font-bold rounded-lg border text-center transition-all ${
                          cardName === cName 
                            ? 'bg-primary border-primary text-white shadow-sm shadow-primary/20' 
                            : 'bg-surface-container-low border-surface-container hover:bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        {cName.replace('카드', '')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card Name Input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-outline uppercase tracking-wider block">카드사 명</label>
                  <input 
                    type="text"
                    required
                    placeholder="예: 신한카드, 국민카드 등 직접 입력 가능"
                    value={cardName}
                    onChange={(e) => {
                      setCardName(e.target.value);
                      setErrorMsg('');
                    }}
                    className="w-full bg-surface-container-low border border-surface-container-high rounded-xl px-4 py-3 text-sm font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline/40"
                  />
                </div>

                {/* Card Number Input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-outline uppercase tracking-wider block">카드 번호</label>
                  <input 
                    type="text"
                    required
                    placeholder="0000 - 0000 - 0000 - 0000"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className="w-full bg-surface-container-low border border-surface-container-high rounded-xl px-4 py-3 text-sm font-mono font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline/40"
                  />
                </div>

                {/* CVC & Expiry Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-outline uppercase tracking-wider block">만료 기한 (MM/YY)</label>
                    <input 
                      type="text"
                      maxLength={5}
                      placeholder="MM / YY"
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length > 2) {
                          val = val.slice(0, 2) + '/' + val.slice(2, 4);
                        }
                        e.target.value = val;
                      }}
                      className="w-full bg-surface-container-low border border-surface-container-high rounded-xl px-4 py-3 text-sm font-mono font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-outline uppercase tracking-wider block">비밀번호 외 (CVC)</label>
                    <input 
                      type="password"
                      maxLength={3}
                      placeholder="3자리 숫자"
                      className="w-full bg-surface-container-low border border-surface-container-high rounded-xl px-4 py-3 text-sm font-mono font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline/40"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <p className="text-xs font-bold text-error mt-1">{errorMsg}</p>
                )}

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-surface-container hover:bg-surface-container-highest text-on-surface-variant font-bold py-4 rounded-xl text-sm transition-all"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary-container text-white font-black py-4 rounded-xl text-sm transition-all shadow-lg shadow-primary/10"
                  >
                    카드 등록 완료
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<ViewType>('landing');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: '1', type: 'kakaopay', name: '카카오페이', digits: '1234', isPrimary: true },
    { id: '2', type: 'card', name: '신한카드 체크', digits: '5678', isPrimary: false },
  ]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('1');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: '새로운 참가자 탑승',
      description: '순천대학교 정문 파티 방에 다른 학우 1명이 탑승을 신청했습니다!',
      time: '방금 전',
      type: 'party',
      isRead: false,
    },
    {
      id: '2',
      title: '정산 완료 안내 💳',
      description: '지난 금요일 탑승의 1/N 공동 정산 금액(3,200원)이 카카오페이를 통해 자동 이체 완료되었습니다.',
      time: '2시간 전',
      type: 'success',
      isRead: false,
    },
    {
      id: '3',
      title: '계정 연동 상태 알림',
      description: '결제 카드가 성공적으로 등록되었습니다. 즉시 택시 파티 매칭 서비스를 이용할 수 있습니다.',
      time: '어제',
      type: 'info',
      isRead: true,
    },
    {
      id: '4',
      title: '모아타에 오신 것을 환영해요! 🎉',
      description: '함께 타고 즐겁게 이동하는 순천대 전용 공유 택시 플랫폼 [Moata]입니다. 안전하고 저렴하게 이동해보세요.',
      time: '3일 전',
      type: 'info',
      isRead: true,
    }
  ]);

  // Prevent scrolling to top on view changes instantly for smooth transitions
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  const handleRemoveNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const renderView = () => {
    switch (view) {
      case 'landing': return <LandingScreen onStart={() => setView('home')} />;
      case 'home': return <HomeScreen setView={setView} selectedZone={selectedZone} setSelectedZone={setSelectedZone} selectedDestination={selectedDestination} setSelectedDestination={setSelectedDestination} />;
      case 'parties': return <PartyListScreen setView={setView} setSelectedDestination={setSelectedDestination} />;
      case 'join': return (
        <PartyJoinScreen 
          setView={setView} 
          selectedZone={selectedZone} 
          selectedDestination={selectedDestination} 
          paymentMethods={paymentMethods}
          selectedPaymentMethodId={selectedPaymentMethodId}
          setSelectedPaymentMethodId={setSelectedPaymentMethodId}
        />
      );
      case 'tracking': return <ActiveRideScreen setView={setView} selectedZone={selectedZone} selectedDestination={selectedDestination} />;
      case 'complete': return <RideCompleteScreen setView={setView} selectedZone={selectedZone} selectedDestination={selectedDestination} />;
      case 'history': return <HistoryScreen setView={setView} />;
      case 'payment': return (
        <PaymentScreen 
          setView={setView} 
          paymentMethods={paymentMethods}
          setPaymentMethods={setPaymentMethods}
          selectedPaymentMethodId={selectedPaymentMethodId}
          setSelectedPaymentMethodId={setSelectedPaymentMethodId}
        />
      );
      case 'profile': return <ProfileScreen setView={setView} />;
      default: return <HomeScreen setView={setView} selectedZone={selectedZone} setSelectedZone={setSelectedZone} selectedDestination={selectedDestination} setSelectedDestination={setSelectedDestination} />;
    }
  };

  const showNav = ['home', 'history', 'profile', 'payment', 'parties'].includes(view);
  const activeTab = view === 'history' ? 'history' : (view === 'profile' || view === 'payment') ? 'profile' : 'home';

  return (
    <SidebarContext.Provider value={{ 
      openSidebar: () => setIsSidebarOpen(true),
      openNotifications: () => setIsNotificationsOpen(true),
      unreadCount
    }}>
      <div className="min-h-screen bg-background text-on-surface select-none overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full relative"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
        {showNav && <BottomNav active={activeTab as ViewType} setView={setView} />}
        
        <LeftDrawer 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          setView={setView} 
          currentView={view} 
        />

        <NotificationsDrawer 
          isOpen={isNotificationsOpen} 
          onClose={() => setIsNotificationsOpen(false)} 
          notifications={notifications}
          onRemove={handleRemoveNotification}
          onMarkRead={handleMarkNotificationAsRead}
          onClearAll={handleClearAllNotifications}
        />
      </div>
    </SidebarContext.Provider>
  );
}
