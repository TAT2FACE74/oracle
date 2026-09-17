interface Props {
  onRitual: () => void;
  onDaily: () => void;
  onPlus: () => void;
  plusUnlocked: boolean;
}

export function Hub({ onRitual, onDaily, onPlus, plusUnlocked }: Props) {
  return (
    <div className="stage hub-stage fade-in">
      <div className="intro-orb hub-orb" aria-hidden />
      <h1 className="title-oracle">Oracle</h1>
      <p className="caption" style={{ marginBottom: '1.75rem', opacity: 0.75 }}>
        Choose your path through the veil.
      </p>
      <div className="hub-actions">
        <button type="button" className="btn-primary" onClick={onRitual}>
          Begin Ritual
        </button>
        <button type="button" className="btn-ghost" onClick={onDaily}>
          Daily Transmission
        </button>
        <button type="button" className="btn-ghost" onClick={onPlus}>
          {plusUnlocked ? 'Oracle+ · Decks' : 'Oracle+'}
        </button>
      </div>
    </div>
  );
}
