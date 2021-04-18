
chrome.tabs.onCreated.addListener(function (tab) {
    //alert(111)
});
function genericOnClick(info, tab) {
    chrome.tabs.getSelected(null, function(tab1){
        console.log(tab1);
    });
}


chrome.contextMenus.create({ "title": "记录书签", "contexts": ["all"], "onclick": genericOnClick });

