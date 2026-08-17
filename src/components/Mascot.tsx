import neutral from "@/assets/neutral.png.asset.json";
import energetic from "@/assets/energetic.png.asset.json";
import tired from "@/assets/tired.png.asset.json";
import comforted from "@/assets/comforted.png.asset.json";
import celebratory from "@/assets/celebratory.png.asset.json";
import sleepy from "@/assets/sleepy.png.asset.json";
import distracted from "@/assets/distracted.png.asset.json";
import type { Phase } from "@/lib/cycle";
import { cn } from "@/lib/utils";

export type MascotState =
  | "neutral"
  | "energetic"
  | "tired"
  | "comforted"
  | "celebratory"
  | "sleepy"
  | "distracted";

const SOURCES: Record<MascotState, string> = {
  neutral: neutral.url,
  energetic: energetic.url,
  tired: tired.url,
  comforted: comforted.url,
  celebratory: celebratory.url,
  sleepy: sleepy.url,
  distracted: distracted.url,
};

const ALT: Record<MascotState, string> = {
  neutral: "Laali resting with a soft smile",
  energetic: "Laali bouncing with sparkles",
  tired: "Laali looking tired",
  comforted: "Laali wrapped in a blanket with a hot water bottle",
  celebratory: "Laali cheering among petals",
  sleepy: "Laali curled up asleep",
  distracted: "Laali following a butterfly",
};

export const phaseMascot: Record<Phase, MascotState> = {
  menstrual: "comforted",
  follicular: "neutral",
  ovulation: "energetic",
  luteal: "tired",
};

export function Mascot({
  state = "neutral",
  size = 128,
  className,
  bob = false,
}: {
  state?: MascotState;
  size?: number;
  className?: string;
  bob?: boolean;
}) {
  return (
    <img
      src={SOURCES[state]}
      alt={ALT[state]}
      width={size}
      height={size}
      loading="lazy"
      style={{ width: size, height: size }}
      className={cn("select-none object-contain", bob && "bob", className)}
    />
  );
}
