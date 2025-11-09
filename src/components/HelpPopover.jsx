import React, { useState, useRef, useEffect } from "react";

export default function HelpPopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  return (
    <div className="help-wrap" ref={ref}>
      <button
        className="help-btn"
        aria-label="Help"
        onClick={() => setOpen((v) => !v)}
      >
        ?
      </button>
      {open && (
        <div className="pop">
          <h3>How to use</h3>
          <ul>
            <li>
              <span className="em2">Autosave</span>: Your work saves to your
              browser as you type.
            </li>
            <li>
              <span className="em2">PDF</span>: Use{" "}
              <span className="em">Export → Download PDF</span> to share or
              print.
            </li>
            <li>
              <span className="em2">Custom Fields</span>: Add, duplicate,
              reorder (via delete+readd), and remove as needed.
            </li>
            <li>
              <span className="em2">Spellcheck</span>: Enabled on all text areas
              by default.
            </li>
            <li>
              <span className="em2">Tips</span>: Use headings for phases,
              bullets for parts, and short sentences for clarity.
            </li>
          </ul>
          <div className="chips">
            <div className="chip">Guides</div>
            <div className="chip">Hobbies</div>
            <div className="chip">DIY</div>
            <div className="chip">Team SOPs</div>
            <div className="chip">Checklists</div>
          </div>
        </div>
      )}
    </div>
  );
}
