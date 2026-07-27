import { FileText, PanelLeftClose, PanelLeftOpen, TerminalSquare } from "lucide-react";
import { useState } from "react";
import { FileManager } from "./components/FileManager";
import { Guide } from "./components/Guide";
import { Statusbar } from "./components/Statusbar";
import { Terminal } from "./components/Terminal";
import { Topbar } from "./components/Topbar";
import { guideSteps, initialFiles } from "./data";

function App() {
  const [tab, setTab] = useState("terminal");
  const [activeStep, setActiveStep] = useState(2);
  const [guideOpen, setGuideOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [files, setFiles] = useState(initialFiles);

  function switchTab(nextTab) {
    setTab(nextTab);
    if (nextTab === "files" && activeStep === 2) setActiveStep(7);
    if (nextTab === "terminal" && activeStep === 7) setActiveStep(2);
  }

  function copyCommand(command) {
    navigator.clipboard?.writeText(command).catch(() => {
      // Clipboard permission can be unavailable on an HTTP-only local network.
    });
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="app-shell">
      <Topbar />
      <main className={`app-main ${guideOpen ? "" : "guide-collapsed"}`}>
        {guideOpen && (
          <Guide
            steps={guideSteps}
            activeStep={activeStep}
            onSelectStep={setActiveStep}
            onCopy={copyCommand}
            copied={copied}
            onClose={() => setGuideOpen(false)}
          />
        )}
        <section className="workspace">
          <div className="tabs">
            <button
              className="guide-toggle"
              type="button"
              onClick={() => setGuideOpen((value) => !value)}
              aria-label={guideOpen ? "Hide installation guide" : "Show installation guide"}
            >
              {guideOpen ? (
                <PanelLeftClose size={18} />
              ) : (
                <PanelLeftOpen size={18} />
              )}
            </button>
            <button
              type="button"
              className={tab === "terminal" ? "active" : ""}
              onClick={() => switchTab("terminal")}
            >
              <TerminalSquare size={17} />
              Terminal
            </button>
            <button
              type="button"
              className={tab === "files" ? "active" : ""}
              onClick={() => switchTab("files")}
            >
              <FileText size={17} />
              Files
            </button>
          </div>
          <div className="workspace-content">
            {tab === "terminal" ? (
              <Terminal />
            ) : (
              <FileManager files={files} setFiles={setFiles} />
            )}
          </div>
        </section>
      </main>
      <Statusbar />
    </div>
  );
}

export default App;
