"use client";

import { useEffect, useState } from "react";

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

type Breakpoint = keyof typeof breakpoints;

/** Returns true when viewport width <= breakpoint value (i.e. at/below that breakpoint). */
export function useResponsive(breakpoint: Breakpoint): boolean {
  const [isMatch, setIsMatch] = useState<boolean>(false);

  useEffect(() => {
    const checkMatch = () => {
      setIsMatch(window.innerWidth <= breakpoints[breakpoint]);
    };

    checkMatch();
    window.addEventListener("resize", checkMatch);
    return () => window.removeEventListener("resize", checkMatch);
  }, [breakpoint]);

  return isMatch;
}
