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
      aria-label={muted ? 'Unmute narration' : 'Mute narration'}
      title={muted ? 'Unmute' : 'Mute'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
}
