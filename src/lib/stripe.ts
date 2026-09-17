/** Live Stripe Payment Links (also in .env.production). */
export const STRIPE_LINKS = {
  plus:
    import.meta.env.VITE_STRIPE_LINK_PLUS ||
    'https://buy.stripe.com/9B6cN4eSKcHXgqhawA0Fi01',
  shadow:
    import.meta.env.VITE_STRIPE_LINK_SHADOW ||
    'https://buy.stripe.com/5kQ7sK11UgYdca1bAE0Fi02',
  gilded:
    import.meta.env.VITE_STRIPE_LINK_GILDED ||
    'https://buy.stripe.com/6oUeVc3a2fU96PH9sw0Fi03',
} as const;

export type UnlockKind = keyof typeof STRIPE_LINKS;

export function checkoutUrl(kind: UnlockKind): string {
  return STRIPE_LINKS[kind];
}

/**
 * Parse return from Stripe Payment Link redirect.
 * Production-grade apps should verify via webhook / Checkout Session API —
 * this client unlock is convenience UX after a successful redirect.
 */
export function parseCheckoutReturn(search: string): {
  unlock: UnlockKind | null;
  success: boolean;
} {
  const params = new URLSearchParams(search);
  const unlockRaw = params.get('unlock');
  const success =
    params.get('checkout') === 'success' ||
    params.has('unlock') ||
    params.get('session_id') != null;
  const unlock =
    unlockRaw === 'plus' || unlockRaw === 'shadow' || unlockRaw === 'gilded'
      ? unlockRaw
      : null;
  return { unlock, success };
}

export function clearCheckoutParams(): void {
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete('unlock');
    url.searchParams.delete('checkout');
    url.searchParams.delete('session_id');
    window.history.replaceState({}, '', url.pathname + url.hash);
  } catch {
    /* ignore */
  }
}
