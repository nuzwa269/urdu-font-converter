/* Loader injected by the bookmarklet. Fetches the main script. */
(function(){
  var s = document.createElement("script");
  s.src = (window.__NASTALEEQ_BASE__ || "") + "/nastaleeq.js?v=" + Date.now();
  document.body.appendChild(s);
})();
