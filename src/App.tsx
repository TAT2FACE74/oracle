import { useCallback, useEffect, useState } from 'react';
import { Cinematic } from './components/Cinematic';
import { Hub } from './components/Hub';
import { Intro } from './components/Intro';
import { Incantation } from './components/Incantation';
import { RitualGate } from './components/RitualGate';
import { EyesGate } from './components/EyesGate';
import { FireTransition } from './components/FireTransition';
import { CardSelect } from './components/CardSelect';
import { Reading } from './components/Reading';
import { Upsell } from './components/Upsell';
import { DailyTransmission } from './components/DailyTransmission';
import { DeckGallery } from './components/DeckGallery';
import { MuteToggle } from './components/MuteToggle';
import { useSpeech } from './hooks/useSpeech';
import { useOraclePlus } from './hooks/useOraclePlus';
import {
  clearCheckoutParams,
  parseCheckoutReturn,
} from './lib/stripe';
import type { DrawnCard, Stage } from './types';
import './index.css';

export default function App() {
  const [stage, setStage] = useState<Stage>('cinematic');
  const [drawn, setDrawn] = useState<DrawnCard[]>([]);
  const [upsellBack, setUpsellBack] = useState<Stage>('hub');
  const [checkoutNotice, setCheckoutNotice] = useState<string | null>(null);
  const { speak, stop, muted, toggleMute, prefetch } = useSpeech();
  const {
    unlocked,
    entitlements,
    unlock,
    refresh,
    deckId,
    setDeckId,
    premiumArt,
    setPremiumArt,
    canUseDeck,
  } = useOraclePlus();

  // Handle Stripe Payment Link return (?unlock=plus|shadow|gilded)
  useEffect(() => {
    const { unlock: kind, success } = parseCheckoutReturn(window.location.search);
    if (!kind && !success) return;
    if (kind) {
      unlock(kind);
      const labels = {
        plus: 'Oracle+',
        shadow: 'Shadow Realm Skin',
        gilded: 'Gilded Obsidian Deck',
      } as const;
      setCheckoutNotice(`${labels[kind]} unlocked. Thank you, witness.`);
      setUpsellBack('hub');
      setStage('upsell');
    } else if (success) {
      refresh();
      setCheckoutNotice('Checkout complete. If unlocks are missing, tap Restore purchases.');
      setStage('upsell');
    }
    clearCheckoutParams();
  }, [unlock, refresh]);

  const go = useCallback(
    (s: Stage) => {
      stop();
      setStage(s);
    },
    [stop],
  );

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

  const openUpsell = useCallback(
    (from: Stage = stage) => {
      setUpsellBack(from === 'upsell' ? 'hub' : from);
      go('upsell');
    },
    [go, stage],
  );

  const hideMute =
    stage === 'eyes' ||
    stage === 'fire' ||
    stage === 'cinematic' ||
    stage === 'ritual';

  return (
    <div className={`app deck-theme-${deckId}${premiumArt ? ' premium-art-on' : ''}`}>
      {!hideMute && <MuteToggle muted={muted} onToggle={toggleMute} />}

      {stage === 'cinematic' && <Cinematic onComplete={() => go('hub')} />}
      {stage === 'hub' && (
        <Hub
          onRitual={() => go('intro')}
          onDaily={() => go('daily')}
          onDeck={() => go('deck')}
          onPlus={() => openUpsell('hub')}
          plusUnlocked={unlocked}
          speak={speak}
        />
      )}
      {stage === 'intro' && (
        <Intro
          onComplete={() => go('incantation')}
          speak={speak}
          stop={stop}
          prefetch={prefetch}
        />
      )}
      {stage === 'incantation' && (
        <Incantation onComplete={() => go('ritual')} />
      )}
      {stage === 'ritual' && (
        <RitualGate onComplete={() => go('select')} />
      )}
      {stage === 'eyes' && <EyesGate onComplete={() => go('fire')} />}
      {stage === 'fire' && (
        <FireTransition onComplete={() => go('select')} />
      )}
      {stage === 'select' && (
        <CardSelect
          onComplete={onSelectComplete}
          deckId={deckId}
          premiumArt={premiumArt && unlocked}
        />
      )}
      {stage === 'reading' && drawn.length === 5 && (
        <Reading
          drawn={drawn}
          speak={speak}
          stop={stop}
          prefetch={prefetch}
          onDrawAgain={drawAgain}
          onUpsell={() => openUpsell('reading')}
          plusUnlocked={unlocked}
          deckId={deckId}
          premiumArt={premiumArt && unlocked}
          onHome={() => go('hub')}
        />
      )}
      {stage === 'deck' && <DeckGallery onBack={() => go('hub')} />}
      {stage === 'daily' && (
        <DailyTransmission
          speak={speak}
          stop={stop}
          onBack={() => go('hub')}
          onRitual={() => go('intro')}
          deckId={deckId}
          premiumArt={premiumArt && unlocked}
        />
      )}
      {stage === 'upsell' && (
        <Upsell
          entitlements={entitlements}
          deckId={deckId}
          premiumArt={premiumArt}
          canUseDeck={canUseDeck}
          onSelectDeck={setDeckId}
          onPremiumArt={setPremiumArt}
          onRestore={() => {
            refresh();
            setCheckoutNotice('Purchases restored from this device.');
          }}
          onBack={() => go(upsellBack === 'reading' && drawn.length === 5 ? 'reading' : 'hub')}
          checkoutNotice={checkoutNotice}
        />
      )}
    </div>
  );
}
