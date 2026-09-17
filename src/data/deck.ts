import type { TarotCard } from '../types';

export const DECK: TarotCard[] = [
  // —— MAJOR ARCANA ——
  {
    id: 'major-0',
    name: 'The Fool',
    suit: 'major',
    number: 0,
    glyph: '✦',
    keywords: ['beginnings', 'faith', 'leap', 'innocence'],
    upright:
      'A sacred threshold opens. You stand at the edge of the known, asked to trust the fall. The Fool does not stumble blindly — they leap because the void itself has whispered permission. Begin before you feel ready.',
    reversed:
      'Recklessness disguised as freedom, or fear dressed as caution. You cling to the cliff while destiny waits below. Either you refuse the leap, or you leap without listening. Reclaim discernment.',
  },
  {
    id: 'major-1',
    name: 'The Magician',
    suit: 'major',
    number: 1,
    glyph: '☿',
    keywords: ['will', 'manifestation', 'focus', 'channel'],
    upright:
      'All tools are already in your hands. Above and below align through your focused will. Speak your intention clearly — the Magician reminds you that energy follows attention, and attention follows choice.',
    reversed:
      'Scattered power, manipulative intent, or unused gifts. Talent without discipline becomes noise. Stop performing magic for an audience and return to the quiet work of true creation.',
  },
  {
    id: 'major-2',
    name: 'The High Priestess',
    suit: 'major',
    number: 2,
    glyph: '☽',
    keywords: ['intuition', 'mystery', 'veil', 'inner knowing'],
    upright:
      'The veil parts for those who listen in stillness. What cannot be explained by logic is already known by your deeper self. Trust the dream, the omen, the pause between thoughts.',
    reversed:
      'Secrets withheld — from others or from yourself. You drown intuition in noise, or weaponize mystery to avoid truth. Sit with what you do not want to know.',
  },
  {
    id: 'major-3',
    name: 'The Empress',
    suit: 'major',
    number: 3,
    glyph: '♀',
    keywords: ['abundance', 'creation', 'nurture', 'embodiment'],
    upright:
      'Life wants to bloom through you. Creativity, fertility of ideas, sensual presence — the Empress blesses what you tend with patience and love. Receive as well as give.',
    reversed:
      'Creative drought, overgiving until empty, or clinging to comfort that softens the soul. Nurture yourself first, or the garden withers from neglect of the gardener.',
  },
  {
    id: 'major-4',
    name: 'The Emperor',
    suit: 'major',
    number: 4,
    glyph: '♂',
    keywords: ['structure', 'authority', 'boundaries', 'order'],
    upright:
      'Sovereignty requires structure. Build the frame that protects your vision. Leadership, discipline, and clear boundaries are not cages — they are the architecture of lasting power.',
    reversed:
      'Tyranny or abdication. Control that crushes, or chaos from refusing to claim authority. Soften the iron fist, or stand up and take the throne you have been avoiding.',
  },
  {
    id: 'major-5',
    name: 'The Hierophant',
    suit: 'major',
    number: 5,
    glyph: '✝',
    keywords: ['tradition', 'teaching', 'initiation', 'lineage'],
    upright:
      'Sacred knowledge passed through lineage. Seek a teacher, honor a tradition, or become the bridge yourself. Initiation is not conformity — it is entering a current larger than ego.',
    reversed:
      'Blind dogma or rebellious rejection of all structure. Question the temple without burning it. Find your own rite of passage beyond inherited scripts.',
  },
  {
    id: 'major-6',
    name: 'The Lovers',
    suit: 'major',
    number: 6,
    glyph: '♡',
    keywords: ['union', 'choice', 'alignment', 'values'],
    upright:
      'A sacred choice of the heart. Not merely romance — the alignment of values, the union of inner opposites. Choose what your soul recognizes as true, even when it costs comfort.',
    reversed:
      'Misalignment, temptation without integrity, or avoidance of a necessary choice. Harmony cannot be forced. Examine where desire and truth diverge.',
  },
  {
    id: 'major-7',
    name: 'The Chariot',
    suit: 'major',
    number: 7,
    glyph: '⚔',
    keywords: ['drive', 'victory', 'willpower', 'direction'],
    upright:
      'Opposed forces harnessed toward one destination. Discipline your wild horses. Momentum is yours if intention stays sharp. Victory belongs to those who steer through chaos.',
    reversed:
      'Scattered drive, aggression without aim, or stalled progress from conflicting desires. Reclaim the reins. Direction matters more than speed.',
  },
  {
    id: 'major-8',
    name: 'Strength',
    suit: 'major',
    number: 8,
    glyph: '∞',
    keywords: ['courage', 'compassion', 'inner fire', 'gentle power'],
    upright:
      'True strength tames the beast with tenderness, not force. Your courage is quiet and enduring. Meet fear with presence; meet rage with understanding. The lion yields to love.',
    reversed:
      'Self-doubt, suppressed emotion, or brute force where softness is needed. Your power is not gone — it is misdirected. Soften, then stand.',
  },
  {
    id: 'major-9',
    name: 'The Hermit',
    suit: 'major',
    number: 9,
    glyph: '⟁',
    keywords: ['solitude', 'wisdom', 'inner light', 'withdrawal'],
    upright:
      'Retreat is not escape — it is pilgrimage inward. Carry your lantern into the mountain silence. Answers arrive when noise falls away. Be alone with what is real.',
    reversed:
      'Isolation that calcifies, or refusal to seek solitude when the soul demands it. Balance the cave and the world. Do not hide from your own light.',
  },
  {
    id: 'major-10',
    name: 'Wheel of Fortune',
    suit: 'major',
    number: 10,
    glyph: '☸',
    keywords: ['cycles', 'fate', 'turning point', 'destiny'],
    upright:
      'The wheel turns. What rises will fall; what falls will rise. Synchronicity thickens around you. Cooperate with the turn rather than gripping the spokes. Destiny is motion.',
    reversed:
      'Resistance to change, bad timing, or clinging to a cycle that has ended. Stop fighting the turn. Release what no longer belongs to this revolution.',
  },
  {
    id: 'major-11',
    name: 'Justice',
    suit: 'major',
    number: 11,
    glyph: '⚖',
    keywords: ['truth', 'balance', 'karma', 'accountability'],
    upright:
      'Cause and effect stand naked before you. Truth cuts clean. Own what is yours; release what is not. Fairness is not softness — it is precise alignment with reality.',
    reversed:
      'Injustice, denial of consequences, or harsh self-judgment. The scales tip. Correct the imbalance — in the world or within — with honesty, not vengeance.',
  },
  {
    id: 'major-12',
    name: 'The Hanged Man',
    suit: 'major',
    number: 12,
    glyph: '∇',
    keywords: ['surrender', 'perspective', 'pause', 'sacrifice'],
    upright:
      'Hang voluntarily between worlds. Surrender the old view so a new one can arrive. This pause is sacred. What feels like suspension is initiation into deeper sight.',
    reversed:
      'Stalling that has become avoidance, or martyrdom without meaning. Release the rope or commit to the hanging. Half-measures waste the sacrifice.',
  },
  {
    id: 'major-13',
    name: 'Death',
    suit: 'major',
    number: 13,
    glyph: '☠',
    keywords: ['ending', 'transformation', 'release', 'rebirth'],
    upright:
      'An ending that clears the field for rebirth. Do not romanticize what must die. Mourn cleanly, then walk through the gate. Transformation requires the corpse of the old self.',
    reversed:
      'Resistance to necessary endings. You drag a dead thing because familiarity feels safer than the void. Let go. The new life cannot enter a occupied tomb.',
  },
  {
    id: 'major-14',
    name: 'Temperance',
    suit: 'major',
    number: 14,
    glyph: '⚗',
    keywords: ['alchemy', 'balance', 'patience', 'integration'],
    upright:
      'Alchemy of opposites. Blend fire and water with patience. Healing is gradual, sacred, and precise. You are the vessel where extremes become medicine.',
    reversed:
      'Imbalance, impatience, or forcing synthesis before readiness. Excess in any direction poisons the brew. Return to the middle path and stir slowly.',
  },
  {
    id: 'major-15',
    name: 'The Devil',
    suit: 'major',
    number: 15,
    glyph: '⛧',
    keywords: ['bondage', 'shadow', 'temptation', 'material chains'],
    upright:
      'Chains you can unlock — if you admit you hold the key. Attachment, addiction, or the seductive lie that you are powerless. Look at the shadow without flinching. Freedom begins with naming the chain.',
    reversed:
      'Breaking free, or deeper entanglement denied. Liberation is near, but only if you stop romanticizing the cage. Sever the cord with clarity.',
  },
  {
    id: 'major-16',
    name: 'The Tower',
    suit: 'major',
    number: 16,
    glyph: '⚡',
    keywords: ['upheaval', 'revelation', 'collapse', 'truth strike'],
    upright:
      'Lightning strikes the false structure. What was built on illusion cannot stand. Shocking, yes — and liberating. After the rubble, the sky is visible again. Rebuild on bedrock.',
    reversed:
      'Delayed collapse, fear of upheaval, or clinging to ruins. The strike may be internal rather than external. Soften into the necessary demolition before it is forced.',
  },
  {
    id: 'major-17',
    name: 'The Star',
    suit: 'major',
    number: 17,
    glyph: '★',
    keywords: ['hope', 'healing', 'guidance', 'renewal'],
    upright:
      'After the storm, starlight. Quiet hope returns. You are being guided — not with thunder, but with a soft, persistent light. Heal. Trust. Pour water back into the earth of your life.',
    reversed:
      'Disconnection from hope, cynicism, or spiritual drought. The stars have not left — your eyes have closed. Look up again. Allow yourself to believe in renewal.',
  },
  {
    id: 'major-18',
    name: 'The Moon',
    suit: 'major',
    number: 18,
    glyph: '☾',
    keywords: ['illusion', 'dreams', 'fear', 'unconscious'],
    upright:
      'The path through fog and dream. Not everything you see is true — and not everything true is visible. Honor intuition while testing illusion. The unconscious speaks in symbols; listen carefully.',
    reversed:
      'Confusion lifting, or deeper deception. Paranoia versus genuine intuition. Clarify what is fear and what is omen. Seek solid ground beneath the mist.',
  },
  {
    id: 'major-19',
    name: 'The Sun',
    suit: 'major',
    number: 19,
    glyph: '☀',
    keywords: ['vitality', 'clarity', 'joy', 'success'],
    upright:
      'Radiance without apology. Clarity, vitality, childlike truth. What was hidden is illuminated. Celebrate without guilt. Your light is not arrogance — it is life expressing itself.',
    reversed:
      'Temporary clouding of joy, delayed success, or forced positivity. The sun still burns behind the cloud. Rest, then return to your warmth without performing happiness.',
  },
  {
    id: 'major-20',
    name: 'Judgement',
    suit: 'major',
    number: 20,
    glyph: '📯',
    keywords: ['awakening', 'reckoning', 'calling', 'absolution'],
    upright:
      'The horn sounds. Rise from the old life. This is reckoning and absolution together — answer the call of your higher purpose. What you have been is forgiven; what you will be awaits.',
    reversed:
      'Self-doubt blocking the call, harsh inner judgment, or refusal to rise. You hear the horn but stay in the coffin. Forgive yourself and stand.',
  },
  {
    id: 'major-21',
    name: 'The World',
    suit: 'major',
    number: 21,
    glyph: '◎',
    keywords: ['completion', 'wholeness', 'integration', 'mastery'],
    upright:
      'A cycle completes. Wholeness achieved — not perfection, but integration. Dance within the wreath of accomplishment, then prepare for the next spiral. You have arrived, and the journey continues.',
    reversed:
      'Near-completion stalled, unfinished business, or fear of the next beginning. Close the circle cleanly. Do not leave loose threads binding you to an ended chapter.',
  },

  // —— WANDS ——
  {
    id: 'wands-1',
    name: 'Ace of Wands',
    suit: 'wands',
    number: 1,
    glyph: '🜂',
    keywords: ['spark', 'inspiration', 'new fire', 'potential'],
    upright:
      'A pure spark of creative fire arrives. Seize it before it cools. This is raw potential — a project, passion, or awakening. Act while the flame is white-hot.',
    reversed:
      'False starts, blocked passion, or inspiration ignored. The spark exists but lacks fuel or courage. Clear the damp wood and try again.',
  },
  {
    id: 'wands-2',
    name: 'Two of Wands',
    suit: 'wands',
    number: 2,
    glyph: '🜂',
    keywords: ['planning', 'vision', 'worldview', 'decision'],
    upright:
      'You hold the world in contemplation. Vision expands beyond current borders. Plan boldly, but remember: maps are not territory. Choose a direction and step.',
    reversed:
      'Fear of the unknown, narrow vision, or analysis paralysis. You grip the wand but will not walk. Expand or stagnate — the choice is yours.',
  },
  {
    id: 'wands-3',
    name: 'Three of Wands',
    suit: 'wands',
    number: 3,
    glyph: '🜂',
    keywords: ['expansion', 'foresight', 'waiting ships', 'progress'],
    upright:
      'Ships you launched return with news. Expansion is underway. Stand on the cliff and watch your efforts reach distant shores. Patience paired with vision.',
    reversed:
      'Delays, limited horizons, or frustration with slow returns. Trust the voyage. Recalibrate if needed, but do not abandon ships already at sea.',
  },
  {
    id: 'wands-4',
    name: 'Four of Wands',
    suit: 'wands',
    number: 4,
    glyph: '🜂',
    keywords: ['celebration', 'homecoming', 'stability', 'joy'],
    upright:
      'A threshold of celebration. Home, community, milestone achieved. Pause to honor what has been built. Joy is not a distraction from the path — it is fuel.',
    reversed:
      'Unstable foundations, delayed celebration, or tension in what should feel like home. Repair the structure before the feast. Harmony requires honesty.',
  },
  {
    id: 'wands-5',
    name: 'Five of Wands',
    suit: 'wands',
    number: 5,
    glyph: '🜂',
    keywords: ['conflict', 'competition', 'chaos', 'sparring'],
    upright:
      'Creative conflict — sticks clashing, egos testing. Not all struggle is destruction; some is sharpening. Engage fairly. Growth often arrives dressed as rivalry.',
    reversed:
      'Conflict avoided or escalating past usefulness. Either step into the sparring ring or walk away cleanly. Passive aggression solves nothing.',
  },
  {
    id: 'wands-6',
    name: 'Six of Wands',
    suit: 'wands',
    number: 6,
    glyph: '🜂',
    keywords: ['victory', 'recognition', 'confidence', 'progress'],
    upright:
      'Public recognition of private labor. Ride the victory with humility. You have earned this moment — let it strengthen your resolve for the next ascent.',
    reversed:
      'Ego inflation, unrecognized effort, or fear of visibility. Success delayed is not success denied. Keep moving; applause is not the destination.',
  },
  {
    id: 'wands-7',
    name: 'Seven of Wands',
    suit: 'wands',
    number: 7,
    glyph: '🜂',
    keywords: ['defense', 'perseverance', 'conviction', 'stand'],
    upright:
      'Hold the high ground. Challenges rise from below — defend what you know is true. Perseverance under pressure reveals the metal of your conviction.',
    reversed:
      'Overwhelm, giving ground too soon, or defending the wrong hill. Choose your battles. Not every challenge deserves your fire.',
  },
  {
    id: 'wands-8',
    name: 'Eight of Wands',
    suit: 'wands',
    number: 8,
    glyph: '🜂',
    keywords: ['swiftness', 'messages', 'acceleration', 'alignment'],
    upright:
      'Events accelerate. Messages fly. What was stalled now moves with purpose. Align with the current — hesitation now costs more than action.',
    reversed:
      'Delays, miscommunication, or scattered energy. Slow the rush enough to aim. Speed without direction multiplies error.',
  },
  {
    id: 'wands-9',
    name: 'Nine of Wands',
    suit: 'wands',
    number: 9,
    glyph: '🜂',
    keywords: ['resilience', 'guard', 'last stand', 'wounded warrior'],
    upright:
      'Battle-worn but standing. One more push. Your resilience is proven — protect your boundaries and finish what you began. Strength remains even in exhaustion.',
    reversed:
      'Paranoia, burnout, or walls so high nothing enters. Rest is not surrender. Lay down the wand long enough to heal, then rise.',
  },
  {
    id: 'wands-10',
    name: 'Ten of Wands',
    suit: 'wands',
    number: 10,
    glyph: '🜂',
    keywords: ['burden', 'responsibility', 'overload', 'duty'],
    upright:
      'You carry too much. Some of these wands are not yours. Set down what was never your duty. Completion approaches — but only if the load is honest.',
    reversed:
      'Release of burdens, or collapse under them. Delegate. Say no. Martyrdom is not nobility. Lighten the pack before the spine breaks.',
  },
  {
    id: 'wands-11',
    name: 'Page of Wands',
    suit: 'wands',
    number: 11,
    glyph: '🜂',
    keywords: ['messenger', 'curiosity', 'spark', 'adventure'],
    upright:
      'A youthful messenger of fire. News of adventure, creative impulse, or a daring invitation. Stay curious. The Page carries the first word of a larger story.',
    reversed:
      'Scattered enthusiasm, bad news, or immature impulsivity. Ground the spark before it burns the map. Curiosity needs direction.',
  },
  {
    id: 'wands-12',
    name: 'Knight of Wands',
    suit: 'wands',
    number: 12,
    glyph: '🜂',
    keywords: ['passion', 'action', 'boldness', 'pursuit'],
    upright:
      'Charge forward with passionate certainty. The Knight of Wands does not wait for perfect conditions. Bold action opens doors caution never finds.',
    reversed:
      'Reckless haste, abandoned projects, or anger without aim. Rein in the horse. Passion without patience leaves scorched earth.',
  },
  {
    id: 'wands-13',
    name: 'Queen of Wands',
    suit: 'wands',
    number: 13,
    glyph: '🜂',
    keywords: ['charisma', 'confidence', 'magnetism', 'warmth'],
    upright:
      'Radiant confidence that draws others to the flame. Lead with warmth and self-possession. Your presence is a hearth — tend it consciously.',
    reversed:
      'Insecurity masked as dominance, jealousy, or dimmed fire. Reclaim your warmth without needing to burn brighter than everyone else.',
  },
  {
    id: 'wands-14',
    name: 'King of Wands',
    suit: 'wands',
    number: 14,
    glyph: '🜂',
    keywords: ['visionary', 'leadership', 'enterprise', 'mastery'],
    upright:
      'Visionary leadership. You see the empire before the first stone is laid. Inspire through bold direction. Rule the fire — do not let it rule you.',
    reversed:
      'Tyrannical vision, arrogance, or leadership without empathy. Temper the blaze. True kings serve the flame, not their own reflection in it.',
  },

  // —— CUPS ——
  {
    id: 'cups-1',
    name: 'Ace of Cups',
    suit: 'cups',
    number: 1,
    glyph: '🜄',
    keywords: ['love', 'overflow', 'emotion', 'spiritual gift'],
    upright:
      'The heart\'s chalice overflows. New love, deep feeling, or spiritual opening. Receive. Allow the waters to fill what was dry. This is grace arriving as emotion.',
    reversed:
      'Emotional blockage, emptied cup, or love withheld. The spring is not gone — the channel is clogged. Soften the armor around the heart.',
  },
  {
    id: 'cups-2',
    name: 'Two of Cups',
    suit: 'cups',
    number: 2,
    glyph: '🜄',
    keywords: ['partnership', 'union', 'mutuality', 'attraction'],
    upright:
      'Sacred exchange between two. Partnership, mutual recognition, the chemistry of equals. What you offer is mirrored. Honor the bond with honesty.',
    reversed:
      'Imbalance, broken connection, or one-sided giving. Repair or release. Forced union creates bitterness. Seek reciprocity or walk alone with dignity.',
  },
  {
    id: 'cups-3',
    name: 'Three of Cups',
    suit: 'cups',
    number: 3,
    glyph: '🜄',
    keywords: ['friendship', 'celebration', 'community', 'joy'],
    upright:
      'Gather with your circle. Celebration, sisterhood, found family. Joy multiplies when shared. Let belonging replenish you.',
    reversed:
      'Gossip, exclusion, or isolation from community. Reconnect with those who raise your frequency. Toxic circles drain — choose wisely.',
  },
  {
    id: 'cups-4',
    name: 'Four of Cups',
    suit: 'cups',
    number: 4,
    glyph: '🜄',
    keywords: ['apathy', 'reassessment', 'withdrawal', 'missed offer'],
    upright:
      'Discontent with what is offered. A fourth cup approaches while you stare at three. Look up. Opportunity may wear unfamiliar clothes.',
    reversed:
      'Emerging from stagnation, or deeper withdrawal. Motivation returns if you choose it. Do not romanticize the sulk.',
  },
  {
    id: 'cups-5',
    name: 'Five of Cups',
    suit: 'cups',
    number: 5,
    glyph: '🜄',
    keywords: ['grief', 'loss', 'regret', 'remaining hope'],
    upright:
      'Mourn what spilled — but turn. Two cups still stand behind you. Grief is sacred; despair is optional. Honor the loss, then claim what remains.',
    reversed:
      'Acceptance beginning, or clinging to sorrow past its season. Forgiveness — of self or other — unlocks the remaining cups.',
  },
  {
    id: 'cups-6',
    name: 'Six of Cups',
    suit: 'cups',
    number: 6,
    glyph: '🜄',
    keywords: ['nostalgia', 'innocence', 'memory', 'reunion'],
    upright:
      'Past kindness returns. Nostalgia, childhood gifts, reunion with innocence. Let memory soften you without trapping you. The past offers medicine, not a cage.',
    reversed:
      'Stuck in the past, or healing from it. Idealized memories distort. Take the gift of nostalgia and leave the chains.',
  },
  {
    id: 'cups-7',
    name: 'Seven of Cups',
    suit: 'cups',
    number: 7,
    glyph: '🜄',
    keywords: ['illusion', 'choices', 'fantasy', 'discernment'],
    upright:
      'Many visions float before you — not all are real. Fantasy can inspire or deceive. Discern the golden cup from the mist. Choose substance over shimmer.',
    reversed:
      'Clarity emerging from confusion, or drowning deeper in delusion. Ground your dreams in action. One real step beats seven fantasies.',
  },
  {
    id: 'cups-8',
    name: 'Eight of Cups',
    suit: 'cups',
    number: 8,
    glyph: '🜄',
    keywords: ['departure', 'seeking', 'abandonment', 'soul quest'],
    upright:
      'Walk away from what no longer nourishes. The cups are stacked but empty of meaning. Seek higher ground. Leaving is sometimes the deepest loyalty to self.',
    reversed:
      'Fear of leaving, or aimless wandering. Either commit to the departure or recommit to staying with eyes open. Drift serves neither.',
  },
  {
    id: 'cups-9',
    name: 'Nine of Cups',
    suit: 'cups',
    number: 9,
    glyph: '🜄',
    keywords: ['wish fulfilled', 'satisfaction', 'contentment', 'gratitude'],
    upright:
      'The wish card. Emotional satisfaction, earned pleasure, gratitude for what fills the table. Enjoy without guilt. Abundance of the heart is present.',
    reversed:
      'Hollow satisfaction, greed, or wishes that cost too much. Check if the feast feeds the soul or only the ego.',
  },
  {
    id: 'cups-10',
    name: 'Ten of Cups',
    suit: 'cups',
    number: 10,
    glyph: '🜄',
    keywords: ['harmony', 'family', 'fulfillment', 'emotional home'],
    upright:
      'Emotional rainbow — lasting harmony, chosen family, the feeling of home in another\'s presence. This is the heart\'s completion. Cherish and protect it.',
    reversed:
      'Discord in the home, broken ideal, or searching for belonging. Rebuild connection with truth. Perfect pictures hide cracked foundations.',
  },
  {
    id: 'cups-11',
    name: 'Page of Cups',
    suit: 'cups',
    number: 11,
    glyph: '🜄',
    keywords: ['sensitivity', 'message', 'dream', 'creative offer'],
    upright:
      'A gentle messenger of feeling. Intuitive news, creative invitation, or tender surprise. Stay open to the unexpected fish in the cup.',
    reversed:
      'Emotional immaturity, blocked creativity, or messages ignored. Soften defenses. The Page asks for wonder, not armor.',
  },
  {
    id: 'cups-12',
    name: 'Knight of Cups',
    suit: 'cups',
    number: 12,
    glyph: '🜄',
    keywords: ['romance', 'idealism', 'quest', 'invitation'],
    upright:
      'The romantic quest. An offer of the heart, artistic pursuit, or idealistic journey. Follow beauty — but keep one foot on earth.',
    reversed:
      'Moodiness, empty promises, or idealism without follow-through. Feel deeply, then act consistently. Charm without substance fades.',
  },
  {
    id: 'cups-13',
    name: 'Queen of Cups',
    suit: 'cups',
    number: 13,
    glyph: '🜄',
    keywords: ['empathy', 'intuition', 'compassion', 'emotional mastery'],
    upright:
      'Deep waters held with grace. Empathy without drowning. The Queen reads the unspoken and holds space for others\' storms while remaining sovereign.',
    reversed:
      'Emotional overwhelm, codependency, or intuition clouded by projection. Pour out what is not yours. Reclaim the shore of self.',
  },
  {
    id: 'cups-14',
    name: 'King of Cups',
    suit: 'cups',
    number: 14,
    glyph: '🜄',
    keywords: ['emotional balance', 'diplomacy', 'wisdom', 'calm'],
    upright:
      'Mastery of feeling without repression. Calm in the storm. Lead with emotional intelligence. Your steadiness becomes sanctuary for others.',
    reversed:
      'Emotional manipulation, repression, or volatility beneath a calm mask. Feel honestly. Authority over emotion is not the same as denial.',
  },

  // —— SWORDS ——
  {
    id: 'swords-1',
    name: 'Ace of Swords',
    suit: 'swords',
    number: 1,
    glyph: '🜁',
    keywords: ['clarity', 'truth', 'breakthrough', 'mental power'],
    upright:
      'A blade of pure truth cuts through fog. Mental breakthrough, decisive insight, the word that liberates. Speak and think with precision. Clarity is power.',
    reversed:
      'Confusion, harsh words, or truth used as a weapon. Sharpen without cutting indiscriminately. Seek clarity, not victory in argument.',
  },
  {
    id: 'swords-2',
    name: 'Two of Swords',
    suit: 'swords',
    number: 2,
    glyph: '🜁',
    keywords: ['stalemate', 'blind choice', 'truce', 'avoidance'],
    upright:
      'Blindfolded at the crossroads. A decision delayed by fear of seeing. Remove the cloth. Even imperfect choice is better than frozen balance.',
    reversed:
      'Information flooding in, or deeper denial. The stalemate breaks — ready or not. Face what you have been refusing to weigh.',
  },
  {
    id: 'swords-3',
    name: 'Three of Swords',
    suit: 'swords',
    number: 3,
    glyph: '🜁',
    keywords: ['heartbreak', 'sorrow', 'truth pain', 'release'],
    upright:
      'Sorrow that clarifies. Heartbreak, betrayal, or necessary painful truth. Let the swords pass through — grief that is felt becomes medicine. Do not armor the wound shut.',
    reversed:
      'Healing from heartbreak, or pain held too long. Forgiveness and release await. The storm cloud can pass if you stop feeding it rain.',
  },
  {
    id: 'swords-4',
    name: 'Four of Swords',
    suit: 'swords',
    number: 4,
    glyph: '🜁',
    keywords: ['rest', 'recuperation', 'meditation', 'truce'],
    upright:
      'Sacred pause. Rest the mind. Recuperate in stillness before the next campaign. Meditation is not inactivity — it is strategic silence.',
    reversed:
      'Restlessness, burnout ignored, or forced isolation. Rest before the body demands it. Burnout is a sword that cuts the wielder.',
  },
  {
    id: 'swords-5',
    name: 'Five of Swords',
    suit: 'swords',
    number: 5,
    glyph: '🜁',
    keywords: ['defeat', 'hollow victory', 'conflict', 'ego war'],
    upright:
      'A victory that costs too much, or a defeat that teaches. Ego battles leave everyone wounded. Ask: is winning this fight worth the field of corpses?',
    reversed:
      'Walking away from conflict, or lingering resentment. Choose peace without becoming a doormat. Some swords are best left on the ground.',
  },
  {
    id: 'swords-6',
    name: 'Six of Swords',
    suit: 'swords',
    number: 6,
    glyph: '🜁',
    keywords: ['transition', 'passage', 'healing journey', 'leaving'],
    upright:
      'Crossing troubled water toward calmer shores. Transition, mental healing, leaving a hard chapter. The boat moves slowly — trust the ferryman.',
    reversed:
      'Stuck in turbulent waters, or refusing necessary departure. Pack what serves and leave the rest. Lingering prolongs the storm.',
  },
  {
    id: 'swords-7',
    name: 'Seven of Swords',
    suit: 'swords',
    number: 7,
    glyph: '🜁',
    keywords: ['strategy', 'deception', 'theft', 'cunning'],
    upright:
      'Strategy in the shadows. Not all battles are fought face-to-face. Be cunning — or beware cunning around you. Integrity still matters in stealth.',
    reversed:
      'Exposure of deceit, or coming clean. Secrets unravel. Choose honesty before it is forced. The thief\'s path eventually circles back.',
  },
  {
    id: 'swords-8',
    name: 'Eight of Swords',
    suit: 'swords',
    number: 8,
    glyph: '🜁',
    keywords: ['restriction', 'mental prison', 'victimhood', 'blindness'],
    upright:
      'Bound by beliefs more than rope. The prison is largely mental. Remove the blindfold. Your power to leave was never taken — only forgotten.',
    reversed:
      'Finding the way out, or deeper entanglement in victim stories. Freedom is a decision repeated daily. Cut one cord at a time.',
  },
  {
    id: 'swords-9',
    name: 'Nine of Swords',
    suit: 'swords',
    number: 9,
    glyph: '🜁',
    keywords: ['anxiety', 'nightmares', 'guilt', 'mental torment'],
    upright:
      'The dark night of the mind. Anxiety, guilt, sleepless spirals. Name the fear — it shrinks in light. You are not your worst 3 a.m. thought.',
    reversed:
      'Anxiety releasing, or secrets coming to light. Seek support. The nightmare ends when shared. Healing begins with one true sentence spoken aloud.',
  },
  {
    id: 'swords-10',
    name: 'Ten of Swords',
    suit: 'swords',
    number: 10,
    glyph: '🜁',
    keywords: ['ending', 'rock bottom', 'betrayal', 'dawn'],
    upright:
      'The worst has happened — and dawn still comes. Absolute ending clears absolute space. You cannot fall further. Rise. The sky behind the swords is lightening.',
    reversed:
      'Recovery from ruin, or resisting the final blow. Accept the ending. Survival is already underway. Stand among the fallen blades and walk.',
  },
  {
    id: 'swords-11',
    name: 'Page of Swords',
    suit: 'swords',
    number: 11,
    glyph: '🜁',
    keywords: ['curiosity', 'vigilance', 'ideas', 'truth-seeking'],
    upright:
      'Sharp young mind. Questions, vigilance, new ideas cutting air. Stay curious and alert. Truth-seeking begins with honest inquiry.',
    reversed:
      'Gossip, spy energy, or ideas without substance. Temper the blade. Curiosity without kindness becomes cruelty.',
  },
  {
    id: 'swords-12',
    name: 'Knight of Swords',
    suit: 'swords',
    number: 12,
    glyph: '🜁',
    keywords: ['intellect', 'haste', 'ambition', 'direct action'],
    upright:
      'Charge of the mind. Swift intellect, direct speech, ambitious pursuit of truth. Act decisively — but remember the collateral of a careless blade.',
    reversed:
      'Ruthlessness, burnt bridges, or ideas charging without wisdom. Slow the horse. Precision beats speed when lives and feelings are at stake.',
  },
  {
    id: 'swords-13',
    name: 'Queen of Swords',
    suit: 'swords',
    number: 13,
    glyph: '🜁',
    keywords: ['clarity', 'independence', 'truth', 'discernment'],
    upright:
      'Clear-eyed sovereignty. Independent thought, honest speech, boundaries of steel wrapped in grace. Cut away what confuses. Truth is her throne.',
    reversed:
      'Coldness, bitterness, or weaponized intellect. Soften the edge without dulling it. Clarity without compassion isolates.',
  },
  {
    id: 'swords-14',
    name: 'King of Swords',
    suit: 'swords',
    number: 14,
    glyph: '🜁',
    keywords: ['authority', 'logic', 'ethics', 'judgment'],
    upright:
      'Intellectual authority with ethical spine. Fair judgment, clear strategy, leadership through reason. Speak law that serves truth, not ego.',
    reversed:
      'Tyrannical intellect, cruelty of logic, or abuse of authority. Temper judgment with humanity. A king\'s sword must serve justice, not pride.',
  },

  // —— PENTACLES ——
  {
    id: 'pentacles-1',
    name: 'Ace of Pentacles',
    suit: 'pentacles',
    number: 1,
    glyph: '🜃',
    keywords: ['opportunity', 'seed', 'prosperity', 'manifest seed'],
    upright:
      'A golden seed of material opportunity. New resources, grounded beginnings, prosperity\'s first coin. Plant it in real soil. Manifestation starts with a tangible step.',
    reversed:
      'Missed opportunity, poor planning, or scarcity mindset blocking the seed. The coin is offered — open the hand.',
  },
  {
    id: 'pentacles-2',
    name: 'Two of Pentacles',
    suit: 'pentacles',
    number: 2,
    glyph: '🜃',
    keywords: ['balance', 'juggling', 'adaptability', 'priorities'],
    upright:
      'The dance of priorities. Juggle with grace. Adaptability keeps the coins in motion. Life asks for rhythm, not rigidity.',
    reversed:
      'Dropped balls, overwhelm, or poor time management. Simplify. Not every coin needs to stay in the air. Choose what matters.',
  },
  {
    id: 'pentacles-3',
    name: 'Three of Pentacles',
    suit: 'pentacles',
    number: 3,
    glyph: '🜃',
    keywords: ['craft', 'collaboration', 'skill', 'mastery building'],
    upright:
      'Skilled collaboration. Your craft is recognized. Build with others who honor excellence. Mastery is communal as much as solitary.',
    reversed:
      'Poor teamwork, mediocrity accepted, or unrecognized skill. Raise the standard. Seek collaborators who match your dedication.',
  },
  {
    id: 'pentacles-4',
    name: 'Four of Pentacles',
    suit: 'pentacles',
    number: 4,
    glyph: '🜃',
    keywords: ['security', 'control', 'holding', 'conservation'],
    upright:
      'Holding tight to resources. Security is wise — hoarding is fear. Examine whether your grip protects or imprisons. Stability without flow becomes a tomb.',
    reversed:
      'Release of control, generosity, or reckless spending. Loosen the fist. True security includes circulation of energy and trust.',
  },
  {
    id: 'pentacles-5',
    name: 'Five of Pentacles',
    suit: 'pentacles',
    number: 5,
    glyph: '🜃',
    keywords: ['hardship', 'exclusion', 'poverty mindset', 'seeking help'],
    upright:
      'Cold season of lack — material or spiritual. Help is nearer than it appears (look to the lit window). Ask. Isolation deepens poverty of every kind.',
    reversed:
      'Recovery from hardship, or lingering in victimhood of scarcity. The door is open. Step toward warmth and support.',
  },
  {
    id: 'pentacles-6',
    name: 'Six of Pentacles',
    suit: 'pentacles',
    number: 6,
    glyph: '🜃',
    keywords: ['generosity', 'exchange', 'charity', 'power balance'],
    upright:
      'Giving and receiving in balance. Generosity that empowers. Notice who holds the scales. True charity honors dignity on both sides.',
    reversed:
      'Strings attached, debt dynamics, or unequal exchange. Examine power in your giving and receiving. Fairness restores flow.',
  },
  {
    id: 'pentacles-7',
    name: 'Seven of Pentacles',
    suit: 'pentacles',
    number: 7,
    glyph: '🜃',
    keywords: ['assessment', 'patience', 'investment', 'long game'],
    upright:
      'Pause to assess the crop. Patience with long investments. Not all growth is visible day to day. Trust the work already done — then decide what to prune.',
    reversed:
      'Impatience, poor returns, or abandoning the field too soon. Recalibrate effort. Some harvests need one more season.',
  },
  {
    id: 'pentacles-8',
    name: 'Eight of Pentacles',
    suit: 'pentacles',
    number: 8,
    glyph: '🜃',
    keywords: ['diligence', 'craft', 'apprenticeship', 'focus'],
    upright:
      'Devotion to craft. Repetition as sacred practice. Skill compounds through focused labor. Show up to the bench again. Mastery is made of ordinary days.',
    reversed:
      'Perfectionism, boredom, or careless work. Rekindle love of the craft, or honestly ask if this is still your path.',
  },
  {
    id: 'pentacles-9',
    name: 'Nine of Pentacles',
    suit: 'pentacles',
    number: 9,
    glyph: '🜃',
    keywords: ['independence', 'luxury', 'self-sufficiency', 'refinement'],
    upright:
      'Self-made abundance. Enjoy the garden you cultivated. Independence, refined taste, quiet luxury of earned peace. Savor without apology.',
    reversed:
      'Financial dependence, isolation in success, or status without fulfillment. Share the garden. Wealth without connection is a gilded cage.',
  },
  {
    id: 'pentacles-10',
    name: 'Ten of Pentacles',
    suit: 'pentacles',
    number: 10,
    glyph: '🜃',
    keywords: ['legacy', 'wealth', 'family', 'long-term security'],
    upright:
      'Legacy and lasting foundation. Generational wealth — material or wisdom. What you build now outlives you. Plant trees whose shade you may never sit in.',
    reversed:
      'Family financial conflict, unstable legacy, or short-term thinking. Rebuild foundations. True wealth includes relationships and meaning.',
  },
  {
    id: 'pentacles-11',
    name: 'Page of Pentacles',
    suit: 'pentacles',
    number: 11,
    glyph: '🜃',
    keywords: ['student', 'opportunity', 'study', 'practical start'],
    upright:
      'Student of the material world. A practical opportunity, study path, or grounded new beginning. Hold the coin with curiosity and care.',
    reversed:
      'Procrastination, lack of focus, or missed practical chances. Commit to the apprenticeship. Dreams need dirt under the nails.',
  },
  {
    id: 'pentacles-12',
    name: 'Knight of Pentacles',
    suit: 'pentacles',
    number: 12,
    glyph: '🜃',
    keywords: ['reliability', 'method', 'duty', 'steadfast'],
    upright:
      'Steady, methodical progress. Reliability as a virtue. The slow knight arrives. Duty fulfilled through consistent small acts. Trust the plodding path.',
    reversed:
      'Stubbornness, stagnation, or lazy routine. Move — even slowly. Duty without heart becomes dead weight.',
  },
  {
    id: 'pentacles-13',
    name: 'Queen of Pentacles',
    suit: 'pentacles',
    number: 13,
    glyph: '🜃',
    keywords: ['nurture', 'abundance', 'practical care', 'earth mother'],
    upright:
      'Nurturing abundance. Practical care, resourcefulness, creating comfort that heals. You make the material world feel like sanctuary.',
    reversed:
      'Self-neglect while caring for others, or smothering control of resources. Tend your own garden first. Emptied queens cannot feed kingdoms.',
  },
  {
    id: 'pentacles-14',
    name: 'King of Pentacles',
    suit: 'pentacles',
    number: 14,
    glyph: '🜃',
    keywords: ['prosperity', 'stability', 'enterprise', 'provider'],
    upright:
      'Master of the material realm. Prosperity with responsibility. Build empires that feed people. Success is measured by what you stabilize for others.',
    reversed:
      'Greed, materialism without soul, or failed stewardship. Wealth is a tool. Return to values that outlast the vault.',
  },
];

export function shuffleDeck(deck: TarotCard[] = DECK): TarotCard[] {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function romanNumeral(n: number): string {
  if (n === 0) return '0';
  const map: [number, string][] = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let result = '';
  let num = n;
  for (const [val, sym] of map) {
    while (num >= val) {
      result += sym;
      num -= val;
    }
  }
  return result;
}

export function courtLabel(n: number): string | null {
  if (n === 11) return 'PAGE';
  if (n === 12) return 'KNIGHT';
  if (n === 13) return 'QUEEN';
  if (n === 14) return 'KING';
  return null;
}
