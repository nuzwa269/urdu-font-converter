/* Urdu Font Converter — vanilla JS port for WordPress plugin
 * Exposes window.UrduConverter.mount(elementId, config)
 * Requires html2canvas (loaded by the shortcode handler).
 */
(function () {
  if (window.UrduConverter) return;

  var FONTS = [
    { id: "jameel",  name: "جمیل نوری نستعلیق",    family: "'Jameel Noori Nastaleeq'",   css: "https://fonts.cdnfonts.com/css/jameel-noori-nastaleeq", fallback: "'Noto Nastaliq Urdu', serif", download: "https://www.cdnfonts.com/jameel-noori-nastaleeq.font" },
    { id: "alqalam", name: "القلم تاج نستعلیق",    family: "'Alqalam Taj Nastaleeq'",    css: "https://fonts.cdnfonts.com/css/alqalam-taj-nastaleeq",    fallback: "'Noto Nastaliq Urdu', serif", download: "https://www.cdnfonts.com/alqalam-taj-nastaleeq.font" },
    { id: "alvi",    name: "علوی نستعلیق",         family: "'Alvi Nastaleeq'",           css: "https://fonts.cdnfonts.com/css/alvi-nastaleeq",            fallback: "'Noto Nastaliq Urdu', serif", download: "https://www.cdnfonts.com/alvi-nastaleeq.font" },
    { id: "mehr",    name: "مہر نستعلیق",          family: "'Mehr Nastaliq Web'",        css: "https://fonts.googleapis.com/css2?family=Mehr+Nastaliq:wght@400..700&display=swap", fallback: "'Noto Nastaliq Urdu', serif", download: "https://fonts.google.com/specimen/Mehr+Nastaliq" },
    { id: "gulzar",  name: "گلزار",                family: "'Gulzar'",                   css: "https://fonts.googleapis.com/css2?family=Gulzar&display=swap", fallback: "'Noto Nastaliq Urdu', serif", download: "https://fonts.google.com/specimen/Gulzar" },
    { id: "noto",    name: "نوٹو نستعلیق اردو",    family: "'Noto Nastaliq Urdu'",       css: "https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400..700&display=swap", fallback: "serif", download: "https://fonts.google.com/noto/specimen/Noto+Nastaliq+Urdu" },
    { id: "amiri",   name: "امیری (نسخ)",          family: "'Amiri'",                    css: "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap", fallback: "serif", download: "https://fonts.google.com/specimen/Amiri" },
  ];

  var SAMPLE = "اردو زبان کی خوبصورتی نستعلیق خط میں اپنی پوری شان سے جلوہ گر ہوتی ہے۔";

  var PRESETS = [
    { name: "سفید/سادہ", fg: "#111111", bg: "#ffffff" },
    { name: "کریم",      fg: "#3a2a14", bg: "#fdf6e3" },
    { name: "سیاہ",      fg: "#f5f5f5", bg: "#111111" },
    { name: "سنہری",     fg: "#3a2a00", bg: "linear-gradient(135deg,#fde68a,#f59e0b)" },
    { name: "سبز",       fg: "#06281e", bg: "linear-gradient(135deg,#d1fae5,#10b981)" },
    { name: "نیلا",      fg: "#0b1e3a", bg: "linear-gradient(135deg,#dbeafe,#3b82f6)" },
    { name: "گلابی",     fg: "#3b0a2a", bg: "linear-gradient(135deg,#fce7f3,#ec4899)" },
    { name: "ارغوانی",   fg: "#1a0033", bg: "linear-gradient(135deg,#ede9fe,#8b5cf6)" },
    { name: "غروب",      fg: "#2a0a00", bg: "linear-gradient(135deg,#fed7aa,#f97316,#ef4444)" },
    { name: "رات",       fg: "#e6e6ff", bg: "linear-gradient(135deg,#0f172a,#312e81)" },
    { name: "زمرد",      fg: "#f0fff4", bg: "linear-gradient(135deg,#064e3b,#10b981)" },
    { name: "گلاب گولڈ", fg: "#fff0f0", bg: "linear-gradient(135deg,#9d174d,#f59e0b)" },
  ];

  var FRAMES = [
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

  var RATIOS = [
    { id: "free", label: "آزاد" },
    { id: "1:1", label: "1:1" },
    { id: "9:16", label: "9:16" },
    { id: "16:9", label: "16:9" },
    { id: "4:5", label: "4:5" },
    { id: "3:4", label: "3:4" },
    { id: "4:3", label: "4:3" },
  ];

  var DEFAULT_STYLE = {
    fg: "#111111", bg: "#ffffff", size: 22, lineHeight: 1.9,
    bold: false, italic: false, underline: false, align: "right",
    shadow: false, ratio: "free", frame: "none", sentenceBreak: false,
  };

  function splitSentences(s) {
    if (!s) return s;
    return s.replace(/([۔!؟?])\s*/g, "$1\n").replace(/\n{2,}/g, "\n").trim();
  }

  function frameStyle(frame, fg) {
    var c = fg || "#111";
    switch (frame) {
      case "thin":   return { border: "2px solid "+c, borderRadius: "12px" };
      case "thick":  return { border: "6px solid "+c, borderRadius: "14px" };
      case "double": return { border: "6px double "+c, borderRadius: "12px" };
      case "dashed": return { border: "3px dashed "+c, borderRadius: "14px" };
      case "dotted": return { border: "3px dotted "+c, borderRadius: "14px" };
      case "inset":  return { border: "2px solid "+c, outline: "1px solid "+c, outlineOffset: "6px", borderRadius: "10px" };
      case "ornate": return { border: "4px double "+c, boxShadow: "inset 0 0 0 8px transparent, inset 0 0 0 10px "+c, borderRadius: "6px" };
      case "gold":   return { borderRadius: "14px", boxShadow: "0 0 0 3px #fde68a, 0 0 0 6px #b45309, 0 0 0 8px #fde68a" };
      case "shadow": return { borderRadius: "14px", boxShadow: "0 18px 40px -10px "+c+"66, 0 6px 18px "+c+"33" };
      case "ring":   return { borderRadius: "9999px", border: "3px solid "+c };
      case "corners": return {
        borderRadius: "4px",
        backgroundImage:
          "linear-gradient("+c+","+c+"),linear-gradient("+c+","+c+"),linear-gradient("+c+","+c+"),linear-gradient("+c+","+c+")," +
          "linear-gradient("+c+","+c+"),linear-gradient("+c+","+c+"),linear-gradient("+c+","+c+"),linear-gradient("+c+","+c+")",
        backgroundRepeat: "no-repeat",
        backgroundSize: "3px 22px, 22px 3px, 3px 22px, 22px 3px, 3px 22px, 22px 3px, 3px 22px, 22px 3px",
        backgroundPosition: "left top, left top, right top, right top, left bottom, left bottom, right bottom, right bottom",
      };
      case "klasik": return {
        border: "2px solid "+c,
        boxShadow: "inset 0 0 0 6px transparent, inset 0 0 0 7px "+c+", inset 0 0 0 11px transparent, inset 0 0 0 12px "+c,
        borderRadius: "10px",
      };
      case "mughal": return {
        borderRadius: "8px",
        boxShadow:
          "0 0 0 2px #7c2d12, 0 0 0 4px #fde68a, 0 0 0 6px #b45309, " +
          "0 0 0 9px #fde68a, 0 0 0 11px #7c2d12, " +
          "inset 0 0 0 3px #b45309, inset 0 0 0 5px #fde68a",
      };
      case "tazhib": return {
        borderRadius: "12px",
        border: "6px solid transparent",
        backgroundImage: "linear-gradient(currentColor,currentColor), linear-gradient(135deg,#fde68a 0%,#b45309 40%,#fde68a 60%,#92400e 100%)",
        backgroundOrigin: "border-box",
        backgroundClip: "content-box, border-box",
        boxShadow: "inset 0 0 0 2px #92400e",
      };
      case "qitaa": return {
        border: "4px solid "+c,
        boxShadow: "inset 0 0 0 6px transparent, inset 0 0 0 7px "+c,
        borderRadius: "2px",
        backgroundImage:
          "radial-gradient(circle, "+c+" 2.5px, transparent 3px)," +
          "radial-gradient(circle, "+c+" 2.5px, transparent 3px)," +
          "radial-gradient(circle, "+c+" 2.5px, transparent 3px)," +
          "radial-gradient(circle, "+c+" 2.5px, transparent 3px)",
        backgroundRepeat: "no-repeat",
        backgroundSize: "10px 10px",
        backgroundPosition: "10px 10px, calc(100% - 10px) 10px, 10px calc(100% - 10px), calc(100% - 10px) calc(100% - 10px)",
      };
      case "manuscript": return {
        border: "3px double "+c, borderRadius: "6px",
        boxShadow: "inset 0 0 0 8px transparent, inset 0 0 0 9px "+c+"55, 0 8px 24px "+c+"33",
      };
      case "naqsh": return {
        border: "8px solid transparent", borderRadius: "8px",
        backgroundImage:
          "linear-gradient(currentColor,currentColor)," +
          "repeating-linear-gradient(45deg, "+c+" 0 4px, transparent 4px 8px)",
        backgroundOrigin: "border-box", backgroundClip: "content-box, border-box",
      };
      case "minar": return {
        borderTop: "8px solid "+c, borderBottom: "8px solid "+c,
        borderLeft: "2px solid "+c, borderRight: "2px solid "+c,
        boxShadow: "inset 0 0 0 4px transparent, inset 0 0 0 5px "+c,
        borderRadius: "4px",
      };
      case "arabesque": return {
        border: "2px solid "+c, borderRadius: "16px",
        boxShadow:
          "0 0 0 4px #fde68a55, 0 0 0 6px "+c+", " +
          "inset 0 0 0 4px transparent, inset 0 0 0 5px "+c+"55, " +
          "inset 0 0 0 10px transparent, inset 0 0 0 11px "+c,
      };
      default: return {};
    }
  }

  function loadFontCss(href) {
    if (!href) return;
    if (document.querySelector('link[data-uc-font="'+href+'"]')) return;
    var l = document.createElement("link");
    l.rel = "stylesheet"; l.href = href; l.setAttribute("data-uc-font", href);
    document.head.appendChild(l);
  }

  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (k === "class") n.className = attrs[k];
        else if (k === "style" && typeof attrs[k] === "object") Object.assign(n.style, attrs[k]);
        else if (k.indexOf("on") === 0) n.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        else if (k === "html") n.innerHTML = attrs[k];
        else n.setAttribute(k, attrs[k]);
      }
    }
    if (children) {
      (Array.isArray(children) ? children : [children]).forEach(function(c){
        if (c == null) return;
        n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
      });
    }
    return n;
  }

  function applyStyles(node, obj) {
    // reset frame-related inline styles
    var keys = ["border","borderTop","borderBottom","borderLeft","borderRight","borderRadius","boxShadow","outline","outlineOffset","backgroundImage","backgroundRepeat","backgroundSize","backgroundPosition","backgroundOrigin","backgroundClip"];
    keys.forEach(function(k){ node.style[k] = ""; });
    for (var k in obj) node.style[k] = obj[k];
  }

  function mount(elementId, config) {
    var root = document.getElementById(elementId);
    if (!root) return;
    config = config || {};

    // Load all font CSS upfront
    FONTS.forEach(function(f){ loadFontCss(f.css); });

    var state = {
      text: SAMPLE,
      brand: config.defaultBrand || "",
      customFonts: [],
      styles: {},
      activeId: FONTS[0].id,
    };
    FONTS.forEach(function(f){ state.styles[f.id] = Object.assign({}, DEFAULT_STYLE); });

    function allFonts() { return FONTS.concat(state.customFonts); }

    // ---- Build UI shell ----
    root.innerHTML = "";

    // Text input card
    var textArea = el("textarea", { class: "uc-textarea", dir: "rtl", rows: "3", placeholder: "اپنا اردو متن یہاں لکھیں…" });
    textArea.value = state.text;
    textArea.addEventListener("input", function(){ state.text = textArea.value; rerenderPreviews(); });

    var brandInput = el("input", { class: "uc-input", dir: "rtl", maxlength: "60", placeholder: "اختیاری — اپنا نام یا برانڈ" });
    brandInput.value = state.brand;
    brandInput.addEventListener("input", function(){ state.brand = brandInput.value; rerenderPreviews(); });

    var fileInput = el("input", { type: "file", accept: ".ttf,.otf,.woff,.woff2", multiple: "true", style: { display: "none" } });
    var uploadBtn = el("button", { class: "uc-btn", type: "button", onclick: function(){ fileInput.click(); } }, "⬆ اپنا فونٹ اپ لوڈ کریں");
    var uploadHint = el("div", { class: "uc-hint" }, "TTF, OTF, WOFF, WOFF2 — صرف آپ کے براؤزر میں شامل ہوگا، اپ لوڈ نہیں ہوگا۔");
    var uploadError = el("div", { class: "uc-error", style: { display: "none" } });

    fileInput.addEventListener("change", function(){
      handleFontUpload(fileInput.files);
    });

    function handleFontUpload(files) {
      if (!files || !files.length) return;
      uploadError.style.display = "none"; uploadError.textContent = "";
      var promises = [];
      Array.prototype.forEach.call(files, function(file){
        var ext = (file.name.split(".").pop() || "").toLowerCase();
        if (["ttf","otf","woff","woff2"].indexOf(ext) === -1) {
          uploadError.textContent = "صرف TTF, OTF, WOFF, WOFF2 فائلز قابل قبول ہیں";
          uploadError.style.display = "block";
          return;
        }
        var p = file.arrayBuffer().then(function(buf){
          var base = file.name.replace(/\.(ttf|otf|woff2?)$/i, "");
          var id = "custom-" + Date.now() + "-" + Math.random().toString(36).slice(2,7);
          var family = "UserFont_" + id.replace(/-/g,"_");
          var face = new FontFace(family, buf);
          return face.load().then(function(loaded){
            document.fonts.add(loaded);
            var f = { id: id, name: base, family: "'"+family+"'", fallback: "'Noto Nastaliq Urdu', serif" };
            state.customFonts.push(f);
            state.styles[id] = Object.assign({}, DEFAULT_STYLE);
            return f;
          });
        }).catch(function(e){
          console.error(e);
          uploadError.textContent = "فونٹ لوڈ نہیں ہو سکا: " + file.name;
          uploadError.style.display = "block";
        });
        promises.push(p);
      });
      Promise.all(promises).then(function(added){
        var last = added.filter(Boolean).pop();
        if (last) state.activeId = last.id;
        renderAll();
      });
      fileInput.value = "";
    }

    var inputCard = el("div", { class: "uc-card" }, [
      el("div", { class: "uc-label" }, "متن"),
      textArea,
      el("div", { class: "uc-label", style: { marginTop: "10px" } }, "اپنا نام / برانڈ (اختیاری)"),
      brandInput,
      el("div", { class: "uc-row", style: { marginTop: "10px" } }, [ uploadBtn, fileInput ]),
      uploadHint, uploadError,
    ]);
    root.appendChild(inputCard);

    // Cards container
    var grid = el("div", { class: "uc-grid" });
    root.appendChild(grid);

    var cardRefs = {}; // id -> { card, preview, content, controls }

    function buildCard(font) {
      var card = el("div", { class: "uc-card" });
      var header = el("div", { class: "uc-row between" }, [
        el("strong", null, font.name),
        el("div", { class: "uc-row" }, [
          el("button", { class: "uc-btn sm", type: "button", title: "رینڈم ڈیزائن", onclick: function(){ randomDesign(font.id); } }, "🎲"),
          el("button", { class: "uc-btn sm" + (state.activeId === font.id ? " active" : ""), type: "button", "data-act": "edit", onclick: function(){ state.activeId = font.id; renderAll(); } }, state.activeId === font.id ? "✓ منتخب" : "ایڈٹ"),
        ]),
      ]);

      var preview = el("div", { class: "uc-preview" });
      var content = el("div", { style: { width: "100%", wordBreak: "break-word", overflowWrap: "anywhere", whiteSpace: "pre-wrap" } });
      preview.appendChild(content);

      var actions = el("div", { class: "uc-row", style: { marginTop: "10px" } }, [
        el("button", { class: "uc-btn primary", type: "button", onclick: function(){ downloadPng(font); } }, "⬇ PNG ڈاؤن لوڈ"),
        el("button", { class: "uc-btn", type: "button", onclick: function(){ copyStyled(font); } }, "📋 کاپی"),
        font.download ? el("a", { class: "uc-btn", href: font.download, target: "_blank", rel: "noopener" }, "فونٹ ڈاؤن لوڈ") : null,
        font.id.indexOf("custom-") === 0 ? el("button", { class: "uc-btn", type: "button", onclick: function(){ removeCustomFont(font.id); } }, "🗑 ہٹائیں") : null,
      ]);

      var controls = el("div", { style: { display: "none", borderTop: "1px solid #e5e7eb", marginTop: "12px", paddingTop: "12px" } });
      buildControls(controls, font);

      card.appendChild(header);
      card.appendChild(preview);
      card.appendChild(actions);
      card.appendChild(controls);
      cardRefs[font.id] = { card: card, preview: preview, content: content, controls: controls };
      return card;
    }

    function buildControls(container, font) {
      container.innerHTML = "";
      var st = state.styles[font.id];

      // presets
      var presetsLabel = el("div", { class: "uc-label" }, "تیار رنگ پیکجز");
      var presetsRow = el("div", { class: "uc-scroll" });
      PRESETS.forEach(function(p){
        var sw = el("button", { class: "uc-swatch" + (st.fg === p.fg && st.bg === p.bg ? " active" : ""), type: "button", title: p.name, onclick: function(){
          st.fg = p.fg; st.bg = p.bg; rerenderCard(font.id); buildControls(container, font);
        }});
        sw.style.background = p.bg;
        presetsRow.appendChild(sw);
      });

      // colors
      var fgInput = el("input", { type: "color", value: st.fg, style: { width: "44px", height: "36px", border: "none", background: "transparent" } });
      fgInput.addEventListener("input", function(){ st.fg = fgInput.value; rerenderCard(font.id); });
      var bgInput = el("input", { type: "color", value: typeof st.bg === "string" && st.bg.charAt(0) === "#" ? st.bg : "#ffffff", style: { width: "44px", height: "36px", border: "none", background: "transparent" } });
      bgInput.addEventListener("input", function(){ st.bg = bgInput.value; rerenderCard(font.id); buildControls(container, font); });

      var colorsRow = el("div", { class: "uc-row" }, [
        el("label", { class: "uc-toggle" }, [ el("span", null, "متن:"), fgInput ]),
        el("label", { class: "uc-toggle" }, [ el("span", null, "پس منظر:"), bgInput ]),
      ]);

      // size + lineHeight
      var sizeRange = el("input", { type: "range", min: "12", max: "72", step: "1", value: st.size, class: "uc-range" });
      sizeRange.addEventListener("input", function(){ st.size = +sizeRange.value; rerenderCard(font.id); sizeShow.textContent = st.size+"px"; });
      var sizeShow = el("span", null, st.size+"px");

      var lhRange = el("input", { type: "range", min: "1", max: "3.2", step: "0.1", value: st.lineHeight, class: "uc-range" });
      lhRange.addEventListener("input", function(){ st.lineHeight = +lhRange.value; rerenderCard(font.id); lhShow.textContent = st.lineHeight.toFixed(1); });
      var lhShow = el("span", null, st.lineHeight.toFixed(1));

      // style toggles
      function styleBtn(label, key) {
        var b = el("button", { class: "uc-btn sm" + (st[key] ? " active" : ""), type: "button", onclick: function(){
          st[key] = !st[key]; rerenderCard(font.id); b.className = "uc-btn sm" + (st[key] ? " active" : "");
        }}, label);
        return b;
      }
      function alignBtn(label, val) {
        var b = el("button", { class: "uc-btn sm" + (st.align === val ? " active" : ""), type: "button", onclick: function(){
          st.align = val; rerenderCard(font.id); buildControls(container, font);
        }}, label);
        return b;
      }

      // ratio
      var ratioRow = el("div", { class: "uc-scroll" });
      RATIOS.forEach(function(r){
        ratioRow.appendChild(el("button", { class: "uc-btn sm" + (st.ratio === r.id ? " active" : ""), type: "button", onclick: function(){
          st.ratio = r.id; rerenderCard(font.id); buildControls(container, font);
        }}, r.label));
      });

      // frame
      var frameRow = el("div", { class: "uc-scroll" });
      FRAMES.forEach(function(fr){
        var chip = el("div", { class: "uc-frame-chip" + (st.frame === fr.id ? " active" : ""), onclick: function(){
          st.frame = fr.id; rerenderCard(font.id); buildControls(container, font);
        }}, fr.label);
        chip.style.color = st.fg;
        chip.style.background = typeof st.bg === "string" ? st.bg : "#fff";
        applyStyles(chip, Object.assign({ width: "64px", height: "44px" }, frameStyle(fr.id, st.fg)));
        chip.style.display = "flex";
        chip.style.alignItems = "center";
        chip.style.justifyContent = "center";
        frameRow.appendChild(chip);
      });

      // sentence break
      var sbToggle = el("label", { class: "uc-toggle" }, [
        (function(){ var c = el("input", { type: "checkbox" }); c.checked = st.sentenceBreak; c.addEventListener("change", function(){ st.sentenceBreak = c.checked; rerenderCard(font.id); }); return c; })(),
        el("span", null, "ہر جملے کے بعد نئی سطر"),
      ]);

      container.style.display = "block";
      container.appendChild(presetsLabel);
      container.appendChild(presetsRow);
      container.appendChild(el("div", { class: "uc-label", style: { marginTop: "10px" } }, "کسٹم رنگ"));
      container.appendChild(colorsRow);
      container.appendChild(el("div", { class: "uc-label", style: { marginTop: "10px" } }, "فونٹ سائز"));
      container.appendChild(el("div", { class: "uc-row" }, [ sizeRange, sizeShow ]));
      container.appendChild(el("div", { class: "uc-label", style: { marginTop: "10px" } }, "لائن ہائٹ"));
      container.appendChild(el("div", { class: "uc-row" }, [ lhRange, lhShow ]));
      container.appendChild(el("div", { class: "uc-label", style: { marginTop: "10px" } }, "اسٹائل"));
      container.appendChild(el("div", { class: "uc-row" }, [
        styleBtn("B", "bold"), styleBtn("I", "italic"), styleBtn("U", "underline"), styleBtn("سایہ", "shadow"),
        alignBtn("→", "right"), alignBtn("≡", "center"), alignBtn("←", "left"),
      ]));
      container.appendChild(el("div", { class: "uc-label", style: { marginTop: "10px" } }, "کارڈ سائز (ریشو)"));
      container.appendChild(ratioRow);
      container.appendChild(el("div", { class: "uc-label", style: { marginTop: "10px" } }, "فریم"));
      container.appendChild(frameRow);
      container.appendChild(el("div", { style: { marginTop: "10px" } }, sbToggle));
    }

    function rerenderCard(id) {
      var font = allFonts().filter(function(f){ return f.id === id; })[0];
      if (!font) return;
      var ref = cardRefs[id];
      if (!ref) return;
      var st = state.styles[id];

      var stack = font.family + ", " + (font.fallback || "serif");
      var fs = frameStyle(st.frame, st.fg);
      var prev = ref.preview;
      prev.style.fontFamily = stack;
      prev.style.fontSize = st.size + "px";
      prev.style.lineHeight = st.lineHeight;
      prev.style.color = st.fg;
      prev.style.background = st.bg;
      prev.style.fontWeight = st.bold ? 700 : 400;
      prev.style.fontStyle = st.italic ? "italic" : "normal";
      prev.style.textDecoration = st.underline ? "underline" : "none";
      prev.style.textShadow = st.shadow ? "0 2px 8px rgba(0,0,0,0.35)" : "none";
      prev.style.minHeight = st.ratio === "free" ? "140px" : "";
      prev.style.aspectRatio = st.ratio === "free" ? "" : st.ratio.replace(":", " / ");
      prev.style.justifyContent = st.align === "right" ? "flex-end" : st.align === "left" ? "flex-start" : "center";
      applyStyles(prev, Object.assign({
        fontFamily: stack, fontSize: st.size+"px", lineHeight: st.lineHeight,
        color: st.fg, background: st.bg,
        fontWeight: st.bold ? 700 : 400, fontStyle: st.italic ? "italic" : "normal",
        textDecoration: st.underline ? "underline" : "none",
        textShadow: st.shadow ? "0 2px 8px rgba(0,0,0,0.35)" : "none",
        minHeight: st.ratio === "free" ? "140px" : "",
        aspectRatio: st.ratio === "free" ? "" : st.ratio.replace(":", " / "),
        alignItems: "center",
        justifyContent: st.align === "right" ? "flex-end" : st.align === "left" ? "flex-start" : "center",
        padding: "20px", display: "flex", overflow: "hidden",
      }, fs));

      // text content
      ref.content.style.textAlign = st.align;
      var txt = st.sentenceBreak ? splitSentences(state.text || SAMPLE) : (state.text || SAMPLE);
      ref.content.textContent = txt;
      if (state.brand && state.brand.trim()) {
        var brandDiv = document.createElement("div");
        brandDiv.style.marginTop = Math.max(12, st.size * 0.8) + "px";
        brandDiv.style.fontSize = Math.max(11, Math.round(st.size * 0.45)) + "px";
        brandDiv.style.opacity = "0.75";
        brandDiv.style.fontWeight = "600";
        brandDiv.style.letterSpacing = "0.3px";
        brandDiv.textContent = state.brand.trim();
        ref.content.appendChild(brandDiv);
      }
    }

    function rerenderPreviews() {
      allFonts().forEach(function(f){ rerenderCard(f.id); });
    }

    function renderAll() {
      grid.innerHTML = "";
      cardRefs = {};
      allFonts().forEach(function(f){
        grid.appendChild(buildCard(f));
        rerenderCard(f.id);
        if (state.activeId === f.id) buildControls(cardRefs[f.id].controls, f);
      });
    }

    function randomDesign(id) {
      var st = state.styles[id];
      var p = PRESETS[Math.floor(Math.random()*PRESETS.length)];
      var sizes = [24,28,32,36,40,44];
      var lhs = [1.8,2.0,2.2,2.4,2.6];
      st.fg = p.fg; st.bg = p.bg;
      st.size = sizes[Math.floor(Math.random()*sizes.length)];
      st.lineHeight = lhs[Math.floor(Math.random()*lhs.length)];
      st.bold = Math.random() > 0.5;
      st.underline = Math.random() > 0.7;
      st.align = Math.random() > 0.5 ? "right" : "center";
      st.shadow = Math.random() > 0.5;
      st.frame = FRAMES[Math.floor(Math.random()*FRAMES.length)].id;
      rerenderCard(id);
      if (state.activeId === id) buildControls(cardRefs[id].controls, allFonts().filter(function(f){ return f.id === id; })[0]);
    }

    function removeCustomFont(id) {
      state.customFonts = state.customFonts.filter(function(f){ return f.id !== id; });
      delete state.styles[id];
      if (state.activeId === id) state.activeId = FONTS[0].id;
      renderAll();
    }

    function copyStyled(font) {
      var st = state.styles[font.id];
      var fam = font.family + ", " + (font.fallback || "serif");
      var txt = state.text || SAMPLE;
      var html = '<div dir="rtl" style="font-family:'+fam+';font-size:'+st.size+'px;line-height:'+st.lineHeight+';color:'+st.fg+';font-weight:'+(st.bold?700:400)+';font-style:'+(st.italic?"italic":"normal")+';text-decoration:'+(st.underline?"underline":"none")+';text-align:'+st.align+';">'+txt.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\n/g,"<br>")+'</div>';
      try {
        if (window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
          var item = new window.ClipboardItem({
            "text/html": new Blob([html], { type: "text/html" }),
            "text/plain": new Blob([txt], { type: "text/plain" }),
          });
          navigator.clipboard.write([item]).then(function(){ alert("متن کاپی ہو گیا"); }, function(){
            navigator.clipboard.writeText(txt).then(function(){ alert("متن کاپی ہو گیا"); });
          });
        } else {
          navigator.clipboard.writeText(txt).then(function(){ alert("متن کاپی ہو گیا"); });
        }
      } catch (e) { alert("کاپی نہیں ہو سکا"); }
    }

    function downloadPng(font) {
      if (!window.html2canvas) { alert("html2canvas دستیاب نہیں"); return; }
      var ref = cardRefs[font.id];
      if (!ref) return;
      var node = ref.preview;
      // ensure font loaded
      var family = font.family.replace(/^'|'$/g, "");
      var st = state.styles[font.id];
      var ready = document.fonts && document.fonts.load
        ? document.fonts.load(st.size+'px "'+family+'"', state.text || SAMPLE).catch(function(){})
        : Promise.resolve();
      ready.then(function(){
        return window.html2canvas(node, { scale: Math.max(2, window.devicePixelRatio || 1), useCORS: true, backgroundColor: null });
      }).then(function(canvas){
        var a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = "urdu-"+font.id+".png";
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
      }).catch(function(e){ console.error(e); alert("PNG ڈاؤن لوڈ میں مسئلہ آیا"); });
    }

    renderAll();
  }

  window.UrduConverter = { mount: mount };
})();