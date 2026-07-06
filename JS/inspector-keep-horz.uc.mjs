// ==UserScript==
// @name           inspector-keep-horz
// @description    Lock devtools inspector orientation, toolbar button to flip it
// @onlyonce
// ==/UserScript==

const PREF = "userchrome.inspector.vert";

const { DevToolsShim } = ChromeUtils.importESModule(
  "chrome://devtools-startup/content/DevToolsShim.sys.mjs"
);

const isVert = () => Services.prefs.getBoolPref(PREF, false);

DevToolsShim.on("toolbox-ready", async toolbox => {
  const inspector = await toolbox.getPanelWhenReady("inspector");
  const splitBox = inspector.splitBox;
  if (!splitBox) {
    return;
  }

  // inspector resize handler calls setState({ vert: width > threshold }); pin it to the pref
  const setState = splitBox.setState.bind(splitBox);
  splitBox.setState = (state, callback) => {
    if (state && typeof state === "object" && "vert" in state) {
      state = { ...state, vert: isVert() };
    }
    return setState(state, callback);
  };
  splitBox.setState({ vert: isVert() });

  const doc = inspector.panelDoc;
  const button = doc.createElement("button");
  button.id = "uc-split-orientation-toggle";
  button.className = "devtools-button";
  button.title = "Toggle inspector split orientation";
  button.setAttribute("aria-pressed", isVert());
  button.addEventListener("click", () => {
    Services.prefs.setBoolPref(PREF, !isVert());
    button.setAttribute("aria-pressed", isVert());
    splitBox.setState({ vert: isVert() });
  });

  const style = doc.createElement("style");
  style.textContent = `
    #uc-split-orientation-toggle::before {
      background-image: url("chrome://devtools/skin/images/dock-bottom.svg");
    }
    #uc-split-orientation-toggle[aria-pressed="true"]::before {
      background-image: url("chrome://devtools/skin/images/dock-side-right.svg");
    }
  `;
  doc.head.appendChild(style);
  doc.getElementById("inspector-toolbar").appendChild(button);
});
