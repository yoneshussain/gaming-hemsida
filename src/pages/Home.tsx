import { Link } from "react-router-dom";
import { ArrowRight, Disc3, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoreLayout } from "@/components/store/StoreLayout";
import { ProductCard } from "@/components/store/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/useProducts";
import { PLATFORMS, STORE } from "@/config/store";
import heroImage from "@/assets/hero.jpg";
import psImage from "@/assets/platform-playstation.jpg";
import xboxImage from "@/assets/platform-xbox.jpg";
import pcImage from "@/assets/platform-pc.jpg";

const PLATFORM_IMAGES: Record<string, string> = { ps5: psImage, xbox: xboxImage, pc: pcImage };
const PLATFORM_RING: Record<string, string> = {
  ps5: "hover:border-platform-ps5/60",
  xbox: "hover:border-platform-xbox/60",
  pc: "hover:border-platform-pc/60",
};

export default function Home() {
  const { data: products, isLoading, isError } = useProducts();
  const featured = (products ?? []).filter((p) => p.featured).slice(0, 8);

  return (
    <StoreLayout>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImage}
          alt=""
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover opacity-60"
          aria-hidden="true"
        />
        <div className="absolute inset-0" style={{ backgroundImage: "var(--gradient-hero)" }} aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Demo store — fictional catalogue and prices
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[1.1] sm:text-5xl lg:text-6xl">
            <span className="text-glow">Your next adventure starts here.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            Discover games for PlayStation 5, Xbox Series X|S, and PC.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-12 px-7 text-base">
              <Link to="/games">
                Explore Games <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-7 text-base">
              <Link to="/playstation-5">Browse PS5</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Platform cards */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6" aria-labelledby="platforms-heading">
        <h2 id="platforms-heading" className="text-2xl font-bold sm:text-3xl">
          Shop by platform
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORMS.map((p) => (
            <Link
              key={p.id}
              to={`/${p.slug}`}
              className={`surface-card group relative overflow-hidden transition-all duration-300 motion-safe:hover:-translate-y-1 ${PLATFORM_RING[p.id]}`}
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={PLATFORM_IMAGES[p.id]}
                  alt=""
                  width={1024}
                  height={768}
                  loading="lazy"
                  aria-hidden="true"
                  className="h-full w-full object-cover opacity-80 transition-transform duration-500 motion-safe:group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" aria-hidden="true" />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.blurb}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Browse games <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6" aria-labelledby="featured-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="featured-heading" className="text-2xl font-bold sm:text-3xl">
            Featured games
          </h2>
          <Link to="/games" className="text-sm font-medium text-primary hover:underline">
            View all games
          </Link>
        </div>

        {isError && (
          <p className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
            We couldn’t load the catalogue right now. Please refresh the page.
          </p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-[360px] rounded-xl" />)
            : featured.map((p) => <ProductCard key={p.sku} product={p} />)}
        </div>
      </section>

      {/* Delivery explainer */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6" aria-labelledby="delivery-heading">
        <h2 id="delivery-heading" className="text-2xl font-bold sm:text-3xl">
          How delivery works
        </h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="surface-card p-6">
            <Disc3 className="h-6 w-6 text-primary" aria-hidden="true" />
            <h3 className="mt-3 text-lg font-semibold">Physical discs</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Discs ship to addresses within {STORE.shippingCountry}. A flat delivery fee of{" "}
              {STORE.shippingFeeMinor / 100} {STORE.currencySuffix} is added once per order that contains physical
              items. Disc editions need a console with a disc drive.
            </p>
          </div>
          <div className="surface-card p-6">
            <Download className="h-6 w-6 text-primary" aria-hidden="true" />
            <h3 className="mt-3 text-lg font-semibold">Digital editions</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Digital games need no address and carry no delivery fee. In this demo no codes are generated,
              dispatched or activated — orders are only saved so the team can review them.
            </p>
          </div>
        </div>
      </section>
    </StoreLayout>
  );
}
