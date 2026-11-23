import type { CardModel } from "./types";
import { ContentLink } from "./content-link";
import styles from "./demo-page.module.css";

export interface ContentCardProps {
  card: CardModel;
}

export const ContentCard = ({ card }: ContentCardProps) => (
  <div className={styles.card}>
    <h3>{card.headline}</h3>
    {card.description && <p>{card.description}</p>}
    {card.cta && <ContentLink link={card.cta} />}
  </div>
);
