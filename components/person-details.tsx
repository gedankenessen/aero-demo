import type { PersonModel } from "./types";
import styles from "./demo-page.module.css";

export interface PersonDetailsProps {
  person: PersonModel;
}

export const PersonDetails = ({ person }: PersonDetailsProps) => (
  <div className={styles.person}>
    <p className={styles.personName}>{person.headline}</p>
    {person.description && <p>{person.description}</p>}
    {(person.email || person.phone) && (
      <address className={styles.personLinks}>
        {person.email && <a href={`mailto:${person.email}`}>{person.email}</a>}
        {person.phone && <a href={`tel:${person.phone.replace(/\s/g, "")}`}>{person.phone}</a>}
      </address>
    )}
  </div>
);
