// CRM hand-off. Every lead event is stored in Supabase first; if CRM_WEBHOOK_URL is
// set, it is also POSTed there as JSON. Point it at Zapier / Make / n8n (which can
// create a contact in HubSpot, Zoho, Pipedrive, Google Sheets…) or a CRM's own
// webhook endpoint. Optional CRM_WEBHOOK_SECRET is sent as an HMAC signature.
//
// Payload: { type: "inquiry" | "whatsapp_click", id, occurred_at, data: {...} }

import crypto from 'crypto';

const TIMEOUT_MS = 4000;

export function crmEnabled() {
  return !!process.env.CRM_WEBHOOK_URL;
}

/** Sends one event to the CRM webhook. Resolves true on a 2xx reply, never throws. */
export async function sendToCrm(event) {
  const url = process.env.CRM_WEBHOOK_URL;
  if (!url) return false;
  const body = JSON.stringify({ ...event, occurred_at: event.occurred_at ?? new Date().toISOString() });
  const headers = { 'Content-Type': 'application/json', 'User-Agent': 'PrincessTravelConsult-Website' };
  if (process.env.CRM_WEBHOOK_SECRET) {
    headers['X-Signature-SHA256'] = crypto
      .createHmac('sha256', process.env.CRM_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');
  }
  try {
    const res = await fetch(url, { method: 'POST', headers, body, signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) console.error(`CRM webhook replied ${res.status} for ${event.type} ${event.id}`);
    return res.ok;
  } catch (err) {
    console.error(`CRM webhook failed for ${event.type} ${event.id}:`, err.message);
    return false;
  }
}
