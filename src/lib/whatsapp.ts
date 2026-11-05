export const WHATSAPP_URL = 'https://wa.me/233554794957';

/** Opens WhatsApp and records the tap (button name + page) without delaying the user. */
export function openWhatsApp(source: string) {
  try {
    const body = new Blob([JSON.stringify({ source, page: window.location.pathname })], {
      type: 'application/json',
    });
    if (!navigator.sendBeacon?.('/api/track/whatsapp', body)) {
      fetch('/api/track/whatsapp', { method: 'POST', body, keepalive: true }).catch(() => {});
    }
  } catch {
    // tracking must never block the chat
  }
  window.open(WHATSAPP_URL, '_blank', 'noopener');
}
