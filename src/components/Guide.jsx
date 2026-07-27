import { ChevronDown, Copy, Info, X } from "lucide-react";

export function Guide({
  steps,
  activeStep,
  onSelectStep,
  onCopy,
  copyFeedback,
  onClose
}) {
  const currentStep = activeStep + 1;
  const progress = Math.round((currentStep / steps.length) * 100);

  return (
    <aside className="guide">
      <div className="guide-heading">
        <div className="guide-title">
          <h1>Installation guide</h1>
          <button type="button" onClick={onClose} aria-label="Close installation guide">
            <X size={18} />
          </button>
        </div>
        <span>
          Step {currentStep} of {steps.length}
        </span>
        <div
          className="progress-track"
          role="progressbar"
          aria-label="Guide position"
          aria-valuemin="1"
          aria-valuemax={steps.length}
          aria-valuenow={currentStep}
        >
          <i style={{ width: `${progress}%` }} />
        </div>
      </div>

      <ol className="steps" aria-label="Installation steps">
        {steps.map((step, index) => {
          const selected = index === activeStep;
          const copyStatus =
            copyFeedback?.stepId === step.id ? copyFeedback.status : null;
          return (
            <li className={`step ${selected ? "selected" : ""}`} key={step.id}>
              <button
                className="step-summary"
                type="button"
                onClick={() => onSelectStep(index)}
                aria-expanded={selected}
              >
                <span className={`step-number ${selected ? "current" : ""}`}>
                  {index + 1}
                </span>
                <span className="step-title">{step.title}</span>
                {selected ? <ChevronDown size={17} /> : <span className="step-dot" />}
              </button>

              {selected && (
                <div className="step-detail">
                  <p>{step.description}</p>
                  <p className="menu-path">
                    <span>{step.pathLabel ?? "Menu path"}:</span>{" "}
                    {step.path}
                  </p>
                  <code>{step.command}</code>
                  <button
                    type="button"
                    className="secondary-button copy-button"
                    onClick={() => onCopy(step.id, step.command)}
                  >
                    <Copy size={15} />
                    {copyStatus === "copied"
                      ? "Copied"
                      : copyStatus === "unavailable"
                        ? "Copy unavailable"
                        : "Copy command"}
                  </button>
                  <span className="visually-hidden" aria-live="polite">
                    {copyStatus === "copied" && "Command copied to clipboard."}
                    {copyStatus === "unavailable" &&
                      "Clipboard access is unavailable. Select the command manually."}
                  </span>
                  <div className="control-note">
                    <Info size={17} />
                    <span>
                      You stay in control. Commands run only when you press Enter.
                    </span>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
