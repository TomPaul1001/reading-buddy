import { WordToken } from '../hooks/useSpeech';

/**
 * Checks if a string represents an abbreviation that doesn't terminate a sentence.
 */
function isAbbreviation(word: string): boolean {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  return ['mr', 'mrs', 'ms', 'dr', 'jr', 'sr', 'st', 'vs', 'etc'].includes(clean);
}

// Common speech verbs for dialogue attribution (e.g., 'said the Cat', 'asked Sam', 'cried our pet fish')
const SPEECH_VERBS = new Set([
  'said',
  'asked',
  'cried',
  'shouted',
  'yelled',
  'whispered',
  'replied',
  'called',
  'screamed',
  'answered',
  'cheered',
  'smiled',
  'laughed',
  'roared',
  'warned',
]);

// Prepositions that start prepositional phrases (e.g., 'in the park', 'on the mat')
const PREPOSITIONS = new Set([
  'in',
  'on',
  'at',
  'to',
  'for',
  'with',
  'from',
  'of',
  'into',
  'by',
  'under',
  'over',
  'through',
  'about',
]);

// Determiners and articles that shouldn't be stranded at the end of a line
const DETERMINERS = new Set([
  'the',
  'a',
  'an',
  'this',
  'that',
  'these',
  'those',
  'my',
  'your',
  'his',
  'her',
  'our',
  'their',
  'some',
  'no',
  'all',
]);

// Conjunctions
const CONJUNCTIONS = new Set(['and', 'but', 'or', 'so', 'because', 'when', 'if', 'as', 'while']);

// Particles that combine with preceding verbs to form phrasal verbs
const PARTICLES = new Set(['in', 'out', 'up', 'down', 'on', 'off', 'away', 'back', 'by', 'over', 'into']);

// Common verbs that form phrasal verbs with particles (e.g. 'step in', 'ran out', 'sat in', 'roll in')
const PHRASAL_VERB_BASES = new Set([
  'step', 'steps', 'stepped', 'stepping',
  'bump', 'bumped', 'bumping',
  'run', 'runs', 'ran', 'running',
  'look', 'looks', 'looked', 'looking',
  'roll', 'rolls', 'rolled', 'rolling',
  'pick', 'picks', 'picked', 'picking',
  'walk', 'walks', 'walked', 'walking',
  'stick', 'sticks', 'stuck', 'sticking',
  'pull', 'pulls', 'pulled', 'pulling',
  'put', 'puts', 'putting',
  'take', 'takes', 'took', 'taking',
  'fall', 'falls', 'fell', 'falling',
  'jump', 'jumps', 'jumped', 'jumping',
  'go', 'goes', 'went', 'going',
  'come', 'comes', 'came', 'coming',
  'get', 'gets', 'got', 'getting',
  'sat', 'sit',
]);

/**
 * Organizes WordToken array into pedagogical reading units (lines)
 * based on reader level and early reading typography best practices:
 *
 * 1. Deliberate sentence starts:
 *    For early readers (Level 1, Dr. Seuss, Mo Willems, etc.), each sentence begins
 *    on its own line to build sentence boundary comprehension and rhythmic cadence.
 *    Dialogue with speech attributions ('said the Cat', 'asked Sam') are kept unified.
 *
 * 2. Short line length:
 *    Aims for roughly 5-8 words per line (up to 9 for a single compact sentence)
 *    so developing readers don't lose their place when returning to the next line.
 *
 * 3. Left-aligned, ragged-right typography.
 *
 * 4. Natural phrasing & orphan prevention:
 *    Avoids breaking prepositional phrases ('in the park'), phrasal verbs ('step in'),
 *    and never strands single-word or 2-word orphans on a line.
 */
export function groupTokensIntoLines(
  tokens: WordToken[],
  readingLevel?: string
): WordToken[][] {
  if (!tokens || tokens.length === 0) return [];

  // Determine if this is an advanced flowing level (Level 2+)
  const isLevel2 = Boolean(
    readingLevel &&
      (readingLevel.includes('Level 2') ||
        readingLevel.includes('Grades 1-2') ||
        readingLevel.includes('Grade 2') ||
        readingLevel.includes('Advanced'))
  );

  if (isLevel2) {
    // --- LEVEL 2+: Flowing paragraphs broken into balanced 6-8 word lines ---
    return breakSentenceIntoLines(tokens, 6, 8);
  }

  // --- EARLY READERS: Deliberate Sentence Grouping & Balanced Phrasing ---
  // Group tokens into complete sentence units, keeping dialogue attributions together
  const rawSentences: WordToken[][] = [];
  let currentSentence: WordToken[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    currentSentence.push(token);

    const after = token.punctuationAfter || '';
    const hasSentenceEnding = /[.!?]/.test(after);
    const isAbbr = hasSentenceEnding && isAbbreviation(token.cleanWord);

    if (hasSentenceEnding && !isAbbr) {
      // Check if next words are a speech attribution like 'said the Cat' or 'asked Sam'
      let isFollowedByDialogueTag = false;
      if (i + 1 < tokens.length) {
        const nextClean = tokens[i + 1].cleanWord.toLowerCase();
        if (SPEECH_VERBS.has(nextClean)) {
          isFollowedByDialogueTag = true;
        } else if (
          i + 2 < tokens.length &&
          ['he', 'she', 'they', 'the', 'our', 'my'].includes(nextClean) &&
          SPEECH_VERBS.has(tokens[i + 2].cleanWord.toLowerCase())
        ) {
          isFollowedByDialogueTag = true;
        }
      }

      if (!isFollowedByDialogueTag) {
        rawSentences.push(currentSentence);
        currentSentence = [];
      }
    }
  }

  if (currentSentence.length > 0) {
    rawSentences.push(currentSentence);
  }

  // Merge ultra-short sentences (<= 2 words, like 'Yes.', 'Say!', '“Sam!', '“Stop!”') with adjacent
  // sentences so that single words or two words are never stranded on awkward lines.
  const mergedSentences: WordToken[][] = [];
  for (let i = 0; i < rawSentences.length; i++) {
    const sent = rawSentences[i];
    if (mergedSentences.length > 0) {
      const prev = mergedSentences[mergedSentences.length - 1];
      if (prev.length <= 2) {
        prev.push(...sent);
        continue;
      }
      if (sent.length <= 2) {
        prev.push(...sent);
        continue;
      }
      if (prev.length <= 3 && prev.length + sent.length <= 9) {
        prev.push(...sent);
        continue;
      }
      if (sent.length <= 3 && prev.length + sent.length <= 9) {
        prev.push(...sent);
        continue;
      }
    }
    mergedSentences.push([...sent]);
  }

  // Now format each sentence into manageable ~5-8 word lines with natural phrase protection
  const lines: WordToken[][] = [];
  for (const sent of mergedSentences) {
    lines.push(...breakSentenceIntoLines(sent, 5, 9));
  }

  return lines;
}

/**
 * Breaks a sequence of tokens into balanced lines aiming for 5-8 words.
 * Prevents stranding 1 or 2 words on the final line, avoids breaking short phrases
 * (like 'in the park' or 'step in'), and respects natural clause boundaries.
 */
function breakSentenceIntoLines(
  tokens: WordToken[],
  minWords = 5,
  maxWords = 9
): WordToken[][] {
  if (tokens.length <= maxWords) {
    return [tokens];
  }

  const result: WordToken[][] = [];
  let i = 0;

  while (i < tokens.length) {
    const remaining = tokens.length - i;

    if (remaining <= maxWords) {
      // Orphan check: if remaining tokens are <= 2 words, rebalance with previous line
      if (remaining <= 2 && result.length > 0) {
        const prev = result[result.length - 1];
        const combined = [...prev, ...tokens.slice(i)];
        const half = Math.ceil(combined.length / 2);
        result[result.length - 1] = combined.slice(0, half);
        result.push(combined.slice(half));
        break;
      }
      result.push(tokens.slice(i));
      break;
    }

    // Number of lines needed for remaining tokens
    const linesNeeded = Math.ceil(remaining / maxWords);
    const idealLen = Math.round(remaining / linesNeeded);

    // Safeguard to prevent leaving an orphan 1 or 2 words on subsequent line
    const maxSafeEnd =
      remaining - maxWords <= 2
        ? i + Math.floor(remaining / 2)
        : Math.min(i + maxWords, tokens.length);

    let bestBreak = -1;
    let bestScore = -999;
    const minSearch = Math.max(i + 3, i + minWords - 2);
    const maxSearch = maxSafeEnd;

    for (let j = minSearch; j <= maxSearch; j++) {
      if (j >= tokens.length) break;
      const remAfter = tokens.length - (j + 1);
      if (remAfter > 0 && remAfter <= 2) continue; // never leave 1 or 2 words

      const token = tokens[j];
      const nextToken = tokens[j + 1];
      const punct = token.punctuationAfter || '';
      const clean = token.cleanWord.toLowerCase();
      const nextClean = nextToken ? nextToken.cleanWord.toLowerCase() : '';

      let score = 0;

      // Punctuation bonus: natural clause pause
      if (/[,;:\-—]/.test(punct)) score += 50;
      if (/[.!?]/.test(punct)) score += 60;

      // Severe penalty for breaking between phrasal verb and particle ('step in', 'ran out')
      if (PHRASAL_VERB_BASES.has(clean) && PARTICLES.has(nextClean)) {
        score -= 70;
      }

      // Bonus for breaking BEFORE a preposition (keeps 'in the park', 'on the mat' intact)
      // Only when preceding word isn't a phrasal verb base
      if (nextToken && PREPOSITIONS.has(nextClean) && !PHRASAL_VERB_BASES.has(clean)) {
        score += 35;
      }

      // Bonus for breaking before a coordinating conjunction ('and', 'but')
      if (nextToken && CONJUNCTIONS.has(nextClean)) {
        score += 25;
      }

      // Penalties for stranding words that should not end a line
      if (PREPOSITIONS.has(clean)) score -= 40;
      if (DETERMINERS.has(clean)) score -= 50;
      if (CONJUNCTIONS.has(clean)) score -= 35;
      if (['i', 'we', 'he', 'she', 'they', 'you'].includes(clean)) score -= 45;

      // Score proximity to balanced line length
      const lineLen = j - i + 1;
      const distFromIdeal = Math.abs(lineLen - idealLen);
      score -= distFromIdeal * 4;

      if (score >= bestScore) {
        bestScore = score;
        bestBreak = j + 1;
      }
    }

    if (bestBreak === -1) {
      bestBreak = Math.min(i + idealLen, tokens.length);
    }

    result.push(tokens.slice(i, bestBreak));
    i = bestBreak;
  }

  return result;
}
