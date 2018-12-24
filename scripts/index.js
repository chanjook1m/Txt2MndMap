import { dragstarted, dragged, dragended } from "./drag.js";
import { openFile } from "./open.js";
import { saveToText, saveToPng } from "./save.js";
import { resetTxtBox } from "./reset.js";
import { map, getSetting, setSetting } from "./setting.js";
import { wrap } from "./wrap.js";

const w = map.width,
  h = map.height;

const drag = d3.behavior
  .drag()
  .on("dragstart", dragstarted)
  .on("drag", function() {
    dragged(svg);
  })
  .on("dragend", dragended);

var svg, nodes, labelAnchors, labelAnchorLinks, links;
var force, force2, node, link, anchorNode, anchorLink;

const txtBox = document.querySelector("#text-area");
txtBox.value = getSetting("documentContent");

const colors = [
  "#2d3436",
  "#fd79a8",
  "#a29bfe",
  "#ff7675",
  "#74b9ff",
  "#fab1a0",
  "#81ecec",
  "#e84393",
  "#6c5ce7",
  "#0984e3",
  "#e17055",
  "#00cec9",
  "#636e72",
  "#00b894"
];

initialize();
saveTxtLineToNode(txtBox, nodes);
setLabelAnchors();
setNodeLinks();
setForce();
setForceLinkNode();
setForce2LinkNode();

force.on("tick", function() {
  update(node, link, anchorNode, anchorLink);
});

// EVENTS
txtBox.addEventListener("keydown", function(e) {
  if (e.which == 9) {
    //ASCII tab
    e.preventDefault();
    var start = this.selectionStart;
    var end = this.selectionEnd;
    var v = this.val();
    if (start == end) {
      $(this).val(v.slice(0, start) + "    " + v.slice(start));
      this.selectionStart = start + 4;
      this.selectionEnd = start + 4;
      return;
    }

    var selectedLines = [];
    var inSelection = false;
    var lineNumber = 0;
    for (var i = 0; i < v.length; i++) {
      if (i == start) {
        inSelection = true;
        selectedLines.push(lineNumber);
      }
      if (i >= end) inSelection = false;

      if (v[i] == "\n") {
        lineNumber++;
        if (inSelection) selectedLines.push(lineNumber);
      }
    }
    var lines = v.split("\n");
    for (var i = 0; i < selectedLines.length; i++) {
      lines[selectedLines[i]] = "    " + lines[selectedLines[i]];
    }

    this.val(lines.join("\n"));
  }
});
txtBox.addEventListener("keypress", function(e) {
  if (e.which == 13) {
    // ASCII newline
    setTimeout(
      function(that) {
        var start = that.selectionStart;
        var v = that.value;
        var thisLine = "";
        var indentation = 0;
        for (var i = start - 2; i >= 0 && v[i] != "\n"; i--) {
          thisLine = v[i] + thisLine;
        }
        for (var i = 0; i < thisLine.length && thisLine[i] == " "; i++) {
          indentation++;
        }
        that.value =
          v.slice(0, start) + " ".repeat(indentation) + v.slice(start);
        that.selectionStart = start + indentation;
        that.selectionEnd = start + indentation;
      },
      0.01,
      this
    );
  }
});

//
txtBox.addEventListener("keyup", function(e) {
  if (e.keyCode == 65 && e.ctrlKey) {
    e.target.select();
  }

  setSetting("documentContent", txtBox.value);
  removeAll();
  initialize();
  saveTxtLineToNode(txtBox, nodes);
  setLabelAnchors();
  setNodeLinks();
  setForce();
  setForceLinkNode();
  setForce2LinkNode();
  force.on("tick", function() {
    update(node, link, anchorNode, anchorLink);
  });
});

const savePng = document.querySelector("#saveToPng");
savePng.addEventListener("click", function() {
  let svg = d3.select("svg");
  saveToPng(svg);
});

const saveTxt = document.querySelector("#saveToTxt");
saveTxt.addEventListener("click", saveToText);

const open = document.querySelector("#open-file");
open.addEventListener("click", openFile);

const newArea = document.querySelector("#new-textarea");
newArea.addEventListener("click", function() {
  const txtBox = document.querySelector("#text-area");
  resetTxtBox(txtBox);
});

// FUNCTIONS
function initialize() {
  nodes = [];
  links = [];
  labelAnchors = [];
  labelAnchorLinks = [];

  svg = d3
    .select(".right")
    .append("svg")
    .attr("width", w)
    .attr("height", h)
    .call(drag)
    .append("g");
}

function saveTxtLineToNode(txtBox, nodes) {
  var lines = txtBox.value.split("\n");

  lines.forEach(function(line, index) {
    //console.log(nodes[index]);
    if (nodes[index]) {
      nodes[index].label = line;
    } else {
      let color = colors[Math.floor((line.search(/\S/) + 1) / 2)];
      let node = {
        label: line,
        color: color
      };
      nodes.push(node);
    }
  });
}

function removeAll() {
  d3.selectAll(".right > *").remove();
}

function setLabelAnchors() {
  for (var i = 0; i < nodes.length; i++) {
    labelAnchors.push({
      node: nodes[i]
    });
    labelAnchors.push({
      node: nodes[i]
    });
  }
}

function setNodeLinks() {
  for (var i = 0; i < nodes.length; i++) {
    let num = nodes[i].label.search(/\S/);
    let targ = i;

    if (num >= 0) {
      for (let j = 0; j < i; j++) {
        let num2 = nodes[j].label.search(/\S/);
        if (num2 < num) {
          //
          targ = j;
        }
      }
      links.push({
        source: i,
        target: targ,
        weight: Math.random()
      });
    }
    //}
    labelAnchorLinks.push({
      source: i * 2,
      target: i * 2 + 1,
      weight: 1
    });
  }
}

function setForce() {
  force = d3.layout
    .force()
    .size([w, h])
    .nodes(nodes)
    .links(links)
    .gravity(1)
    .linkDistance(50)
    .charge(-3000)
    .linkStrength(function(x) {
      return x.weight * 10;
    });

  force.start();

  force2 = d3.layout
    .force()
    .nodes(labelAnchors)
    .links(labelAnchorLinks)
    .gravity(0)
    .linkDistance(0)
    .linkStrength(8)
    .charge(-100)
    .size([w, h]);
  force2.start();
}

function setForceLinkNode() {
  link = svg.selectAll("line.link").data(links);
  link.remove();
  link = svg.selectAll("line.link").data(links);
  link
    .enter()
    .append("svg:line")
    .attr("class", "link")
    .style("stroke", "#CCC");

  node = svg.selectAll("g.node").data(force.nodes());
  node.exit().remove();
  node = svg.selectAll("g.node").data(force.nodes());
  node
    .enter()
    .append("svg:g")
    .attr("class", "node");
  node
    .append("svg:circle")
    .attr("r", function(d) {
      return d.weight * 3;
    })
    .style("fill", function(d) {
      return d.color;
    })
    .style("stroke-width", 3);
  node.call(force.drag);
}

function setForce2LinkNode() {
  anchorLink = svg.selectAll("line.anchorLink").data(labelAnchorLinks);
  anchorLink.remove();

  anchorNode = svg.selectAll("g.anchorNode").data(force2.nodes());
  anchorNode.remove();
  anchorNode = svg.selectAll("g.anchorNode").data(force2.nodes());
  anchorNode
    .enter()
    .append("svg:g")
    .attr("class", "anchorNode");
  anchorNode
    .append("svg:circle")
    .attr("r", 0)
    .style("fill", "#FFF");
  anchorNode
    .append("svg:text")
    .text(function(d, i) {
      return i % 2 == 0 ? "" : d.node.label;
    })
    .call(wrap, 100)
    .style("fill", function(d) {
      return d.node.color;
    })
    .style("font-family", "Lucida Console, Monaco, monospace")
    .style("font-size", 15)
    .style("font-weight", "bold");
}

function updateLink() {
  this.attr("x1", function(d) {
    return d.source.x;
  })
    .attr("y1", function(d) {
      return d.source.y;
    })
    .attr("x2", function(d) {
      return d.target.x;
    })
    .attr("y2", function(d) {
      return d.target.y;
    });
}

function updateNode() {
  this.attr("transform", function(d) {
    return "translate(" + d.x + "," + d.y + ")";
  });
}

function update(node, link, anchorNode, anchorLink) {
  force2.start();

  node.call(updateNode);

  anchorNode.each(function(d, i) {
    if (i % 2 == 0) {
      d.x = d.node.x;
      d.y = d.node.y;
    } else {
      if (this.childNodes[1]) {
        let b = this.childNodes[1].getBBox();

        let diffX = d.x - d.node.x;
        let diffY = d.y - d.node.y;

        let dist = Math.sqrt(diffX * diffX + diffY * diffY);

        let shiftX = (b.width * (diffX - dist)) / (dist * 2);
        shiftX = Math.max(-b.width, Math.min(0, shiftX));
        let shiftY = 5;
        this.childNodes[1].setAttribute(
          "transform",
          "translate(" + shiftX + "," + shiftY + ")"
        );
      }
    }
  });

  anchorNode.call(updateNode);

  link.call(updateLink);
  anchorLink.call(updateLink);
}
