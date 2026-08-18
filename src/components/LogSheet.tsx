import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Mascot, type MascotState } from "@/components/Mascot";
import { IconCheck, IconDrop } from "@/components/Icons";
import {
  DESIRE_LABELS,
  FLOW_LEVELS,
  INTIMACY_ACTIVITIES,
  INTIMACY_SYMPTOMS,
  MOODS,
  SYMPTOMS,
  formatDay,
  fromISO,
} from "@/lib/cycle";
import {
  useIntimacyLogs,
  useSaveIntimacy,
  useSaveLog,
  useStartPeriod,
  type DayLog,
} from "@/lib/data";
import { cn } from "@/lib/utils";

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-2 text-sm transition-all",
        active
          ? "border-foreground/70 bg-primary/30 text-foreground"
          : "border-border bg-card text-muted-foreground hover:border-foreground/40",
      )}
    >
      {children}
    </button>
  );
}

export function LogSheet({
  open,
  onOpenChange,
  date,
  existing,
  advanced,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  date: string;
  existing?: DayLog | null;
  advanced?: boolean;
}) {
  const [flow, setFlow] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [moods, setMoods] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [bbt, setBbt] = useState("");
  const [mucus, setMucus] = useState("");
  const [meds, setMeds] = useState("");
  const [startsPeriod, setStartsPeriod] = useState(false);

  const saveLog = useSaveLog();
  const startPeriod = useStartPeriod();

  useEffect(() => {
    if (!open) return;
    setFlow(existing?.flow ?? null);
    setSymptoms(existing?.symptoms ?? []);
    setMoods(existing?.moods ?? []);
    setNote(existing?.note ?? "");
    setBbt(existing?.bbt != null ? String(existing.bbt) : "");
    setMucus(existing?.mucus ?? "");
    setMeds(existing?.medications ?? "");
    setStartsPeriod(false);
  }, [open, existing]);

  const mascotState: MascotState = flow
    ? "comforted"
    : moods.includes("Energetic") || moods.includes("Happy")
      ? "energetic"
      : moods.includes("Foggy") || moods.includes("Withdrawn")
        ? "tired"
        : "neutral";

  const toggle = (list: string[], set: (v: string[]) => void, value: string) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  async function save() {
    try {
      await saveLog.mutateAsync({
        log_date: date,
        flow,
        symptoms,
        moods,
        note: note.trim() || null,
        bbt: bbt ? Number(bbt) : null,
        mucus: mucus || null,
        medications: meds.trim() || null,
      });
      if (startsPeriod) await startPeriod.mutateAsync(date);
      toast.success("Logged", { description: formatDay(fromISO(date)) });
      onOpenChange(false);
    } catch (error) {
      toast.error("Couldn't save that", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-xl bg-card">
        <DrawerHeader className="flex flex-row items-center gap-3 text-left">
          <Mascot state={mascotState} size={56} />
          <div>
            <DrawerTitle className="text-xl">{formatDay(fromISO(date))}</DrawerTitle>
            <DrawerDescription>How was the day? Anything you skip is fine.</DrawerDescription>
          </div>
        </DrawerHeader>

        <div className="max-h-[62vh] space-y-6 overflow-y-auto px-5 pb-4">
          <div>
            <p className="mb-2 text-sm font-semibold">Flow</p>
            <div className="flex flex-wrap gap-2">
              <Chip active={flow === null} onClick={() => setFlow(null)}>
                None
              </Chip>
              {FLOW_LEVELS.map((level) => (
                <Chip key={level} active={flow === level} onClick={() => setFlow(level)}>
                  <span className="flex items-center gap-1.5 capitalize">
                    <IconDrop className="h-3.5 w-3.5" />
                    {level}
                  </span>
                </Chip>
              ))}
            </div>
            {flow ? (
              <label className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={startsPeriod}
                  onChange={(e) => setStartsPeriod(e.target.checked)}
                  className="h-4 w-4 accent-[var(--rose)]"
                />
                This is day 1 of a new period
              </label>
            ) : null}
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold">Body</p>
            <div className="flex flex-wrap gap-2">
              {SYMPTOMS.map((s) => (
                <Chip
                  key={s}
                  active={symptoms.includes(s)}
                  onClick={() => toggle(symptoms, setSymptoms, s)}
                >
                  {s}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold">Mood</p>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <Chip key={m} active={moods.includes(m)} onClick={() => toggle(moods, setMoods, m)}>
                  {m}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold">Note</p>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Just for you."
              rows={3}
            />
          </div>

          {advanced ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="mb-2 text-sm font-semibold">BBT</p>
                <Input
                  value={bbt}
                  onChange={(e) => setBbt(e.target.value)}
                  inputMode="decimal"
                  placeholder="36.6"
                />
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold">Mucus</p>
                <Input
                  value={mucus}
                  onChange={(e) => setMucus(e.target.value)}
                  placeholder="Creamy"
                />
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold">Medication</p>
                <Input value={meds} onChange={(e) => setMeds(e.target.value)} placeholder="Iron" />
              </div>
            </div>
          ) : null}
        </div>

        <div className="border-t border-border/60 p-5">
          <Button
            className="h-12 w-full rounded-full text-base"
            onClick={save}
            disabled={saveLog.isPending}
          >
            <IconCheck className="mr-2 h-4 w-4" />
            {saveLog.isPending ? "Saving…" : "Save the day"}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
