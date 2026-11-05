"use client";

import { AnimatePresence, m, type TargetAndTransition } from "framer-motion";
import {
  useEffect,
  useId,
  useRef,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/format";
import { CloseIcon } from "./icons";

type Side = "right" | "left" | "bottom" | "center";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  side?: Side;
  children: ReactNode;
  footer?: ReactNode;
  /** Show the title visually (it is always available to screen readers). */
  showTitle?: boolean;
  /** Custom title content (e.g. a heading with a count badge); `title` stays the accessible name. */
  heading?: ReactNode;
  /** Panel background. */
  tone?: "bone" | "white";
  className?: string;
  /** Element to focus when opened; defaults to the first focusable element. */
  initialFocus?: RefObject<HTMLElement | null>;
}

const EASE = [0.22, 1, 0.36, 1] as const;

const panelMotion: Record<
  Side,
  { initial: TargetAndTransition; animate: TargetAndTransition; exit: TargetAndTransition }
> = {
  right: { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } },
  left: { initial: { x: "-100%" }, animate: { x: 0 }, exit: { x: "-100%" } },
  bottom: { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } },
  center: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 8 },
  },
};

const panelLayout: Record<Exclude<Side, "center">, string> = {
  right: "right-0 top-0 h-dvh w-full max-w-md",
  left: "left-0 top-0 h-dvh w-full max-w-md",
  bottom: "inset-x-0 bottom-0 max-h-[88dvh] w-full",
};

const subscribeNoop = () => () => {};

/**
 * Accessible modal sheet used for the cart drawer, mobile menu, mobile
 * filters and the size guide: portal, focus trap, Escape to close, focus
 * restore, background made inert, scroll lock.
 */
export function Sheet(props: SheetProps) {
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>{props.open && <SheetPanel {...props} />}</AnimatePresence>,
    document.body,
  );
}

function SheetPanel({
  onClose,
  title,
  side = "right",
  children,
  footer,
  showTitle = true,
  heading,
  tone = "bone",
  className,
  initialFocus,
}: SheetProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useModalBehaviour(rootRef, panelRef, onCloseRef, initialFocus);

  // Center modals sit in a flex wrapper so the motion transform doesn't
  // fight the centering transform.
  const isCenter = side === "center";

  return (
    <div ref={rootRef} className="fixed inset-0 z-50">
      <m.div
        className="absolute inset-0 bg-ink/55"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          "pointer-events-none absolute",
          side === "center" ? "inset-0 flex items-center justify-center p-4" : panelLayout[side],
        )}
      >
        <m.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          {...panelMotion[side]}
          transition={{ duration: side === "center" ? 0.35 : 0.55, ease: EASE }}
          className={cn(
            "pointer-events-auto flex flex-col text-ink shadow-2xl outline-none",
            tone === "white" ? "bg-white" : "bg-bone",
            isCenter ? "max-h-[88dvh] w-full max-w-2xl" : "h-full w-full",
            side === "bottom" && "max-h-[88dvh]",
            className,
          )}
        >
          <div
            className={cn(
              "flex shrink-0 items-center justify-between border-b border-ink/10 px-5 md:px-6",
              showTitle ? "h-16" : "h-14",
            )}
          >
            {heading ? (
              <h2 id={titleId} aria-label={title}>
                {heading}
              </h2>
            ) : (
              <h2 id={titleId} className={cn("type-label", !showTitle && "sr-only")}>
                {title}
              </h2>
            )}
            <button
              type="button"
              onClick={onClose}
              className="-mr-2 inline-flex h-10 w-10 items-center justify-center"
              aria-label="Close"
            >
              <CloseIcon />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
          {footer && <div className="shrink-0 border-t border-ink/10">{footer}</div>}
        </m.div>
      </div>
    </div>
  );
}

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

let lockCount = 0;

function useModalBehaviour(
  rootRef: RefObject<HTMLDivElement | null>,
  panelRef: RefObject<HTMLDivElement | null>,
  onCloseRef: RefObject<() => void>,
  initialFocus?: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const root = rootRef.current;
    const panel = panelRef.current;
    if (!root || !panel) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Initial focus
    const target =
      initialFocus?.current ?? panel.querySelector<HTMLElement>(FOCUSABLE) ?? panel;
    target.focus({ preventScroll: true });

    // Make everything outside the dialog inert for keyboard and AT users.
    const inerted: Element[] = [];
    for (const el of Array.from(document.body.children)) {
      if (el !== root && !el.contains(root) && !el.hasAttribute("inert")) {
        el.setAttribute("inert", "");
        inerted.push(el);
      }
    }

    // Scroll lock (ref-counted for stacked sheets)
    lockCount += 1;
    document.documentElement.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (items.length === 0) {
        e.preventDefault();
        panel.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      inerted.forEach((el) => el.removeAttribute("inert"));
      lockCount -= 1;
      if (lockCount === 0) document.documentElement.style.overflow = "";
      if (previouslyFocused?.isConnected) previouslyFocused.focus({ preventScroll: true });
    };
  }, [rootRef, panelRef, onCloseRef, initialFocus]);
}
