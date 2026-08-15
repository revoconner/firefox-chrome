// ==UserScript==
// @name           FF Save Tabs popup height
// @description    Allow the FF Save Tabs action popup to reach 1000px
// @onlyonce
// ==/UserScript==

const TARGET_EXTENSION_ID = "ffsavetabs@revoconner";
const TARGET_MAX_HEIGHT = 1000;
const patchedManagers = new WeakSet();

const { ExtensionParent } = ChromeUtils.importESModule(
    "resource://gre/modules/ExtensionParent.sys.mjs"
);

function getOwningExtension(browser) {
    const groupId = browser.getAttribute(
        "initialBrowsingContextGroupId"
    );

    for (
        const extension
        of ExtensionParent.GlobalManager.extensionMap.values()
    ) {
        if (
            String(extension.policy.browsingContextGroupId)
            === groupId
        ) {
            return extension;
        }
    }

    return null;
}

function patchPopup(_event, browser) {
    if (
        browser.getAttribute("webextension-view-type") !== "popup"
        || getOwningExtension(browser)?.id !== TARGET_EXTENSION_ID
    ) {
        return;
    }

    const manager = browser.messageManager;

    if (!manager || patchedManagers.has(manager)) {
        return;
    }

    const originalSend = manager.sendAsyncMessage;

    manager.sendAsyncMessage = function(name, data, ...rest) {
        if (name === "Extension:InitBrowser") {
            data = {
                ...data,
                maxHeight: TARGET_MAX_HEIGHT,
            };
        }

        return originalSend.call(this, name, data, ...rest);
    };

    patchedManagers.add(manager);
}

ExtensionParent.apiManager.on(
    "extension-browser-inserted",
    patchPopup
);