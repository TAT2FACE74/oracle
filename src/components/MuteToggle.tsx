interface Props {
  muted: boolean;
  onToggle: () => void;
}

export function MuteToggle({ muted, onToggle }: Props) {
  return (
    <button
      type="button"
      className="mute-btn"
      onClick={onToggle}
      aria-label={muted ? 'Unmute the Fortune Teller' : 'Mute the Fortune Teller'}
      title={muted ? 'Unmute — Elder of the Crossroads' : 'Mute — The Fortune Teller'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
}
