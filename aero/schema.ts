import { defineSchema, v } from "@gedankenessen/aero";

const blocks = v.array(v.reference(["blockTeaser", "blockText", "blockContact", "blockHighlights"])).required();

export const schema = defineSchema({
  link: {
    label: v.string({ presentation: "single" }).required(),
    href: v.string({ presentation: "single" }).required(),
    inNewTab: v.boolean().required(),
  },
  card: {
    headline: v.string({ presentation: "single" }).required(),
    description: v.string().required(),
    cta: v.reference(["link"]),
  },
  person: {
    headline: v.string({ presentation: "single" }).required(),
    description: v.string().required(),
    email: v.string({ presentation: "single" }),
    phone: v.string({ presentation: "single" }),
  },
  location: {
    name: v.string({ presentation: "single" }).required(),
    address: v.string().required(),
  },
  page: {
    slug: v.string({ presentation: "single" }).required(),
    content: v.reference(["pageContent", "pageArticle", "pageEvent"]).required(),
    title: v.string({ presentation: "single" }).required(),
    description: v.string().required(),
    noIndex: v.boolean().required(),
    noFollow: v.boolean().required(),
    keywords: v.array(v.string()).required(),
  },
  pageContent: {
    hero: v.reference(["card"]).required(),
    blocks,
  },
  pageArticle: {
    headline: v.string({ presentation: "single" }).required(),
    description: v.string().required(),
    readTime: v.number().required(),
    body: v.string().required(),
    author: v.reference(["person"]).required(),
    blocks,
  },
  pageEvent: {
    headline: v.string({ presentation: "single" }).required(),
    description: v.string().required(),
    location: v.reference(["location"]).required(),
    contact: v.reference(["person"]).required(),
    blocks,
  },
  blockTeaser: {
    headline: v.string({ presentation: "single" }).required(),
    description: v.string().required(),
    item: v.reference(["card"]).required(),
  },
  blockText: {
    headline: v.string({ presentation: "single" }).required(),
    description: v.string().required(),
  },
  blockContact: {
    headline: v.string({ presentation: "single" }).required(),
    description: v.string().required(),
    contact: v.reference(["person"]).required(),
  },
  blockHighlights: {
    headline: v.string({ presentation: "single" }).required(),
    items: v.array(v.reference(["card"])).required(),
  },
});
