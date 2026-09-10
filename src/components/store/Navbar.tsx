import { useState } from "react";
import { Link, NavLink, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Menu, Search, ShoppingCart, X, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { PLATFORMS, STORE } from "@/config/store";
import { useCart } from "@/contexts/CartContext";

function SearchForm({ onDone, id }: { onDone?: () => void; id: string }) {
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [term, setTerm] = useState(location.pathname.startsWith("/games") ? params.get("q") ?? "" : "");

  return (
    <form
      role="search"
      className="relative w-full"
      onSubmit={(e) => {
        e.preventDefault();
        navigate(`/games?q=${encodeURIComponent(term.trim())}`);
        onDone?.();
      }}
    >
      <label htmlFor={id} className="sr-only">
        Search games
      </label>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        id={id}
        type="search"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Search games…"
        className="h-11 bg-secondary/60 pl-9"
      />
    </form>
  );
}

export function Navbar() {
  const { totalQuantity } = useCart();
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
      isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground",
    );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6" aria-label="Main">
        <Link to="/" className="flex shrink-0 items-center gap-2" aria-label={`${STORE.name} home`}>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary glow-ring">
            <Gamepad2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-[Chakra_Petch] text-lg font-bold tracking-wide">
            Game<span className="text-primary">Vault</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {PLATFORMS.map((p) => (
            <NavLink key={p.id} to={`/${p.slug}`} className={linkClass}>
              {p.name}
            </NavLink>
          ))}
          <NavLink to="/games" end className={linkClass}>
            All games
          </NavLink>
        </div>

        <div className="ml-auto hidden max-w-xs flex-1 md:block">
          <SearchForm id="nav-search" />
        </div>

        <Button asChild variant="ghost" size="icon" className="relative ml-auto h-11 w-11 md:ml-2">
          <Link to="/cart" aria-label={`Cart, ${totalQuantity} item${totalQuantity === 1 ? "" : "s"}`}>
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            {totalQuantity > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
                {totalQuantity}
              </span>
            )}
          </Link>
        </Button>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-11 w-11 lg:hidden" aria-label="Open menu">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85vw] max-w-sm border-border bg-card">
            <SheetTitle className="mb-4 text-base">Browse {STORE.name}</SheetTitle>
            <div className="mb-4 md:hidden">
              <SearchForm id="mobile-search" onDone={() => setOpen(false)} />
            </div>
            <div className="flex flex-col gap-1">
              {PLATFORMS.map((p) => (
                <NavLink
                  key={p.id}
                  to={`/${p.slug}`}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "rounded-lg px-3 py-3 text-base font-medium transition-colors",
                      isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary",
                    )
                  }
                >
                  {p.name}
                </NavLink>
              ))}
              <NavLink
                to="/games"
                end
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "rounded-lg px-3 py-3 text-base font-medium transition-colors",
                    isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary",
                  )
                }
              >
                All games
              </NavLink>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
