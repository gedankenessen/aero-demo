import { ArticlePage } from "./article-page";
import { ContentBlock } from "./content-block";
import { EventPage } from "./event-page";
import { StandardPage } from "./standard-page";
import type { PageContent, PageLink, PageModel } from "./types";
import styles from "./demo-page.module.css";

export interface DemoPageProps {
  page: PageModel;
  pages: readonly PageLink[];
}

function renderPage(content: PageContent) {
  switch (content.type) {
    case "pageContent":
      return <StandardPage content={content} />;
    case "pageArticle":
      return <ArticlePage content={content} />;
    case "pageEvent":
      return <EventPage content={content} />;
  }
}

function pageHref(slug: string) {
  return slug === "home" ? "/" : `/${encodeURIComponent(slug)}`;
}

export const DemoPage = ({ page, pages }: DemoPageProps) => (
  <div className={styles.shell}>
    <header className={styles.siteHeader}>
      <div className={styles.headerInner}>
        <a className={styles.wordmark} href="/">Aero</a>
        <nav className={styles.navigation} aria-label="Demo pages">
          {pages.map(({ slug, title }) => (
            <a key={slug} href={pageHref(slug)} aria-current={page.slug === slug ? "page" : undefined}>
              {title}
            </a>
          ))}
        </nav>
      </div>
    </header>
    <main className={styles.main}>
      {renderPage(page.content)}
      {page.content.blocks.length > 0 && (
        <div className={styles.blocks}>
          {page.content.blocks.map((block, index) => <ContentBlock key={index} block={block} />)}
        </div>
      )}
    </main>
  </div>
);
