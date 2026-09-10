import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchX } from "lucide-react";
import { StoreLayout } from "@/components/store/StoreLayout";
import { ProductCard } from "@/components/store/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProducts } from "@/hooks/useProducts";
import { PlatformId, platformById } from "@/config/store";

export default function Catalog({ platform }: { platform?: PlatformId }) {
  const { data: products, isLoading, isError } = useProducts();
  const [params, setParams] = useSearchParams();

  const q = params.get("q") ?? "";
  const genre = params.get("genre") ?? "all";
  const format = params.get("format") ?? "all";
  const sort = params.get("sort") ?? "featured";

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (!value || value === "all" || (key === "sort" && value === "featured")) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const scoped = useMemo(
    () => (products ?? []).filter((p) => (platform ? p.platform === platform : true)),
    [products, platform],
  );

  const genres = useMemo(
    () => Array.from(new Set(scoped.map((p) => p.genre))).sort((a, b) => a.localeCompare(b)),
    [scoped],
  );

  const results = useMemo(() => {
    let list = scoped.filter((p) => {
      const matchesTerm = p.title.toLowerCase().includes(q.trim().toLowerCase());
      const matchesGenre = genre === "all" || p.genre === genre;
      const matchesFormat = format === "all" || p.format === format;
      return matchesTerm && matchesGenre && matchesFormat;
    });
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price_minor - b.price_minor);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price_minor - a.price_minor);
    return list;
  }, [scoped, q, genre, format, sort]);

  const meta = platform ? platformById(platform) : undefined;
  const heading = meta ? `${meta.name} games` : "All games";
  const hasFilters = Boolean(q) || genre !== "all" || format !== "all" || sort !== "featured";

  return (
    <StoreLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <header>
          <h1 className="text-3xl font-bold sm:text-4xl">{heading}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {meta?.blurb ?? "Every title in the vault, across all three platforms."} All listings and prices on
            this site are demo content for a student project.
          </p>
        </header>

        {/* Filters */}
        <div className="surface-card mt-6 grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label htmlFor="catalog-search">Search by title</Label>
            <Input
              id="catalog-search"
              type="search"
              value={q}
              onChange={(e) => update("q", e.target.value)}
              placeholder="e.g. Neon Requiem"
              className="mt-1.5 h-11 bg-secondary/60"
            />
          </div>
          <div>
            <Label htmlFor="catalog-genre">Genre</Label>
            <Select value={genre} onValueChange={(v) => update("genre", v)}>
              <SelectTrigger id="catalog-genre" className="mt-1.5 h-11 bg-secondary/60">
                <SelectValue placeholder="All genres" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All genres</SelectItem>
                {genres.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="catalog-format">Format</Label>
            <Select value={format} onValueChange={(v) => update("format", v)}>
              <SelectTrigger id="catalog-format" className="mt-1.5 h-11 bg-secondary/60">
                <SelectValue placeholder="All formats" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All formats</SelectItem>
                <SelectItem value="physical">Physical disc</SelectItem>
                <SelectItem value="digital">Digital</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="catalog-sort">Sort by</Label>
            <Select value={sort} onValueChange={(v) => update("sort", v)}>
              <SelectTrigger id="catalog-sort" className="mt-1.5 h-11 bg-secondary/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Recommended</SelectItem>
                <SelectItem value="price-asc">Price: low to high</SelectItem>
                <SelectItem value="price-desc">Price: high to low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isError && (
          <p className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
            We couldn’t load the catalogue right now. Please refresh the page.
          </p>
        )}

        {!isLoading && !isError && (
          <p className="mt-6 text-sm text-muted-foreground" role="status">
            {results.length} {results.length === 1 ? "listing" : "listings"}
          </p>
        )}

        {isLoading ? (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-[360px] rounded-xl" />
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {results.map((p) => (
              <ProductCard key={p.sku} product={p} />
            ))}
          </div>
        ) : (
          !isError && (
            <div className="surface-card mt-4 flex flex-col items-center gap-3 p-12 text-center">
              <SearchX className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <h2 className="text-lg font-semibold">No games match your filters</h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                Try a different title, genre or format — or clear everything and start again.
              </p>
              {hasFilters && (
                <Button variant="outline" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
                  Clear filters
                </Button>
              )}
            </div>
          )
        )}
      </div>
    </StoreLayout>
  );
}
