// THE MODEL IN THIS PROCESS (node step 626-2). Loaded once at the server's start (`instrumentation.ts`) and kept: a resident process
// like every element under pm2 — its price in memory is on the passport (~0.6 GB after load, measured in 626-1). No timer, no unload,
// no queue of its own beyond one batch at a time (two batches at once would double the peak of memory, not the speed).
//
// `@huggingface/transformers` 3.8.1 runs the ONNX file through `onnxruntime-node` 1.21.0 — the last line with a macOS Intel binary
// (1.24+ ship arm64 only, measured 2026-11-03). Only the pinned local files are read: remote models are off.
import { dirname, basename } from 'node:path'
import { BATCH, DIMS, MAX_TEXTS, MAX_TOKENS, MODEL } from './manifest.mjs'
import { checkModel, modelDir, windowsRuntimeMissing } from './files.mjs'

/** One state per process — Next may load this module in more than one bundle, the global keeps a single model. */
const state = (globalThis.__fracteraEmbed ??= { status: 'idle', extractor: null, loading: null, loadedMs: null, error: null, calls: 0, tail: Promise.resolve() })

async function load() {
  const started = Date.now()
  const dir = modelDir()
  const check = await checkModel(dir)
  if (!check.ok) {
    throw new Error(`the model in ${dir} is not the pinned one: ${check.wrong.map((w) => `${w.path} ${w.reason}`).join('; ')} — run npm run model`)
  }
  let extractor
  try {
    const { env, pipeline } = await import('@huggingface/transformers')
    env.allowRemoteModels = false
    env.allowLocalModels = true
    env.localModelPath = dirname(dir)
    extractor = await pipeline('feature-extraction', basename(dir), { dtype: 'fp32', local_files_only: true })
  } catch (err) {
    const missing = windowsRuntimeMissing()
    if (!missing.length) throw err
    throw new Error(`the Microsoft Visual C++ 2015–2022 runtime is missing (${missing.join(', ')}): install https://aka.ms/vs/17/release/vc_redist.${process.arch === 'arm64' ? 'arm64' : 'x64'}.exe and restart the element (${err instanceof Error ? err.message : String(err)})`)
  }
  extractor.tokenizer.model_max_length = MAX_TOKENS
  state.loadedMs = Date.now() - started
  return extractor
}

// ✗ Measured 2026-11-03 on the owner's Mac: once the model has counted anything, `process.exit()` aborts the process inside
// onnxruntime-node 1.21 («libc++abi: … mutex lock failed: Invalid argument», SIGABRT, exit 134) — with or without dispose(), with
// one thread or four; a natural end of the event loop does not. Next ends with `process.exit()` on SIGINT/SIGTERM (pm2 stop and
// restart), so after the load a stop signal ends the process by that same signal, with no exit() — nothing is lost: the element
// keeps no state, the model is read from disk at the next start.
function stopBySignal() {
  if (state.signalsTaken) return
  state.signalsTaken = true
  for (const sig of ['SIGINT', 'SIGTERM']) {
    process.prependListener(sig, () => {
      process.removeAllListeners(sig)
      process.kill(process.pid, sig)
    })
  }
}

/** Start loading (the server's start calls it); a second call waits for the same load. */
export function startModel() {
  if (state.loading) return state.loading
  state.status = 'loading'
  state.loading = load().then(
    (extractor) => { state.extractor = extractor; state.status = 'ready'; stopBySignal(); console.log(`[embeddings] ${MODEL} ready in ${state.loadedMs} ms`); return true },
    (err) => { state.status = 'failed'; state.error = err instanceof Error ? err.message : String(err); console.error(`[embeddings] ${state.error}`); return false },
  )
  return state.loading
}

export function modelStatus() {
  return {
    model: MODEL,
    dims: DIMS,
    ready: state.status === 'ready',
    status: state.status,
    ...(state.error ? { error: state.error } : {}),
    loadedMs: state.loadedMs,
    rssMb: Math.round(process.memoryUsage().rss / 1048576),
    calls: state.calls,
    maxTokens: MAX_TOKENS,
    maxTexts: MAX_TEXTS,
  }
}

/** Texts → normalized 384-number vectors, in the order given. Waits for the load; throws when the model is not ready. */
export async function embedTexts(texts) {
  if (!state.loading) startModel()
  await state.loading
  if (state.status !== 'ready') throw new Error(state.error ?? 'the model is not loaded')
  const run = state.tail.then(async () => {
    const out = []
    for (let i = 0; i < texts.length; i += BATCH) {
      const t = await state.extractor(texts.slice(i, i + BATCH), { pooling: 'mean', normalize: true })
      out.push(...t.tolist())
    }
    state.calls += texts.length
    return out
  })
  state.tail = run.catch(() => {})
  return run
}
