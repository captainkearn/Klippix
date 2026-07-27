import { FileText, PanelLeftClose, PanelLeftOpen, TerminalSquare } from "lucide-react";
import { useState } from "react";
import { FileManager } from "./components/FileManager";
import { Guide } from "./components/Guide";
import { Statusbar } from "./components/Statusbar";
import { Terminal } from "./components/Terminal";
import { Topbar } from "./components/Topbar";
import { guideSteps, initialFiles } from "./data";
import { useClipboardFeedback } from "./hooks/useClipboardFeedback";

const DEFAULT_STEP_BY_TAB = {
  terminal: "install-klipper",
  files: "printer-configuration"
};

function stepIndexForTab(tab) {
  const stepId = DEFAULT_STEP_BY_TAB[tab];
  const index = guideSteps.findIndex((step) => step.id === stepId);
  return index === -1 ? 0 : index;
}

function App() {
  const [tab, setTab] = useState("terminal");
  const [activeStep, setActiveStep] = useState(() => stepIndexForTab("terminal"));
  const [guideOpen, setGuideOpen] = useState(true);
  const [files, setFiles] = useState(() => initialFiles);
  const clipboard = useClipboardFeedback();

  function switchTab(nextTab) {
    setTab(nextTab);
    if (guideSteps[activeStep]?.workspace !== nextTab) {
      setActiveStep(stepIndexForTab(nextTab));
    }
  }

  function selectGuideStep(index) {
    const step = guideSteps[index];
    if (!step) return;
    setActiveStep(index);
    setTab(step.workspace);
  }

  return (
    <div className="app-shell">
      <Topbar />
      <main className={`app-main ${guideOpen ? "" : "guide-collapsed"}`}>
        {guideOpen && (
          <Guide
            steps={guideSteps}
            activeStep={activeStep}
            onSelectStep={selectGuideStep}
            onCopy={clipboard.copy}
            copyFeedback={clipboard.feedback}
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
              aria-pressed={tab === "terminal"}
            >
              <TerminalSquare size={17} />
              Terminal
            </button>
            <button
              type="button"
              className={tab === "files" ? "active" : ""}
              onClick={() => switchTab("files")}
              aria-pressed={tab === "files"}
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
