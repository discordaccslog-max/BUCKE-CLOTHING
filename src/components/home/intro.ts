/**
 * Decides whether the buck mark intro plays: once per browser session and
 * never with reduced motion. It must stay self-contained (no imports or
 * outer variables) because it is also serialized into an inline script
 * that runs before first paint on hard loads.
 */
export function runIntroDecision(introId: string): void {
  const root = document.documentElement;
  root.dataset.hero = "top";
  const el = document.getElementById(introId);
  if (!el || el.dataset.intro) return;
  const key = "bucke:intro-played";
  try {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce && !window.sessionStorage.getItem(key)) {
      el.dataset.intro = "play";
      window.sessionStorage.setItem(key, "1");
    } else {
      el.dataset.intro = "done";
    }
  } catch {
    el.dataset.intro = "done";
  }
}

export function introInlineScript(introId: string): string {
  return `(${runIntroDecision.toString()})(${JSON.stringify(introId)});`;
}
