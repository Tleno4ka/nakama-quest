import { useState, useRef, useEffect } from "react";
import { Check, Search, X } from "lucide-react";

const extendedGames = [
  "PUBG", "Genshin Impact", "Honkai: Star Rail", "World of Warcraft",
  "Diablo IV", "Path of Exile 2", "Destiny 2", "Warframe",
  "Rocket League", "FIFA / EA FC", "NBA 2K", "GTA Online",
  "Red Dead Online", "Sea of Thieves", "Phasmophobia", "Lethal Company",
  "Among Us", "Fall Guys", "Dead by Daylight", "Hunt: Showdown",
  "Escape from Tarkov", "DayZ", "Rust", "ARK: Survival Ascended",
  "Palworld", "Satisfactory", "Factorio", "Stardew Valley",
  "The Finals", "XDefiant", "Splitgate", "Halo Infinite",
  "Call of Duty: Warzone", "Battlefield 2042", "Starcraft II",
  "Age of Empires IV", "Civilization VI", "Hearts of Iron IV",
  "Euro Truck Simulator 2", "Monster Hunter: World", "Elden Ring",
  "Dark Souls III", "Baldur's Gate 3", "Divinity: Original Sin 2",
  "It Takes Two", "A Way Out", "Overcooked 2", "Stumble Guys",
  "Brawlhalla", "Smite 2",
];

interface GameSearchDropdownProps {
  selectedGames: string[];
  onToggle: (game: string) => void;
  primaryGames: string[];
}

export default function GameSearchDropdown({
  selectedGames,
  onToggle,
  primaryGames,
}: GameSearchDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const availableGames = extendedGames.filter(
    (g) => !primaryGames.includes(g)
  );

  const filtered = availableGames.filter((g) =>
    g.toLowerCase().includes(search.toLowerCase())
  );

  const selectedExtended = selectedGames.filter((g) =>
    availableGames.includes(g)
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
          selectedExtended.length > 0
            ? "bg-primary text-primary-foreground shadow-[0_0_0_1px_hsla(0,0%,100%,0.1)_inset]"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        }`}
      >
        Другое{selectedExtended.length > 0 ? ` (${selectedExtended.length})` : ""}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl bg-card border border-border shadow-lg overflow-hidden">
          {/* Search */}
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск игр..."
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            {search && (
              <button type="button" onClick={() => setSearch("")}>
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Selected chips */}
          {selectedExtended.length > 0 && (
            <div className="flex flex-wrap gap-1 border-b border-border px-3 py-2">
              {selectedExtended.map((game) => (
                <span
                  key={game}
                  onClick={() => onToggle(game)}
                  className="flex items-center gap-1 rounded-md bg-primary/20 px-2 py-0.5 text-[11px] font-medium text-primary cursor-pointer hover:bg-primary/30 transition-colors"
                >
                  {game}
                  <X className="h-3 w-3" />
                </span>
              ))}
            </div>
          )}

          {/* List */}
          <div className="max-h-48 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">Ничего не найдено</p>
            ) : (
              filtered.map((game) => {
                const selected = selectedGames.includes(game);
                return (
                  <button
                    key={game}
                    type="button"
                    onClick={() => onToggle(game)}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-foreground hover:bg-secondary/60 transition-colors"
                  >
                    <div
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                        selected
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/40"
                      }`}
                    >
                      {selected && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    {game}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
