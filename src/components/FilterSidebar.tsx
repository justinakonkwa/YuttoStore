import { useFilters } from "@/store/filters";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

interface FilterSidebarProps {
  categories: string[];
  subCategories: string[];
}

export const FilterSidebar = ({ categories, subCategories }: FilterSidebarProps) => {
  const f = useFilters();

  const toggleCat = (c: string) => {
    f.set(
      "categories",
      f.categories.includes(c) ? f.categories.filter((x) => x !== c) : [...f.categories, c]
    );
  };

  const toggleSub = (s: string) => {
    f.set(
      "subCategories",
      f.subCategories.includes(s)
        ? f.subCategories.filter((x) => x !== s)
        : [...f.subCategories, s]
    );
  };

  return (
    <aside className="space-y-10 text-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Filtres</h2>
        <button
          onClick={f.reset}
          className="text-xs text-foreground/55 hover:text-accent transition-smooth uppercase tracking-wider"
        >
          Réinitialiser
        </button>
      </div>

      {categories.length > 0 && (
        <Section title="Catégorie">
          <div className="space-y-2.5">
            {categories.map((c) => (
              <label
                key={c}
                className="flex items-center gap-3 cursor-pointer text-foreground/75 hover:text-foreground transition-smooth"
              >
                <Checkbox
                  checked={f.categories.includes(c)}
                  onCheckedChange={() => toggleCat(c)}
                />
                <span>{c}</span>
              </label>
            ))}
          </div>
        </Section>
      )}

      {subCategories.length > 0 && (
        <Section title="Sous-catégorie">
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {subCategories.map((s) => (
              <label
                key={s}
                className="flex items-center gap-3 cursor-pointer text-foreground/75 hover:text-foreground transition-smooth"
              >
                <Checkbox
                  checked={f.subCategories.includes(s)}
                  onCheckedChange={() => toggleSub(s)}
                />
                <span>{s}</span>
              </label>
            ))}
          </div>
        </Section>
      )}

      <Section title="Prix (FCFA)">
        <Slider
          value={f.priceRange}
          min={0}
          max={5000}
          step={100}
          onValueChange={(v) => f.set("priceRange", [v[0], v[1]] as [number, number])}
          className="mt-3"
        />
        <div className="flex justify-between text-xs text-foreground/60 mt-3">
          <span>{f.priceRange[0].toLocaleString()} FCFA</span>
          <span>{f.priceRange[1].toLocaleString()} FCFA</span>
        </div>
      </Section>

      <Section title="Disponibilité">
        <label className="flex items-center gap-3 cursor-pointer text-foreground/75 hover:text-foreground transition-smooth">
          <Checkbox
            checked={f.inStockOnly}
            onCheckedChange={(v) => f.set("inStockOnly", !!v)}
          />
          <span>En stock uniquement</span>
        </label>
      </Section>
    </aside>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <p className="text-[11px] uppercase tracking-[0.2em] text-foreground/50 mb-4">{title}</p>
    {children}
  </div>
);
