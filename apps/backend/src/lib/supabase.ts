// @ts-nocheck
// MOCKED SUPABASE CLIENT FOR DEMO
export function getEnvVar(env: any, key: string) { return ''; }
export function getSupabaseServiceClient(env: any) { return mockSupabase; }
export function getSupabaseAnonClient(env: any) { return mockSupabase; }

const mockSupabase = {
  from: (table: string) => ({
    select: () => ({
      eq: () => ({
        order: () => ({
          limit: () => ({
            maybeSingle: async () => ({ data: mockData(table, true) }),
            single: async () => ({ data: mockData(table, true) })
          }),
          maybeSingle: async () => ({ data: mockData(table, true) })
        }),
        gte: () => ({
          order: () => ({
            order: async () => ({ data: mockData(table) })
          })
        }),
        single: async () => ({ data: mockData(table, true) }),
        maybeSingle: async () => ({ data: mockData(table, true) })
      }),
      order: () => ({
        limit: async () => ({ data: mockData(table) }),
        async then(res: any) { res({ data: mockData(table) }) }
      }),
      single: async () => ({ data: mockData(table, true) }),
      async then(res: any) { res({ data: mockData(table) }) }
    }),
    insert: () => ({
      select: () => ({
        single: async () => ({ data: { id: 'bk-123', token_number: 'KS-2026-8899', status: 'BOOKED' } })
      }),
      async then(res: any) { res({ data: null, error: null }) }
    }),
    update: () => ({
      eq: async () => ({ data: null, error: null })
    })
  }),
  auth: {
    getUser: async () => ({ data: { user: { id: 'u1' } }, error: null }),
    signInWithOtp: async () => ({ data: {}, error: null }),
    verifyOtp: async () => ({ data: { session: { access_token: 'demo_token' } }, error: null })
  }
};

function mockData(table: string, single = false): any {
  const db: any = {
    centres: [
      { id: 1, name: 'Khanna Mandi', district: 'Ludhiana', state: 'Punjab', active: true, capacity: 300, current_queue: 45 },
      { id: 2, name: 'Amritsar Central', district: 'Amritsar', state: 'Punjab', active: true, capacity: 250, current_queue: 12 }
    ],
    slots: [
      { id: 1, centre_id: 1, date: '2026-09-17', start_time: '08:00:00', end_time: '10:00:00', capacity: 50, booked_count: 12 },
      { id: 2, centre_id: 1, date: '2026-09-17', start_time: '10:00:00', end_time: '12:00:00', capacity: 50, booked_count: 48 }
    ],
    prices: [
      { id: 1, crop: 'Wheat', mandi: 'Khanna', modal_price: 2350, msp: 2275, min_price: 2300, max_price: 2400, date: '2026-09-16' },
      { id: 2, crop: 'Rice', mandi: 'Amritsar', modal_price: 2200, msp: 2183, min_price: 2150, max_price: 2250, date: '2026-09-16' }
    ],
    farmers: [
      { id: 'u1', name: 'Gurpreet Singh', phone: '9876543210', village: 'Khanna Kalan', district: 'Ludhiana', state: 'Punjab' }
    ],
    bookings: [
      { id: 'b1', farmer_id: 'u1', centre_id: 1, slot_id: 1, crop: 'Wheat', status: 'BOOKED', token_number: 'KS-2026-1122' }
    ]
  };
  const res = db[table] || [];
  return single ? res[0] : res;
}
