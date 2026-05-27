/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TransactionInfo {
  totalFare: number;
  members: number;
  myShare: number;
}

export interface RideHistoryItem {
  id: string;
  date: string;
  time: string;
  origin: string;
  destination: string;
  members: number;
  price: number;
  status: 'completed' | 'ongoing' | 'cancelled';
}

export interface Party {
  id: string;
  destination: string;
  icon: string;
  mannerIndex: number;
  members: string[]; // images
  maxMembers: number;
  currentMembers: number;
  estimatedPrice: number;
  status: string;
}

export type ViewType = 
  | 'landing' 
  | 'home' 
  | 'parties' 
  | 'join' 
  | 'tracking' 
  | 'complete' 
  | 'history' 
  | 'payment' 
  | 'profile';

export interface PaymentMethod {
  id: string;
  type: 'kakaopay' | 'card';
  name: string;
  digits: string;
  isPrimary: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'party';
  isRead: boolean;
}

