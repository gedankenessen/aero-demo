import { ContentCard } from "./content-card";
import { PersonDetails } from "./person-details";
import type { BlockModel } from "./types";
import styles from "./demo-page.module.css";

export interface ContentBlockProps {
  block: BlockModel;
}

export const ContentBlock = ({ block }: ContentBlockProps) => (
  <section className={styles.block}>
    <h2>{block.headline}</h2>
    {"description" in block && block.description && <p className={styles.copy}>{block.description}</p>}
    {block.type === "blockTeaser" && <ContentCard card={block.item} />}
    {block.type === "blockContact" && <PersonDetails person={block.contact} />}
    {block.type === "blockHighlights" && block.items.length > 0 && (
      <div className={styles.cardGrid}>
        {block.items.map((card, index) => <ContentCard key={index} card={card} />)}
      </div>
    )}
  </section>
);
