import { branchRoot } from "@/lib/page-tree"
import type { PageItem } from "@/lib/content/page-items"

// The words of the embeddings home page are the body of `(publicLayer)/_data/<lang>.json`, as on the Stripe element's landing (node
// step 573-7). The page is `bare`: this widget draws its body, and the same body are the page's text copy for search and agents
// (`index.md`, `llms-full.txt`). A language without its own file gets the English one, like the whole page. No words in code: a fixed
// sentence shows without a rebuild (ISR 300 s or `npm run pages:refresh`).
export function landingBlocks(lang: string): PageItem[] {
  const root = branchRoot("(publicLayer)")
  return (root?.overrides[lang]?.body ?? root?.en.body ?? []) as PageItem[]
}

export type Hero = Extract<PageItem, { kind: "section-hero-centered" }>
export type Section = { id: string; title: string; body: PageItem[] }

/** The first screen and the sections: a section is a `section-head` and the body up to the next one; sequence widgets are skipped. */
export function landing(lang: string): { hero: Hero | null; sections: Section[] } {
  let hero: Hero | null = null
  const sections: Section[] = []
  for (const b of landingBlocks(lang)) {
    if (b.kind === "section-hero-centered") hero = b
    else if (b.kind === "section-head") sections.push({ id: b.id, title: b.title, body: [] })
    else if (!b.kind.startsWith("widget-")) sections.at(-1)?.body.push(b)
  }
  return { hero, sections }
}
