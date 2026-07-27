import { FlaskConical, LockKeyhole, Network, Shield } from "lucide-react";
import { releaseLabel } from "../release";

export function Statusbar() {
  return (
    <footer className="statusbar">
      <span>
        <LockKeyhole size={14} />
        Password protected
      </span>
      <span>
        <Network size={14} />
        Port 8020
      </span>
      <span>
        <Shield size={14} />
        LAN restricted
      </span>
      <span className="beta-status">
        <FlaskConical size={14} />
        {releaseLabel}
      </span>
    </footer>
  );
}
