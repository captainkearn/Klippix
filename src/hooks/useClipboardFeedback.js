import { useEffect, useRef, useState } from "react";

const RESET_DELAY_MS = 1600;

export function useClipboardFeedback() {
  const [feedback, setFeedback] = useState(null);
  const resetTimer = useRef(null);

  useEffect(
    () => () => {
      window.clearTimeout(resetTimer.current);
    },
    []
  );

  async function copy(stepId, command) {
    window.clearTimeout(resetTimer.current);

    try {
      if (!navigator.clipboard) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(command);
      setFeedback({ stepId, status: "copied" });
    } catch {
      setFeedback({ stepId, status: "unavailable" });
    }

    resetTimer.current = window.setTimeout(() => {
      setFeedback(null);
    }, RESET_DELAY_MS);
  }

  return { feedback, copy };
}
