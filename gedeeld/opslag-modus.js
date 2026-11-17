"use strict";

// Controlemodus: niets wordt blijvend bewaard. Alle opslag (localStorage en
// sessionStorage) gaat dan naar een tijdelijke opslag die alleen in dit
// tabblad bestaat en verdwijnt zodra het tabblad wordt gesloten. Dit script
// moet als eerste script op elke pagina worden geladen.

const CONTROL_MODE_FLAG = "box3-controlemodus";
const CONTROL_PREFIX = "box3-controle:";
const realLocalStorage = window.localStorage;
const realSessionStorage = window.sessionStorage;

function isControlMode() {
  try {
    return realSessionStorage.getItem(CONTROL_MODE_FLAG) === "aan";
  } catch {
    return false;
  }
}

function createControlStorage() {
  const prefixedKeys = () => {
    const keys = [];
    for (let index = 0; index < realSessionStorage.length; index += 1) {
      const key = realSessionStorage.key(index);
      if (key && key.startsWith(CONTROL_PREFIX)) keys.push(key.slice(CONTROL_PREFIX.length));
    }
    return keys;
  };
  return {
    getItem: (key) => realSessionStorage.getItem(CONTROL_PREFIX + key),
    setItem: (key, value) => realSessionStorage.setItem(CONTROL_PREFIX + key, String(value)),
    removeItem: (key) => realSessionStorage.removeItem(CONTROL_PREFIX + key),
    key: (index) => prefixedKeys()[index] ?? null,
    clear: () => prefixedKeys().forEach((key) => realSessionStorage.removeItem(CONTROL_PREFIX + key)),
    get length() {
      return prefixedKeys().length;
    },
  };
}

if (isControlMode()) {
  const controlStorage = createControlStorage();
  Object.defineProperty(window, "localStorage", { configurable: true, get: () => controlStorage });
  Object.defineProperty(window, "sessionStorage", { configurable: true, get: () => controlStorage });
}

function removeControlData() {
  const keys = [];
  for (let index = 0; index < realSessionStorage.length; index += 1) {
    const key = realSessionStorage.key(index);
    if (key && key.startsWith(CONTROL_PREFIX)) keys.push(key);
  }
  keys.forEach((key) => realSessionStorage.removeItem(key));
}

function removeAllToolData() {
  if (isControlMode()) {
    removeControlData();
    return;
  }
  for (const storage of [realLocalStorage, realSessionStorage]) {
    const keys = [];
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (key && key.startsWith("box3") && key !== CONTROL_MODE_FLAG) keys.push(key);
    }
    keys.forEach((key) => storage.removeItem(key));
  }
}

function renderStorageControls() {
  const topbar = document.querySelector(".topbar");
  if (!topbar) return;
  const controlMode = isControlMode();
  document.documentElement.dataset.controlMode = controlMode ? "aan" : "uit";

  const controls = document.createElement("div");
  controls.className = "storage-controls";

  const toggle = document.createElement("label");
  toggle.className = "control-mode-toggle";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = controlMode;
  checkbox.id = "control-mode-toggle";
  const text = document.createElement("span");
  text.textContent = "Controlemodus (niets opslaan)";
  toggle.append(checkbox, text);
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      realSessionStorage.setItem(CONTROL_MODE_FLAG, "aan");
    } else {
      if (!window.confirm("Controlemodus uitzetten? Alle gegevens die u in de controlemodus hebt ingevoerd, worden gewist.")) {
        checkbox.checked = true;
        return;
      }
      removeControlData();
      realSessionStorage.removeItem(CONTROL_MODE_FLAG);
    }
    window.location.reload();
  });

  const clear = document.createElement("button");
  clear.type = "button";
  clear.className = "secondary-button clear-data-button";
  clear.id = "clear-all-data";
  clear.textContent = "Alle gegevens wissen";
  clear.addEventListener("click", () => {
    const message = controlMode
      ? "Alle gegevens van deze controle wissen?"
      : "Alle opgeslagen gegevens van de rekentool wissen, voor alle belastingjaren? Dit kan niet ongedaan worden gemaakt.";
    if (!window.confirm(message)) return;
    removeAllToolData();
    window.location.reload();
  });

  controls.append(toggle, clear);
  const label = topbar.querySelector(".topbar-label");
  if (label) label.before(controls);
  else topbar.append(controls);

  if (controlMode) {
    const banner = document.createElement("p");
    banner.className = "control-mode-banner";
    banner.setAttribute("role", "status");
    banner.textContent =
      "Controlemodus: er wordt niets blijvend opgeslagen. De invoer verdwijnt als u dit tabblad sluit of op ‘Alle gegevens wissen’ klikt. Vul geen namen, BSN, rekeningnummers of adressen in.";
    topbar.after(banner);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderStorageControls);
} else {
  renderStorageControls();
}
