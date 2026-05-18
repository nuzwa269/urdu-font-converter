## مقصد
آپ کی موجودہ ایپ کو ایک مکمل WordPress پلگ ان میں تبدیل کرنا، تاکہ کوئی بھی WP سائٹ مالک اسے انسٹال کر کے استعمال کر سکے۔

## پلگ ان کا ڈھانچہ

```text
wordpress-plugin/urdu-tools/
├── urdu-tools.php              ← مین پلگ ان فائل (header + bootstrap)
├── readme.txt                  ← WP.org سٹائل readme
├── includes/
│   ├── class-settings.php      ← Admin settings page
│   ├── class-shortcode.php     ← [urdu_converter] shortcode
│   └── class-block.php         ← Gutenberg block رجسٹریشن
├── assets/
│   ├── nastaleeq.js            ← public/nastaleeq.js کی کاپی (فلوٹنگ پینل)
│   ├── converter.js            ← Font Converter (vanilla JS، نیچے دیکھیں)
│   ├── converter.css           ← کنورٹر کی سٹائلنگ
│   └── icon.svg
└── languages/
    └── urdu-tools.pot          ← ترجمے کے لیے
```

ساتھ ہی `/mnt/documents/urdu-tools.zip` بنا کر دیں گے — جسے آپ WP Admin → Plugins → Add New → Upload سے انسٹال کر سکیں۔

## فیچرز کی تفصیل

### 1. نستعلیق ٹول (فلوٹنگ پینل)
- `public/nastaleeq.js` کو من و عن استعمال کریں گے۔
- `wp_enqueue_scripts` hook کے ذریعے فرنٹ‌اینڈ پر inject ہوگا (اگر admin نے فعال کیا)۔
- Admin settings میں: ٹول on/off، صرف لاگ ان یوزرز کے لیے، یا سب کے لیے۔

### 2. Urdu Font Converter (shortcode + block)
- موجودہ `src/routes/converter.tsx` (React + TanStack) کو WordPress میں چلانا غیر عملی ہے (پورا framework لوڈ کرنا پڑے گا)۔
- بہترین حل: کنورٹر کی منطق کو **vanilla JS + ایک HTML template** میں دوبارہ لکھیں — وہی FONTS array، PRESETS، FRAMES، brand field، PNG ڈاؤن لوڈ (html-to-image کی جگہ `html2canvas` CDN استعمال کریں گے جو WP میں عام ہے)۔
- استعمال: کوئی بھی پیج/پوسٹ میں `[urdu_converter]` ڈالے، یا Gutenberg block منتخب کرے۔
- Block: `block.json` کے ساتھ سادہ ServerSideRender جو shortcode کو wrap کرے۔

### 3. Admin Settings Page
- مینیو: **Settings → اردو ٹولز**
- آپشنز:
  - نستعلیق فلوٹنگ پینل فعال/غیر فعال
  - ڈیفالٹ فونٹ سائز، لائن ہائٹ، وزن
  - کنورٹر کے لیے ڈیفالٹ برانڈ ٹیکسٹ
  - کن پیج types پر inject ہو (posts/pages/all)
- `register_setting()` + `Settings API` استعمال ہوگی، تمام ویلیوز sanitized۔

## ٹیکنیکل نوٹس

- **منطق کا اشتراک**: Font Converter کی FONTS, PRESETS, FRAMES arrays کو ایک ہی `converter.js` میں نکالیں گے تاکہ مستقبل میں React اور WP plugin دونوں ایک ہی source سے update ہوں (لیکن فی الحال کاپی کرنا کافی ہے)۔
- **Security**: تمام admin inputs `sanitize_text_field()`، nonce verification، capability check (`manage_options`)۔
- **Performance**: کنورٹر کی JS صرف اس صفحے پر لوڈ ہوگی جس میں shortcode موجود ہو (`has_shortcode()` چیک)۔
- **i18n**: تمام strings `__('...', 'urdu-tools')` کے اندر۔
- **PNG download**: `html2canvas` کو CDN سے یا bundle کر کے assets میں شامل کریں گے۔
- **Compatibility**: PHP 7.4+، WordPress 6.0+۔

## ڈیلیوریبلز
1. ریپو میں نیا `wordpress-plugin/urdu-tools/` فولڈر مکمل سورس کے ساتھ۔
2. `/mnt/documents/urdu-tools.zip` — انسٹالیشن کے لیے تیار ZIP۔
3. مختصر انسٹالیشن گائیڈ (چیٹ میں)۔

## محدودیتیں (آگاہی)
- React ایپ کی بالکل ویسی smoothness نہیں ہوگی (vanilla JS rewrite)؛ تاہم تمام فیچرز موجود ہوں گے۔
- Browser/Proxy فیچر شامل نہیں (آپ نے منتخب نہیں کیا)۔
- پلگ ان WP.org پر شائع کرنے کے لیے اضافی review process درکار ہوگا — یہاں صرف self-hosted انسٹال کے لیے تیار ہے۔
