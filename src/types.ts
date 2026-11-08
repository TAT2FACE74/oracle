export type Stage =
  | 'cinematic'
  | 'hub'
  | 'intro'
  | 'incantation'
  | 'eyes'
  | 'fire'
  | 'select'
  | 'reveal'
  | 'reading'
  | 'upsell'
  | 'daily';

/** Visual skin / unlock tier — free deck is Veil of the Ash Realms. */
export type DeckId = 'veil' | 'shadow' | 'gilded' | 'abyss';

/** Realm flavor for original oracle messengers (not tarot suits). */
export type Realm = 'ash' | 'bone' | 'blood' | 'ember' | 'veil';

/**
 * Fortune body — flowing upright/reversed message prose from the card entity.
 * (Formerly structured as coming/workOn/watchFor — removed.)
 */
export type FortuneMessage = string;

export interface OracleCard {
  id: string;
  name: string;
  number: number;
  realm: Realm;
  keywords: [string, string];
  upright: FortuneMessage;
  reversed: FortuneMessage;
  glyph: string;
  image: string;
}

/** @deprecated alias — prefer OracleCard */
export type TarotCard = OracleCard;

export interface DrawnCard {
  card: OracleCard;
  reversed: boolean;
  position: number;
}

export type SpreadPosition =
  | 'Shadow'
  | 'Crossroads'
  | 'Hidden Thread'
  | 'Near Timeline'
  | 'Ascension Path';

export const SPREAD_POSITIONS: SpreadPosition[] = [
  'Shadow',
  'Crossroads',
  'Hidden Thread',
  'Near Timeline',
  'Ascension Path',
];

export const POSITION_DESCRIPTIONS: Record<SpreadPosition, string> = {
  Shadow: 'What moves beneath — the weight you feel before you can name it.',
  Crossroads: 'The choice itself — two real roads, and the honest cost of each.',
  'Hidden Thread': 'The unseen connection — how your days are tied to another person, habit, or promise.',
  'Near Timeline': 'What is close — the next days and weeks, arriving whether you prepare or not.',
  'Ascension Path': 'The honest road up — harder than the others, and the only one that holds.',
};

export const DECK_META: Record<
  DeckId,
  { id: DeckId; name: string; blurb: string; gated: boolean; unlockKey: 'plus' | 'shadow' | 'gilded' | null }
> = {
  veil: {
    id: 'veil',
    name: 'Veil of the Ash Realms',
    blurb: 'Free 44-card dark oracle — original messengers of fate.',
    gated: false,
    unlockKey: null,
  },
  shadow: {
    id: 'shadow',
    name: 'Shadow Realm',
    blurb: 'Desaturated crimson alt faces from the underworld.',
    gated: true,
    unlockKey: 'shadow',
  },
  gilded: {
    id: 'gilded',
    name: 'Gilded Obsidian',
    blurb: 'Gold foil borders on black glass.',
    gated: true,
    unlockKey: 'gilded',
  },
  abyss: {
    id: 'abyss',
    name: 'Abyss Chrome',
    blurb: 'Cold chrome mirrors of the deep void.',
    gated: true,
    unlockKey: 'plus',
  },
};

export const DECK_NAME = 'Veil of the Ash Realms';

/** Soft voice / oracle branding — mystical elder woman, not a caricature. */
export const FORTUNE_TELLER_TITLE = 'The Fortune Teller';
export const FORTUNE_TELLER_EPITHET = 'Elder of the Crossroads';
