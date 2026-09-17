import { DECK_META, type DeckId } from '../types';
import { checkoutUrl, type UnlockKind } from '../lib/stripe';
import type { Entitlements } from '../hooks/useOraclePlus';

interface Props {
  entitlements: Entitlements;
  deckId: DeckId;
  premiumArt: boolean;
  canUseDeck: (id: DeckId) => boolean;
  onSelectDeck: (id: DeckId) => void;
  onPremiumArt: (on: boolean) => void;
  onRestore: () => void;
  onBack: () => void;
  checkoutNotice?: string | null;
}

export function Upsell({
  entitlements,
  deckId,
  premiumArt,
  canUseDeck,
  onSelectDeck,
  onPremiumArt,
  onRestore,
  onBack,
  checkoutNotice,
}: Props) {
  const goCheckout = (kind: UnlockKind) => {
    window.location.href = checkoutUrl(kind);
  };

  return (
    <div className="stage fade-in" style={{ overflowY: 'auto' }}>
      <div className="upsell-sheet">
        <h2>
          Oracle+
          {entitlements.plus && <span className="badge-plus">ACTIVE</span>}
        </h2>

        {checkoutNotice && (
          <p className="checkout-notice">{checkoutNotice}</p>
        )}

        {!entitlements.plus ? (
          <div className="upsell-price">
            $9.99
            <span>one-time · live Stripe Checkout</span>
          </div>
        ) : (
          <p className="caption" style={{ marginBottom: '1rem', fontSize: '1rem' }}>
            The veil is lifted. Premium currents are yours.
          </p>
        )}

        <ul className="feature-list">
          <li>Master unlock — Abyss Chrome deck + premium art</li>
          <li>Shadow Realm Deck — desaturated crimson faces ($4.99)</li>
          <li>Gilded Obsidian — gold foil borders ($4.99)</li>
          <li>Animated shimmer on card faces</li>
        </ul>

        <div className="upsell-actions">
          {!entitlements.plus && (
            <button
              type="button"
              className="btn-primary"
              onClick={() => goCheckout('plus')}
            >
              Unlock Oracle+ · $9.99
            </button>
          )}

          {!entitlements.shadow && !entitlements.plus && (
            <button
              type="button"
              className="btn-ghost"
              onClick={() => goCheckout('shadow')}
            >
              Shadow Realm Deck · $4.99
            </button>
          )}

          {!entitlements.gilded && !entitlements.plus && (
            <button
              type="button"
              className="btn-ghost"
              onClick={() => goCheckout('gilded')}
            >
              Gilded Obsidian · $4.99
            </button>
          )}

          <div className="deck-picker">
            <h3>Deck skin</h3>
            <div className="deck-grid">
              {(Object.keys(DECK_META) as DeckId[]).map((id) => {
                const meta = DECK_META[id];
                const allowed = canUseDeck(id);
                return (
                  <button
                    key={id}
                    type="button"
                    className={`deck-chip ${deckId === id ? 'active' : ''} ${
                      !allowed ? 'locked' : ''
                    }`}
                    disabled={!allowed}
                    onClick={() => onSelectDeck(id)}
                    title={meta.blurb}
                  >
                    {meta.name}
                    {!allowed && ' 🔒'}
                  </button>
                );
              })}
            </div>
          </div>

          {(entitlements.plus || entitlements.shadow || entitlements.gilded) && (
            <label className="premium-toggle">
              <input
                type="checkbox"
                checked={premiumArt && entitlements.plus}
                disabled={!entitlements.plus}
                onChange={(e) => onPremiumArt(e.target.checked)}
              />
              <span>Premium art shimmer {!entitlements.plus && '(needs Oracle+)'}</span>
            </label>
          )}

          <button type="button" className="btn-ghost" onClick={onRestore}>
            Restore purchases
          </button>

          <p className="locked-note">
            Payments via Stripe. After checkout you return here unlocked.
            Production-grade verification should use webhooks / session check.
          </p>

          <button type="button" className="btn-ghost" onClick={onBack}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
