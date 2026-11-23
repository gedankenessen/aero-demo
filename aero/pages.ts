import { createClient } from "@gedankenessen/aero/contentful";
import type { Metadata } from "next";
import { cache } from "react";
import type { BlockModel, CardModel, PageContent } from "../components/types";

const client = createClient();

type Reference = { sys: { id: string } };

function indexFields<Fields>(entries: readonly (Reference & { fields: Fields })[]) {
  return new Map(entries.map(({ sys, fields }) => [sys.id, fields]));
}

function follow<Value>(entries: ReadonlyMap<string, Value>, { sys: { id } }: Reference) {
  const entry = entries.get(id);
  if (entry === undefined) {
    throw new Error(`The demo could not resolve Entry "${id}".`);
  }
  return entry;
}

const readPages = cache(async () => (await client.getEntries({ content_type: "page" })).items);

const readPageContent = cache(async () => {
  const [standard, articles, events, cards, links, people, locations, teasers, text, contacts, highlights] = await Promise.all([
    client.getEntries({ content_type: "pageContent" }),
    client.getEntries({ content_type: "pageArticle" }),
    client.getEntries({ content_type: "pageEvent" }),
    client.getEntries({ content_type: "card" }),
    client.getEntries({ content_type: "link" }),
    client.getEntries({ content_type: "person" }),
    client.getEntries({ content_type: "location" }),
    client.getEntries({ content_type: "blockTeaser" }),
    client.getEntries({ content_type: "blockText" }),
    client.getEntries({ content_type: "blockContact" }),
    client.getEntries({ content_type: "blockHighlights" }),
  ]);
  const cardFields = indexFields(cards.items);
  const linkFields = indexFields(links.items);
  const personFields = indexFields(people.items);
  const locationFields = indexFields(locations.items);

  const card = (reference: Reference): CardModel => {
    const { cta, ...fields } = follow(cardFields, reference);
    return { ...fields, cta: cta === undefined ? undefined : follow(linkFields, cta) };
  };
  const blocks = new Map<string, BlockModel>([
    ...teasers.items.map(({ sys, fields }) => [sys.id, { ...fields, type: "blockTeaser", item: card(fields.item) }] as const),
    ...text.items.map(({ sys, fields }) => [sys.id, { ...fields, type: "blockText" }] as const),
    ...contacts.items.map(({ sys, fields }) => [
      sys.id, { ...fields, type: "blockContact", contact: follow(personFields, fields.contact) },
    ] as const),
    ...highlights.items.map(({ sys, fields }) => [sys.id, { ...fields, type: "blockHighlights", items: fields.items.map(card) }] as const),
  ]);
  const resolveBlocks = (references: readonly Reference[]) => references.map((reference) => follow(blocks, reference));

  return new Map<string, PageContent>([
    ...standard.items.map(({ sys, fields }) => [
      sys.id, { type: "pageContent", hero: card(fields.hero), blocks: resolveBlocks(fields.blocks) },
    ] as const),
    ...articles.items.map(({ sys, fields }) => [
      sys.id, { ...fields, type: "pageArticle", author: follow(personFields, fields.author), blocks: resolveBlocks(fields.blocks) },
    ] as const),
    ...events.items.map(({ sys, fields }) => [
      sys.id, {
        ...fields,
        type: "pageEvent",
        location: follow(locationFields, fields.location),
        contact: follow(personFields, fields.contact),
        blocks: resolveBlocks(fields.blocks),
      },
    ] as const),
  ]);
});

const findPage = cache(async (slug: string) => {
  const pages = await readPages();
  return { pages, entry: pages.find(({ fields }) => fields.slug === slug) };
});

export async function loadDemoPage(slug: string) {
  const { pages, entry } = await findPage(slug);
  if (entry === undefined) {
    return undefined;
  }
  const { title, description, content } = entry.fields;
  return {
    page: { slug, title, description, content: follow(await readPageContent(), content) },
    pages: pages.map(({ fields }) => ({ slug: fields.slug, title: fields.title })),
  };
}

export async function getDemoPageMetadata(slug: string): Promise<Metadata> {
  const { entry } = await findPage(slug);
  if (entry === undefined) {
    return {};
  }
  const { title, description, keywords, noIndex, noFollow } = entry.fields;
  return { title, description, keywords: [...keywords], robots: { index: !noIndex, follow: !noFollow } };
}
