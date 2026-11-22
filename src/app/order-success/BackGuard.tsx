"use client";

import { useEffect } from "react";

export function BackGuard() {
  useEffect(() => {
    history.pushState(null, "", window.location.href);
    const onPopState = () => {
      history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return null;
}
