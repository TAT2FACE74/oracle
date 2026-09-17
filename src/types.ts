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

export interface OracleCard {
  id: string;
  name: string;
  number: number;
  realm: Realm;
  keywords: [string, string];
  upright: string;
  reversed: string;
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
  Shadow: 'What stalks beneath — the force you have not yet named.',
  Crossroads: 'The blade of choice — tension between irreversible paths.',
  'Hidden Thread': 'The unseen cord binding your fate to another.',
  'Near Timeline': 'What approaches on the immediate, merciless horizon.',
  'Ascension Path': 'The harder trajectory — how you rise without lying.',
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
