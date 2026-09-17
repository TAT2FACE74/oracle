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

export type Suit = 'major' | 'wands' | 'cups' | 'swords' | 'pentacles';

export type DeckId = 'rws' | 'shadow' | 'gilded' | 'abyss';

export interface TarotCard {
  id: string;
  name: string;
  suit: Suit;
  number: number;
  keywords: string[];
  upright: string;
  reversed: string;
  glyph: string;
}

export interface DrawnCard {
  card: TarotCard;
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
  Shadow: 'What lurks beneath — the force you have not yet named.',
  Crossroads: 'The choice before you — tension between paths.',
  'Hidden Thread': 'The unseen connection binding your story.',
  'Near Timeline': 'What approaches on the immediate horizon.',
  'Ascension Path': 'The higher trajectory — how you rise.',
};

export const DECK_META: Record<
  DeckId,
  { id: DeckId; name: string; blurb: string; gated: boolean; unlockKey: 'plus' | 'shadow' | 'gilded' | null }
> = {
  rws: {
    id: 'rws',
    name: 'RWS Dark',
    blurb: 'Free classic Rider–Waite–Smith dark art.',
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
