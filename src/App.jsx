import React, { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "./components/Navbar.jsx";
import HelpPopover from "./components/HelpPopover.jsx";
import FieldEditor from "./components/FieldEditor.jsx";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const STORAGE_KEY = "instruction_builder_v1";

const toLines = (text) =>
  (text || "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

export default function App() {
  const [data, setData] = useState(() => {
    const s = localStorage.getItem(STORAGE_KEY);
    return s
      ? JSON.parse(s)
      : {
          title: "",
          summary: "",
          difficulty: "Beginner",
          estTime: "",
          materials: "",
          steps: "",
          safety: "",
          custom: [
            {
              id: crypto.randomUUID(),
              label: "Notes",
              type: "long",
              value: "",
            },
          ],
        };
  });

  const sections = [
    { id: "overview", label: "Overview" },
    { id: "core-details", label: "Core Details" },
    { id: "steps", label: "Steps" },
    { id: "materials", label: "Materials" },
    { id: "custom", label: "Custom Fields" },
    { id: "export", label: "Export" },
  ];
  const [active, setActive] = useState("overview");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const addField = () => {
    setData((d) => ({
      ...d,
      custom: [
        ...d.custom,
        {
          id: crypto.randomUUID(),
          label: "New Field",
          type: "short",
          value: "",
        },
      ],
    }));
  };
  const setField = (id, next) =>
    setData((d) => ({
      ...d,
      custom: d.custom.map((it) => (it.id === id ? next : it)),
    }));
  const dupField = (id) =>
    setData((d) => {
      const it = d.custom.find((x) => x.id === id);
      if (!it) return d;
      const copy = { ...it, id: crypto.randomUUID() };
      return { ...d, custom: [...d.custom, copy] };
    });
  const delField = (id) =>
    setData((d) => ({ ...d, custom: d.custom.filter((it) => it.id !== id) }));

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0.01 }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const [showExportDoc, setShowExportDoc] = useState(false);
  const exportRef = useRef(null);

  const downloadPDF = async () => {
    setShowExportDoc(true);

    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));

    const el = exportRef.current;
    if (!el) return;

    const canvas = await html2canvas(el, {
      scale: 2,
      backgroundColor: "#0b0f14",
      useCORS: true,
      scrollY: -window.scrollY,
      windowWidth: el.scrollWidth,
      windowHeight: el.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW;
    const imgH = (canvas.height * imgW) / canvas.width;

    let y = 0;
    let remaining = imgH;

    while (remaining > 0) {
      pdf.addImage(imgData, "PNG", 0, y ? -y : 0, imgW, imgH);
      remaining -= pageH;
      if (remaining > 0) {
        pdf.addPage();
        y += pageH;
      }
    }

    pdf.save((data.title || "instructions") + ".pdf");
    setShowExportDoc(false);
  };

  const ImportantKicker = ({ children }) => (
    <div className="kicker" aria-label="Important">
      {children}
    </div>
  );

  /* Print-only snapshot*/
  const ExportDocument = () => (
    <div className="export-doc" ref={exportRef}>
      <div className="export-header">
        <div className="export-title">
          <span className="em2">Instruction</span> Builder
        </div>
        <div className="export-sub">Complete guide snapshot</div>
      </div>

      <section className="export-section">
        <h2>Start</h2>
        <div className="export-row">
          <div className="export-field">
            <div className="export-label">Title</div>
            <div className="export-value">{data.title || "—"}</div>
          </div>
          <div className="export-field">
            <div className="export-label">Summary</div>
            <div className="export-value">{data.summary || "—"}</div>
          </div>
        </div>
      </section>

      <section className="export-section">
        <h2>Core Details</h2>
        <div className="export-row">
          <div className="export-field">
            <div className="export-label">Difficulty</div>
            <div className="export-value">{data.difficulty || "—"}</div>
          </div>
          <div className="export-field">
            <div className="export-label">Estimated Time</div>
            <div className="export-value">{data.estTime || "—"}</div>
          </div>
        </div>
        <div className="export-field">
          <div className="export-label">Safety Notes</div>
          <div className="export-value">{data.safety || "—"}</div>
        </div>
      </section>

      <section className="export-section">
        <h2>Step-by-Step</h2>
        {toLines(data.steps).length ? (
          <ol className="export-list">
            {toLines(data.steps).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        ) : (
          <div className="export-muted">No steps provided.</div>
        )}
      </section>

      <section className="export-section">
        <h2>Materials & Tools</h2>
        {toLines(data.materials).length ? (
          <ul className="export-list">
            {toLines(data.materials).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        ) : (
          <div className="export-muted">No materials listed.</div>
        )}
      </section>

      {data.custom?.length ? (
        <section className="export-section">
          <h2>Custom Fields</h2>
          {data.custom.map((f) => (
            <div className="export-field" key={f.id}>
              <div className="export-label">{f.label || "Custom Field"}</div>
              <div className="export-value">
                {(f.value ?? "").toString() || "—"}
              </div>
            </div>
          ))}
        </section>
      ) : null}

      <div className="export-footer">
        Generated with <span className="em2">Neon Blue</span> +{" "}
        <span className="em">Neon Green</span> theme.
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <main className="container">
        {/* Hidden print snapshot */}
        {showExportDoc && <ExportDocument />}

        <header id="overview" className="panel glow-hover">
          <div
            style={{
              display: "flex",
              alignItems: "start",
              gap: 12,
              justifyContent: "space-between",
            }}
          >
            <div>
              <h1>
                <span className="em2">Instruction</span> Builder
              </h1>
              <p>
                Create clear, professional, neon-clean instruction sets for any
                hobby, DIY, or project. Everything saves automatically, and
                exports to a PDF.
              </p>
            </div>
            <HelpPopover />
          </div>

          <div className="grid" style={{ marginTop: 12 }}>
            <section className="panel">
              <h2>Start</h2>
              <div className="field">
                <label>
                  Title <span className="em">*</span>
                </label>
                <input
                  spellCheck
                  placeholder="e.g., Build a Minimalist Desk"
                  value={data.title}
                  onChange={(e) => setData({ ...data, title: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Summary</label>
                <textarea
                  spellCheck
                  placeholder="What is this and why should someone do it?"
                  value={data.summary}
                  onChange={(e) =>
                    setData({ ...data, summary: e.target.value })
                  }
                />
              </div>
            </section>

            <aside className="panel">
              <h3>Quick Tips</h3>
              <ul>
                <li>
                  Use <span className="em">short steps</span> and{" "}
                  <span className="em2">bullet lists</span>.
                </li>
                <li>
                  Put <span className="em">safety notes</span> near the top.
                </li>
                <li>
                  Add <span className="em2">custom fields</span> for your niche.
                </li>
              </ul>
              <div style={{ marginTop: 12 }}>
                <button className="btn greener" onClick={downloadPDF}>
                  Download PDF
                </button>
              </div>
            </aside>
          </div>
        </header>

        <div className="grid">
          <section id="core-details" className="panel">
            <h2>Core Details</h2>
            <div className="kicker" aria-label="Important">
              Most people scan: title, difficulty, time, safety.
            </div>
            <div className="field-row">
              <div className="field">
                <label>Difficulty</label>
                <select
                  value={data.difficulty}
                  onChange={(e) =>
                    setData({ ...data, difficulty: e.target.value })
                  }
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              <div className="field">
                <label>Estimated Time</label>
                <input
                  spellCheck
                  placeholder="e.g., 2 hours"
                  value={data.estTime}
                  onChange={(e) =>
                    setData({ ...data, estTime: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="field">
              <label>
                Safety Notes <span className="em">Important</span>
              </label>
              <textarea
                spellCheck
                placeholder="Gloves, goggles, ventilation, adhesive warnings, etc."
                value={data.safety}
                onChange={(e) => setData({ ...data, safety: e.target.value })}
              />
            </div>
          </section>

          <aside className="panel toc" aria-label="Section Navigator">
            <h3>Sections</h3>
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={active === s.id ? "active" : ""}
              >
                {s.label}
              </a>
            ))}
          </aside>
        </div>

        <section id="steps" className="panel">
          <h2>Step-by-Step</h2>
          <div className="field">
            <label>
              Steps <span className="em2">(one per line)</span>
            </label>
            <textarea
              spellCheck
              placeholder={
                "1) Prepare workspace\n2) Measure and mark\n3) Cut pieces\n4) Assemble\n5) Sand and finish"
              }
              value={data.steps}
              onChange={(e) => setData({ ...data, steps: e.target.value })}
            />
          </div>
        </section>

        <section id="materials" className="panel">
          <h2>Materials & Tools</h2>
          <div className="field">
            <label>
              List <span className="em2">(one per line)</span>
            </label>
            <textarea
              spellCheck
              placeholder={
                'Plywood 3/4"\nWood glue\n#8 screws\nOrbital sander\nFinish of choice'
              }
              value={data.materials}
              onChange={(e) => setData({ ...data, materials: e.target.value })}
            />
          </div>
        </section>

        <section id="custom" className="panel">
          <h2>Custom Fields</h2>
          <p>
            Add specialized sections: cost breakdown, links, references,
            troubleshooting, etc.
          </p>
          <div style={{ marginBottom: 12 }}>
            <button className="btn" onClick={addField}>
              Add Custom Field
            </button>
          </div>
          {data.custom.map((item) => (
            <FieldEditor
              key={item.id}
              item={item}
              onChange={(next) => setField(item.id, next)}
              onDuplicate={() => dupField(item.id)}
              onDelete={() => delField(item.id)}
            />
          ))}
        </section>

        <section id="export" className="panel">
          <h2>Export</h2>
          <p>
            Everything above will render to PDF with your{" "}
            <span className="em2">neon theme</span> preserved.
          </p>
          <div className="field-actions">
            <button className="btn greener" onClick={downloadPDF}>
              Download PDF
            </button>
            <button
              className="btn"
              onClick={() => {
                localStorage.removeItem(STORAGE_KEY);
                location.reload();
              }}
            >
              Clear Local Save
            </button>
          </div>
        </section>

        <footer className="footer">
          Built with <span className="em2">Vite + React</span>. Theme:{" "}
          <span className="em">Neon Blue</span> +{" "}
          <span className="em2">Neon Green</span>. Background is dark for
          comfort.
        </footer>
      </main>
    </>
  );
}
