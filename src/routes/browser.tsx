import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/browser")({
  head: () => ({
    meta: [
      { title: "ان-ایپ نستعلیق براؤزر" },
      { name: "description", content: "کسی بھی اردو ویب سائٹ کو جمیل نوری نستعلیق میں پڑھیں۔" },
    ],
  }),
  component: BrowserPage,
});

function normalize(u: string) {
  if (!u) return "";
  if (!/^https?:\/\//i.test(u)) return "https://" + u;
  return u;
}

function BrowserPage() {
  const [input, setInput] = useState("");
  const [proxied, setProxied] = useState("");

  const go = (e?: React.FormEvent) => {
    e?.preventDefault();
    const target = normalize(input);
    if (!target) return;
    setProxied(`/api/proxy?url=${encodeURIComponent(target)}`);
  };

  return (
    <div dir="rtl" className="flex flex-col h-screen bg-background text-foreground">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap" />
      <form onSubmit={go} className="flex gap-2 p-2 border-b border-border bg-card">
        <a href="/" className="px-3 py-2 rounded bg-secondary text-secondary-foreground text-sm no-underline">←</a>
        <input
          dir="ltr"
          type="url"
          inputMode="url"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="https://example.com"
          className="flex-1 px-3 py-2 rounded border border-input bg-background text-foreground text-sm"
        />
        <button type="submit" className="px-4 py-2 rounded bg-primary text-primary-foreground font-bold text-sm">
          جائیں
        </button>
      </form>
      {proxied ? (
        <iframe
          key={proxied}
          src={proxied}
          className="flex-1 w-full border-0"
          title="in-app browser"
        />
      ) : (
        <div className="flex-1 flex items-center justify-center p-6 text-center text-muted-foreground" style={{ fontFamily: "'Noto Nastaliq Urdu', serif", lineHeight: 2 }}>
          <div>
            <p className="text-lg mb-2">اوپر کسی اردو ویب سائٹ کا پتہ درج کریں۔</p>
            <p className="text-sm">سائٹ سرور کے ذریعے لوڈ ہو گی اور خودکار طور پر جمیل نوری نستعلیق میں دکھائی دے گی۔</p>
          </div>
        </div>
      )}
    </div>
  );
}
