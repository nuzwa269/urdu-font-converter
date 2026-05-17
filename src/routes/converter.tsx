import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toPng } from "html-to-image";

export const Route = createFileRoute("/converter")({
  head: () => ({
    meta: [
      { title: "اردو فونٹ کنورٹر — ڈیزائن، کلر اور ڈاؤن لوڈ" },
      { name: "description", content: "اردو متن کو 7 خوبصورت فونٹس میں دیکھیں، رنگ اور ڈیزائن منتخب کریں، اور PNG میں محفوظ کریں۔" },
    ],
  }),
  component: ConverterPage,
});

type Font = {
  id: string;
  name: string;
  family: string;
  css?: string;
  fallback?: string;
};

const FONTS: Font[] = [
  { id: "jameel", name: "جمیل نوری نستعلیق", family: "'Jameel Noori Nastaleeq'", css: "https://fonts.cdnfonts.com/css/jameel-noori-nastaleeq", fallback: "'Noto Nastaliq Urdu', serif" },
  { id: "alqalam", name: "القلم تاج نستعلیق", family: "'Alqalam Taj Nastaleeq'", css: "https://fonts.cdnfonts.com/css/alqalam-taj-nastaleeq", fallback: "'Noto Nastaliq Urdu', serif" },
  { id: "alvi", name: "علوی نستعلیق", family: "'Alvi Nastaleeq'", css: "https://fonts.cdnfonts.com/css/alvi-nastaleeq", fallback: "'Noto Nastaliq Urdu', serif" },
  { id: "mehr", name: "مہر نستعلیق", family: "'Mehr Nastaliq Web'", css: "https://fonts.googleapis.com/css2?family=Mehr+Nastaliq:wght@400..700&display=swap", fallback: "'Noto Nastaliq Urdu', serif" },
  { id: "gulzar", name: "گلزار", family: "'Gulzar'", css: "https://fonts.googleapis.com/css2?family=Gulzar&display=swap", fallback: "'Noto Nastaliq Urdu', serif" },
  { id: "noto", name: "نوٹو نستعلیق اردو", family: "'Noto Nastaliq Urdu'", css: "https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400..700&display=swap", fallback: "serif" },
  { id: "amiri", name: "امیری (نسخ)", family: "'Amiri'", css: "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap", fallback: "serif" },
];

const SAMPLE = `اردو زبان کی خوبصورتی نستعلیق خط میں اپنی پوری شان سے جلوہ گر ہوتی ہے۔`;

// Curated design presets (text color, background — solid or gradient)
const PRESETS: { name: string; fg: string; bg: string }[] = [
  { name: "سفید/سادہ", fg: "#111111", bg: "#ffffff" },
  { name: "کریم", fg: "#3a2a14", bg: "#fdf6e3" },
  { name: "سیاہ", fg: "#f5f5f5", bg: "#111111" },
  { name: "سنہری", fg: "#3a2a00", bg: "linear-gradient(135deg,#fde68a,#f59e0b)" },
  { name: "سبز", fg: "#06281e", bg: "linear-gradient(135deg,#d1fae5,#10b981)" },
  { name: "نیلا", fg: "#0b1e3a", bg: "linear-gradient(135deg,#dbeafe,#3b82f6)" },
  { name: "گلابی", fg: "#3b0a2a", bg: "linear-gradient(135deg,#fce7f3,#ec4899)" },
  { name: "ارغوانی", fg: "#1a0033", bg: "linear-gradient(135deg,#ede9fe,#8b5cf6)" },
  { name: "غروب", fg: "#2a0a00", bg: "linear-gradient(135deg,#fed7aa,#f97316,#ef4444)" },
  { name: "رات", fg: "#e6e6ff", bg: "linear-gradient(135deg,#0f172a,#312e81)" },
  { name: "زمرد", fg: "#f0fff4", bg: "linear-gradient(135deg,#064e3b,#10b981)" },
  { name: "گلاب گولڈ", fg: "#fff0f0", bg: "linear-gradient(135deg,#9d174d,#f59e0b)" },
];

type Style = {
  fg: string;
  bg: string;
  size: number;
  lineHeight: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  align: "right" | "center" | "left";
  shadow: boolean;
  ratio: string; // "free" | "1:1" | "9:16" | "16:9" | "4:5" | "3:4" | "4:3"
  frame: string; // frame id
};

const FRAMES: { id: string; label: string }[] = [
  { id: "none", label: "بغیر فریم" },
  { id: "thin", label: "باریک" },
  { id: "thick", label: "موٹا" },
  { id: "double", label: "دوہرا" },
  { id: "dashed", label: "ڈیشڈ" },
  { id: "dotted", label: "ڈاٹڈ" },
  { id: "inset", label: "اندرونی" },
  { id: "ornate", label: "آرائشی" },
  { id: "gold", label: "سنہری" },
  { id: "shadow", label: "سایہ" },
  { id: "ring", label: "حلقہ" },
  { id: "corners", label: "کونے" },
];

/** Returns inline style additions for the chosen frame, tinted by fg color. */
function frameStyle(frame: string, fg: string): React.CSSProperties {
  const c = fg || "#111";
  switch (frame) {
    case "thin":
      return { border: `2px solid ${c}`, borderRadius: 12 };
    case "thick":
      return { border: `6px solid ${c}`, borderRadius: 14 };
    case "double":
      return { border: `6px double ${c}`, borderRadius: 12 };
    case "dashed":
      return { border: `3px dashed ${c}`, borderRadius: 14 };
    case "dotted":
      return { border: `3px dotted ${c}`, borderRadius: 14 };
    case "inset":
      return { border: `2px solid ${c}`, outline: `1px solid ${c}`, outlineOffset: 6, borderRadius: 10 };
    case "ornate":
      return {
        border: `4px double ${c}`,
        boxShadow: `inset 0 0 0 8px transparent, inset 0 0 0 10px ${c}`,
        borderRadius: 6,
      };
    case "gold":
      return {
        borderRadius: 14,
        boxShadow: `0 0 0 3px #fde68a, 0 0 0 6px #b45309, 0 0 0 8px #fde68a`,
      };
    case "shadow":
      return { borderRadius: 14, boxShadow: `0 18px 40px -10px ${c}66, 0 6px 18px ${c}33` };
    case "ring":
      return { borderRadius: 9999, border: `3px solid ${c}` };
    case "corners":
      return {
        borderRadius: 4,
        backgroundImage:
          `linear-gradient(${c},${c}),linear-gradient(${c},${c}),linear-gradient(${c},${c}),linear-gradient(${c},${c}),` +
          `linear-gradient(${c},${c}),linear-gradient(${c},${c}),linear-gradient(${c},${c}),linear-gradient(${c},${c})`,
        backgroundRepeat: "no-repeat",
        backgroundSize:
          "3px 22px, 22px 3px, 3px 22px, 22px 3px, 3px 22px, 22px 3px, 3px 22px, 22px 3px",
        backgroundPosition:
          "left top, left top, right top, right top, left bottom, left bottom, right bottom, right bottom",
      };
    default:
      return {};
  }
}

const RATIOS: { id: string; label: string }[] = [
  { id: "free", label: "آزاد" },
  { id: "1:1", label: "1:1" },
  { id: "9:16", label: "9:16" },
  { id: "16:9", label: "16:9" },
  { id: "4:5", label: "4:5" },
  { id: "3:4", label: "3:4" },
  { id: "4:3", label: "4:3" },
];

const DEFAULT_STYLE: Style = {
  fg: "#111111",
  bg: "#ffffff",
  size: 30,
  lineHeight: 2.2,
  bold: false,
  italic: false,
  underline: false,
  align: "right",
  shadow: false,
  ratio: "free",
  frame: "none",
};

function ConverterPage() {
  const [text, setText] = useState(SAMPLE);
  // Per-font styles
  const [styles, setStyles] = useState<Record<string, Style>>(() =>
    FONTS.reduce((acc, f) => ({ ...acc, [f.id]: { ...DEFAULT_STYLE } }), {})
  );
  const [activeId, setActiveId] = useState(FONTS[0].id);
  const [busyId, setBusyId] = useState<string | null>(null);
  const refs = useRef<Record<string, HTMLDivElement | null>>({});

  const active = FONTS.find(f => f.id === activeId)!;
  const aStyle = styles[activeId];

  const updateStyle = (id: string, patch: Partial<Style>) =>
    setStyles(s => ({ ...s, [id]: { ...s[id], ...patch } }));

  const applyPreset = (id: string, p: { fg: string; bg: string }) =>
    updateStyle(id, { fg: p.fg, bg: p.bg });

  const randomDesign = (id: string) => {
    const p = PRESETS[Math.floor(Math.random() * PRESETS.length)];
    const sizes = [24, 28, 32, 36, 40, 44];
    const lhs = [1.8, 2.0, 2.2, 2.4, 2.6];
    const aligns: Style["align"][] = ["right", "center"];
    updateStyle(id, {
      fg: p.fg,
      bg: p.bg,
      size: sizes[Math.floor(Math.random() * sizes.length)],
      lineHeight: lhs[Math.floor(Math.random() * lhs.length)],
      bold: Math.random() > 0.5,
      italic: false,
      underline: Math.random() > 0.7,
      align: aligns[Math.floor(Math.random() * aligns.length)],
      shadow: Math.random() > 0.5,
    });
  };

  const ensureFont = async (font: Font, sample: string, px: number) => {
    const fontsApi: any = (document as any).fonts;
    if (!fontsApi?.load) return;
    const family = font.family.replace(/^'|'$/g, "");
    const targets = [`${px}px "${family}"`, `bold ${px}px "${family}"`];
    await Promise.all(targets.map(t => fontsApi.load(t, sample).catch(() => {})));
    await fontsApi.ready.catch(() => {});
  };

  const copy = async (font: Font, st: Style) => {
    const fam = `${font.family}, ${font.fallback || "serif"}`;
    const escaped = (text || SAMPLE)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");
    const deco = st.underline ? "underline" : "none";
    const html = `<div dir="rtl" style="font-family:${fam};font-size:${st.size}px;line-height:${st.lineHeight};color:${st.fg};font-weight:${st.bold ? 700 : 400};font-style:${st.italic ? "italic" : "normal"};text-decoration:${deco};text-align:${st.align};">${escaped}</div>`;
    try {
      if ((window as any).ClipboardItem && navigator.clipboard?.write) {
        const item = new (window as any).ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([text || SAMPLE], { type: "text/plain" }),
        });
        await navigator.clipboard.write([item]);
      } else {
        await navigator.clipboard.writeText(text || SAMPLE);
      }
      alert("متن اسی اسٹائل میں کاپی ہو گیا");
    } catch {
      try { await navigator.clipboard.writeText(text || SAMPLE); alert("متن کاپی ہو گیا"); }
      catch { alert("کاپی نہیں ہو سکا"); }
    }
  };

  const downloadPng = async (font: Font) => {
    if (busyId) return;
    setBusyId(font.id);
    try {
      const node = refs.current[font.id];
      if (!node) throw new Error("missing");
      await ensureFont(font, text || SAMPLE, styles[font.id].size);
      await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: Math.max(2, window.devicePixelRatio || 1),
        skipFonts: false,
        style: { width: `${node.clientWidth}px` },
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `urdu-${font.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error(e);
      alert("PNG ڈاؤنلوڈ میں مسئلہ آیا");
    } finally {
      setBusyId(null);
    }
  };

  const renderCard = (font: Font) => {
    const st = styles[font.id];
    const fontStack = font.family + ", " + (font.fallback || "serif");
    return (
      <div key={font.id} className="rounded-xl border border-border bg-card p-3 sm:p-4 space-y-3 overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-muted-foreground" style={{ fontFamily: "system-ui" }}>
            {font.name}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => randomDesign(font.id)}
              className="text-xs min-h-9 px-2.5 py-1.5 rounded bg-secondary text-secondary-foreground"
              title="رینڈم ڈیزائن"
            >🎲</button>
            <button
              onClick={() => setActiveId(font.id)}
              className={`text-xs min-h-9 px-2.5 py-1.5 rounded ${activeId === font.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
            >
              {activeId === font.id ? "✓" : "ایڈٹ"}
            </button>
          </div>
        </div>

        {/* Preview */}
        <div
          ref={(el) => { refs.current[font.id] = el; }}
          className="rounded-lg p-4 sm:p-6 overflow-hidden flex"
          style={{
            fontFamily: fontStack,
            fontSize: st.size,
            lineHeight: st.lineHeight,
            color: st.fg,
            background: st.bg,
            fontWeight: st.bold ? 700 : 400,
            fontStyle: st.italic ? "italic" : "normal",
            textDecoration: st.underline ? "underline" : "none",
            textShadow: st.shadow ? "0 2px 8px rgba(0,0,0,0.35)" : "none",
            minHeight: st.ratio === "free" ? 140 : undefined,
            aspectRatio: st.ratio === "free" ? undefined : st.ratio.replace(":", " / "),
            alignItems: "center",
            justifyContent: st.align === "right" ? "flex-end" : st.align === "left" ? "flex-start" : "center",
          }}
        >
          <div style={{ width: "100%", textAlign: st.align, wordBreak: "break-word", overflowWrap: "anywhere" }}>
            {text || SAMPLE}
          </div>
        </div>

        {/* Controls — only if active */}
        {activeId === font.id && (
          <div className="space-y-3 border-t border-border pt-3">
            {/* Aspect ratio */}
            <div>
              <div className="text-xs text-muted-foreground mb-1.5" style={{ fontFamily: "system-ui" }}>کارڈ سائز (ریشو)</div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1" style={{ fontFamily: "system-ui" }}>
                {RATIOS.map(r => (
                  <button
                    key={r.id}
                    onClick={() => updateStyle(font.id, { ratio: r.id })}
                    className={`shrink-0 min-h-9 px-3 rounded text-xs font-semibold ${st.ratio === r.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
                  >{r.label}</button>
                ))}
              </div>
            </div>

            {/* Color presets */}
            <div>
              <div className="text-xs text-muted-foreground mb-1.5" style={{ fontFamily: "system-ui" }}>ڈیزائن پریسیٹس</div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
                {PRESETS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => applyPreset(font.id, p)}
                    className="shrink-0 h-9 w-12 rounded border border-border"
                    style={{ background: p.bg, color: p.fg, fontSize: 12, fontWeight: 700 }}
                    title={p.name}
                  >ابج</button>
                ))}
              </div>
            </div>

            {/* Color pickers */}
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-xs">
                <span>ٹیکسٹ کلر</span>
                <input
                  type="color"
                  value={st.fg.startsWith("#") ? st.fg : "#111111"}
                  onChange={(e) => updateStyle(font.id, { fg: e.target.value })}
                  className="h-7 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
                />
              </label>
              <label className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-xs">
                <span>بیک گراؤنڈ</span>
                <input
                  type="color"
                  value={st.bg.startsWith("#") ? st.bg : "#ffffff"}
                  onChange={(e) => updateStyle(font.id, { bg: e.target.value })}
                  className="h-7 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
                />
              </label>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs">
                <div className="flex justify-between mb-1"><span>سائز</span><span>{st.size}px</span></div>
                <input type="range" min={16} max={72} value={st.size} onChange={(e) => updateStyle(font.id, { size: +e.target.value })} className="w-full h-6" />
              </label>
              <label className="text-xs">
                <div className="flex justify-between mb-1"><span>سطر فاصلہ</span><span>{st.lineHeight.toFixed(1)}</span></div>
                <input type="range" min={1.4} max={3.4} step={0.1} value={st.lineHeight} onChange={(e) => updateStyle(font.id, { lineHeight: +e.target.value })} className="w-full h-6" />
              </label>
            </div>

            {/* Toggles + alignment */}
            <div className="flex flex-wrap gap-1.5" style={{ fontFamily: "system-ui" }}>
              {([
                ["B", "bold", st.bold],
                ["I", "italic", st.italic],
                ["U", "underline", st.underline],
                ["S", "shadow", st.shadow],
              ] as const).map(([label, key, val]) => (
                <button
                  key={key}
                  onClick={() => updateStyle(font.id, { [key]: !val } as any)}
                  className={`min-h-9 min-w-9 px-2.5 rounded text-sm font-bold ${val ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
                >{label}</button>
              ))}
              <div className="flex-1" />
              {(["right", "center", "left"] as const).map(a => (
                <button
                  key={a}
                  onClick={() => updateStyle(font.id, { align: a })}
                  className={`min-h-9 min-w-9 px-2.5 rounded text-sm ${st.align === a ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
                  title={a}
                >{a === "right" ? "⇥" : a === "center" ? "≡" : "⇤"}</button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => copy(font, st)} className="min-h-11 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-semibold">کاپی</button>
          <button onClick={() => downloadPng(font)} disabled={busyId === font.id} className="min-h-11 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold disabled:opacity-60">{busyId === font.id ? "..." : "PNG ڈاؤنلوڈ"}</button>
        </div>
      </div>
    );
  };

  return (
    <div dir="rtl" className="min-h-screen w-full overflow-x-hidden bg-background text-foreground" style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}>
      {FONTS.map(f => f.css && <link key={f.id} rel="stylesheet" href={f.css} />)}

      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center gap-3">
          <a href="/" className="px-3 py-2 rounded bg-secondary text-secondary-foreground text-sm no-underline" style={{ fontFamily: "system-ui" }}>←</a>
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">اردو فونٹ کنورٹر</h1>
            <p className="text-sm text-muted-foreground mt-1">7 فونٹس، رنگ، ڈیزائن اور PNG ڈاؤنلوڈ</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Input + global actions */}
        <section className="rounded-xl border border-border bg-card p-4 space-y-3">
          <label className="block text-sm font-semibold">اپنا متن لکھیں</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            dir="rtl"
            className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-base"
            style={{ fontFamily: active.family + ", " + (active.fallback || "serif"), lineHeight: 2 }}
          />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => FONTS.forEach(f => randomDesign(f.id))}
              className="min-h-10 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold"
            >🎲 سب کے لیے رینڈم ڈیزائن</button>
            <button
              onClick={() => setStyles(FONTS.reduce((acc, f) => ({ ...acc, [f.id]: { ...DEFAULT_STYLE } }), {}))}
              className="min-h-10 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-semibold"
            >ری سیٹ</button>
          </div>
        </section>

        {/* Cards grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FONTS.map(renderCard)}
        </section>
      </main>
    </div>
  );
}
