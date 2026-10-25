import { useRef, useState } from "react";
import { cn } from "../lib/cn";
import {
  cityCouncilDistricts,
  lookupDistrict,
  type DistrictLayer,
  type DistrictLookup,
} from "../lib/district-lookup";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error" }
  | DistrictLookup;

/** Address box that looks up which council district an address is in. */
export function DistrictSearch({
  onResult,
  id = "district-address",
  layer = cityCouncilDistricts,
  inputLabel = "Your Portland address",
  outside = "outside Portland city limits",
  learnMore = { href: "https://www.portland.gov/council", text: "portland.gov/council" },
}: {
  onResult: (result: DistrictLookup | null) => void;
  /** Id for the address field; unique per search on the page. */
  id?: string;
  layer?: DistrictLayer;
  inputLabel?: string;
  /** Finishes "[address] is …" for an address outside the districts. */
  outside?: string;
  learnMore?: { href: string; text: string };
}) {
  const [state, setState] = useState<State>({ status: "idle" });
  const pending = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function dismiss() {
    pending.current?.abort();
    setState({ status: "idle" });
    onResult(null);
    if (inputRef.current) inputRef.current.value = "";
    inputRef.current?.focus();
  }

  async function search(query: string) {
    pending.current?.abort();
    if (!query.trim()) return;
    const controller = new AbortController();
    pending.current = controller;
    setState({ status: "loading" });
    onResult(null);
    try {
      const result = await lookupDistrict(query, controller.signal, layer);
      setState(result);
      onResult(result);
    } catch (err) {
      if (!controller.signal.aborted) setState({ status: "error" });
    }
  }

  return (
    <div className="mx-auto mt-6 w-full max-w-xl text-base font-normal tracking-normal sm:text-lg">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          search(new FormData(e.currentTarget).get("address") as string);
        }}
        className="flex gap-2"
      >
        <label htmlFor={id} className="sr-only">
          {inputLabel}
        </label>
        <input
          ref={inputRef}
          id={id}
          name="address"
          type="search"
          autoComplete="street-address"
          placeholder="Enter your address"
          className="min-w-0 flex-1 rounded-control border-2 border-ink/20 bg-paper px-5 py-3 text-ink placeholder:text-ink/50 focus:border-flag-green focus:outline-none"
        />
        <button
          type="submit"
          disabled={state.status === "loading"}
          className="cursor-pointer rounded-control bg-flag-green px-6 py-3 font-bold text-cream hover:bg-flag-green/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flag-green disabled:cursor-wait disabled:opacity-70"
        >
          {state.status === "loading" ? "Finding…" : "Find"}
        </button>
      </form>

      <div className="mt-3 flex min-h-11 flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <p aria-live="polite" className="text-ink/80">
          {state.status === "found" && (
            <>
              {state.address} is in{" "}
              <strong className="text-ink">District {state.district}</strong>.
            </>
          )}
          {state.status === "outside" && (
            <>
              {state.address} is {outside}.
            </>
          )}
          {state.status === "not-found" && (
            <>We couldn't find that address. Try adding the street type, like "Ave" or "St".</>
          )}
          {state.status === "error" && (
            <>Something went wrong looking up that address. Try again in a moment.</>
          )}
        </p>
        {state.status !== "idle" && state.status !== "loading" && (
          <button
            type="button"
            onClick={dismiss}
            className="cursor-pointer rounded-full border-2 border-ink/20 px-4 py-1.5 text-sm font-semibold text-ink hover:border-ink/40 hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flag-green"
          >
            Dismiss
          </button>
        )}
      </div>

      {/* Always rendered, so the page doesn't shift when a result arrives. */}
      <p
        inert={state.status !== "found"}
        className={cn("mt-1 text-center text-ink/80", state.status !== "found" && "invisible")}
      >
        Learn more at{" "}
        <a
          href={learnMore.href}
          className="font-semibold text-flag-green underline decoration-2 underline-offset-4 hover:decoration-flag-gold focus-visible:rounded-control focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-flag-green"
        >
          {learnMore.text}
        </a>
      </p>
    </div>
  );
}
