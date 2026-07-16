import type { ReactNode } from "react";
import { chapters, type ChapterId } from "../data/media";
import { CATEGORY_LABELS, type Category } from "../data/archiveCategories";

const CATEGORIES: Category[] = ["photography", "video", "travel", "street", "portrait", "bw"];
const LOCATION_OPTIONS = ["Nepal", "USA"] as const;

/** A museum-label tag rather than a Tailwind pill — active state reads as
 * an underline, the way a label plate marks the piece you're standing in
 * front of, not a filled button. */
function Tag({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      data-cursor-hover
      onClick={onClick}
      className={`shrink-0 border-b pb-1 font-mono text-[10px] uppercase tracking-cinema transition-colors ${
        active ? "border-warm-white text-warm-white" : "border-transparent text-warm-white/45 hover:border-warm-white/40 hover:text-warm-white/80"
      }`}
    >
      {children}
    </button>
  );
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
      <p className="font-mono text-[9px] uppercase tracking-cinema text-warm-white/30">{label}</p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">{children}</div>
    </div>
  );
}

export default function ArchiveFilters({
  chapter,
  onChapter,
  category,
  onCategory,
  location,
  onLocation,
  search,
  onSearch,
}: {
  chapter: ChapterId | "all";
  onChapter: (c: ChapterId | "all") => void;
  category: Category | "all";
  onCategory: (c: Category | "all") => void;
  location: string | "all";
  onLocation: (l: string | "all") => void;
  search: string;
  onSearch: (s: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4 px-6 py-6 md:px-16 md:py-8 lg:px-24">
      <input
        type="text"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Find a memory…"
        className="w-full max-w-sm border-b border-warm-white/20 bg-transparent py-1.5 font-serif-display text-base italic text-warm-white placeholder:text-warm-white/30 focus:border-warm-white/60 focus:outline-none"
      />

      <Group label="Collections">
        <Tag active={chapter === "all"} onClick={() => onChapter("all")}>
          All
        </Tag>
        {chapters.map((c) => (
          <Tag key={c.id} active={chapter === c.id} onClick={() => onChapter(c.id)}>
            {c.name}
          </Tag>
        ))}
      </Group>

      <Group label="Categories">
        <Tag active={category === "all"} onClick={() => onCategory("all")}>
          All
        </Tag>
        {CATEGORIES.map((c) => (
          <Tag key={c} active={category === c} onClick={() => onCategory(c)}>
            {CATEGORY_LABELS[c]}
          </Tag>
        ))}
      </Group>

      <Group label="Locations">
        <Tag active={location === "all"} onClick={() => onLocation("all")}>
          Everywhere
        </Tag>
        {LOCATION_OPTIONS.map((l) => (
          <Tag key={l} active={location === l} onClick={() => onLocation(l)}>
            {l}
          </Tag>
        ))}
      </Group>
    </div>
  );
}
