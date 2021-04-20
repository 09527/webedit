var $j = jQuery.noConflict();
var global = {
    range: "",
    editId: "",
    color: "",
    backgroundColor: "",
    borderRadius: "",
    fontSize: "",
    fontWeight: "",
    saveDom: "",
    recentColor: [],
    recentBackgroundColor: []
}

//--------工具区

var tools = document.createElement("div");
tools.id = "edit-tools";
tools.className = "edit-tools";
$j.get(chrome.extension.getURL("template/tools.html"), function (result) { //加载工具
    $j(tools).html(result);
    $j(".color-choose-item").attr("src", chrome.extension.getURL($j(".color-choose-item").attr("src")));
    $j(".pen-box").on("mouseenter", function () {
        $j(".pen-item1").addClass("item1-go")
        $j(".pen-item2").addClass("item2-go")
        $j(".pen-item3").addClass("item3-go")
        $j(".pen-item4").addClass("item4-go")
    })
    $j(".pen-box").on("mouseleave", function () {
        $j(".pen-item1").removeClass("item1-go")
        $j(".pen-item2").removeClass("item2-go")
        $j(".pen-item3").removeClass("item3-go")
        $j(".pen-item4").removeClass("item4-go")
    })
    $j(".bc-box").on("mouseenter", function () {
        $j(".bc-item0").addClass("item0-go")
        $j(".bc-item1").addClass("item1-go")
        $j(".bc-item2").addClass("item2-go")
        $j(".bc-item3").addClass("item3-go")
        $j(".bc-item4").addClass("item4-go")
    })
    $j(".bc-box").on("mouseleave", function () {
        $j(".bc-item0").removeClass("item0-go")
        $j(".bc-item1").removeClass("item1-go")
        $j(".bc-item2").removeClass("item2-go")
        $j(".bc-item3").removeClass("item3-go")
        $j(".bc-item4").removeClass("item4-go")
    })
    $j(".bc-item0").on("mouseenter", function (evt) {
        $j(".bc-item0-up").addClass("bc-item0-up-go")
        $j(".bc-item0-down").addClass("bc-item0-down-go")
    })
    $j(".bc-item0").on("mouseleave", function (evt) {
        $j(".bc-item0-up").removeClass("bc-item0-up-go")
        $j(".bc-item0-down").removeClass("bc-item0-down-go")
    })
    $j(".bc-item0-up").on("click", function () {

        $j(".bc-item0-core").css("border-radius", parseInt($j(".bc-item0-core").css("border-radius").replace("px", "")) - 1 + "px")

    })
    $j(".bc-item0-down").on("click", function () {
        if (parseInt($j(".bc-item0-core").css("border-radius").replace("px", "")) > 0) {
            $j(".bc-item0-core").css("border-radius", $j(".bc-item0-core").css("border-radius") + 1 + "px")
        }
    })
    var clickThis, oldColor;
    var cp = $j("#colorpicker").colorpicker({//创建取色板
        popover: true,
        inline: true,
        container: "#colorValue",
        template:
            '<div class="colorpicker">' +
            '<div class="colorpicker-saturation"><i class="colorpicker-guide"></i></div>' +
            '<div class="colorpicker-hue"><i class="colorpicker-guide"></i></div>' +
            '<div class="colorpicker-alpha">' +
            '   <div class="colorpicker-alpha-color"></div>' +
            '   <i class="colorpicker-guide"></i>' +
            "</div>" +
            '<button type="button" class="btn sureColor btn-normal btn-sm">确定</button><button style="margin-left:5px;" class="btn cancleColor btn-normal btn-sm">取消</button>' +
            "</div>",
    });
    cp.hide();
    $j(".pen-item4,.bc-item4").on("click", function () {
        clickThis = $j(this)
        cp.toggle()
        if (cp.css("display") == "none") {
            recordColor()
        }
        if (clickThis.hasClass("pen-item4")) {
            oldColor = $j(".edit-tool-colorPen").css("color");
        }
        if (clickThis.hasClass("bc-item4")) {
            oldColor = $j(".edit-tool-backgroundColorPen").css("background-color");
        }
    })
    cp.on("colorpickerChange", function (o, evt) {
        if (clickThis.hasClass("pen-item4")) {
            $j(".edit-tool-colorPen").css("color", $j("#colorValue").val())
        }
        if (clickThis.hasClass("bc-item4")) {
            $j(".edit-tool-backgroundColorPen").css("background-color", $j("#colorValue").val())
        }
    })
    $j(".sureColor").on("click", function () {
        cp.hide()
        recordColor()
    })
    $j(".cancleColor").on("click", function () {
        if (clickThis.hasClass("pen-item4")) {
            $j(".edit-tool-colorPen").css("color", oldColor)
        }
        if (clickThis.hasClass("bc-item4")) {
            $j(".edit-tool-backgroundColorPen").css("background-color", oldColor)
        }
        cp.hide()
        recordColor()
    })
    function recordColor() {
        if (clickThis.hasClass("pen-item4")) {
            $j(".pen-item3").css("background-color", $j(".pen-item2").css("background-color"))
            $j(".pen-item2").css("background-color", $j(".pen-item1").css("background-color"))
            $j(".pen-item1").css("background-color", $j(".edit-tool-colorPen").css("color"))
        }
        if (clickThis.hasClass("bc-item4")) {
            $j(".bc-item3").css("background-color", $j(".bc-item2").css("background-color"))
            $j(".bc-item2").css("background-color", $j(".bc-item1").css("background-color"))
            $j(".bc-item1").css("background-color", $j(".edit-tool-backgroundColorPen").css("background-color"))
        }
        global.recentColor.splice(1, 1)
        global.recentColor.push($j(".edit-tool-colorPen").css("color"))
        global.color = $j(".edit-tool-colorPen").css("color");
        global.recentBackgroundColor.splice(1, 1)
        global.recentBackgroundColor.push($j(".edit-tool-backgroundColorPen").css("background-color"))
        global.backgroundColor = $j(".edit-tool-backgroundColorPen").css("background-color");
        saveChange()
    }
});
document.body.append(tools);

setTimeout(() => {
    addBox()
    addToolEvent();
    listenEdit();
    reEdit()
}, 1000);

function addToolEvent() { //监听工具和页面点击事件
    $j(".edit-tool-colorPen").on("click", function () {
        editTo({
            type: "color",
            editId: global.editId,
            color: global.color
        })
        saveChange()
    })
    $j(".edit-tool-backgroundColorPen").on("click", function () {
        editTo({
            type: "backgroundColor",
            editId: global.editId,
            color: global.backgroundColor
        })
        saveChange()
    })
    $j("body").on("click", function (evt) {
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
    var savedGlobal = JSON.parse(window.localStorage.getItem(window.location.href));
    if (savedGlobal) {
        console.log(savedGlobal)
        var domeditarr = savedGlobal.saveDom;
        global.color = savedGlobal.color;
        global.backgroundColor = savedGlobal.backgroundColor;
        $j(".edit-tool-colorPen").css("color", savedGlobal.color)
        $j(".edit-tool-backgroundColorPen").css("background-color", savedGlobal.backgroundColor)
        if (savedGlobal.recentColor) {
            global.recentColor = savedGlobal.recentColor;
            for (var i = 0; i < savedGlobal.recentColor.length; i++) {
                $j(".pen-item" + (i + 1).toString()).css("background-color", savedGlobal.recentColor[savedGlobal.recentColor.length - i - 1])
            }
        }
        if (savedGlobal.recentBackgroundColor) {
            global.recentBackgroundColor = savedGlobal.recentBackgroundColor;
            for (var i = 0; i < savedGlobal.recentBackgroundColor.length; i++) {
                $j(".pc-item" + (i + 1).toString()).css("background-color", savedGlobal.recentBackgroundColor[savedGlobal.recentBackgroundColor.length - i - 1])
            }
        }
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
            $j("edit").on("mouseenter", function () {
                $j(tools).show();
                global.editId = $j(this).attr("editId")
                var editIndex = $j("[editId='" + $j(this).attr("editId") + "'").last().offset();
                tools.style.top = editIndex.top + $j("[editId='" + $j(this).attr("editId") + "'").last().innerHeight() + "px";
                tools.style.left = editIndex.left + $j("[editId='" + $j(this).attr("editId") + "'").last().innerWidth() + "px";
            })
        }
    } else {
        global.color = "red";
        global.backgroundColor = "#bebebe";
    }
}

function listenEdit() { //监听选择事件
    $j("body").on("mouseup", function (evt) {
        var range = document.getSelection().getRangeAt(0);
        global.range = range;
        if ($j(evt.target).is('#edit-tools') || $j(evt.target).is('#edit-tools *')) {

        } else {
            if (range.collapsed != true) {
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
    if (global.range != "" && global.range != null) { //表示新选择了文本，需要建立选择区
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
            editObj.editId = editId;
            newnode.setAttribute("editId", editId);
            newnode.textContent = nextdom.textContent;
            nextdom.parentNode.replaceChild(newnode, nextdom);
        }
        var sel = document.getSelection();
        sel.removeAllRanges();
        global.range = null;
        $j("[editId='" + global.editId + "']").on("mouseenter", function () {
            var editIndex = $j(this).last().offset()
            tools.style.top = editIndex.top + $j(this).last().innerHeight() + "px";
            tools.style.left = editIndex.left + $j(this).last().innerWidth() + "px";
            $j(tools).show();
        })
    }
    var editNode = $j("[editId='" + editObj.editId + "']");
    switch (editObj.type) {
        case "color":
            editNode.css("color", editObj.color);
            break;
        case "backgroundColor":
            editNode.css("background-color", editObj.color);
            editNode.css("border-radius", editObj.borderRadius);
            break;
    }
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
    global.saveDom = saveDom;
    window.localStorage.setItem(window.location.href, JSON.stringify(global));
}

function addBox() { //添加标识符
    var resultdom = [];
    fds(document.body);
    function fds(node) {
        if (node.id != "edit-tools") {
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