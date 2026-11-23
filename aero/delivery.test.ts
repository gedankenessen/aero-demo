import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { test, type TestContext } from "node:test";
import { createClient, type EntryFieldTypes } from "@gedankenessen/aero/contentful";
import { validateContent } from "@gedankenessen/aero/contentful/local";
import { schema } from "./schema.ts";

type PageSkeleton = {
  contentTypeId: "page";
  fields: {
    slug: EntryFieldTypes.Symbol;
    title: EntryFieldTypes.Symbol;
  };
};

const pageQuery = { content_type: "page", "fields.slug": "hello-aero" } as const;
const articleFields = {
  headline: "Hello, Aero",
  description: "The demo article.",
  readTime: 5,
  body: "Publish content with Aero.",
  author: "person",
};

async function createTestContentDirectory(context: TestContext) {
  const directory = await mkdtemp(join(tmpdir(), "aero-delivery-"));
  context.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}

const writeEntry = (
  directory: string,
  filename: string,
  contentType: keyof typeof schema,
  fields: Record<string, unknown>,
) => writeFile(join(directory, filename), JSON.stringify({ contentType, fields }));

function writeArticleSupport(directory: string) {
  return Promise.all([
    writeEntry(directory, "person.json", "person", { headline: "Aero Author", description: "The demo author." }),
    writeEntry(directory, "article.json", "pageArticle", { ...articleFields, blocks: [] }),
  ]);
}

function pageFields(slug: string, title: string | number) {
  return { slug, title, description: "A demo page.", content: "article", noIndex: false, noFollow: true, keywords: [] };
}

test("serves empty Content before the first Entry is published", async (context) => {
  const directory = await createTestContentDirectory(context);
  const config = { schema, contentDir: relative(process.cwd(), join(directory, "content")) };
  await validateContent(config);
  assert.deepEqual((await createClient(config).getEntries(pageQuery)).items, []);
});

test("queries a Page by scalar Fields through the Contentful-compatible client", async (context) => {
  const directory = await createTestContentDirectory(context);
  await Promise.all([
    writeArticleSupport(directory),
    writeEntry(directory, "p001.json", "page", pageFields("getting-started", "Getting Started")),
    writeEntry(directory, "p002.json", "page", pageFields("hello-aero", "Hello, Aero")),
  ]);
  const client = createClient({ schema, contentDir: relative(process.cwd(), directory) });
  const { items } = await client.getEntries<PageSkeleton>(pageQuery);

  assert.equal(items.length, 1);
  const [page] = items;
  assert.ok(page);
  assert.equal(page.sys.id, "p002");
  assert.equal(page.fields.slug satisfies string, "hello-aero");
  assert.equal(page.fields.title satisfies string, "Hello, Aero");

  const { items: inferredItems } = await client.getEntries(pageQuery);
  const [inferredPage] = inferredItems;
  assert.ok(inferredPage);
  assert.deepEqual(inferredPage.fields satisfies { slug: string; title: string }, page.fields);

  const missing = await client.getEntries({ ...pageQuery, "fields.slug": "unknown" });
  assert.deepEqual(missing.items, []);

  const byTitle = await client.getEntries({ content_type: "page", "fields.title": "Hello, Aero" });
  assert.deepEqual(byTitle.items, [page]);

  const conflicting = await client.getEntries({ ...pageQuery, "fields.title": "Getting Started" });
  assert.deepEqual(conflicting.items, []);
});

test("uses the same validator for configured Content in CI and delivery", async (context) => {
  const directory = await createTestContentDirectory(context);
  await mkdir(join(directory, "pages"));
  await writeArticleSupport(directory);

  const file = join(directory, "pages", "p007.json");
  const writePage = (title: string | number) => writeEntry(directory, "pages/p007.json", "page", pageFields("hello-aero", title));
  const config = { schema, contentDir: relative(process.cwd(), directory) };
  const client = createClient(config);
  const query = () => client.getEntries<PageSkeleton>(pageQuery);
  const invalidTitle = { entryId: "p007", source: relative(process.cwd(), file), path: "fields.title" };

  await writeFile(file, "{");
  await assert.rejects(() => validateContent(config), {
    ...invalidTitle,
    path: "$",
    message: /Invalid JSON/,
  });

  await writePage(42);
  await assert.rejects(() => validateContent(config), invalidTitle);
  await assert.rejects(query, invalidTitle);

  await writePage("Valid title");
  const [first, second] = await Promise.all([query(), query()]);
  await writePage("Changed on disk");

  assert.equal(first.items[0]?.fields.title, "Valid title");
  assert.deepEqual(second, first);
  assert.deepEqual(await query(), first);
});

test("resolves ordered Block Entries and reports the index of an invalid item", async (context) => {
  const directory = await createTestContentDirectory(context);
  const config = { schema, contentDir: relative(process.cwd(), directory) };
  await writeArticleSupport(directory);
  const writeBlocks = (blocks: unknown) => writeEntry(directory, "article.json", "pageArticle", { ...articleFields, blocks });
  await Promise.all([
    writeEntry(directory, "b001.json", "blockTeaser", { headline: "Teaser", description: "A teaser", item: "card" }),
    writeEntry(directory, "b002.json", "blockText", { headline: "Text", description: "Some text" }),
    writeEntry(directory, "card.json", "card", { headline: "A card", description: "Card content." }),
  ]);

  await writeBlocks(["b001", 42]);
  await assert.rejects(validateContent(config), { path: "fields.blocks[1]", message: /Expected a reference/ });
  await writeBlocks(["b001", "missing"]);
  await assert.rejects(validateContent(config), { path: "fields.blocks[1]", message: /was not found/ });
  await writeBlocks(["b001", "card"]);
  await assert.rejects(validateContent(config), { path: "fields.blocks[1]", message: /allowed Content-Type/ });

  const blocks = ["b002", "b001", "b002"];
  await writeBlocks(blocks);
  const { items } = await createClient(config).getEntries({ content_type: "pageArticle" });
  const [article] = items;
  assert.ok(article);
  assert.deepEqual(article.fields.blocks.map(({ sys }) => sys.id), blocks);
  const text = {
    sys: { id: "b002", contentType: { sys: { id: "blockText" } } },
    fields: { headline: "Text", description: "Some text" },
  };
  assert.deepEqual(JSON.parse(JSON.stringify(article.fields.blocks)), [
    text,
    {
      sys: { id: "b001", contentType: { sys: { id: "blockTeaser" } } },
      fields: { headline: "Teaser", description: "A teaser", item: { sys: { type: "Link", linkType: "Entry", id: "card" } } },
    },
    text,
  ]);
});

test("delivers typed Page fields and rejects a dangling reference", async (context) => {
  const directory = await createTestContentDirectory(context);
  const fields = pageFields("hello-aero", "Explore Aero");
  await writeEntry(directory, "p001.json", "page", fields);
  const config = { schema, contentDir: relative(process.cwd(), directory) };
  const client = createClient(config);
  const query = () => client.getEntries({
    content_type: "page",
    "fields.noIndex": false,
    "fields.noFollow": true,
    "fields.content": "article",
  });

  await assert.rejects(query, { entryId: "p001", path: "fields.content" });
  await writeArticleSupport(directory);
  const { items } = await query();
  assert.equal(items.length, 1);
  assert.deepEqual(items[0]?.fields, {
    ...fields,
    content: {
      sys: { id: "article", contentType: { sys: { id: "pageArticle" } } },
      fields: { ...articleFields, author: { sys: { type: "Link", linkType: "Entry", id: "person" } }, blocks: [] },
    },
  });
});
