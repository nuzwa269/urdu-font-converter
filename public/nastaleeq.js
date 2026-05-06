/* Urdu Nastaleeq Tool - injectable script
 * Used by bookmarklet, extension content script, and proxy injection.
 */
(function () {
  if (window.__NASTALEEQ_TOOL__) {
    window.__NASTALEEQ_TOOL__.toggle();
    return;
  }

  var STORAGE_KEY = "nastaleeq_settings_v1";
  var FONT_CSS = "https://fonts.cdnfonts.com/css/jameel-noori-nastaleeq";
  var STYLE_ID = "nastaleeq-tool-style";
  var PANEL_ID = "nastaleeq-tool-panel";
  var FAB_ID = "nastaleeq-tool-fab";

  var defaults = {
    enabled: true,
    size: 120, // %
    lineHeight: 200, // %
    weight: 400,
    dark: false,
  };

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return Object.assign({}, defaults);
      return Object.assign({}, defaults, JSON.parse(raw));
    } catch (e) {
      return Object.assign({}, defaults);
    }
  }
  function save(s) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {}
  }

  var settings = load();

  // Inject font stylesheet once
  if (!document.getElementById("nastaleeq-tool-font")) {
    var link = document.createElement("link");
    link.id = "nastaleeq-tool-font";
    link.rel = "stylesheet";
    link.href = FONT_CSS;
    document.head.appendChild(link);
  }

  function buildCSS(s) {
    if (!s.enabled) return "";
    var css = "" +
      "html, body, body *:not(#" + PANEL_ID + "):not(#" + PANEL_ID + " *):not(#" + FAB_ID + "):not(#" + FAB_ID + " *) {" +
        "font-family: 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif !important;" +
        "font-size: " + s.size + "% !important;" +
        "line-height: " + (s.lineHeight / 100) + " !important;" +
        "font-weight: " + s.weight + " !important;" +
      "}";
    if (s.dark) {
      css += "html, body { background: #111 !important; color: #f5f5f5 !important; }" +
             "body *:not(#" + PANEL_ID + "):not(#" + PANEL_ID + " *):not(#" + FAB_ID + "):not(#" + FAB_ID + " *) {" +
             "background-color: transparent !important; color: #f5f5f5 !important; border-color: #333 !important;" +
             "}";
    }
    return css;
  }

  function applyStyle() {
    var el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement("style");
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent = buildCSS(settings);
  }

  function buildPanel() {
    var p = document.createElement("div");
    p.id = PANEL_ID;
    p.dir = "rtl";
    p.style.cssText = [
      "position:fixed","bottom:80px","right:12px","left:12px","z-index:2147483647",
      "background:#fff","color:#111","border-radius:14px","padding:14px",
      "box-shadow:0 10px 40px rgba(0,0,0,.25)","font-family:system-ui,-apple-system,sans-serif",
      "font-size:14px","display:none","max-width:420px","margin:0 auto"
    ].join(";");

    p.innerHTML = '\
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">\
        <strong>اردو نستعلیق ٹول</strong>\
        <button data-act="close" style="background:none;border:none;font-size:20px;cursor:pointer">×</button>\
      </div>\
      <label style="display:flex;justify-content:space-between;align-items:center;margin:8px 0">\
        <span>ٹول فعال</span>\
        <input type="checkbox" data-act="enabled">\
      </label>\
      <div style="margin:10px 0">\
        <div style="display:flex;justify-content:space-between"><span>فونٹ سائز</span><span data-show="size"></span></div>\
        <input type="range" min="80" max="220" step="5" data-act="size" style="width:100%">\
      </div>\
      <div style="margin:10px 0">\
        <div style="display:flex;justify-content:space-between"><span>سطور کا فاصلہ</span><span data-show="lineHeight"></span></div>\
        <input type="range" min="120" max="320" step="10" data-act="lineHeight" style="width:100%">\
      </div>\
      <div style="margin:10px 0">\
        <div style="display:flex;justify-content:space-between"><span>فونٹ وزن</span><span data-show="weight"></span></div>\
        <input type="range" min="300" max="800" step="100" data-act="weight" style="width:100%">\
      </div>\
      <label style="display:flex;justify-content:space-between;align-items:center;margin:8px 0">\
        <span>ڈارک موڈ</span>\
        <input type="checkbox" data-act="dark">\
      </label>\
      <div style="display:flex;gap:8px;margin-top:10px">\
        <button data-act="reset" style="flex:1;padding:10px;border-radius:8px;border:1px solid #ddd;background:#f5f5f5">ری سیٹ</button>\
        <button data-act="hide" style="flex:1;padding:10px;border-radius:8px;border:none;background:#0a7;color:#fff">بند کریں</button>\
      </div>';
    document.body.appendChild(p);

    function refresh() {
      p.querySelector('[data-act="enabled"]').checked = settings.enabled;
      p.querySelector('[data-act="dark"]').checked = settings.dark;
      ["size","lineHeight","weight"].forEach(function(k){
        p.querySelector('[data-act="'+k+'"]').value = settings[k];
        var s = p.querySelector('[data-show="'+k+'"]');
        if (s) s.textContent = settings[k] + (k==="weight" ? "" : "%");
      });
    }
    refresh();

    p.addEventListener("input", function(e){
      var t = e.target; var k = t.getAttribute("data-act"); if (!k) return;
      if (t.type === "checkbox") settings[k] = t.checked;
      else if (t.type === "range") settings[k] = +t.value;
      save(settings); applyStyle(); refresh();
    });
    p.addEventListener("click", function(e){
      var k = e.target.getAttribute && e.target.getAttribute("data-act");
      if (k === "close" || k === "hide") p.style.display = "none";
      else if (k === "reset") { settings = Object.assign({}, defaults); save(settings); applyStyle(); refresh(); }
    });
    return p;
  }

  function buildFab() {
    var b = document.createElement("button");
    b.id = FAB_ID;
    b.textContent = "ن";
    b.title = "اردو نستعلیق ٹول";
    b.style.cssText = [
      "position:fixed","bottom:16px","right:16px","z-index:2147483647",
      "width:52px","height:52px","border-radius:50%","border:none",
      "background:#0a7","color:#fff","font-size:24px","font-weight:bold",
      "box-shadow:0 6px 20px rgba(0,0,0,.3)","cursor:pointer",
      "font-family:'Jameel Noori Nastaleeq','Noto Nastaliq Urdu',serif"
    ].join(";");
    document.body.appendChild(b);
    return b;
  }

  applyStyle();
  var panel = buildPanel();
  var fab = buildFab();
  fab.addEventListener("click", function(){
    panel.style.display = panel.style.display === "none" ? "block" : "none";
  });

  window.__NASTALEEQ_TOOL__ = {
    toggle: function(){ panel.style.display = panel.style.display === "none" ? "block" : "none"; },
    settings: settings,
  };
})();
