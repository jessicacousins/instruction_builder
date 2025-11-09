import React from "react";

export default function FieldEditor({ item, onChange, onDuplicate, onDelete }) {
  const set = (patch) => onChange({ ...item, ...patch });
  return (
    <div className="panel glow-hover" style={{ marginBottom: 12 }}>
      <div className="field-row">
        <div className="field">
          <label>
            Field Label <span className="em2">*</span>
          </label>
          <input
            spellCheck
            value={item.label}
            onChange={(e) => set({ label: e.target.value })}
            placeholder="e.g., Safety Notes"
          />
        </div>
        <div className="field">
          <label>Type</label>
          <select
            value={item.type}
            onChange={(e) => set({ type: e.target.value })}
          >
            <option value="short">Short Text</option>
            <option value="long">Long Text</option>
            <option value="number">Number</option>
            <option value="url">URL</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label>Value</label>
        {item.type === "long" ? (
          <textarea
            spellCheck
            value={item.value}
            onChange={(e) => set({ value: e.target.value })}
            placeholder="Write details here..."
          />
        ) : (
          <input
            spellCheck
            type={
              item.type === "number"
                ? "number"
                : item.type === "url"
                ? "url"
                : "text"
            }
            value={item.value}
            onChange={(e) => set({ value: e.target.value })}
            placeholder={
              item.type === "short"
                ? "Short text…"
                : item.type === "number"
                ? "0"
                : "https://"
            }
          />
        )}
      </div>

      <div className="field-actions">
        <button className="btn" onClick={onDuplicate}>
          Duplicate
        </button>
        <button className="btn warn" onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}
