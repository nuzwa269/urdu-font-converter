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
  download?: string; // direct font download URL (TTF/OTF/ZIP) or info page
};

const FONTS: Font[] = [
  { id: "jameel", name: "جمیل نوری نستعلیق", family: "'Jameel Noori Nastaleeq'", css: "https://fonts.cdnfonts.com/css/jameel-noori-nastaleeq", fallback: "'Noto Nastaliq Urdu', serif", download: "https://www.cdnfonts.com/jameel-noori-nastaleeq.font" },
  { id: "alqalam", name: "القلم تاج نستعلیق", family: "'Alqalam Taj Nastaleeq'", css: "https://fonts.cdnfonts.com/css/alqalam-taj-nastaleeq", fallback: "'Noto Nastaliq Urdu', serif", download: "https://www.cdnfonts.com/alqalam-taj-nastaleeq.font" },
  { id: "alvi", name: "علوی نستعلیق", family: "'Alvi Nastaleeq'", css: "https://fonts.cdnfonts.com/css/alvi-nastaleeq", fallback: "'Noto Nastaliq Urdu', serif", download: "https://www.cdnfonts.com/alvi-nastaleeq.font" },
  { id: "mehr", name: "مہر نستعلیق", family: "'Mehr Nastaliq Web'", css: "https://fonts.googleapis.com/css2?family=Mehr+Nastaliq:wght@400..700&display=swap", fallback: "'Noto Nastaliq Urdu', serif", download: "https://fonts.google.com/specimen/Mehr+Nastaliq" },
  { id: "gulzar", name: "گلزار", family: "'Gulzar'", css: "https://fonts.googleapis.com/css2?family=Gulzar&display=swap", fallback: "'Noto Nastaliq Urdu', serif", download: "https://fonts.google.com/specimen/Gulzar" },
  { id: "noto", name: "نوٹو نستعلیق اردو", family: "'Noto Nastaliq Urdu'", css: "https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400..700&display=swap", fallback: "serif", download: "https://fonts.google.com/noto/specimen/Noto+Nastaliq+Urdu" },
  { id: "amiri", name: "امیری (نسخ)", family: "'Amiri'", css: "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap", fallback: "serif", download: "https://fonts.google.com/specimen/Amiri" },
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
  sentenceBreak: boolean; // ہر جملے کے بعد نئی سطر
};

/** ہر جملے (۔ ؟ ! .) کے بعد نئی سطر ڈالیں */
function splitSentences(input: string): string {
  if (!input) return input;
  // Insert newline after Urdu/Arabic full stop ۔, question marks (؟/?), exclamation (!), and Latin period
  return input
    .replace(/([۔!؟?])\s*/g, "$1\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

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
  { id: "klasik", label: "کلاسک" },
  { id: "mughal", label: "مغل" },
  { id: "tazhib", label: "تذہیب" },
  { id: "qitaa", label: "قطعہ" },
  { id: "manuscript", label: "مخطوطہ" },
  { id: "naqsh", label: "نقش" },
  { id: "minar", label: "مینار" },
  { id: "arabesque", label: "اسلیمی" },
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
    case "klasik":
      // Classic triple border: outer thin, gap, inner thin (manuscript-like)
      return {
        border: `2px solid ${c}`,
        boxShadow: `inset 0 0 0 6px transparent, inset 0 0 0 7px ${c}, inset 0 0 0 11px transparent, inset 0 0 0 12px ${c}`,
        borderRadius: 10,
      };
    case "mughal":
      // Mughal-era illuminated border: deep + gold + deep layered rings
      return {
        borderRadius: 8,
        boxShadow:
          `0 0 0 2px #7c2d12, 0 0 0 4px #fde68a, 0 0 0 6px #b45309, ` +
          `0 0 0 9px #fde68a, 0 0 0 11px #7c2d12, ` +
          `inset 0 0 0 3px #b45309, inset 0 0 0 5px #fde68a`,
      };
    case "tazhib":
      // Illumination (تذہیب) — gold gradient with inset shadow
      return {
        borderRadius: 12,
        border: `6px solid transparent`,
        backgroundImage:
          `linear-gradient(currentColor,currentColor), linear-gradient(135deg,#fde68a 0%,#b45309 40%,#fde68a 60%,#92400e 100%)`,
        backgroundOrigin: "border-box",
        backgroundClip: "content-box, border-box",
        boxShadow: `inset 0 0 0 2px #92400e`,
      };
    case "qitaa":
      // Manuscript قطعہ: thick outer + gap + thin inner with corner dots
      return {
        border: `4px solid ${c}`,
        boxShadow: `inset 0 0 0 6px transparent, inset 0 0 0 7px ${c}`,
        borderRadius: 2,
        backgroundImage:
          `radial-gradient(circle, ${c} 2.5px, transparent 3px),` +
          `radial-gradient(circle, ${c} 2.5px, transparent 3px),` +
          `radial-gradient(circle, ${c} 2.5px, transparent 3px),` +
          `radial-gradient(circle, ${c} 2.5px, transparent 3px)`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "10px 10px",
        backgroundPosition: "10px 10px, calc(100% - 10px) 10px, 10px calc(100% - 10px), calc(100% - 10px) calc(100% - 10px)",
      };
    case "manuscript":
      // Parchment-style: double outer + offset shadow + warm inset
      return {
        border: `3px double ${c}`,
        borderRadius: 6,
        boxShadow:
          `inset 0 0 0 8px transparent, inset 0 0 0 9px ${c}55, ` +
          `0 8px 24px ${c}33`,
      };
    case "naqsh":
      // Geometric pattern border via repeating gradient
      return {
        border: `8px solid transparent`,
        borderRadius: 8,
        backgroundImage:
          `linear-gradient(currentColor,currentColor),` +
          `repeating-linear-gradient(45deg, ${c} 0 4px, transparent 4px 8px)`,
        backgroundOrigin: "border-box",
        backgroundClip: "content-box, border-box",
      };
    case "minar":
      // Mihrab/minaret-like: thick top & bottom, thin sides
      return {
        borderTop: `8px solid ${c}`,
        borderBottom: `8px solid ${c}`,
        borderLeft: `2px solid ${c}`,
        borderRight: `2px solid ${c}`,
        boxShadow: `inset 0 0 0 4px transparent, inset 0 0 0 5px ${c}`,
        borderRadius: 4,
      };
    case "arabesque":
      // Islamic-style: double rings + soft gold halo
      return {
        border: `2px solid ${c}`,
        borderRadius: 16,
        boxShadow:
          `0 0 0 4px #fde68a55, 0 0 0 6px ${c}, ` +
          `inset 0 0 0 4px transparent, inset 0 0 0 5px ${c}55, ` +
          `inset 0 0 0 10px transparent, inset 0 0 0 11px ${c}`,
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
  size: 20,
  lineHeight: 1.8,
  bold: false,
  italic: false,
  underline: false,
  align: "right",
  shadow: false,
  ratio: "free",
  frame: "none",
  sentenceBreak: false,
};

export function ConverterPage() {
  const [text, setText] = useState(SAMPLE);
  const [customFonts, setCustomFonts] = useState<Font[]>([]);
  const allFonts = [...FONTS, ...customFonts];
  // Per-font styles
  const [styles, setStyles] = useState<Record<string, Style>>(() =>
    FONTS.reduce((acc, f) => ({ ...acc, [f.id]: { ...DEFAULT_STYLE } }), {})
  );
  const [activeId, setActiveId] = useState(FONTS[0].id);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const refs = useRef<Record<string, HTMLDivElement | null>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const active = allFonts.find(f => f.id === activeId) || allFonts[0];
  const aStyle = styles[activeId] || DEFAULT_STYLE;

  const handleFontUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);
    const added: Font[] = [];
    for (const file of Array.from(files)) {
      try {
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (!["ttf", "otf", "woff", "woff2"].includes(ext || "")) {
          setUploadError("صرف TTF, OTF, WOFF, WOFF2 فائلز قابل قبول ہیں");
          continue;
        }
        const buf = await file.arrayBuffer();
        const baseName = file.name.replace(/\.(ttf|otf|woff2?|TTF|OTF|WOFF2?)$/i, "");
        const id = "custom-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
        const family = "UserFont_" + id.replace(/-/g, "_");
        const face = new FontFace(family, buf);
        await face.load();
        (document as any).fonts.add(face);
        const font: Font = {
          id,
          name: baseName,
          family: `'${family}'`,
          fallback: "'Noto Nastaliq Urdu', serif",
        };
        added.push(font);
        setStyles(s => ({ ...s, [id]: { ...DEFAULT_STYLE } }));
      } catch (e) {
        console.error(e);
        setUploadError("فونٹ لوڈ نہیں ہو سکا: " + file.name);
      }
    }
    if (added.length) {
      setCustomFonts(prev => [...prev, ...added]);
      setActiveId(added[0].id);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeCustomFont = (id: string) => {
    setCustomFonts(prev => prev.filter(f => f.id !== id));
    setStyles(s => { const c = { ...s }; delete c[id]; return c; });
    if (activeId === id) setActiveId(FONTS[0].id);
  };

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
      frame: FRAMES[Math.floor(Math.random() * FRAMES.length)].id,
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
            ...frameStyle(st.frame, st.fg),
          }}
        >
          <div style={{ width: "100%", textAlign: st.align, wordBreak: "break-word", overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}>
            {st.sentenceBreak ? splitSentences(text || SAMPLE) : (text || SAMPLE)}
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

            {/* Frame */}
            <div>
              <div className="text-xs text-muted-foreground mb-1.5" style={{ fontFamily: "system-ui" }}>فریم اسٹائل</div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
                {FRAMES.map(fr => (
                  <button
                    key={fr.id}
                    onClick={() => updateStyle(font.id, { frame: fr.id })}
                    className={`shrink-0 min-h-12 px-2 rounded text-[10px] font-semibold flex items-center justify-center ${st.frame === fr.id ? "ring-2 ring-primary" : ""}`}
                    style={{
                      width: 56,
                      background: st.bg,
                      color: st.fg,
                      ...frameStyle(fr.id, st.fg),
                    }}
                    title={fr.label}
                  >ابج</button>
                ))}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1" style={{ fontFamily: "system-ui" }}>
                {FRAMES.find(f => f.id === st.frame)?.label}
              </div>
            </div>

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

            {/* Sentence break toggle */}
            <label className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-xs cursor-pointer" style={{ fontFamily: "system-ui" }}>
              <span style={{ fontFamily: "'Noto Nastaliq Urdu', serif", lineHeight: 1.8 }}>
                ہر جملے (۔ ؟ !) کے بعد نئی سطر
              </span>
              <input
                type="checkbox"
                checked={st.sentenceBreak}
                onChange={(e) => updateStyle(font.id, { sentenceBreak: e.target.checked })}
                className="h-5 w-5 cursor-pointer"
              />
            </label>

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
        {font.download && (
          <a
            href={font.download}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center min-h-11 px-3 py-2.5 rounded-lg bg-accent text-accent-foreground text-sm font-semibold no-underline"
          >⬇ فونٹ ڈاؤنلوڈ کریں</a>
        )}
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
            <p className="text-sm text-muted-foreground mt-1">فونٹس، رنگ، ڈیزائن اور PNG ڈاؤنلوڈ</p>
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
              onClick={() => allFonts.forEach(f => randomDesign(f.id))}
              className="min-h-10 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold"
            >🎲 سب کے لیے رینڈم ڈیزائن</button>
            <button
              onClick={() => setStyles(allFonts.reduce((acc, f) => ({ ...acc, [f.id]: { ...DEFAULT_STYLE } }), {}))}
              className="min-h-10 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-semibold"
            >ری سیٹ</button>
          </div>

          {/* Custom font upload */}
          <div className="border-t border-border pt-3 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="text-sm font-semibold">اپنا فونٹ اپ لوڈ کریں</div>
              <span className="text-[11px] text-muted-foreground" style={{ fontFamily: "system-ui" }}>TTF / OTF / WOFF / WOFF2</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".ttf,.otf,.woff,.woff2,font/ttf,font/otf,font/woff,font/woff2"
              multiple
              onChange={(e) => handleFontUpload(e.target.files)}
              className="block w-full text-xs text-muted-foreground file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:font-semibold file:cursor-pointer cursor-pointer"
              style={{ fontFamily: "system-ui" }}
            />
            {uploadError && (
              <div className="text-xs text-destructive">{uploadError}</div>
            )}
            {customFonts.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {customFonts.map(cf => (
                  <span key={cf.id} className="inline-flex items-center gap-1.5 rounded-full bg-secondary text-secondary-foreground text-xs px-2.5 py-1">
                    <span style={{ fontFamily: cf.family + ", " + (cf.fallback || "serif") }}>{cf.name}</span>
                    <button onClick={() => removeCustomFont(cf.id)} className="opacity-70 hover:opacity-100" title="حذف کریں" style={{ fontFamily: "system-ui" }}>✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Cards grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allFonts.map(renderCard)}
        </section>
      </main>
    </div>
  );
}
