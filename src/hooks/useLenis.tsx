/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-refresh/only-export-components */
import { useEffect, useRef, createContext, useContext } from 'react';
import Lenis from 'lenis';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import gsap from 'gsap';

gsap.registerPlugin(ScrollTrigger);

const LenisContext = createContext<Lenis | null>(null);

// Module-level handle so non-descendant code (route changes) can reset scroll.
let currentLenis: Lenis | null = null;

export function getLenis(): Lenis | null {
  return currentLenis;
}

export function useLenisInstance() {
  return useContext(LenisContext);
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenisRef.current = lenis;
    currentLenis = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
      if (currentLenis === lenis) currentLenis = null;
    };
  }, []);

  /* eslint-disable react-hooks/refs */
  return (
    <LenisContext.Provider value={lenisRef.current}>
      {children}
    </LenisContext.Provider>
  );
}
/* eslint-enable react-hooks/refs */
