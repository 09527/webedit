setTimeout(() => {
  fds(document.body);
  freshedit();
}, 1000);

var alldom = [];
var domindex = 0;
function fds(node) {
  if (node.nodeType === 3) {
    alldom.push(node);
    $(node.parentNode).addClass("edi_span")
    if (!$(node.parentNode).attr("edi_index")) {
      $(node.parentNode).attr("edi_index", domindex)
      domindex++;
    }
  }
  var children = node.childNodes;
  for (var i = 0; i < children.length; i++) {
    fds(children[i]);
  }
}

function freshedit() {
  alldom = document.getElementsByTagName("edit");
  document.onmouseup = function () {
    var alldom = document.getElementsByClassName("edi_span");
    var range = document.getSelection().getRangeAt(0);
    console.log(range);
    if (range.collapsed != true) {
      var startOffset = range.startOffset;
      var startDom = range.startContainer.parentElement;
      var startIndex = parseInt($(startDom).attr("edi_index"));
      var endOffset = range.endOffset;
      var endDom = range.endContainer.parentElement;
      var endIndex = parseInt($(endDom).attr("edi_index"));

      //---------
      var sellength = endIndex - startIndex;
      if (sellength == 0) {
        var nowstr = alldom[startIndex].firstChild;
        // console.log(alldom)
        console.log("start", startIndex, range, nowstr)
        nowstr.splitText(startOffset);
        var node = nowstr.nextSibling;
        node.splitText(endOffset - startOffset);
        var newnode = document.createElement("hilight");
        newnode.style.color = "red";
        newnode.innerHTML = node.textContent;
        alldom[startIndex].replaceChild(newnode, node);
      } else {
        for (var i = 0; i < sellength; i++) {
          if (i == 0) {
            var nowstr = alldom[startIndex + i].lastChild;
            console.log("start", startIndex, range, nowstr)
            nowstr.splitText(startOffset);
            var node = nowstr.nextSibling;
            var newnode = document.createElement("hilight");
            newnode.style.color = "red";
            newnode.innerHTML = node.textContent;
            alldom[startIndex + i].replaceChild(newnode, node);
          } else if (i == sellength - 1) {
            var nowstr = alldom[endIndex].lastChild;
            console.log("end", range, nowstr)
            var node = nowstr;
            var newnode = document.createElement("hilight");
            newnode.style.color = "blue";
            nowstr.splitText(endOffset);
            newnode.innerHTML = node.textContent;
            alldom[endIndex].replaceChild(newnode, node);
            var sel = window.getSelection();
            sel.removeAllRanges();
          } else {
            var childnode = alldom[startIndex + i];
            do {
            
            } while (i < 1005);
          }
        }
      }

      $("hilight").click(function () {
        var parent = this.parentNode;
        $(this.childNodes[0]).unwrap()
        parent.normalize()
      })
    }
  };
}
