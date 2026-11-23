export interface LinkModel {
  label: string;
  href: string;
  inNewTab: boolean;
}

export interface CardModel {
  headline: string;
  description: string;
  cta?: LinkModel;
}

export interface PersonModel {
  headline: string;
  description: string;
  email?: string;
  phone?: string;
}

export interface LocationModel {
  name: string;
  address: string;
}

export type BlockModel =
  | { type: "blockTeaser"; headline: string; description: string; item: CardModel }
  | { type: "blockText"; headline: string; description: string }
  | { type: "blockContact"; headline: string; description: string; contact: PersonModel }
  | { type: "blockHighlights"; headline: string; items: readonly CardModel[] };

export type PageContent =
  | { type: "pageContent"; hero: CardModel; blocks: readonly BlockModel[] }
  | {
    type: "pageArticle";
    headline: string;
    description: string;
    readTime: number;
    body: string;
    author: PersonModel;
    blocks: readonly BlockModel[];
  }
  | {
    type: "pageEvent";
    headline: string;
    description: string;
    location: LocationModel;
    contact: PersonModel;
    blocks: readonly BlockModel[];
  };

export interface PageLink {
  slug: string;
  title: string;
}

export interface PageModel extends PageLink {
  description: string;
  content: PageContent;
}
