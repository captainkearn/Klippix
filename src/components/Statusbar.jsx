import { LockKeyhole, Network, ShieldCheck } from "lucide-react";

export function Statusbar() {
  return (
    <footer className="statusbar">
      <span>
        <LockKeyhole size={14} />
        Password protected
      </span>
      <span>
        <Network size={14} />
        LAN access
      </span>
      <span className="status-healthy">
        <ShieldCheck size={14} />
        System healthy
      </span>
      <span>Klippix 0.1.0</span>
    </footer>
  );
}
