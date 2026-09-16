// @ts-nocheck
import { Hono } from 'hono';
import { AppContext } from '../types.js';
import { getSupabaseServiceClient } from '../lib/supabase.js';

export const ivrRouter = new Hono<AppContext>();

// Level 1: Inbound Call Entrypoint -> Welcome & Request Mobile Number
ivrRouter.post('/incoming', (c) => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi" language="hi-IN">
    किसानिफाई स्मार्ट मंडी हेल्पलाइन में आपका स्वागत है।
  </Say>
  <Gather numDigits="10" action="/ivr/menu" method="POST" timeout="10">
    <Say voice="Polly.Aditi" language="hi-IN">
      कृपया अपनी बुकिंग और कतार स्थिति जानने के लिए अपना 10 अंकों का पंजीकृत मोबाइल नंबर दर्ज करें।
    </Say>
  </Gather>
  <Say voice="Polly.Aditi" language="hi-IN">
    समय समाप्त हो गया। धन्यवाद।
  </Say>
</Response>`;

  return c.text(xml, 200, { 'Content-Type': 'application/xml' });
});

// Level 2: Menu / Phone Digits Handling -> Lookup Active Queue Position & Status
ivrRouter.post('/menu', async (c) => {
  let digits = '';
  try {
    const bodyText = await c.req.text();
    const params = new URLSearchParams(bodyText);
    digits = params.get('Digits') || '';
  } catch (e) {
    digits = '';
  }

  const formattedPhone = digits.length === 10 ? `+91${digits}` : digits;
  const supabase = getSupabaseServiceClient(c.env);

  // Lookup farmer and booking
  const { data: farmer } = await supabase
    .from('farmers')
    .select('id, name')
    .or(`phone.eq.${formattedPhone},phone.eq.${digits}`)
    .maybeSingle();

  let responseSay = '';

  if (!farmer) {
    responseSay = `आपका मोबाइल नंबर ${digits} पंजीकृत नहीं पाया गया। कृपया किसानिफाई ऐप डाउनलोड करें।`;
  } else {
    const { data: booking } = await supabase
      .from('bookings')
      .select('*, centre:centres(name), queue:queue_entries(position, estimated_wait_minutes)')
      .eq('farmer_id', farmer.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!booking) {
      responseSay = `नमस्कार ${farmer.name}, आपकी आज की कोई सक्रिय मंडी बुकिंग नहीं है।`;
    } else {
      const pos = booking.queue?.position || 1;
      const wait = booking.queue?.estimated_wait_minutes || 15;
      responseSay = `नमस्कार ${farmer.name}। ${booking.centre?.name} में आपकी टोकन संख्या है ${booking.token_number}। आपकी वर्तमान कतार स्थिति नंबर ${pos} है। अनुमानित प्रतीक्षा समय लगभग ${wait} मिनट है। आपकी स्थिति है: ${booking.status}`;
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi" language="hi-IN">
    ${responseSay}
  </Say>
  <Say voice="Polly.Aditi" language="hi-IN">
    किसानिफाई सेवा का उपयोग करने के लिए धन्यवाद। आपका दिन शुभ हो!
  </Say>
</Response>`;

  return c.text(xml, 200, { 'Content-Type': 'application/xml' });
});
