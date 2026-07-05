// ==UserScript==
// @name           Pinned Extensions Panel
// @description    Nav-bar button that opens a panel extension buttons can be pinned to
// ==/UserScript==

(function () {
  const { CustomizableUI } = ChromeUtils.importESModule(
    "moz-src:///browser/components/customizableui/CustomizableUI.sys.mjs"
  );
  const { PanelMultiView } = ChromeUtils.importESModule(
    "moz-src:///browser/components/customizableui/PanelMultiView.sys.mjs"
  );

  const CONFIG = {
    buttonId: "uc-ext-panel-button",
    areaId: "uc-pinned-extensions",
    panelId: "uc-ext-panel",
    viewId: "uc-ext-panel-view",
    label: "Pinned extensions",
    icon: "chrome://mozapps/skin/extensions/extension.svg",
    position: "bottomright topright",
    // extension action widget ids to place in the panel on first run
    // e.g. "ublock0_raymondhill_net-browser-action"
    pinned: [],
  };

  registerGlobals();
  UC_API.Windows.waitWindowLoading(window).then(buildForWindow);

  // panel area + opener button are global to CustomizableUI, register once
  function registerGlobals() {
    try {
      CustomizableUI.registerArea(CONFIG.areaId, {
        type: CustomizableUI.TYPE_PANEL,
        anchor: CONFIG.buttonId,
        defaultPlacements: [...CONFIG.pinned],
      });
    } catch (e) {
      console.error("[uc-ext-panel] registerArea:", e);
    }
    try {
      if (!CustomizableUI.getWidget(CONFIG.buttonId)) {
        CustomizableUI.createWidget({
          id: CONFIG.buttonId,
          label: CONFIG.label,
          tooltiptext: CONFIG.label,
          onCreated: node => node.setAttribute("image", CONFIG.icon),
          onCommand: togglePanel,
        });
      }
      // builtin toolbars ignore defaultArea, so place explicitly if unplaced
      if (!CustomizableUI.getPlacementOfWidget(CONFIG.buttonId)) {
        CustomizableUI.addWidgetToArea(
          CONFIG.buttonId,
          CustomizableUI.AREA_NAVBAR
        );
      }
    } catch (e) {
      console.error("[uc-ext-panel] createWidget:", e);
    }
  }

  function openPanel(panel, anchor, event) {
    if (!panel || panel.state === "open" || panel.state === "showing") return;
    panel.hidden = false;
    PanelMultiView.openPopup(panel, anchor, {
      position: CONFIG.position,
      triggerEvent: event,
    });
  }

  function togglePanel(event) {
    const button = event.target;
    const panel = button.ownerDocument.getElementById(CONFIG.panelId);
    if (!panel) return;
    if (panel.state === "open" || panel.state === "showing") {
      PanelMultiView.hidePopup(panel);
    } else {
      openPanel(panel, button, event);
    }
  }

  // panel DOM + area node are per-window, mirror the native unified-extensions panel
  function buildForWindow(win) {
    const doc = win.document;
    if (doc.getElementById(CONFIG.panelId)) return;
    const popupSet = doc.getElementById("mainPopupSet");
    if (!popupSet) return;

    popupSet.appendChild(
      win.MozXULElement.parseXULToFragment(`
        <panel id="${CONFIG.panelId}" class="panel-no-padding" role="group"
               type="arrow" noautofocus="true" hidden="true">
          <panelmultiview mainViewId="${CONFIG.viewId}">
            <panelview id="${CONFIG.viewId}" class="cui-widget-panelview">
              <vbox class="panel-subview-body">
                <vbox id="${CONFIG.areaId}"/>
              </vbox>
            </panelview>
          </panelmultiview>
        </panel>
      `)
    );

    try {
      CustomizableUI.registerPanelNode(
        doc.getElementById(CONFIG.areaId),
        CONFIG.areaId
      );
    } catch (e) {
      console.error("[uc-ext-panel] registerPanelNode:", e);
    }

    win.ucExtPanel = makeApi(win);
  }

  function widgetIdOf(id) {
    return id.endsWith("-browser-action") ? id : `${id}-browser-action`;
  }

  // console helpers, reachable from the Browser Toolbox as ucExtPanel.*
  function makeApi(win) {
    return {
      pin(id) {
        CustomizableUI.addWidgetToArea(widgetIdOf(id), CONFIG.areaId);
      },
      unpin(id, toArea = CustomizableUI.AREA_ADDONS) {
        CustomizableUI.addWidgetToArea(widgetIdOf(id), toArea);
      },
      list() {
        const areas = [
          CustomizableUI.AREA_NAVBAR,
          CustomizableUI.AREA_ADDONS,
          CustomizableUI.AREA_BOOKMARKS,
          CustomizableUI.AREA_TABSTRIP,
          CONFIG.areaId,
        ];
        const found = {};
        for (const area of areas) {
          let ids;
          try {
            ids = CustomizableUI.getWidgetIdsInArea(area);
          } catch (e) {
            continue;
          }
          for (const id of ids) {
            if (id.endsWith("-browser-action")) found[id] = area;
          }
        }
        return found;
      },
      open() {
        const doc = win.document;
        const anchor =
          doc.getElementById(CONFIG.buttonId) ||
          doc.getElementById("unified-extensions-button") ||
          doc.getElementById("nav-bar");
        openPanel(doc.getElementById(CONFIG.panelId), anchor);
      },
    };
  }
})();
