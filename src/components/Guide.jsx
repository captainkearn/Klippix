import { Check, ChevronDown, Copy, Info, X } from "lucide-react";

export function Guide({
  steps,
  activeStep,
  onSelectStep,
  onCopy,
  copied,
  onClose
}) {
  const progress = Math.round((6 / steps.length) * 100);

  return (
    <aside className="guide">
      <div className="guide-heading">
        <div className="guide-title">
          <h1>Installation guide</h1>
          <button type="button" onClick={onClose} aria-label="Close installation guide">
            <X size={18} />
          </button>
        </div>
        <span>6 of 9 steps</span>
        <div className="progress-track" aria-label={`${progress}% complete`}>
          <i style={{ width: `${progress}%` }} />
        </div>
      </div>

      <nav className="steps" aria-label="Installation steps">
        {steps.map((step, index) => {
          const selected = index === activeStep;
          const complete = step.status === "complete";
          return (
            <div className={`step ${selected ? "selected" : ""}`} key={step.title}>
              <button
                className="step-summary"
                type="button"
                onClick={() => onSelectStep(index)}
                aria-expanded={selected}
              >
                <span
                  className={`step-number ${complete ? "complete" : ""} ${
                    step.status === "current" ? "current" : ""
                  }`}
                >
                  {complete ? <Check size={15} strokeWidth={2.5} /> : index + 1}
                </span>
                <span className="step-title">{step.title}</span>
                {selected ? <ChevronDown size={17} /> : <span className="step-dot" />}
              </button>

              {selected && (
                <div className="step-detail">
                  <p>{step.description}</p>
                  <p className="menu-path">
                    <span>{step.status === "files" ? "Location" : "Menu path"}:</span>{" "}
                    {step.path}
                  </p>
                  <code>{step.command}</code>
                  <button
                    type="button"
                    className="secondary-button copy-button"
                    onClick={() => onCopy(step.command)}
                  >
                    <Copy size={15} />
                    {copied ? "Copied" : "Copy command"}
                  </button>
                  <div className="control-note">
                    <Info size={17} />
                    <span>
                      You stay in control. Commands run only when you press Enter.
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
