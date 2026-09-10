import { Link } from "react-router-dom";
import { Gamepad2 } from "lucide-react";
import { PLATFORMS, STORE } from "@/config/store";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Gamepad2 className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="font-[Chakra_Petch] text-base font-bold">
              Game<span className="text-primary">Vault</span>
            </span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            A student demo store. The catalogue, prices and checkout are fictional — no money is charged and
            no games are dispatched or activated.
          </p>
        </div>

        <nav aria-label="Platforms">
          <h2 className="text-sm font-semibold">Platforms</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {PLATFORMS.map((p) => (
              <li key={p.id}>
                <Link to={`/${p.slug}`} className="text-muted-foreground transition-colors hover:text-primary">
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Store">
          <h2 className="text-sm font-semibold">Store</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/games" className="text-muted-foreground transition-colors hover:text-primary">
                All games
              </Link>
            </li>
            <li>
              <Link to="/cart" className="text-muted-foreground transition-colors hover:text-primary">
                Cart
              </Link>
            </li>
            <li>
              <Link to="/checkout" className="text-muted-foreground transition-colors hover:text-primary">
                Checkout
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {STORE.name} — demo project. Delivery within {STORE.shippingCountry}. Prices in{" "}
        {STORE.currency}.
      </div>
    </footer>
  );
}
