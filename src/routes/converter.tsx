import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toPng } from "html-to-image";

export const Route = createFileRoute("/converter")({
  head: () => ({
    meta: [
      { title: "اردو فونٹ کنورٹر — جمیل نوری نستعلیق، القلم اور مزید" },
      { name: "description", content: "اردو متن کو خوبصورت فونٹس (جمیل نوری نستعلیق، القلم، علوی نستعلیق، مہر نستعلیق، گلزار، اور نوٹو نستعلیق) میں دیکھیں اور کاپی/ڈاؤن لوڈ کریں۔" },
    ],
  }),
  component: ConverterPage,
});

type Font = {
  id: string;
  name: string;
  family: string;
  css?: string; // <link href>
  fallback?: string;
};

const FONTS: Font[] = [
  {
    id: "jameel",
    name: "جمیل نوری نستعلیق",
    family: "'Jameel Noori Nastaleeq'",
    css: "https://fonts.cdnfonts.com/css/jameel-noori-nastaleeq",
    fallback: "'Noto Nastaliq Urdu', serif",
  },
  {
    id: "alqalam",
    name: "القلم تاج نستعلیق",
    family: "'Alqalam Taj Nastaleeq'",
    css: "https://fonts.cdnfonts.com/css/alqalam-taj-nastaleeq",
    fallback: "'Noto Nastaliq Urdu', serif",
  },
  {
    id: "alvi",
    name: "علوی نستعلیق",
    family: "'Alvi Nastaleeq'",
    css: "https://fonts.cdnfonts.com/css/alvi-nastaleeq",
    fallback: "'Noto Nastaliq Urdu', serif",
  },
  {
    id: "mehr",
    name: "مہر نستعلیق",
    family: "'Mehr Nastaliq Web'",
    css: "https://fonts.googleapis.com/css2?family=Mehr+Nastaliq:wght@400..700&display=swap",
    fallback: "'Noto Nastaliq Urdu', serif",
  },
  {
    id: "gulzar",
    name: "گلزار",
    family: "'Gulzar'",
    css: "https://fonts.googleapis.com/css2?family=Gulzar&display=swap",
    fallback: "'Noto Nastaliq Urdu', serif",
  },
  {
    id: "noto",
    name: "نوٹو نستعلیق اردو",
    family: "'Noto Nastaliq Urdu'",
    css: "https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400..700&display=swap",
    fallback: "serif",
  },
  {
    id: "amiri",
    name: "امیری (نسخ)",
    family: "'Amiri'",
    css: "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap",
    fallback: "serif",
  },
];

const SAMPLE = `اردو زبان کی خوبصورتی نستعلیق خط میں اپنی پوری شان سے جلوہ گر ہوتی ہے۔ یہ ایک سادہ سا جملہ ہے جس سے آپ مختلف فونٹس کا موازنہ کر سکتے ہیں۔`;

function ConverterPage() {
  const [text, setText] = useState(SAMPLE);
  const [size, setSize] = useState(28);
  const [lineHeight, setLineHeight] = useState(2.2);
  const [dark, setDark] = useState(false);
  const [active, setActive] = useState<Font>(FONTS[0]);
  const [busy, setBusy] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const ensureFont = async (font: Font, sample: string, px: number) => {
    const fontsApi: any = (document as any).fonts;
    if (!fontsApi?.load) return;
    const family = font.family.replace(/^'|'$/g, "");
    const targets = [
      `${px}px "${family}"`,
      `bold ${px}px "${family}"`,
      `${Math.max(16, Math.round(px * 0.8))}px "${family}"`,
    ];
    await Promise.all(targets.map(t => fontsApi.load(t, sample).catch(() => {})));
    await fontsApi.ready.catch(() => {});
  };

  const copy = async () => {
    const fam = `${active.family}, ${active.fallback || "serif"}`;
    const escaped = text
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");
    const html = `<div dir="rtl" style="font-family:${fam};font-size:${size}px;line-height:${lineHeight};">${escaped}</div>`;
    try {
      if ((window as any).ClipboardItem && navigator.clipboard?.write) {
        const item = new (window as any).ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([text], { type: "text/plain" }),
        });
        await navigator.clipboard.write([item]);
      } else {
        await navigator.clipboard.writeText(text);
      }
      alert("متن اسی فونٹ میں کاپی ہو گیا (ورڈ/جی میل میں پیسٹ کریں)");
    } catch {
      try { await navigator.clipboard.writeText(text); alert("متن کاپی ہو گیا"); }
      catch { alert("کاپی نہیں ہو سکا"); }
    }
  };

  const downloadPng = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const sample = text || SAMPLE;
      // 1) Make sure the active font is fully loaded
      await ensureFont(active, sample, size);
      // 2) Double rAF so the preview node has painted with final glyphs
      await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));

      const node = previewRef.current;
      if (!node) throw new Error("preview missing");

      // 3) Render the EXACT preview DOM to PNG — guarantees parity with screen
      const bg = dark ? "#111111" : getComputedStyle(node).backgroundColor || "#ffffff";
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: Math.max(2, window.devicePixelRatio || 1),
        backgroundColor: bg,
        skipFonts: false,
        style: {
          // Lock width so wrapping matches the on-screen layout
          width: `${node.clientWidth}px`,
        },
      });

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `urdu-${active.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert("PNG ڈاؤنلوڈ میں مسئلہ آیا — دوبارہ کوشش کریں");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}>
      {/* Load all font CSS upfront */}
      {FONTS.map(f => f.css && <link key={f.id} rel="stylesheet" href={f.css} />)}

      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center gap-3">
          <a href="/" className="px-3 py-2 rounded bg-secondary text-secondary-foreground text-sm no-underline" style={{ fontFamily: "system-ui" }}>←</a>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">اردو فونٹ کنورٹر</h1>
            <p className="text-sm text-muted-foreground mt-1">ٹائپ کریں اور خوبصورت اردو فونٹس میں دیکھیں۔</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Input */}
        <section className="rounded-xl border border-border bg-card p-4">
          <label className="block text-sm font-semibold mb-2">اپنا متن لکھیں</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            dir="rtl"
            className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-base"
            style={{ fontFamily: active.family + ", " + (active.fallback || "serif"), lineHeight: 2 }}
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <label className="text-sm">
              <div className="flex justify-between"><span>سائز</span><span>{size}px</span></div>
              <input type="range" min={16} max={64} value={size} onChange={(e)=>setSize(+e.target.value)} className="w-full" />
            </label>
            <label className="text-sm">
              <div className="flex justify-between"><span>سطور کا فاصلہ</span><span>{lineHeight.toFixed(1)}</span></div>
              <input type="range" min={1.4} max={3.2} step={0.1} value={lineHeight} onChange={(e)=>setLineHeight(+e.target.value)} className="w-full" />
            </label>
            <label className="text-sm flex items-center justify-between gap-2 col-span-2 md:col-span-1">
              <span>ڈارک پری ویو</span>
              <input type="checkbox" checked={dark} onChange={(e)=>setDark(e.target.checked)} />
            </label>
            <div className="flex gap-2 col-span-2 md:col-span-1">
              <button onClick={copy} className="flex-1 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm">کاپی</button>
              <button onClick={downloadPng} className="flex-1 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold">PNG</button>
            </div>
          </div>
        </section>

        {/* Font tabs */}
        <section className="flex flex-wrap gap-2">
          {FONTS.map(f => (
            <button
              key={f.id}
              onClick={() => setActive(f)}
              className={`px-3 py-2 rounded-lg border text-sm transition ${active.id === f.id ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"}`}
              style={{ fontFamily: f.family + ", " + (f.fallback || "serif") }}
            >
              {f.name}
            </button>
          ))}
        </section>

        {/* Big preview of active font */}
        <section
          className="rounded-xl border border-border p-6"
          style={{
            fontFamily: active.family + ", " + (active.fallback || "serif"),
            fontSize: size,
            lineHeight: lineHeight,
            background: dark ? "#111" : "var(--card)",
            color: dark ? "#f5f5f5" : "var(--foreground)",
            minHeight: 160,
          }}
        >
          {text || <span className="text-muted-foreground">یہاں آپ کا متن دکھائی دے گا۔</span>}
        </section>

        {/* Compare all */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold">تمام فونٹس کا موازنہ</h2>
          {FONTS.map(f => (
            <div key={f.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-muted-foreground" style={{ fontFamily: "system-ui" }}>{f.name}</span>
                <button onClick={() => setActive(f)} className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground">منتخب کریں</button>
              </div>
              <div style={{ fontFamily: f.family + ", " + (f.fallback || "serif"), fontSize: 22, lineHeight: 2 }}>
                {text || SAMPLE}
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const paragraphs = text.split(/\n/);
  const lines: string[] = [];
  for (const para of paragraphs) {
    const words = para.split(/\s+/);
    let line = "";
    for (const word of words) {
      const test = line ? line + " " + word : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    if (paragraphs.length > 1) lines.push("");
  }
  return lines;
}
