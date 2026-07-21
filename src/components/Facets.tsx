import { facets } from "@/data/media";
import { FacetCard } from "./FacetCard";

// Closing band of the About chapter: four dithered persona studies.
// Grid on lg+, snap strip below; content comes from src/data/media.ts.
export function Facets() {
  return (
    <div className="mt-24 sm:mt-28">
      <p className="marker">+++ IN HER ELEMENT +++</p>
      <div className="mt-4 h-px bg-line" />

      <div
        tabIndex={0}
        role="region"
        aria-label="Four sides of Senudi, illustrated"
        className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0"
      >
        {facets.map((facet, i) => (
          <FacetCard key={facet.key} facet={facet} index={i} />
        ))}
      </div>
    </div>
  );
}
