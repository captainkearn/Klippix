import { Server, UserRound } from "lucide-react";
import { BrandMark } from "./Brand";

export function Topbar() {
  const hostname = window.location.hostname || "localhost";

  return (
    <header className="topbar">
      <div className="brand">
        <BrandMark />
        <span>Klippix</span>
      </div>
      <div className="topbar-divider" />
      <span className="hostname">{hostname}</span>
      <div className="topbar-divider compact-hide" />
      <span className="runtime-context compact-hide">
        <Server size={15} />
        Host workspace
      </span>
      <span className="user-context">
        <UserRound size={18} />
        Local login
      </span>
    </header>
  );
}
