/**
 * Phonics utility for accurate syllable and letter sound generation in speech synthesis.
 * Solves the issue where SpeechSynthesis spells out non-word chunks (like 'zle' -> 'Z L E')
 * by converting letter chunks into phonetic equivalents that text-to-speech engines pronounce naturally.
 */

// Specific contextual mappings for known whole words and their syllables
const CONTEXTUAL_WORD_PHONETICS: Record<string, Record<string, string>> = {
  nozzle: {
    noz: 'nahz',
    zle: 'zull',
    zles: 'zulls',
  },
  gerald: {
    ger: 'jair',
    ald: 'uld',
  },
  piggie: {
    pig: 'pig',
    gie: 'gee',
  },
  elephant: {
    el: 'el',
    e: 'eh',
    phant: 'funt',
  },
  delicious: {
    de: 'duh',
    li: 'lish',
    cious: 'us',
  },
  traditional: {
    tra: 'truh',
    di: 'dish',
    tion: 'un',
    al: 'ul',
  },
  decision: {
    de: 'duh',
    ci: 'sizh',
    sion: 'un',
  },
  recipe: {
    rec: 'reh',
    i: 'suh',
    pe: 'pee',
  },
  courage: {
    cour: 'ker',
    age: 'ij',
  },
  precious: {
    pre: 'presh',
    cious: 'us',
  },
  lantern: {
    lan: 'lan',
    tern: 'turn',
  },
  dreary: {
    drea: 'dree',
    ry: 'ree',
  },
  octopus: {
    oc: 'ahk',
    to: 'tuh',
    pus: 'puss',
  },
  jellyfish: {
    jel: 'jel',
    ly: 'lee',
    fish: 'fish',
  },
  recycle: {
    re: 'ree',
    cy: 'sigh',
    cle: 'kull',
  },
  impossible: {
    im: 'im',
    pos: 'pahss',
    si: 'ih',
    ble: 'bull',
  },
  pelican: {
    pel: 'pel',
    i: 'ih',
    can: 'kuhn',
  },
  creature: {
    crea: 'kree',
    ture: 'cher',
  },
  nature: {
    na: 'nay',
    ture: 'cher',
  },
  patience: {
    pa: 'pay',
    tience: 'shens',
  },
  monster: {
    mon: 'mahn',
    ster: 'stir',
  },
  monkey: {
    mon: 'mung',
    key: 'kee',
  },
  whisper: {
    whis: 'hwis',
    per: 'pur',
  },
  happily: {
    hap: 'hap',
    pi: 'ih',
    ly: 'lee',
  },
  polite: {
    po: 'puh',
    lite: 'lyte',
  },
  surprising: {
    sur: 'ser',
    pris: 'prize',
    ing: 'ing',
  },
  surprise: {
    sur: 'ser',
    prise: 'prize',
  },
  practice: {
    prac: 'prak',
    tice: 'tiss',
  },
  practicing: {
    prac: 'prak',
    tic: 'tiss',
    ing: 'ing',
  },
  bottle: {
    bot: 'baht',
    tle: 'tull',
    tles: 'tulls',
  },
  bottles: {
    bot: 'baht',
    tles: 'tulls',
  },
  little: {
    lit: 'lit',
    tle: 'tull',
  },
  bubble: {
    bub: 'bub',
    ble: 'bull',
    bles: 'bulls',
  },
  bubbles: {
    bub: 'bub',
    bles: 'bulls',
  },
  sparkle: {
    spar: 'spar',
    kle: 'kull',
    kling: 'kling',
  },
  sparkling: {
    spar: 'spar',
    kling: 'kling',
  },
  twinkle: {
    twin: 'twin',
    kle: 'kull',
    kling: 'kling',
  },
  twinkling: {
    twin: 'twin',
    kling: 'kling',
  },
};

// General syllable patterns and endings
const DIRECT_CHUNK_DICTIONARY: Record<string, string> = {
  // Consonant -le endings
  zle: 'zull',
  zles: 'zulls',
  ble: 'bull',
  bles: 'bulls',
  tle: 'tull',
  tles: 'tulls',
  dle: 'dull',
  dles: 'dulls',
  gle: 'gull',
  gles: 'gulls',
  ple: 'pull',
  ples: 'pulls',
  fle: 'full',
  fles: 'fulls',
  kle: 'kull',
  kles: 'kulls',
  cle: 'kull',
  cles: 'kulls',
  stle: 'sull',
  stles: 'sulls',
  ckle: 'kull',
  ckles: 'kulls',
  zle_: 'zull',

  // Common phonics endings & suffixes
  tion: 'shun',
  tions: 'shuns',
  sion: 'shun',
  sions: 'shuns',
  cial: 'shul',
  tial: 'shul',
  cious: 'shus',
  tious: 'shus',
  ture: 'cher',
  tures: 'chers',
  sure: 'zhur',
  sures: 'zhurs',
  tience: 'shens',
  tient: 'shent',
  que: 'k',
  gue: 'g',
  dge: 'j',
  tch: 'ch',
  gie: 'gee',
  gies: 'geez',
  tie: 'tee',
  cie: 'see',
  ph: 'f',
  gh: 'f',

  // Suffix endings
  ly: 'lee',
  ry: 'ree',
  ty: 'tee',
  ny: 'nee',
  dy: 'dee',
  py: 'pee',
  my: 'mee',
  by: 'bee',
  sy: 'zee',
  gy: 'jee',
  cy: 'see',
  ey: 'ee',

  // Word parts
  mon: 'mahn',
  ster: 'stir',
  ger: 'jer',
  ald: 'uld',
  nan: 'nan',
  wis: 'wiz',
  per: 'pur',
  ter: 'tur',
  ber: 'bur',
  der: 'dur',
  fer: 'fur',
  ker: 'kur',
  ner: 'nur',
  ser: 'sur',
  ver: 'vur',
  zer: 'zur',
};

/**
 * Returns a phonetic pronunciation text suitable for Web Speech API SpeechSynthesisUtterance.
 * Converts letter combinations that would otherwise be spelled out (e.g. 'zle') into soundable words.
 */
export function getPhoneticChunkSound(
  chunk: string,
  fullWord?: string,
  chunkIndex?: number,
  allChunks?: string[]
): string {
  if (!chunk) return '';

  const cleanChunk = chunk.trim().toLowerCase().replace(/[^a-z]/g, '');
  if (!cleanChunk) return chunk;

  const cleanFullWord = fullWord ? fullWord.trim().toLowerCase().replace(/[^a-z]/g, '') : '';

  // 1. Check contextual word dictionary first
  if (cleanFullWord && CONTEXTUAL_WORD_PHONETICS[cleanFullWord]?.[cleanChunk]) {
    return CONTEXTUAL_WORD_PHONETICS[cleanFullWord][cleanChunk];
  }

  // 2. Check direct chunk dictionary
  if (DIRECT_CHUNK_DICTIONARY[cleanChunk]) {
    return DIRECT_CHUNK_DICTIONARY[cleanChunk];
  }

  // 3. Rule: Consonant-LE ending (e.g. "zle", "ble", "tle", "dle", "gle", "ple", "fle", "kle", "cle")
  if (/^[bcdfghjklmnpqrstvwxyz]le$/.test(cleanChunk)) {
    const lead = cleanChunk[0];
    if (lead === 'c' || lead === 'k') return 'kull';
    if (lead === 'g') return 'gull';
    return `${lead}ull`;
  }
  if (/^[bcdfghjklmnpqrstvwxyz]les$/.test(cleanChunk)) {
    const lead = cleanChunk[0];
    if (lead === 'c' || lead === 'k') return 'kulls';
    if (lead === 'g') return 'gulls';
    return `${lead}ulls`;
  }

  // 4. Rule: Two-letter consonant + y ending (e.g. "ly" -> "lee", "py" -> "pee", "sy" -> "see")
  if (/^[bcdfghjklmnpqrstvwxyz]y$/.test(cleanChunk)) {
    const lead = cleanChunk[0];
    if (lead === 'c') return 'see';
    if (lead === 'g') return 'jee';
    if (lead === 'q') return 'kwee';
    return `${lead}ee`;
  }

  // 5. Rule: Single letter vowel sounding
  if (cleanChunk.length === 1) {
    switch (cleanChunk) {
      case 'a':
        return 'ah';
      case 'e':
        return 'eh';
      case 'i':
        return 'ih';
      case 'o':
        return 'oh';
      case 'u':
        return 'uh';
      case 'y':
        return 'ee';
      default:
        // Single consonants -> pronounce the soft consonant sound
        return `${cleanChunk}uh`;
    }
  }

  // 6. Rule: Ending in 'er', 'or', 'ar' without other vowels (e.g. 'ter' -> 'tur')
  if (/^[bcdfghjklmnpqrstvwxyz]+(er|or|ar)$/.test(cleanChunk)) {
    const prefix = cleanChunk.slice(0, -2);
    return `${prefix}ur`;
  }

  // 7. Rule: Words ending with 'ie'
  if (/^[bcdfghjklmnpqrstvwxyz]+ie$/.test(cleanChunk)) {
    const prefix = cleanChunk.slice(0, -2);
    return `${prefix}ee`;
  }

  // 8. If the chunk has no vowels at all (e.g. 'str', 'sch', 'pl'), add a schwa so TTS doesn't spell it out
  if (!/[aeiouy]/.test(cleanChunk)) {
    return `${cleanChunk}uh`;
  }

  // Default: return the original chunk
  return cleanChunk;
}
