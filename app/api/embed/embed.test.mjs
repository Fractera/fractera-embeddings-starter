// Samples of the door embed (`npm run test:embed`): exit code 1 on any miss.
// 626-2: the refusals need no model; the vectors are compared with the 626-1 reference (the same pinned file counted on the owner's
// Mac in Node and in Python) — needs the model in place (`npm run model`).
import { readFileSync } from 'node:fs'
import { handle } from './embed.mjs'

let failures = 0
const expect = async (label, input, want) => {
  const got = await handle(input)
  const ok = JSON.stringify(got) === JSON.stringify(want)
  if (!ok) failures++
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${ok ? '' : `\n     got  ${JSON.stringify(got)}\n     want ${JSON.stringify(want)}`}`)
}
const check = (label, ok, detail = '') => {
  if (!ok) failures++
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${detail ? ` — ${detail}` : ''}`)
}
const cos = (a, b) => { let d = 0, x = 0, y = 0; for (let i = 0; i < a.length; i += 1) { d += a[i] * b[i]; x += a[i] * a[i]; y += b[i] * b[i] } return d / Math.sqrt(x * y) }

await expect('no texts', {}, { status: 422, body: { error: 'no_texts', reason: 'send { "texts": ["…"] } — a list of 1 to 256 texts' } })
await expect('257 texts', { texts: Array(257).fill('x') }, { status: 422, body: { error: 'too_many_texts', reason: '257 texts — at most 256 in one call' } })
await expect('an empty text', { texts: ['Привет', '  '] }, { status: 422, body: { error: 'bad_text', reason: 'texts[1] is not a non-empty string' } })

const ref = JSON.parse(readFileSync(new URL('../../../lib/embed/reference-626-1.json', import.meta.url), 'utf8'))
const got = await handle({ texts: ref.texts })
check('20 texts → 200, 384 numbers each', got.status === 200 && got.body.vectors?.length === 20 && got.body.vectors.every((v) => v.length === 384),
  got.status === 200 ? '' : JSON.stringify(got.body))
if (got.status === 200) {
  const c = ref.texts.map((_, i) => cos(got.body.vectors[i], ref.vectors[i]))
  check('the same text as in 626-1: cos ≥ 0.999 for all 20', c.every((x) => x >= 0.999), `min ${Math.min(...c).toFixed(6)}`)
  const at = (t) => got.body.vectors[ref.texts.indexOf(t)]
  const far = cos(at('Привет'), at('Fix a leaking kitchen faucet'))
  check('negative control: two different texts stay below 0.9', far < 0.9, `«Привет» ~ «Fix a leaking kitchen faucet» ${far.toFixed(4)}`)
}

// No process.exit() after an inference — it aborts inside onnxruntime-node on macOS (lib/embed/model.mjs); the loop ends by itself.
if (failures) { console.error(`===TEST_EMBED_FAILED=== ${failures}`); process.exitCode = 1 } else console.log('===TEST_EMBED_OK===')
