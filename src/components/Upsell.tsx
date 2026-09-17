interface Props {
  unlocked: boolean;
  onUnlock: () => void;
  onBack: () => void;
}

const FEATURES = [
  '10-card Depth Spread — the Abyss layout',
  'Abyss Voice Pack — deeper ritual narration',
  'Export reading (mock) — share your spread',
  'Relationship & Career dedicated spreads',
  'Ritual skins — altar themes for the veil',
];

export function Upsell({ unlocked, onUnlock, onBack }: Props) {
  return (
    <div className="stage fade-in">
      <div className="upsell-sheet">
        <h2>
          Oracle+{unlocked && <span className="badge-plus">ACTIVE</span>}
        </h2>
        {!unlocked ? (
          <div className="upsell-price">
            $9.99
            <span>one-time demo unlock</span>
          </div>
        ) : (
          <p
            className="caption"
            style={{ marginBottom: '1.25rem', fontSize: '1rem' }}
          >
            The veil is lifted. Premium currents are yours.
          </p>
        )}

        <ul className="feature-list">
          {FEATURES.map((f) => (
            <li key={f}>
              <span>
                {f}
                {!unlocked && (
                  <span style={{ color: 'var(--bone-dim)', fontSize: '0.85rem' }}>
                    {' '}
                    (gated)
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>

        <div className="upsell-actions">
          {!unlocked ? (
            <button
              type="button"
              className="btn-primary"
              onClick={onUnlock}
            >
              Unlock demo · $9.99
            </button>
          ) : (
            <p className="locked-note">
              Plus features are unlocked in this session (mock). Free 5-card flow remains fully available.
            </p>
          )}
          <button type="button" className="btn-ghost" onClick={onBack}>
            Return to reading
          </button>
        </div>
      </div>
    </div>
  );
}
