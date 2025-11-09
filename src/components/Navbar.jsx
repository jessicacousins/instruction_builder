import React from "react";

export default function Navbar() {
  return (
    <nav className="nav" aria-label="Primary">
      <div className="nav-inner">
        <div className="brand">Instruction Builder</div>
        <div style={{ flex: 1 }} />
        <a href="#overview">Overview</a>
        <a href="#core-details">Core Details</a>
        <a href="#steps">Steps</a>
        <a href="#materials">Materials</a>
        <a href="#custom">Custom Fields</a>
        <a href="#export">Export</a>
      </div>
    </nav>
  );
}
