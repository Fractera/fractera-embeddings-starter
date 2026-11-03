// The work of the door POST /api/embed: Turns texts into 384-number vectors with the node's local model.
// Gets what the caller sent (the JSON body), returns { status, body }:
// 200 with the result, 400 or 422 with { error, reason } for input it cannot use. Pure: no request, no key — route.ts does that.
// 626-2: { texts: string[] } (1 … 256, none empty) → { model, dims, vectors } in the same order; the model not ready → 503 with why.
import { DIMS, MAX_TEXTS, MODEL } from '../../../lib/embed/manifest.mjs'
import { embedTexts, modelStatus } from '../../../lib/embed/model.mjs'

export async function handle(input) {
  const texts = input?.texts
  if (!Array.isArray(texts) || !texts.length) {
    return { status: 422, body: { error: 'no_texts', reason: 'send { "texts": ["…"] } — a list of 1 to 256 texts' } }
  }
  if (texts.length > MAX_TEXTS) {
    return { status: 422, body: { error: 'too_many_texts', reason: `${texts.length} texts — at most ${MAX_TEXTS} in one call` } }
  }
  const bad = texts.findIndex((t) => typeof t !== 'string' || !t.trim())
  if (bad >= 0) return { status: 422, body: { error: 'bad_text', reason: `texts[${bad}] is not a non-empty string` } }
  try {
    const vectors = await embedTexts(texts)
    return { status: 200, body: { model: MODEL, dims: DIMS, vectors } }
  } catch (err) {
    const s = modelStatus()
    return { status: 503, body: { error: 'model_not_ready', reason: err instanceof Error ? err.message : String(err), status: s.status } }
  }
}
