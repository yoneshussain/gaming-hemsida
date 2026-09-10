/** Maps the `image_key` stored with each product to its local cover artwork. */
import neonRequiem from "@/assets/covers/neon-requiem.jpg";
import starfallVanguard from "@/assets/covers/starfall-vanguard.jpg";
import verdantHollow from "@/assets/covers/verdant-hollow.jpg";
import apexCircuit from "@/assets/covers/apex-circuit.jpg";
import shadowbind from "@/assets/covers/shadowbind.jpg";
import crownOfAsh from "@/assets/covers/crown-of-ash.jpg";
import tidebreakerSaga from "@/assets/covers/tidebreaker-saga.jpg";
import pixelPanicParty from "@/assets/covers/pixel-panic-party.jpg";
import ironholdTactics from "@/assets/covers/ironhold-tactics.jpg";

export const COVERS: Record<string, string> = {
  "neon-requiem": neonRequiem,
  "starfall-vanguard": starfallVanguard,
  "verdant-hollow": verdantHollow,
  "apex-circuit": apexCircuit,
  shadowbind: shadowbind,
  "crown-of-ash": crownOfAsh,
  "tidebreaker-saga": tidebreakerSaga,
  "pixel-panic-party": pixelPanicParty,
  "ironhold-tactics": ironholdTactics,
};

export const coverFor = (imageKey: string): string | undefined => COVERS[imageKey];
