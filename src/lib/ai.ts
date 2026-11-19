import type { CustomDeck, QuizItem } from './flashcards'

// AI-made study decks. Two ways to reach Claude, tried in this order:
//  1. Inside claude.ai (the published artifact), the page's `sample` capability asks Claude on the
//     viewer's own account, after they allow it once.
//  2. Anywhere else (GitHub Pages), an Anthropic API key the person pastes in, kept only in this browser.

export type AiMode = 'claude' | 'key' | 'none'

export interface AiError {
  code: string
  message: string
  hide?: boolean // the provider can't be used in this view: stop offering it
}

type SampleFn = {
  json: <T>(input: string, opts?: { signal?: AbortSignal; onText?: (u: { text: string; delta: string }) => void; cache?: boolean; modelTier?: string }) => Promise<T>
}

let samplePromise: Promise<SampleFn | null> | null = null
/** The claude.ai `sample` capability, or null outside a Claude viewer. */
export function getSample(): Promise<SampleFn | null> {
  const c = (window as unknown as { claude?: { use?: (n: string) => Promise<unknown> } }).claude
  if (!c?.use) return Promise.resolve(null)
  samplePromise ??= c
    .use('sample')
    .then((s) => (s ? (s as SampleFn) : null))
    .catch(() => null)
  return samplePromise
}

const KEY = 'mp-anthropic-key'
export const apiKey = {
  get(): string {
    try {
      return localStorage.getItem(KEY) ?? ''
    } catch {
      return ''
    }
  },
  set(v: string) {
    try {
      if (v) localStorage.setItem(KEY, v)
      else localStorage.removeItem(KEY)
    } catch {
      /* storage blocked: the key lasts for this visit only */
    }
  },
}

export const LEVELS = ['Pre-med / pre-dental', 'MCAT / DAT', 'Medical / dental school'] as const

export interface DeckRequest {
  topic: string
  count: number
  quizCount: number
  level: string
}

interface Generated {
  title: string
  cards: { front: string; back: string; tag: string }[]
  quiz: { question: string; choices: string[]; answer: number; explanation: string }[]
}

const SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    cards: {
      type: 'array',
      items: {
        type: 'object',
        properties: { front: { type: 'string' }, back: { type: 'string' }, tag: { type: 'string' } },
        required: ['front', 'back', 'tag'],
        additionalProperties: false,
      },
    },
    quiz: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          question: { type: 'string' },
          choices: { type: 'array', items: { type: 'string' } },
          answer: { type: 'integer' },
          explanation: { type: 'string' },
        },
        required: ['question', 'choices', 'answer', 'explanation'],
        additionalProperties: false,
      },
    },
  },
  required: ['title', 'cards', 'quiz'],
  additionalProperties: false,
}

function prompt(r: DeckRequest): string {
  return `You are writing study material for MedPeriodic, an anatomy and biochemistry study app for pre-med and pre-dental students.

Topic requested by the student: """${r.topic.slice(0, 200)}"""
Level: ${r.level}

Write exactly ${r.count} flashcards and ${r.quizCount} multiple-choice quiz questions on this topic.

Flashcards (Anki style):
- One fact per card. "front" is a question or cue of at most 25 words; "back" is the precise answer in at most 40 words.
- "tag" is a 1–3 word subtopic so cards can be grouped.
- Cover the topic broadly: structure, function, clinical relevance, key numbers, and the molecules, elements and biochemical pathways involved.
- Use accurate, textbook-standard facts that match the level. No trick questions, no duplicates.

Quiz:
- Each question has exactly 4 "choices"; exactly one is correct; "answer" is the 0-based index of the correct choice.
- Distractors must be plausible and from the same topic. Vary where the correct answer sits.
- "explanation" is one sentence saying why the answer is right.

"title" is a short deck name (2–5 words).
If the topic is not something a student could study, return a title explaining that, with empty "cards" and "quiz" arrays.

Reply with only a JSON object of this shape, no other text:
{"title": "Brachial plexus", "cards": [{"front": "…", "back": "…", "tag": "…"}], "quiz": [{"question": "…", "choices": ["…", "…", "…", "…"], "answer": 2, "explanation": "…"}]}`
}

/** Check the reply, since nothing validates JSON from `sample` at run time. */
function toDeck(g: Generated, r: DeckRequest, source: 'ai'): CustomDeck {
  if (!g || typeof g !== 'object' || !Array.isArray(g.cards)) throw { code: 'invalid_json', message: 'The reply was not a deck.' } as AiError
  const id = `d${Date.now().toString(36)}`
  const cards = g.cards
    .filter((c) => c && typeof c.front === 'string' && typeof c.back === 'string' && c.front.trim() && c.back.trim())
    .slice(0, 60)
    .map((c, i) => ({ id: String(i), front: c.front.trim(), back: c.back.trim(), tag: typeof c.tag === 'string' ? c.tag.trim().slice(0, 40) : undefined }))
  const quiz: QuizItem[] = (Array.isArray(g.quiz) ? g.quiz : [])
    .filter((q) => q && typeof q.question === 'string' && Array.isArray(q.choices) && q.choices.length >= 2 && Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.choices.length)
    .slice(0, 30)
    .map((q, i) => ({ id: `q${i}`, question: q.question, choices: q.choices.map(String), answer: q.answer, explanation: typeof q.explanation === 'string' ? q.explanation : undefined }))
  if (!cards.length) throw { code: 'empty', message: typeof g.title === 'string' ? g.title : 'No cards came back for that topic.' } as AiError
  return { id, title: (typeof g.title === 'string' && g.title.trim()) || r.topic, topic: r.topic, level: r.level, created: Date.now(), source, cards, quiz }
}

const countCards = (text: string) => (text.match(/"front"\s*:/g) ?? []).length

/** Maps the `sample` capability's error codes to what the page should say and do. */
function sampleError(e: unknown): AiError {
  const code = (e as { code?: string })?.code ?? 'upstream_error'
  switch (code) {
    case 'cancelled':
      return { code, message: '' }
    case 'not_granted':
    case 'sampling_disabled':
    case 'not_declared':
    case 'capability_disabled':
    case 'capability_removed':
      return { code, message: 'Claude isn’t available for this page, so AI decks are off here. You can still write your own cards below.', hide: true }
    case 'rate_limited':
      return { code, message: 'You’ve reached a usage limit for now. Try again a little later.' }
    case 'session_expired':
      return { code, message: 'Your Claude session expired. Sign in to claude.ai again, then retry.' }
    case 'refused':
      return { code, message: 'Claude declined that topic. Try wording it as an anatomy or health topic.' }
    case 'invalid_json':
    case 'empty_completion':
      return { code, message: 'The answer came back incomplete. Try again, or ask for fewer cards.' }
    case 'prompt_too_large':
      return { code, message: 'That topic is too long. Shorten it and try again.' }
    default:
      return { code, message: 'Couldn’t reach Claude just now. Try again.' }
  }
}

export async function generateWithClaude(r: DeckRequest, signal: AbortSignal, onProgress: (cards: number) => void): Promise<CustomDeck> {
  const sample = await getSample()
  if (!sample) throw { code: 'not_granted', message: 'Claude isn’t available here.', hide: true } as AiError
  try {
    const g = await sample.json<Generated>(prompt(r), { signal, cache: false, onText: ({ text }) => onProgress(countCards(text)) })
    return toDeck(g, r, 'ai')
  } catch (e) {
    if ((e as AiError)?.code === 'empty') throw e
    throw sampleError(e)
  }
}

export async function generateWithKey(r: DeckRequest, key: string, signal: AbortSignal, onProgress: (cards: number) => void): Promise<CustomDeck> {
  const { default: Anthropic, AuthenticationError, RateLimitError, APIConnectionError, APIUserAbortError, PermissionDeniedError } = await import('@anthropic-ai/sdk')
  // The key belongs to the person using this browser; it is sent only to Anthropic's API.
  const client = new Anthropic({ apiKey: key, dangerouslyAllowBrowser: true })
  try {
    const stream = client.messages.stream(
      {
        model: 'claude-opus-5-5',
        max_tokens: 16000,
        messages: [{ role: 'user', content: prompt(r) }],
        output_config: { format: { type: 'json_schema', schema: SCHEMA } },
      },
      { signal },
    )
    stream.on('text', (_delta, snapshot) => onProgress(countCards(snapshot)))
    const msg = await stream.finalMessage()
    if (msg.stop_reason === 'refusal') throw { code: 'refused', message: 'Claude declined that topic. Try wording it as an anatomy or health topic.' } as AiError
    if (msg.stop_reason === 'max_tokens') throw { code: 'invalid_json', message: 'The answer was cut short. Ask for fewer cards.' } as AiError
    const text = msg.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('')
    let parsed: Generated
    try {
      parsed = JSON.parse(text) as Generated
    } catch {
      throw { code: 'invalid_json', message: 'The answer came back incomplete. Try again.' } as AiError
    }
    return toDeck(parsed, r, 'ai')
  } catch (e) {
    if ((e as AiError)?.code && !(e instanceof Error)) throw e
    if (e instanceof APIUserAbortError || signal.aborted) throw { code: 'cancelled', message: '' } as AiError
    if (e instanceof AuthenticationError || e instanceof PermissionDeniedError) throw { code: 'bad_key', message: 'That API key was rejected. Check it and paste it again.' } as AiError
    if (e instanceof RateLimitError) throw { code: 'rate_limited', message: 'The API is rate-limiting this key. Wait a minute and try again.' } as AiError
    if (e instanceof APIConnectionError) throw { code: 'network', message: 'Couldn’t connect to the Anthropic API. Check your connection.' } as AiError
    throw { code: 'upstream_error', message: `The API returned an error: ${(e as Error)?.message ?? 'unknown'}` } as AiError
  }
}
