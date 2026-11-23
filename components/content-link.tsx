import type { LinkModel } from "./types";
import styles from "./demo-page.module.css";

export interface ContentLinkProps {
  link: LinkModel;
}

export const ContentLink = ({ link }: ContentLinkProps) => (
  <a
    className={styles.cta}
    href={link.href}
    target={link.inNewTab ? "_blank" : undefined}
    rel={link.inNewTab ? "noreferrer" : undefined}
  >
    {link.label}
    <span aria-hidden="true">{link.inNewTab ? "↗" : "→"}</span>
  </a>
);
