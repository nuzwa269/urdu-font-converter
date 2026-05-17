import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ConverterPage } from "./converter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "اردو فونٹ کنورٹر — خوبصورت نستعلیق فونٹس میں متن" },
      { name: "description", content: "اردو متن کو 7 خوبصورت نستعلیق فونٹس میں دیکھیں، رنگ و ڈیزائن منتخب کریں اور PNG ڈاؤن لوڈ کریں۔" },
      { property: "og:title", content: "اردو فونٹ کنورٹر" },
      { property: "og:description", content: "اردو متن کو خوبصورت نستعلیق فونٹس میں کنورٹ کریں۔" },
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
    <>
      {/* Main tool — Urdu Font Converter shown first */}
      <ConverterPage />

      {/* Additional tools available below */}
      <div dir="rtl" className="w-full bg-background text-foreground border-t border-border" style={{ fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif" }}>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400..700&display=swap" />
        <main className="max-w-3xl mx-auto px-4 py-8 space-y-6 sm:space-y-8 [&_code]:break-all [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold">مزید ٹولز</h2>
            <p className="text-sm text-muted-foreground mt-2 leading-loose">موبائل پر کسی بھی اردو ویب سائٹ کو نستعلیق فونٹ میں دیکھنے کے اضافی طریقے۔ ضرورت ہو تو کھول کر استعمال کریں۔</p>
          </div>

          {/* Bookmarklet */}
          <section className="rounded-xl border border-border bg-card">
            <details>
              <summary className="cursor-pointer p-4 sm:p-5 font-semibold text-lg sm:text-xl">۱۔ بُک مارک لیٹ (سب سے آسان)</summary>
              <div className="p-4 sm:p-5 pt-0">
                <p className="text-muted-foreground leading-loose mb-4 text-sm sm:text-base">
                  نیچے دیے گئے بٹن کو دبا کر رکھیں اور اسے اپنے براؤزر کے بُک مارکس میں محفوظ کر لیں۔ پھر کسی بھی اردو ویب سائٹ پر جا کر اس بُک مارک پر ٹیپ کریں — ٹول چالو ہو جائے گا۔
                </p>
                <a
                  href={bookmarklet}
                  onClick={(e) => e.preventDefault()}
                  className="inline-flex items-center justify-center min-h-12 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-bold no-underline"
                >
                  📌 نستعلیق ٹول
                </a>
                <details className="mt-4 text-sm text-muted-foreground">
                  <summary className="cursor-pointer font-semibold py-2">موبائل پر بُک مارک کیسے بنائیں؟</summary>
                  <div className="mt-3 space-y-3 leading-loose">
                    <div>
                      <p className="font-semibold text-foreground">Firefox Android (آسان طریقہ):</p>
                      <ol className="mr-5 list-decimal space-y-1">
                        <li>اوپر بٹن پر دبا کر رکھیں → "Copy link"۔</li>
                        <li>کوئی بھی صفحہ کھول کر بُک مارک کریں (⋮ → Bookmark)۔</li>
                        <li>Bookmarks میں جا کر اسے Edit کریں، URL کی جگہ کاپی شدہ <code>javascript:</code> کوڈ پیسٹ کریں، نام "نستعلیق" رکھیں۔</li>
                        <li>کسی اردو سائٹ پر جا کر ایڈریس بار میں <code>نستعلیق</code> لکھیں اور suggestion پر ٹیپ کریں۔</li>
                      </ol>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Chrome Android:</p>
                      <p>Chrome بُک مارک لیٹس بلاک کرتا ہے۔ ایڈریس بار میں <code>javascript:</code> ٹائپ کر کے کاپی شدہ کوڈ paste کریں اور Enter دبائیں۔ آسان متبادل: نیچے دیا گیا <strong>ان-ایپ براؤزر</strong> استعمال کریں۔</p>
                    </div>
                  </div>
                </details>
              </div>
            </details>
          </section>

          {/* Extension */}
          <section className="rounded-xl border border-border bg-card">
            <details>
              <summary className="cursor-pointer p-4 sm:p-5 font-semibold text-lg sm:text-xl">۲۔ اینڈرائیڈ ایکسٹینشن (Kiwi / Firefox)</summary>
              <div className="p-4 sm:p-5 pt-0">
                <p className="text-muted-foreground leading-loose mb-4 text-sm sm:text-base">
                  Kiwi Browser یا Firefox for Android میں ایکسٹینشن انسٹال کر کے ہر سائٹ پر خودکار طور پر نستعلیق فونٹ لگائیں۔
                </p>
                <button
                  onClick={downloadExtension}
                  className="inline-flex items-center justify-center min-h-12 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-bold"
                >
                  ⬇ ایکسٹینشن ڈاؤن لوڈ کریں
                </button>
                <ol className="mt-4 mr-5 list-decimal text-sm text-muted-foreground space-y-1.5 leading-loose">
                  <li>زپ فائل ڈاؤن لوڈ کر کے اَن زپ کریں۔</li>
                  <li>Kiwi Browser میں <code>chrome://extensions</code> کھولیں۔</li>
                  <li>Developer mode آن کریں اور "Load unpacked" دبا کر فولڈر منتخب کریں۔</li>
                  <li>کسی بھی اردو سائٹ پر جا کر ایکسٹینشن کا آئیکن دبائیں۔</li>
                </ol>
              </div>
            </details>
          </section>

          {/* In-app browser */}
          <section className="rounded-xl border border-border bg-card">
            <details>
              <summary className="cursor-pointer p-4 sm:p-5 font-semibold text-lg sm:text-xl">۳۔ ان-ایپ براؤزر</summary>
              <div className="p-4 sm:p-5 pt-0">
                <p className="text-muted-foreground leading-loose mb-4 text-sm sm:text-base">
                  کسی بھی اردو ویب سائٹ کا پتہ درج کریں اور اسے فوراً نستعلیق میں پڑھیں — کوئی انسٹال کی ضرورت نہیں۔
                </p>
                <a
                  href="/browser"
                  className="inline-flex items-center justify-center min-h-12 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-bold no-underline"
                >
                  🌐 ان-ایپ براؤزر کھولیں
                </a>
              </div>
            </details>
          </section>

          <footer className="text-center text-sm text-muted-foreground pt-6 pb-4">
            <p>تمام ٹولز میں فونٹ سائز، سطور کا فاصلہ، فونٹ وزن، ڈارک موڈ اور آن/آف کنٹرول دستیاب ہیں۔</p>
          </footer>
        </main>
      </div>
    </>
  );
}
