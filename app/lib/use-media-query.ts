import { useEffect, useState } from "react";

/**
 * Whether a media query matches. Returns `fallback` during server rendering
 * and the first client render, then tracks the real value.
 */
export function useMediaQuery(query: string, fallback = true) {
  const [matches, setMatches] = useState(fallback);

  useEffect(() => {
    const list = window.matchMedia(query);
    setMatches(list.matches);
    const onChange = () => setMatches(list.matches);
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
