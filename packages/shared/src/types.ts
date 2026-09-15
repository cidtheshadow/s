export type BookingStatus =
  | 'BOOKED'
  | 'ARRIVED'
  | 'QUALITY_CHECKED'
  | 'PROCURED'
  | 'PAYMENT_INITIATED'
  | 'PAID'
  | 'CANCELLED'
  | 'NO_SHOW';

export type LanguageCode = 'hi' | 'pa' | 'en' | 'mr' | 'te' | 'bn';

export interface Farmer {
  id: string;
  phone: string;
  name: string;
  village: string;
  district: string;
  state: string;
  preferred_language: LanguageCode;
  land_size_acres: number;
  crop_types: string[];
  aadhaar_ref_masked: string;
  created_at: string;
}

export interface OperatingHours {
  start: string; // "09:00"
  end: string;   // "17:00"
}

export interface Centre {
  id: string;
  name: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  daily_capacity: number;
  operating_hours: OperatingHours;
  active: boolean;
}

export interface Slot {
  id: string;
  centre_id: string;
  date: string;       // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string;   // HH:MM
  capacity: number;
  booked_count: number;
}

export interface Booking {
  id: string;
  farmer_id: string;
  slot_id: string;
  centre_id: string;
  crop: string;
  expected_quantity_qtl: number;
  status: BookingStatus;
  token_number: string;
  created_at: string;
}

export interface BookingStatusEvent {
  id: string;
  booking_id: string;
  status: BookingStatus;
  actor_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface QueueEntry {
  id: string;
  booking_id: string;
  centre_id: string;
  position: number;
  estimated_wait_minutes: number;
  checked_in_at: string | null;
  served_at: string | null;
}

export interface PriceRecord {
  id: string;
  crop: string;
  mandi: string;
  state: string;
  modal_price: number;
  min_price: number;
  max_price: number;
  msp: number;
  date: string;
}

export interface Grievance {
  id: string;
  farmer_id: string;
  booking_id: string | null;
  category: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  resolution: string | null;
  created_at: string;
}

export interface NotificationLog {
  id: string;
  farmer_id: string;
  channel: 'SMS' | 'IVR' | 'PUSH';
  template: string;
  payload: Record<string, any>;
  status: 'SENT' | 'DELIVERED' | 'FAILED';
  sent_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
