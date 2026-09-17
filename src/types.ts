export type Stage =
  | 'intro'
  | 'incantation'
  | 'eyes'
  | 'fire'
  | 'select'
  | 'reveal'
  | 'reading'
  | 'upsell';

export type Suit = 'major' | 'wands' | 'cups' | 'swords' | 'pentacles';

export interface TarotCard {
  id: string;
  name: string;
  suit: Suit;
  number: number; // 0-21 majors, 1-14 minors (11=Page,12=Knight,13=Queen,14=King)
  keywords: string[];
  upright: string;
  reversed: string;
  glyph: string; // decorative symbol
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
