import { branchRoot } from "@/lib/page-tree"
import type { Block } from "@/lib/content/blocks/types"

// The words of the embeddings home page are the blocks of `(publicLayer)/_data/<lang>.json`, as on the Stripe element's landing (node
// step 573-7). The page is `bare`: this widget draws its blocks, and the same blocks are the page's text copy for search and agents
// (`index.md`, `llms-full.txt`). A language without its own file gets the English one, like the whole page. No words in code: a fixed
// sentence shows without a rebuild (ISR 300 s or `npm run pages:refresh`).
export function landingBlocks(lang: string): Block[] {
  const root = branchRoot("(publicLayer)")
  return (root?.overrides[lang]?.blocks ?? root?.en.blocks ?? []) as Block[]
}

export type Hero = Extract<Block, { kind: "block-hero-centered" }>
export type Section = { id: string; title: string; blocks: Block[] }

/** The first screen and the sections: a section is a `block-section-head` and the blocks up to the next one; sequence widgets are skipped. */
export function landing(lang: string): { hero: Hero | null; sections: Section[] } {
  let hero: Hero | null = null
  const sections: Section[] = []
  for (const b of landingBlocks(lang)) {
    if (b.kind === "block-hero-centered") hero = b
    else if (b.kind === "block-section-head") sections.push({ id: b.id, title: b.title, blocks: [] })
    else if (!b.kind.startsWith("widget-")) sections.at(-1)?.blocks.push(b)
  }
  return { hero, sections }
}
