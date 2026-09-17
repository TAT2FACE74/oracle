import { useCallback, useState } from 'react';
import { Intro } from './components/Intro';
import { Incantation } from './components/Incantation';
import { EyesGate } from './components/EyesGate';
import { FireTransition } from './components/FireTransition';
import { CardSelect } from './components/CardSelect';
import { Reading } from './components/Reading';
import { Upsell } from './components/Upsell';
import { MuteToggle } from './components/MuteToggle';
import { useSpeech } from './hooks/useSpeech';
import { useOraclePlus } from './hooks/useOraclePlus';
import type { DrawnCard, Stage } from './types';
import './index.css';

export default function App() {
  const [stage, setStage] = useState<Stage>('intro');
  const [drawn, setDrawn] = useState<DrawnCard[]>([]);
  const { speak, stop, muted, toggleMute } = useSpeech();
  const { unlocked, unlock } = useOraclePlus();

  const go = useCallback((s: Stage) => {
    stop();
    setStage(s);
  }, [stop]);

  const onSelectComplete = useCallback(
    (cards: DrawnCard[]) => {
      setDrawn(cards);
      stop();
      setStage('reading');
    },
    [stop],
  );

  const drawAgain = useCallback(() => {
    stop();
    setDrawn([]);
    setStage('fire');
  }, [stop]);

  return (
    <div className="app">
      {stage !== 'eyes' && stage !== 'fire' && (
        <MuteToggle muted={muted} onToggle={toggleMute} />
      )}

      {stage === 'intro' && (
        <Intro onComplete={() => go('incantation')} speak={speak} stop={stop} />
      )}
      {stage === 'incantation' && (
        <Incantation onComplete={() => go('eyes')} />
      )}
      {stage === 'eyes' && <EyesGate onComplete={() => go('fire')} />}
      {stage === 'fire' && (
        <FireTransition onComplete={() => go('select')} />
      )}
      {stage === 'select' && <CardSelect onComplete={onSelectComplete} />}
      {stage === 'reading' && drawn.length === 5 && (
        <Reading
          drawn={drawn}
          speak={speak}
          stop={stop}
          onDrawAgain={drawAgain}
          onUpsell={() => go('upsell')}
          plusUnlocked={unlocked}
        />
      )}
      {stage === 'upsell' && (
        <Upsell
          unlocked={unlocked}
          onUnlock={unlock}
          onBack={() => go('reading')}
        />
      )}
    </div>
  );
}
