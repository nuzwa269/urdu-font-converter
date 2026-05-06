import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "اردو نستعلیق ٹول — موبائل پر جمیل نوری نستعلیق" },
      { name: "description", content: "کسی بھی موبائل پر اردو ویب سائٹس کو جمیل نوری نستعلیق فونٹ میں دیکھیں۔ بُک مارک لیٹ، اینڈرائیڈ ایکسٹینشن، اور ان-ایپ براؤزر۔" },
      { property: "og:title", content: "اردو نستعلیق ٹول" },
      { property: "og:description", content: "موبائل پر کسی بھی اردو ویب سائٹ کو نستعلیق میں پڑھیں۔" },
    ],
  }),
  component: Index,
});

function Index() {
  const [origin, setOrigin] = useState("");
  useEffect(() => { setOrigin(window.location.origin); }, []);

  const bookmarklet = useMemo(() => {
    if (!origin) return "javascript:void(0)";
    const code = `(function(){window.__NASTALEEQ_BASE__=${JSON.stringify(origin)};var s=document.createElement('script');s.src='${origin}/nastaleeq.js?v='+Date.now();document.body.appendChild(s);})();`;
    return "javascript:" + encodeURIComponent(code);
  }, [origin]);

  const downloadExtension = () => {
    fetch("/nastaleeq-extension.zip")
      .then((r) => { if (!r.ok) throw new Error("Download failed"); return r.blob(); })
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "nastaleeq-extension.zip";
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch((e) => alert(e.message));
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif" }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400..700&display=swap" />
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">اردو نستعلیق ٹول</h1>
          <p className="mt-3 text-muted-foreground text-lg leading-loose">
            موبائل پر کسی بھی اردو ویب سائٹ کو <strong>جمیل نوری نستعلیق</strong> فونٹ میں دیکھیں۔ فونٹ کا سائز، سطور کا فاصلہ، وزن اور ڈارک موڈ خود کنٹرول کریں۔
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Method 1: Bookmarklet */}
        <section className="rounded-xl border border-border p-5 bg-card">
          <h2 className="text-2xl font-semibold mb-2">۱۔ بُک مارک لیٹ (سب سے آسان)</h2>
          <p className="text-muted-foreground leading-loose mb-4">
            نیچے دیے گئے بٹن کو دبا کر رکھیں اور اسے اپنے براؤزر کے بُک مارکس میں محفوظ کر لیں۔ پھر کسی بھی اردو ویب سائٹ پر جا کر اس بُک مارک پر ٹیپ کریں — ٹول چالو ہو جائے گا۔
          </p>
          <a
            href={bookmarklet}
            onClick={(e) => e.preventDefault()}
            className="inline-block px-5 py-3 rounded-lg bg-primary text-primary-foreground font-bold no-underline"
          >
            📌 نستعلیق ٹول
          </a>
          <details className="mt-4 text-sm text-muted-foreground">
            <summary className="cursor-pointer">موبائل پر بُک مارک کیسے بنائیں؟</summary>
            <ol className="mt-2 mr-5 list-decimal space-y-1 leading-loose">
              <li>اوپر بٹن پر دبا کر رکھیں اور لنک کاپی کریں۔</li>
              <li>کوئی بھی صفحہ بُک مارک کریں۔</li>
              <li>اس بُک مارک کو ایڈٹ کر کے اس کا URL کاپی شدہ <code>javascript:</code> کوڈ سے بدل دیں۔</li>
              <li>کسی اردو سائٹ پر جا کر ایڈریس بار میں اس بُک مارک کا نام لکھ کر منتخب کریں۔</li>
            </ol>
          </details>
        </section>

        {/* Method 2: Extension */}
        <section className="rounded-xl border border-border p-5 bg-card">
          <h2 className="text-2xl font-semibold mb-2">۲۔ اینڈرائیڈ ایکسٹینشن (Kiwi / Firefox)</h2>
          <p className="text-muted-foreground leading-loose mb-4">
            Kiwi Browser یا Firefox for Android میں ایکسٹینشن انسٹال کر کے ہر سائٹ پر خودکار طور پر نستعلیق فونٹ لگائیں۔
          </p>
          <button
            onClick={downloadExtension}
            className="px-5 py-3 rounded-lg bg-primary text-primary-foreground font-bold"
          >
            ⬇ ایکسٹینشن ڈاؤن لوڈ کریں
          </button>
          <ol className="mt-4 mr-5 list-decimal text-sm text-muted-foreground space-y-1 leading-loose">
            <li>زپ فائل ڈاؤن لوڈ کر کے اَن زپ کریں۔</li>
            <li>Kiwi Browser میں <code>chrome://extensions</code> کھولیں۔</li>
            <li>Developer mode آن کریں اور "Load unpacked" دبا کر فولڈر منتخب کریں۔</li>
            <li>کسی بھی اردو سائٹ پر جا کر ایکسٹینشن کا آئیکن دبائیں۔</li>
          </ol>
        </section>

        {/* Method 3: In-app browser */}
        <section className="rounded-xl border border-border p-5 bg-card">
          <h2 className="text-2xl font-semibold mb-2">۳۔ ان-ایپ براؤزر</h2>
          <p className="text-muted-foreground leading-loose mb-4">
            کسی بھی اردو ویب سائٹ کا پتہ درج کریں اور اسے فوراً نستعلیق میں پڑھیں — کوئی انسٹال کی ضرورت نہیں۔
          </p>
          <a
            href="/browser"
            className="inline-block px-5 py-3 rounded-lg bg-primary text-primary-foreground font-bold no-underline"
          >
            🌐 ان-ایپ براؤزر کھولیں
          </a>
        </section>

        <footer className="text-center text-sm text-muted-foreground pt-6">
          <p>تینوں طریقوں میں فونٹ سائز، سطور کا فاصلہ، فونٹ وزن، ڈارک موڈ اور آن/آف کنٹرول دستیاب ہیں۔</p>
        </footer>
      </main>
    </div>
  );
}
