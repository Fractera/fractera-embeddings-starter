// THE MODEL OF THIS ELEMENT, PINNED (node step 626-2). Every vector of the node is counted by this one model, here and at Fractera
// (the skills catalog ships its vectors ready, 627) — so the files are pinned by sha256 and come from THIS element's own GitHub release,
// never from a third party at run time. Chosen by measurement in 626-1 (the core's completed-steps/626-1.md): the same file gives the
// same vector in Node and in Python (cos 1.000000 on 20 of 20 texts).
//
// 🔒 Changing the model means recounting every stored vector of the node (the vectors element, the graph, the memory) — the owner
// decides, and the release tag below changes with it.
export const MODEL = 'paraphrase-multilingual-MiniLM-L12-v2'
export const DIMS = 384
/** The model was trained on 128 tokens (its tokenizer config says 512): a longer text is cut here, as at Fractera. */
export const MAX_TOKENS = 128
/** One call of the door takes at most this many texts; they are counted in batches of BATCH. */
export const MAX_TEXTS = 256
export const BATCH = 32

export const RELEASE = {
  repo: 'Fractera/fractera-embeddings-starter',
  tag: 'model-minilm-l12-1',
  origin: 'Qdrant/paraphrase-multilingual-MiniLM-L12-v2-onnx-Q (ONNX export of sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2), Apache-2.0',
}

/** The files as the runtime reads them (`path` inside the model folder) and as the release names them (`asset`). */
export const FILES = [
  { path: 'onnx/model.onnx', asset: 'model.onnx', bytes: 235052644, sha256: '634d0f66c29dc934c8fa72b8a4fe91dd4d420a22f1d82a241058d4316e659a99' },
  { path: 'tokenizer.json', asset: 'tokenizer.json', bytes: 17083009, sha256: 'fa685fc160bbdbab64058d4fc91b60e62d207e8dc60b9af5c002c5ab946ded00' },
  { path: 'config.json', asset: 'config.json', bytes: 673, sha256: 'c8ec081fdad2df991bf5abbf18418fec7a5cdaa421f60ffb060a30040b8c376f' },
  { path: 'tokenizer_config.json', asset: 'tokenizer_config.json', bytes: 1416, sha256: '0666eebf692422757e1dddf3c9fb1ded73ba3dc726c5828671fc89e45bf3609f' },
  { path: 'special_tokens_map.json', asset: 'special_tokens_map.json', bytes: 964, sha256: '8c785abebea9ae3257b61681b4e6fd8365ceafde980c21970d001e834cf10835' },
]

export const assetUrl = (asset) => `https://github.com/${RELEASE.repo}/releases/download/${RELEASE.tag}/${asset}`
