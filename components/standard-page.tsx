import { ContentLink } from "./content-link";
import type { PageContent } from "./types";
import styles from "./demo-page.module.css";

export interface StandardPageProps {
  content: Extract<PageContent, { type: "pageContent" }>;
}

export const StandardPage = ({ content: { hero } }: StandardPageProps) => (
  <header className={`${styles.hero} ${styles.standardHero}`}>
    <h1>{hero.headline}</h1>
    {hero.description && <p>{hero.description}</p>}
    {hero.cta && <ContentLink link={hero.cta} />}
  </header>
);
