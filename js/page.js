var $j = jQuery.noConflict();
var global = {
    range: "",
    editId: "",
    color: "red",
    backgroundColor: "",
    borderRadius: "",
    fontSize: "",
    fontWeight: "",
}

//--------工具区

var tools = document.createElement("div");
tools.id = "edit-tools";
$j.get(chrome.extension.getURL("template/tools.html"), function(result) { //加载工具
    $j(tools).html(result);
});
document.body.append(tools);

setTimeout(() => {
    addBox()
    addToolEvent();
    listenEdit();
    reEdit()
}, 1000);

function addToolEvent() { //监听工具和页面点击事件
    $j(".edit-tool-colorPen").on("click", function() {
        editTo({
            color: "red",
            backgroundColor: "blue",
            borderRadius: "10px"
        })
        saveChange()
    })
    $j("body").on("click", function(evt) {
        var thisrange = document.getSelection().getRangeAt(0);
        if ($j(evt.target).is('#edit-tools') || $j(evt.target).is('#edit-tools *') || thisrange.collapsed == false) {
            $j("#edit-tools").show()
        } else {
            $j("#edit-tools").hide()
        }
    })
}


function reEdit() { //还原标记样式
    var alldom = $j("edit-box");
    var domeditarr = JSON.parse(window.localStorage.getItem(window.location.href));
    if (domeditarr != null) {
        var editarrlength = domeditarr.length < alldom.length ? domeditarr.length : alldom.length //在标记库和现有网页dom之间选择数组长度最小的作为参考值，这样做是为了避开网页中多出的未知的内容
        for (var i = 0; i < editarrlength; i++) {
            if (alldom[i].textContent != domeditarr[i].text) {
                if (alldom.length > domeditarr.length) {
                    alldom.splice(i, 1)
                } else if (alldom.length < domeditarr.length) {
                    domeditarr.splice(i, 1)
                } else {
                    continue;
                }
            }
            alldom[i].innerHTML = domeditarr[i].innerHTML;
        }
        $j("edit").on("mouseenter", function() {
            $j(tools).show();
            var editIndex = $j("[editId='" + $j(this).attr("editId") + "'").last().offset();
            tools.style.top = editIndex.top + $j("[editId='" + $j(this).attr("editId") + "'").last().innerHeight() + "px";
            tools.style.left = editIndex.left + $j("[editId='" + $j(this).attr("editId") + "'").last().innerWidth() + "px";
        })
    }
}

function listenEdit() { //监听选择事件
    $j("body").on("mouseup", function(evt) {
        if ($j(evt.target).is('#edit-tools') || $j(evt.target).is('#edit-tools *')) {

        } else {
            var range = document.getSelection().getRangeAt(0);
            if (range.collapsed != true) {
                global.range = range;
                var endOffset = range.endOffset;
                var endDom = range.endContainer;
                endDom.splitText(endOffset)
                var end = endDom.nextSibling;
                var indexNode = document.createElement("edit-i"); //用于定位选区位置
                end.parentNode.insertBefore(indexNode, end)
                var editIndex = $j(indexNode).offset()
                tools.style.top = editIndex.top + $j(indexNode).innerHeight() + "px";
                tools.style.left = editIndex.left + $j(indexNode).innerWidth() + "px";
                $j(tools).show();
                $j(indexNode).remove()
            }
        }
    })
}

function editTo(editObj) { //执行标记动作
    if (global.range != null) { //表示新选择了文本，需要建立选择区
        console.log(global.range)
        var startOffset = global.range.startOffset;
        var startDom = global.range.startContainer;
        startDom.splitText(startOffset);
        var start = startDom.nextSibling;
        var endOffset = global.range.endOffset;
        var endDom = global.range.endContainer;
        endDom.splitText(endOffset)
        var end = endDom;

        var alldom = getAlldom(document.body)
        var startIndex = $j(alldom).index(start)
        var endIndex = $j(alldom).index(end)

        selLength = endIndex - startIndex + 1;
        var editId = new Date().getTime();
        for (var i = 0; i < selLength; i++) {
            var nextdom = alldom[startIndex + i]
            var newnode = document.createElement("edit");
            global.editId = editId;
            newnode.setAttribute("editId", editId);
            newnode.textContent = nextdom.textContent;
            nextdom.parentNode.replaceChild(newnode, nextdom);
        }
        var sel = document.getSelection();
        sel.removeAllRanges();
        global.range = null;
        $j("[editId='" + global.editId + "']").on("mouseenter", function() {
            var editIndex = $j(this).last().offset()
            tools.style.top = editIndex.top + $j(this).last().innerHeight() + "px";
            tools.style.left = editIndex.left + $j(this).last().innerWidth() + "px";
            $j(tools).show();
        })
    }
    var editNode = $j("[editId='" + global.editId + "']");
    editNode.css("color", editObj.color);
    editNode.css("background-color", editObj.backgroundColor);
    editNode.css("border-radius", editObj.borderRadius);
};

function saveChange() {
    var oldDom = $j("edit-box").clone();
    var saveDom = [];
    var domLength = oldDom.length;
    for (var i = 0; i < domLength; i++) { //将结果保存进savedom
        var item = {
            text: oldDom[i].textContent,
            innerHTML: getRangeNode(oldDom[i])
        }
        saveDom.push(item)
    }
    window.localStorage.setItem(window.location.href, JSON.stringify(saveDom));
}

function addBox() { //添加标识符
    var resultdom = [];
    fds(document.body);
    function fds(node) {
        if(node.className!="edit-tools"){
            if (node.nodeType === 3 && node.textContent != "") {
                resultdom.push(node);
                if (node.parentNode.nodeName != "STYLE") {
                    $j(node).wrap("<edit-box></edit-box>")
                }
            }
            var children = node.childNodes;
            for (var i = 0; i < children.length; i++) {
                fds(children[i]);
            }
        }
    }
    return resultdom;
}


function getRangeNode(node) { //用在保存步骤中，剔除textnode元素的非edit父元素，这样是为了防止网页中途操作产生的干扰
    var childNode = getAlldom(node)
    for (var i = 0; i < childNode.length; i++) {
        unwrap(childNode[i])
    }

    function unwrap(child) {
        if (child.parentNode.nodeName != "EDIT-BOX") {
            if (child.parentNode.nodeName != "EDIT") {
                $j(child).unwrap();
                unwrap(child)
            } else {
                unwrap(child.parentNode)
            }
        }
    }
    return node.innerHTML
}

function getAlldom(thisnode) { //获取所有textnode
    var resultdom = [];
    fds(thisnode);

    function fds(node) {
        if (node.nodeType === 3 && node.textContent != "") {
            resultdom.push(node);
        }
        var children = node.childNodes;
        for (var i = 0; i < children.length; i++) {
            fds(children[i]);
        }
    }
    return resultdom;
}