import { PersonDetails } from "./person-details";
import type { PageContent } from "./types";
import styles from "./demo-page.module.css";

export interface ArticlePageProps {
  content: Extract<PageContent, { type: "pageArticle" }>;
}

export const ArticlePage = ({ content }: ArticlePageProps) => (
  <article>
    <header className={`${styles.hero} ${styles.articleHero}`}>
      <p className={styles.readTime}>{content.readTime} min read</p>
      <h1>{content.headline}</h1>
      {content.description && <p>{content.description}</p>}
    </header>
    <div className={styles.articleContent}>
      {content.body && <div className={styles.prose}>{content.body}</div>}
      <PersonDetails person={content.author} />
    </div>
  </article>
);
