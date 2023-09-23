function injectScriptSync(src) {
  const script = document.createElement("script");
  script.src = src;
  script.onload = function () {
    script.remove();
  };
  document.documentElement.appendChild(script);
}

injectScriptSync(chrome.runtime.getURL("script.js"));
