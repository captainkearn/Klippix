import { ExternalLink, RefreshCw, SquareTerminal } from "lucide-react";
import { useState } from "react";

export function Terminal() {
  const [session, setSession] = useState(0);

  return (
    <section className="terminal-frame">
      <div className="terminal-toolbar">
        <div className="session-title">
          <SquareTerminal size={18} />
          <span>Local login — interactive bash session</span>
        </div>
        <button
          type="button"
          aria-label="Reconnect terminal"
          title="Reconnect terminal"
          onClick={() => setSession((value) => value + 1)}
        >
          <RefreshCw size={17} />
        </button>
        <a
          className="terminal-toolbar-link"
          href="/terminal/"
          target="_blank"
          rel="noreferrer"
          aria-label="Open terminal in a new tab"
          title="Open terminal in a new tab"
        >
          <ExternalLink size={17} />
        </a>
      </div>
      <iframe
        key={session}
        className="terminal-session"
        src="/terminal/"
        title="Klippix local login terminal"
        allow="clipboard-read; clipboard-write"
      />
    </section>
  );
}
