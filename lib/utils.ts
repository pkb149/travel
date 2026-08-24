
export function planToChips(plan: string) {
  return plan.split("→").map((s) => s.trim()).filter(Boolean);
}
export function chipsToPlan(chips: string[]) {
  return chips.join(" → ");
}
export function dateLabel(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", weekday: "short" });
}
export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`;
}
export function baseColor(base: string) {
  const m: Record<string, string> = {
    Singapore: "bg-sky-500",
    Hanoi: "bg-red-500",
    "Lan Ha Bay": "bg-teal-500",
    "Ninh Binh": "bg-emerald-500",
    "Da Nang": "bg-orange-500",
    "Ba Na Hills": "bg-violet-500",
    "Hoi An": "bg-amber-500",
    HCMC: "bg-blue-600",
    "Phu Quoc": "bg-cyan-500",
    Home: "bg-zinc-700",
  };
  return m[base] || "bg-zinc-500";
}
export function baseDot(base: string) {
  const c = baseColor(base);
  return c;
}
