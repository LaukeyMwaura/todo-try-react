(function () {
    if (!BrowserUtils.isEdgeChromium())
        return;
    if (~document.location.href.indexOf("?")) {
        return;
    }
    var assistShownKey = "assistNT";
    var stateKeyForSetFocusOnRestart = "setFocusOnRestart";
    if (!window.localStorage.getItem(assistShownKey)) {
        return new Promise(function (resolve) {
            var setFocusOnRestartState = {};
            setFocusOnRestartState[stateKeyForSetFocusOnRestart] = true;
            chrome.storage.local.set(setFocusOnRestartState, resolve);
        });
    }
    var gettingAllTabs = new Promise(function (resolve) { return chrome.tabs.query({}, resolve); });
    var gettingState = new Promise(function (resolve) { return chrome.storage.local.get(stateKeyForSetFocusOnRestart, resolve); });
    Promise.all([gettingAllTabs, gettingState])
        .then(function (result) {
        var edgeState = result[1];
        var numberOfTabsOpened = result[0].length;
        if (numberOfTabsOpened === 1 ||
            (Object.keys(edgeState).length && !edgeState[stateKeyForSetFocusOnRestart])) {
            edgeState[stateKeyForSetFocusOnRestart] = true;
            chrome.storage.local.set(edgeState);
            return;
        }
        var newTabFile = chrome.runtime.getManifest().chrome_url_overrides.newtab
            ? chrome.runtime.getManifest().chrome_url_overrides.newtab
            : "ntp1.html";
        chrome.tabs.getCurrent(function (originalTab) {
            chrome.tabs.create({ url: chrome.runtime.getURL(newTabFile) + "?" }, function (tab) {
                chrome.tabs.remove(originalTab.id);
            });
        });
    });
})();
