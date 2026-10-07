"use client";

import { useEffect, useRef, useState } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Fades children up once they scroll into view. */
export function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !("IntersectionObserver" in window)) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`s-reveal ${className}`} data-shown={shown} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/** Counts from 0 to `value` when first visible. Non-numeric values render as-is. */
export function CountUp({ value, format = (n) => n.toLocaleString("en-AE") }: { value: number; format?: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !("IntersectionObserver" in window)) return;
    let frame = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const step = (t: number) => {
        const p = Math.min(1, (t - start) / 900);
        setShown(Math.round(value * (1 - Math.pow(1 - p, 3))));
        if (p < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);
  return (
    <span ref={ref} className="tnum">
      {format(shown)}
    </span>
  );
}

/**
 * Flies a copy of `source` (usually the product image) into the cart button,
 * then pops the cart badge.
 */
export function flyToCart(source: Element | null | undefined) {
  const cart = document.getElementById("cart-button");
  if (!cart) return;
  const pop = () => {
    cart.classList.remove("s-pop");
    void (cart as HTMLElement).offsetWidth; // restart the animation
    cart.classList.add("s-pop");
  };
  if (!source || prefersReducedMotion()) return pop();

  const from = source.getBoundingClientRect();
  const to = cart.getBoundingClientRect();
  const ghost = source.cloneNode(true) as HTMLElement;
  Object.assign(ghost.style, {
    position: "fixed",
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
    margin: "0",
    zIndex: "100",
    pointerEvents: "none",
    borderRadius: "12px",
    objectFit: "contain",
  });
  document.body.appendChild(ghost);
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  ghost
    .animate(
      [
        { transform: "translate(0,0) scale(1)", opacity: 1 },
        { transform: `translate(${dx * 0.6}px, ${dy * 0.6 - 60}px) scale(.45)`, opacity: 0.9, offset: 0.6 },
        { transform: `translate(${dx}px, ${dy}px) scale(.12)`, opacity: 0.2 },
      ],
      { duration: 650, easing: "cubic-bezier(.4,0,.2,1)" },
    )
    .finished.finally(() => {
      ghost.remove();
      pop();
    });
}

/** Grey placeholder blocks while TecDoc loads. */
export function SkeletonCards({ count = 3 }: { count?: number }) {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="s-card flex gap-4 p-4">
          <div className="s-skeleton h-20 w-20 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="s-skeleton h-3 w-1/3 rounded" />
            <div className="s-skeleton h-4 w-3/4 rounded" />
            <div className="s-skeleton h-3 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
