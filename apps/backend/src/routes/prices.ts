// @ts-nocheck
import { Hono } from 'hono';
import { AppContext } from '../types.js';
import { getSupabaseServiceClient } from '../lib/supabase.js';
import { formatSuccessResponse, formatErrorResponse } from '../middleware/error.js';

export const pricesRouter = new Hono<AppContext>();

pricesRouter.get('/', async (c) => {
  const supabase = getSupabaseServiceClient(c.env);

  const { data: priceRecords, error } = await supabase
    .from('prices')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    return c.json(formatErrorResponse('DB_ERROR', error.message), 500);
  }

  // Group by crop and compute sparkline and recommendation
  const cropMap = new Map<string, any[]>();
  (priceRecords || []).forEach((item) => {
    const list = cropMap.get(item.crop) || [];
    list.push(item);
    cropMap.set(item.crop, list);
  });

  const result = Array.from(cropMap.entries()).map(([crop, records]) => {
    const latest = records[0];
    const sparkline = records
      .slice(0, 7)
      .map(r => ({ date: r.date, price: Number(r.modal_price) }))
      .reverse();

    // Recommendation logic: compare latest modal_price with MSP and 7-day trend
    const modalPrice = Number(latest.modal_price);
    const msp = Number(latest.msp);
    const prevPrice = sparkline.length > 1 ? sparkline[0].price : modalPrice;

    let hint = 'HOLD';
    let hintReason = 'Market price is below MSP. Recommend holding or selling via MSP procurement slot.';

    if (modalPrice >= msp * 1.05) {
      hint = 'SELL_NOW';
      hintReason = 'Market price is 5%+ above MSP. Strong demand in mandi today!';
    } else if (modalPrice >= msp && modalPrice >= prevPrice) {
      hint = 'SELL_NOW';
      hintReason = 'Price is trending upward above MSP. Good time to book procurement slot.';
    }

    return {
      crop,
      latest,
      sparkline,
      recommendation: {
        hint,
        hintReason,
        mspDifference: modalPrice - msp
      }
    };
  });

  return c.json(formatSuccessResponse(result));
});
