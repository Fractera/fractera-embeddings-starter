# fractera-embeddings-starter

The native element `embeddings` of a Fractera node: the node's own vectors. It turns texts into 384-number vectors with one local
multilingual model, on this computer — no key, no internet, no outside service. Every vector of the node is counted here: the
vectors element, the knowledge graph and the deep memory ask it; the core and the other elements send texts to the vectors element
and count nothing themselves.

Born from `fractera-native-item-starter` v0.1.34 (node step 626-2) — without the template's three-system check
`.github/workflows/three-os.yml`: the token that filled this repository on 2026-11-03 had no `workflow` scope, and GitHub refuses a
workflow file without it. It comes back after `gh auth refresh -h github.com -s workflow`.

## The model

`paraphrase-multilingual-MiniLM-L12-v2` (sentence-transformers): 384 numbers, about 50 languages, 128 tokens of each text (a longer
text is cut — the model was trained so), mean pooling, normalized vectors. The file is the ONNX export
`Qdrant/paraphrase-multilingual-MiniLM-L12-v2-onnx-Q` (235 MB), Apache-2.0 — see `NOTICE-MODEL.md`.

It runs inside this element's own process: `@huggingface/transformers` 3.8.1 with `onnxruntime-node` 1.21.0. Measured on the
owner's Intel Mac (node step 626-1): the same file gives the same vector in Node and in Python (cos 1.000000 on 20 of 20 texts), so
a vector counted at Fractera (the skills catalog ships ready, 627) equals the one counted on a node. `onnxruntime-node` stays at
1.21.0: 1.23 does not load on macOS 12 (its libc++ lacks `std::to_chars` for double), and 1.24+ ship no macOS Intel binary.

## The price in memory

A resident process like every element under pm2: the model loads at the start and stays — about **0.8 GB for the whole element after the load
(the server ~0.2 GB, the model ~0.6 GB), up to about 1.0 GB** while a batch of 100 texts is counted (Intel i7-6820HQ, 16 GB). One short text takes 6–25 ms, the load 2–4 s. There
is no timer, no unload and no queue of its own: one batch is counted at a time.

## Using it

Both doors are for the processes of this machine: the loopback and the node key (`X-Node-Key` — this element's `SETTINGS_SECRET`).

```
POST http://127.0.0.1:<port>/api/embed
X-Node-Key: <the node key>
{ "texts": ["Привет", "Hello"] }

→ 200 { "model": "paraphrase-multilingual-MiniLM-L12-v2", "dims": 384, "vectors": [[0.0123, …], [0.0119, …]] }
→ 401 without the key · 422 no texts, more than 256, an empty text · 503 { "error": "model_not_ready", "reason": "…" }
```

```
GET http://127.0.0.1:<port>/api/embed-status
X-Node-Key: <the node key>

→ 200 { "model": "…", "dims": 384, "ready": true, "status": "ready", "loadedMs": 3218, "rssMb": 595, "calls": 42, … }
```

`calls` counts the texts embedded since the start; a failed load names its reason in `error` (`status: "failed"`).

## Where the model lives

`npm run model` downloads the five pinned files (`lib/embed/manifest.mjs`) from THIS repository's release `model-minilm-l12-1` into
the node's data folder of the element (`SERVICE_DATA_DIR/model`, outside the build and the clone — a rebuild or a reinstall does not
download it again; without a node — the user's cache, `~/.cache/fractera-embeddings/model`) and checks the size and the sha256 of each. The build runs it (`prebuild`, softly: the site builds without the
model and the status door names what is missing). A file with another sha256 is refused by name and deleted; the element never
loads a model it has not checked, and the running element downloads nothing.

```
npm run model                      # download what is missing or wrong, check everything
npm run model -- --check           # check only
npm run model -- --from <folder>   # take the files from a local copy instead of the release
```

## Changing the model

Changing the model means recounting every stored vector of the node — the vectors element's store, the graph's spaces, the deep
memory, the skills catalog shipped by Fractera. **The owner decides.** A new model is a new release tag and new pins in
`lib/embed/manifest.mjs`; the readers set their old data aside when the model they recorded differs.

## Stopping

After the first vector, `process.exit()` aborts the process inside `onnxruntime-node` 1.21 on macOS (measured: «mutex lock failed:
Invalid argument»). So once the model is loaded, SIGINT and SIGTERM end the process by that same signal, without `exit()`
(`lib/embed/model.mjs`); nothing is lost — the element keeps no state.

## Windows and Linux — not measured yet

Measured on macOS only (the owner, 2026-11-03: Windows and Linux come back by his word). What the package itself says:

- **Windows x64 and arm64.** The CPU build is inside `onnxruntime-node` 1.21.0 — nothing is downloaded at install. Its DLLs import
  the Microsoft Visual C++ 2015–2022 runtime (`VCRUNTIME140.dll`, `VCRUNTIME140_1.dll`, `MSVCP140.dll`, `MSVCP140_1.dll`) and
  DirectX 12 (`d3d12.dll`, `dxgi.dll`, present on every Windows 10/11 desktop). A Windows without that runtime cannot load the model:
  the status door names the missing DLLs and the official installer (`https://aka.ms/vs/17/release/vc_redist.x64.exe`, an
  administrator's yes).
- **Windows stop.** pm2 ends a process abruptly there (Windows has no stop signals), so «Stopping» above does not apply.
- **Linux x64.** The install script of `onnxruntime-node` downloads its CUDA build from GitHub on every install, GPU or not, and a
  failed download fails `npm ci` — `.npmrc` here turns it off (`onnxruntime-node-install-cuda=skip`).

## The contract a replacement must keep

- `OWN-SERVICE-PROPS/` — the passport, the element's main door (`GET /api/own-service-props`); `NODE-CONTRACT.json` — what the node needs to install it.
- The port comes from the `PORT` environment variable.
- `GET /api/health` answers 200 without a session.
- `POST /api/embed` and `GET /api/embed-status` keep their shape; the model and its size are named by the status door, never assumed by a caller.

## Run on its own

```
npm install
npm run model
npm run build
PORT=24696 SETTINGS_SECRET=<a key> node .next/standalone/server.js
```

License: MIT (the code). The model: Apache-2.0 (`NOTICE-MODEL.md`).
