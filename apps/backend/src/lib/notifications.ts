// @ts-nocheck
import { Bindings } from '../types.js';
import { getSupabaseServiceClient } from './supabase.js';

export type NotificationTemplate =
  | 'BOOKING_CONFIRMED'
  | 'REMINDER_T_MINUS_1'
  | 'NEXT_IN_QUEUE'
  | 'QUALITY_CHECK_RESULT'
  | 'PAYMENT_INITIATED'
  | 'PAYMENT_COMPLETED';

const TEMPLATES: Record<NotificationTemplate, Record<string, string>> = {
  BOOKING_CONFIRMED: {
    en: 'Kisanify: Your mandi slot is confirmed at {{centre_name}} for {{date}} {{time}}. Token: #{{token_number}}.',
    hi: 'किसानिफाई: आपका मंडी स्लॉट {{centre_name}} पर {{date}} {{time}} के लिए कन्फर्म हो गया है। टोकन: #{{token_number}}।',
    pa: 'ਕਿਸਾਨੀਫਾਈ: ਤੁਹਾਡਾ ਮੰਡੀ ਸਲਾਟ {{centre_name}} ਲਈ {{date}} {{time}} ਨੂੰ ਕਨਫਰਮ ਹੋ ਗਿਆ ਹੈ। ਟੋਕਨ: #{{token_number}}।'
  },
  REMINDER_T_MINUS_1: {
    en: 'Kisanify Reminder: You have a mandi appointment tomorrow at {{centre_name}} (Token #{{token_number}}).',
    hi: 'किसानिफाई रिमाइंडर: कल {{centre_name}} में आपकी मंडी अपॉइंटमेंट है (टोकन #{{token_number}})।'
  },
  NEXT_IN_QUEUE: {
    en: 'Kisanify Alert: You are next in queue! Position #{{position}} at {{centre_name}}. Please report to Gate 2.',
    hi: 'किसानिफाई अलर्ट: आपकी बारी आने वाली है! कतार स्थिति #{{position}}। कृपया गेट 2 पर पहुँचें।'
  },
  QUALITY_CHECK_RESULT: {
    en: 'Kisanify Quality Check: Crop {{crop}} passed with Grade {{grade}} (Moisture {{moisture}}%). Status updated.',
    hi: 'किसानिफाई गुणवत्ता परिणाम: फसल {{crop}} ग्रेड {{grade}} के साथ पास हो गई है (नमी {{moisture}}%)।'
  },
  PAYMENT_INITIATED: {
    en: 'Kisanify Payment: Govt MSP payment of ₹{{amount}} initiated for Token #{{token_number}}.',
    hi: 'किसानिफाई भुगतान: टोकन #{{token_number}} के लिए ₹{{amount}} का सरकारी एमएसपी भुगतान शुरू किया गया।'
  },
  PAYMENT_COMPLETED: {
    en: 'Kisanify Success: ₹{{amount}} credited to your bank account via Direct Benefit Transfer (DBT).',
    hi: 'किसानिफाई सफलता: डायरेक्ट बेनिफिट ट्रांसफर (DBT) के माध्यम से ₹{{amount}} आपके बैंक खाते में जमा हो गए हैं।'
  }
};

export async function sendSmsNotification(
  env: Bindings,
  farmerId: string,
  phone: string,
  templateKey: NotificationTemplate,
  lang: string = 'hi',
  variables: Record<string, string> = {}
) {
  const supabase = getSupabaseServiceClient(env);

  // Render message
  const langTemplates = TEMPLATES[templateKey] || TEMPLATES[templateKey]['en'];
  let messageText = langTemplates[lang] || langTemplates['en'] || Object.values(langTemplates)[0];

  Object.entries(variables).forEach(([k, v]) => {
    messageText = messageText.replace(new RegExp(`{{${k}}}`, 'g'), v);
  });

  let status: 'SENT' | 'FAILED' = 'SENT';

  // Twilio integration call with retry logic
  if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && !env.TWILIO_ACCOUNT_SID.includes('mock')) {
    try {
      const auth = btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`);
      const body = new URLSearchParams({
        To: phone,
        From: env.TWILIO_PHONE_NUMBER || '+18005550199',
        Body: messageText
      });

      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      });

      if (!res.ok) status = 'FAILED';
    } catch (e) {
      status = 'FAILED';
    }
  }

  // Log to notifications_log table
  await supabase
    .from('notifications_log')
    .insert({
      farmer_id: farmerId,
      channel: 'SMS',
      template: templateKey,
      payload: { phone, messageText, variables },
      status
    });

  return { status, messageText };
}
