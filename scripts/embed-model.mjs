// npm run model — the model of this element (node step 626-2): the pinned files of `lib/embed/manifest.mjs` into the element's data
// folder at the node (`SERVICE_DATA_DIR/model`), each checked by its size and sha256. The download happens only here, from THIS
// element's own GitHub release; the running server never downloads anything.
//
//   npm run model                    download what is missing or wrong, check everything; already in place → one line, exit 0
//   npm run model -- --soft          the same, but a failure prints ===EMBED_MODEL_FAILED=== and exits 0: prebuild calls it so — the
//                                    site builds without the model, and the status door names what is missing
//   npm run model -- --check         check only, download nothing
//   npm run model -- --from <folder> take the files from a local folder (a copy carried by hand) instead of the release
//
// 🔒 A file whose sha256 is not the pinned one is refused by name and deleted; it never replaces a good file (written as `.part`,
// renamed only after the check).
import { chmodSync, copyFileSync, createWriteStream, existsSync, mkdirSync, renameSync, rmSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { fileURLToPath } from 'node:url'
import { FILES, RELEASE, assetUrl } from '../lib/embed/manifest.mjs'
import { checkModel, modelDir, sha256Of } from '../lib/embed/files.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const SOFT = args.includes('--soft')
const fromAt = args.indexOf('--from')
const FROM = fromAt >= 0 ? resolve(args[fromAt + 1] ?? '') : null
const say = (m) => console.log(m)
const fail = (reason) => {
  say(`===EMBED_MODEL_FAILED=== ${reason}`)
  process.exit(SOFT ? 0 : 1)
}

const dir = modelDir(ROOT)
const mb = (n) => `${Math.round(n / 1048576)} MB`
const total = FILES.reduce((n, f) => n + f.bytes, 0)

const before = await checkModel(dir)
if (before.ok) {
  say(`===EMBED_MODEL_OK=== ${dir} — ${FILES.length} files, ${mb(total)}, sha256 checked (release ${RELEASE.tag})`)
  process.exit(0)
}
if (args.includes('--check')) fail(`${dir}: ${before.wrong.map((w) => `${w.path} ${w.reason}`).join('; ')}`)

for (const w of before.wrong) {
  const f = FILES.find((x) => x.path === w.path)
  const file = join(dir, f.path)
  const part = `${file}.part`
  mkdirSync(dirname(file), { recursive: true })
  rmSync(part, { force: true })
  const t0 = Date.now()
  try {
    if (FROM) {
      const src = join(FROM, f.asset)
      if (!existsSync(src)) throw new Error(`no ${f.asset} in ${FROM}`)
      copyFileSync(src, part)
    } else {
      const res = await fetch(assetUrl(f.asset), { redirect: 'follow', signal: AbortSignal.timeout(30 * 60 * 1000) })
      if (!res.ok || !res.body) throw new Error(`the release answered ${res.status} for ${assetUrl(f.asset)}`)
      await pipeline(Readable.fromWeb(res.body), createWriteStream(part))
    }
  } catch (err) {
    rmSync(part, { force: true })
    fail(`${f.asset}: ${err instanceof Error ? err.message : String(err)}`)
  }
  const size = statSync(part).size
  const sha = await sha256Of(part)
  if (size !== f.bytes || sha !== f.sha256) {
    rmSync(part, { force: true })
    fail(`${f.asset}: ${size} bytes, sha256 ${sha} — the pinned file has ${f.bytes} bytes, sha256 ${f.sha256}; refused and deleted`)
  }
  // Windows: a copied file keeps its read-only mark, and a file the running element holds open cannot be replaced — the old one is
  // removed first, and a refusal is named instead of a bare EPERM.
  try {
    chmodSync(part, 0o644)
    rmSync(file, { force: true })
    renameSync(part, file)
  } catch (err) {
    rmSync(part, { force: true })
    fail(`${f.path}: ${file} cannot be replaced (${err?.code ?? err}) — the running element holds it; stop the element and run npm run model again`)
  }
  say(`  ${f.path}: ${mb(size)} in ${((Date.now() - t0) / 1000).toFixed(1)} s, sha256 checked`)
}

const after = await checkModel(dir)
if (!after.ok) fail(`${dir}: ${after.wrong.map((w) => `${w.path} ${w.reason}`).join('; ')}`)
say(`===EMBED_MODEL_OK=== ${dir} — ${FILES.length} files, ${mb(total)}, sha256 checked (release ${RELEASE.tag})`)
