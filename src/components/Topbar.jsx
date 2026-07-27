import { ChevronDown, UserRound } from "lucide-react";
import { BrandMark } from "./Brand";

export function Topbar() {
  return (
    <header className="topbar">
      <div className="brand">
        <BrandMark />
        <span>Klippix</span>
      </div>
      <div className="topbar-divider" />
      <span className="hostname">voron-workshop</span>
      <div className="topbar-divider compact-hide" />
      <span className="connection compact-hide">
        <i />
        Connected
      </span>
      <button className="user-menu" type="button" aria-label="Open user menu">
        <UserRound size={18} />
        <span>maker</span>
        <ChevronDown size={15} />
      </button>
    </header>
  );
}
