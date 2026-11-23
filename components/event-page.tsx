import { PersonDetails } from "./person-details";
import type { PageContent } from "./types";
import styles from "./demo-page.module.css";

export interface EventPageProps {
  content: Extract<PageContent, { type: "pageEvent" }>;
}

export const EventPage = ({ content }: EventPageProps) => (
  <article>
    <header className={`${styles.hero} ${styles.eventHero}`}>
      <h1>{content.headline}</h1>
      {content.description && <p>{content.description}</p>}
    </header>
    <div className={styles.eventDetails}>
      <section>
        <h2>Location</h2>
        <address className={styles.venue}>
          <strong>{content.location.name}</strong>
          {content.location.address && <span>{content.location.address}</span>}
        </address>
      </section>
      <section>
        <h2>Contact</h2>
        <PersonDetails person={content.contact} />
      </section>
    </div>
  </article>
);
