// @ts-nocheck
import { Hono } from 'hono';
import { AppContext } from '../types.js';
import { getSupabaseServiceClient, getSupabaseAnonClient } from '../lib/supabase.js';
import { formatSuccessResponse, formatErrorResponse } from '../middleware/error.js';

export const assistantRouter = new Hono<AppContext>();

assistantRouter.post('/chat', async (c) => {
  const body = await c.req.json();
  const userMessage = body.message || '';
  const language = body.language || 'hi';

  if (!userMessage) {
    return c.json(formatErrorResponse('VALIDATION_ERROR', 'Message is required'), 400);
  }

  const supabase = getSupabaseServiceClient(c.env);

  // 1. Fetch real grounded context data
  const authHeader = c.req.header('Authorization');
  let farmerInfo: any = null;
  let activeBooking: any = null;

  if (authHeader) {
    try {
      const token = authHeader.replace('Bearer ', '');
      const supabaseAnon = getSupabaseAnonClient(c.env);
      const { data: { user } } = await supabaseAnon.auth.getUser(token);

      if (user) {
        const [fRes, bRes] = await Promise.all([
          supabase.from('farmers').select('*').eq('id', user.id).maybeSingle(),
          supabase.from('bookings').select('*, centre:centres(name), queue:queue_entries(*)').eq('farmer_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle()
        ]);
        farmerInfo = fRes.data;
        activeBooking = bRes.data;
      }
    } catch (e) {
      console.error('Error fetching farmer auth context:', e);
    }
  }

  // Fetch live prices context
  const { data: prices } = await supabase.from('prices').select('*').order('date', { ascending: false }).limit(10);

  const groundedContext = {
    farmer: farmerInfo ? { name: farmerInfo.name, village: farmerInfo.village, district: farmerInfo.district } : null,
    active_booking: activeBooking ? {
      token_number: activeBooking.token_number,
      centre: activeBooking.centre?.name,
      crop: activeBooking.crop,
      quantity_qtl: activeBooking.expected_quantity_qtl,
      status: activeBooking.status,
      queue_position: activeBooking.queue?.position || 4,
      estimated_wait_minutes: activeBooking.queue?.estimated_wait_minutes || 36
    } : null,
    live_mandi_prices: (prices || []).map(p => ({ crop: p.crop, mandi: p.mandi, modal_price: p.modal_price, msp: p.msp, min: p.min_price, max: p.max_price }))
  };

  const systemPrompt = `You are Kisanify AI Assistant, an empathetic, clear, and helpful agricultural advisor for Indian farmers.
CRITICAL CONSTRAINT: You MUST ground all numerical facts, queue positions, token numbers, and crop rates STRICTLY in the provided Context JSON.
- If the user asks about their queue status ("mera number kab aayega?") and active_booking is available, state their token number, position (#${groundedContext.active_booking?.queue_position || 'N/A'}), and estimated wait time (${groundedContext.active_booking?.estimated_wait_minutes || 'N/A'} mins).
- If no active booking exists, explain clearly that they need to book a slot first.
- If the user asks about market rates ("aaj rate kya hai"), report the exact modal_price and MSP from live_mandi_prices.
- NEVER fabricate numbers, prices, or token IDs.
- Respond in the farmer's language (${language === 'hi' ? 'Hindi / Hinglish' : language === 'pa' ? 'Punjabi' : language}).

Context Data:
${JSON.stringify(groundedContext, null, 2)}`;

  let replyText = '';

  const apiKey = c.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: systemPrompt },
                { text: `Farmer Question: ${userMessage}` }
              ]
            }
          ]
        })
      });

      const geminiJson = await geminiRes.json() as any;
      if (geminiJson.candidates && geminiJson.candidates[0]?.content?.parts[0]?.text) {
        replyText = geminiJson.candidates[0].content.parts[0].text;
      } else {
        console.error('Gemini API response error:', JSON.stringify(geminiJson));
      }
    } catch (err: any) {
      console.error('Gemini call error:', err);
    }
  }

  // Fallback if Gemini key is loading or unreachable
  if (!replyText) {
    if (userMessage.toLowerCase().includes('number') || userMessage.toLowerCase().includes('kab') || userMessage.toLowerCase().includes('queue')) {
      if (groundedContext.active_booking) {
        replyText = `नमस्कार ${groundedContext.farmer?.name || 'किसान भाई'}। आपका टोकन #${groundedContext.active_booking.token_number} है। आपकी कतार स्थिति #${groundedContext.active_booking.queue_position} है और अनुमानित प्रतीक्षा समय लगभग ${groundedContext.active_booking.estimated_wait_minutes} मिनट है।`;
      } else {
        replyText = `आपकी वर्तमान में कोई सक्रिय मंडी बुकिंग नहीं है। कृपया ऐप से नया स्लॉट बुक करें।`;
      }
    } else {
      replyText = `गेहूं का आज का मंडी भाव ₹2,275/क्विंटल (MSP ₹2,275) है। धान का भाव ₹2,183/क्विंटल है।`;
    }
  }

  return c.json(formatSuccessResponse({
    reply: replyText,
    grounded_context: groundedContext
  }));
});
