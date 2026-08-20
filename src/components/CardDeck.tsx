import type { ReactNode } from "react";
import { Mascot, type MascotState } from "@/components/Mascot";
import { cn } from "@/lib/utils";

export interface DeckCard {
  id: string;
  title: string;
  /** Optional small line above the title, for example "You are here today". */
  eyebrow?: string;
  body: string;
  points: string[];
  mascot: MascotState;
  tint?: string;
  accent?: string;
  footer?: ReactNode;
}

/**
 * The shared Learn hub card: short, illustrated, swipeable.
 * Used on her Learn page and on the partner's general Insights section.
 */
export function CardDeck({ cards, className }: { cards: DeckCard[]; className?: string }) {
  return (
    <div
      className={cn(
        "-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2",
        className,
      )}
      style={{ scrollbarWidth: "none" }}
    >
      {cards.map((card) => (
        <article
          key={card.id}
          className="paper w-[19rem] shrink-0 snap-center p-5"
          style={{ background: card.tint }}
        >
          <div className="flex items-center gap-3">
            <Mascot state={card.mascot} size={56} />
            <div>
              <h3 className="text-xl leading-tight">{card.title}</h3>
              {card.eyebrow ? (
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {card.eyebrow}
                </p>
              ) : null}
            </div>
          </div>
          <p className="mt-3 text-sm">{card.body}</p>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            {card.points.map((line) => (
              <li key={line} className="flex gap-2">
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: card.accent ?? "var(--ink)" }}
                />
                {line}
              </li>
            ))}
          </ul>
          {card.footer}
        </article>
      ))}
    </div>
  );
}
