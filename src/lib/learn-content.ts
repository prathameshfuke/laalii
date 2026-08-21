import type { DeckCard } from "@/components/CardDeck";
import { PHASES, type Phase } from "@/lib/cycle";
import { phaseMascot } from "@/components/Mascot";

export const PHASE_DETAIL: Record<Phase, string[]> = {
  menstrual: [
    "The lining sheds; hormones sit at their lowest.",
    "Energy often dips. Rest is not laziness here.",
    "Warmth, iron rich food and gentle movement tend to help.",
  ],
  follicular: [
    "Oestrogen climbs and follicles mature.",
    "Many people feel clearer, lighter, more social.",
    "A good stretch for starting things and harder training.",
  ],
  ovulation: [
    "An egg is released; oestrogen peaks then drops.",
    "Peak fertility sits in the few days before, not after.",
    "Some notice a twinge on one side or a change in discharge.",
  ],
  luteal: [
    "Progesterone rises then falls if there is no pregnancy.",
    "Appetite, sleep and mood can all shift in the back half.",
    "Steady routines and less caffeine often soften the landing.",
  ],
};

export function phaseCards(currentPhase?: Phase | null): DeckCard[] {
  return (Object.keys(PHASES) as Phase[]).map((phase) => ({
    id: phase,
    title: PHASES[phase].label,
    ...(currentPhase === phase ? { eyebrow: "Where she is today" } : {}),
    body: PHASES[phase].blurb,
    points: PHASE_DETAIL[phase],
    mascot: phaseMascot[phase],
    tint: PHASES[phase].soft,
    accent: PHASES[phase].color,
  }));
}


/**
 * General education for the partner. None of this depends on her data, so it
 * is the same for everyone and shows regardless of her sharing settings.
 */
export const PARTNER_TOPICS: Array<{ id: string; title: string; blurb: string; cards: DeckCard[] }> = [
  {
    id: "cycle",
    title: "Understanding the cycle",
    blurb: "Four phases, in plain language, so the rest of this has context.",
    cards: phaseCards(),
  },
  {
    id: "support",
    title: "Supporting someone through PMS or a period",
    blurb: "Practical, specific, and mostly about lowering the load.",
    cards: [
      {
        id: "support-pms",
        title: "In the PMS days",
        body: "The week before a period is often the hardest stretch, and it passes.",
        points: [
          "Take one thing off her plate without being asked, cooking, laundry, an errand.",
          "Keep plans flexible. Cancelling is not a failure.",
          "Snacks and an earlier night help more than advice does.",
        ],
        mascot: "tired",
      },
      {
        id: "support-period",
        title: "During the period itself",
        body: "Cramps, low iron and poor sleep are a real physical load.",
        points: [
          "Heat helps: a hot water bottle, a warm bath, a blanket.",
          "Offer painkillers, water and food without making it a production.",
          "Ask what she wants tonight rather than deciding for her.",
        ],
        mascot: "comforted",
      },
      {
        id: "support-pain",
        title: "When pain is severe",
        body: "Bad pain is common, but it is not something to simply put up with.",
        points: [
          "Pain that stops her working or sleeping is worth a doctor visit.",
          "Offer to book it, and to come along if she wants that.",
          "Do not compare it to a previous month or to anyone else.",
        ],
        mascot: "neutral",
      },
    ],
  },
  {
    id: "desire",
    title: "Shifts in desire across the cycle",
    blurb: "General context, not a statement about her.",
    cards: [
      {
        id: "desire-why",
        title: "Why it moves",
        body: "Desire commonly rises and falls with hormonal changes through the cycle.",
        points: [
          "For many people it lifts around ovulation and dips before a period.",
          "Sleep, stress, pain and contraception all shift it too.",
          "Averages describe groups, not any one person.",
        ],
        mascot: "energetic",
      },
      {
        id: "desire-how",
        title: "What that means in practice",
        body: "A quieter week is information, not a verdict on the relationship.",
        points: [
          "Do not keep score across a month.",
          "Closeness without sex still counts as closeness.",
          "Ask, do not infer. Patterns are not permission.",
        ],
        mascot: "neutral",
      },
    ],
  },
  {
    id: "talking",
    title: "Talking during sensitive moments",
    blurb: "How to check in, and what tends to land badly.",
    cards: [
      {
        id: "talk-checkin",
        title: "Checking in",
        body: "Short and specific beats broad and anxious.",
        points: [
          "Try: what would help right now, quiet, food, or company?",
          "Offer options rather than one question she has to answer twice.",
          "Then actually do the thing, without a running commentary.",
        ],
        mascot: "neutral",
      },
      {
        id: "talk-avoid",
        title: "What lands badly",
        body: "Most unhelpful responses are attempts to fix or to explain.",
        points: [
          "Avoid: is it your period? Even when it is.",
          "Avoid jumping to solutions before she has finished the sentence.",
          "Avoid treating a mood as a problem to be argued out of.",
        ],
        mascot: "tired",
      },
      {
        id: "talk-intimacy",
        title: "Around intimacy",
        body: "Consent is a conversation, and it can change mid way.",
        points: [
          "Ask plainly, accept the answer the first time.",
          "No is a full answer. It does not need a reason.",
          "If something hurts, stop, and treat it as worth mentioning to a doctor.",
        ],
        mascot: "comforted",
      },
    ],
  },
  {
    id: "health",
    title: "Sexual health for couples",
    blurb: "Factual and calm, the basics worth both of you knowing.",
    cards: [
      {
        id: "health-contraception",
        title: "Contraception basics",
        body: "Methods differ in how they work and how reliable they are in real life.",
        points: [
          "Hormonal methods, barriers like condoms, and long acting options all exist.",
          "Cycle tracking on its own is not contraception.",
          "Condoms are the only common method that also reduces infection risk.",
        ],
        mascot: "neutral",
      },
      {
        id: "health-testing",
        title: "Testing and honesty",
        body: "Routine testing is normal, not an accusation.",
        points: [
          "Get tested together when a relationship starts, or after a risk.",
          "Many infections have no symptoms at all.",
          "Talk about results the way you would any other health result.",
        ],
        mascot: "distracted",
      },
      {
        id: "health-doctor",
        title: "When to see a doctor together",
        body: "Some things are worth raising rather than waiting out.",
        points: [
          "Pain during sex, bleeding after sex, or periods that soak through hourly.",
          "Cycles that suddenly change length or stop.",
          "A year of trying to conceive without success, or six months over thirty five.",
        ],
        mascot: "celebratory",
      },
    ],
  },
];
