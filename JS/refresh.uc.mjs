// ==UserScript==
// @onlyonce
// ==/UserScript==

// Script from here:  https://gist.github.com/jscher2000/ad268422c3187dbcbc0d15216a3a8060?permalink_comment_id=3259657#gistcomment-3259657
setInterval(() => {
    /*
       Code to paste and run in the Browser Console
       Requires devtools.chrome.enabled => true in about:config
       Tested in Firefox 68.0.1 on Windows
    */

    // Create references to APIs we'll use
    var ss = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);
    var io = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
    var ds = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties);
      
    // Get the chrome directory in the current profile
    var chromepath = ds.get("UChrm", Ci.nsIFile);

    // Specific file: userChrome.css or userContent.css
    chromepath.append("userChrome.css");

    // Morph to a file URI
    var chromefile = io.newFileURI(chromepath);

    // Unregister the sheet
    if(ss.sheetRegistered(chromefile, ss.USER_SHEET)){
      ss.unregisterSheet(chromefile, ss.USER_SHEET);
    }

    // Reload the sheet
    ss.loadAndRegisterSheet(chromefile, ss.USER_SHEET);
}, 1000)