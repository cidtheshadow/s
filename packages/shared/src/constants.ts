import { BookingStatus } from './types.js';

export const BOOKING_STATUS_ORDER: Record<BookingStatus, number> = {
  BOOKED: 1,
  ARRIVED: 2,
  QUALITY_CHECKED: 3,
  PROCURED: 4,
  PAYMENT_INITIATED: 5,
  PAID: 6,
  CANCELLED: 99,
  NO_SHOW: 99
};

export const SUPPORTED_LANGUAGES = [
  { code: 'hi', label: 'हिंदी', englishName: 'Hindi' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ', englishName: 'Punjabi' },
  { code: 'en', label: 'English', englishName: 'English' },
  { code: 'mr', label: 'मराठी', englishName: 'Marathi' },
  { code: 'te', label: 'తెలుగు', englishName: 'Telugu' },
  { code: 'bn', label: 'বাংলা', englishName: 'Bengali' }
] as const;

export const CROPS_LIST = [
  'Wheat (गेहूं)',
  'Paddy (धान)',
  'Mustard (सरसों)',
  'Gram (चना)',
  'Cotton (कपास)',
  'Maize (मक्का)',
  'Soyabean (सोयाबीन)'
] as const;
