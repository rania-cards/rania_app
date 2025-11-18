import type { TemplateCategory } from "@/lib/templates";

type Props = {
  receiverName: string;
  occasion: string;
  relationship: string;
  category: TemplateCategory;
  onChangeReceiverName: (v: string) => void;
  onChangeOccasion: (v: string) => void;
  onChangeRelationship: (v: string) => void;
  onChangeCategory: (c: TemplateCategory) => void;
};

const CATEGORY_OPTIONS: { value: TemplateCategory; label: string }[] = [
  { value: "love", label: "Love" },
  { value: "apology", label: "Apology" },
  { value: "new_born", label: "New Born" },
  { value: "wedding_anniversary", label: "Wedding & Anniversary" },
  { value: "condolences", label: "Condolences" },
  { value: "get_well", label: "Get Well Soon" },
  { value: "others", label: "Others" },
];

export default function AboutThemStep({
  receiverName,
  occasion,
  relationship,
  category,
  onChangeReceiverName,
  onChangeOccasion,
  onChangeRelationship,
  onChangeCategory,
}: Props) {
  return (
    <div className="p-4 border border-slate-800 rounded-2xl bg-slate-900/70 space-y-4">
      <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">
        Step 1 of 5 — About Them
      </p>
      <p className="text-slate-300 text-sm">
        Tell RANIA who this moment is for and what you&apos;re celebrating (or
        fixing 😅). This helps the AI talk like you, not a robot.
      </p>

      <div className="space-y-3">
        <div>
          <label className="block text-xs text-slate-300 mb-1">
            Their name
          </label>
          <input
            className="w-full rounded-xl bg-slate-950/70 border border-slate-700 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400"
            placeholder="Amina, Dad, My best friend..."
            value={receiverName}
            onChange={(e) => onChangeReceiverName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-300 mb-1">
            Occasion
          </label>
          <input
            className="w-full rounded-xl bg-slate-950/70 border border-slate-700 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400"
            placeholder="Wedding, New Born, Apology, Birthday..."
            value={occasion}
            onChange={(e) => onChangeOccasion(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-300 mb-1">
            Relationship
          </label>
          <input
            className="w-full rounded-xl bg-slate-950/70 border border-slate-700 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400"
            placeholder="Partner, Friend, Parent, Child..."
            value={relationship}
            onChange={(e) => onChangeRelationship(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-300 mb-1">
            Moment category
          </label>
          <select
            className="w-full rounded-xl bg-slate-950/70 border border-slate-700 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400"
            value={category}
            onChange={(e) =>
              onChangeCategory(e.target.value as TemplateCategory)
            }
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}