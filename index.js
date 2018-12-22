// script
var w = 960,
  h = 960;

var labelDistance = 0;

var drag = d3.behavior
  .drag()
  //.origin(function (d) { return d; })
  .on("dragstart", dragstarted)
  .on("drag", dragged)
  .on("dragend", dragended);

var vis = d3
  .select(".right")
  .append("svg")
  .attr("width", w)
  .attr("height", h)
  .call(drag);

var nodes = [];
var labelAnchors = [];
var labelAnchorLinks = [];
var links = [];
const txtBox = document.querySelector("#text-area");

const str = "aasdfasfasdfasdf";
const str2 = "zzz";
txtBox.value = str + "\n" + str2;

var colors = [
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

var lines = txtBox.value.split("\n");
lines.forEach(function(line, index) {
  if (nodes[index]) nodes[index].label = line;
  else {
    let color = colors[Math.floor((line.search(/\S/) + 1) / 2)];
    let node = {
      label: line,
      color: color
    };
    nodes.push(node);
  }
});

for (var i = 0; i < nodes.length; i++) {
  labelAnchors.push({
    node: nodes[i]
  });
  labelAnchors.push({
    node: nodes[i]
  });
}

for (var i = 0; i < nodes.length; i++) {
  num = nodes[i].label.search(/\S/);
  targ = i;

  if (num >= 0) {
    for (let j = 0; j < i; j++) {
      let num2 = nodes[j].label.search(/\S/);
      if (num2 < num) {
        //console.log(j);
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

function dragstarted(d) {
  d3.event.sourceEvent.stopPropagation();
  d3.event.sourceEvent.preventDefault;
  //console.log("start");
  //log.text("start");
}

function dragged(e) {
  var t = d3.transform(vis.attr("transform")).translate;
  vis.attr(
    "transform",
    "translate(" + [t[0] + d3.event.dx, t[1] + d3.event.dy] + ")"
  );
  //console.log("drag: " + d3.transform(vis.attr("transform")).translate);
  //log.text("drag: " + d3.transform(svg.attr("transform")).translate);
}

function dragended(d) {
  //console.log("end");
  //log.text("end");
}
// for (var i = 0; i < nodes.length; i++) {
//   for (var j = 0; j < i; j++) {
//     if (Math.random() > 0.95)
//       links.push({
//         source: i,
//         target: j,
//         weight: Math.random()
//       });
//   }
//   labelAnchorLinks.push({
//     source: i * 2,
//     target: i * 2 + 1,
//     weight: 1
//   });
// }

var force = d3.layout
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
//console.log(labelAnchors)
var force2 = d3.layout
  .force()
  .nodes(labelAnchors)
  .links(labelAnchorLinks)
  .gravity(0)
  .linkDistance(0)
  .linkStrength(8)
  .charge(-100)
  .size([w, h]);
force2.start();

var link = vis.selectAll("line.link").data(links);
link
  .enter()
  .append("svg:line")
  .attr("class", "link")
  .style("stroke", "#CCC");

var node = vis.selectAll("g.node").data(force.nodes());
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
    //console.log(d)
    return d.color;
  })
  .style("stroke-width", 3);
node.call(force.drag);

//console.log(nodes[node[0].length-1].color)

//node.exit().remove();

//console.log(force.nodes())

var anchorLink = vis
  .selectAll("line.anchorLink")
  .data(labelAnchorLinks)
  .enter()
  .append("svg:line")
  .attr("class", "anchorLink")
  .style("stroke", "#999");

var anchorNode = vis.selectAll("g.anchorNode").data(force2.nodes());
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
  .style("fill", "#d63031")
  .style("font-family", "Lucida Console, Monaco, monospace")
  .style("font-weight", "bold")
  .style("font-size", 15);

vis
  .selectAll("g.anchorNode")
  .data(force2.nodes())
  .exit()
  .remove();

var updateLink = function() {
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
};

var updateNode = function() {
  this.attr("transform", function(d) {
    return "translate(" + d.x + "," + d.y + ")";
  });
};

force.on("tick", function() {
  force2.start();

  node.call(updateNode);

  anchorNode.each(function(d, i) {
    if (i % 2 == 0) {
      d.x = d.node.x;
      d.y = d.node.y;
    } else {
      var b = this.childNodes[1].getBBox();

      var diffX = d.x - d.node.x;
      var diffY = d.y - d.node.y;

      var dist = Math.sqrt(diffX * diffX + diffY * diffY);

      var shiftX = (b.width * (diffX - dist)) / (dist * 2);
      shiftX = Math.max(-b.width, Math.min(0, shiftX));
      var shiftY = 5;
      this.childNodes[1].setAttribute(
        "transform",
        "translate(" + shiftX + "," + shiftY + ")"
      );
    }
  });

  anchorNode.call(updateNode);

  link.call(updateLink);
  anchorLink.call(updateLink);
});
// script

txtBox.addEventListener("keyup", function(e) {
  if (e.keyCode == 65 && e.ctrlKey) {
    e.target.select();
  }
  d3.selectAll("svg > *").remove();
  nodes = [];
  links = [];
  labelAnchors = [];
  labelAnchorLinks = [];

  var lines = txtBox.value.split("\n");
  lines.forEach(function(line, index) {
    if (nodes[index]) nodes[index].label = line;
    else {
      let color = colors[Math.floor((line.search(/\S/) + 1) / 2)];
      let node = {
        label: line,
        color: color
      };
      nodes.push(node);
    }
  });

  for (var i = 0; i < nodes.length; i++) {
    labelAnchors.push({
      node: nodes[i]
    });
    labelAnchors.push({
      node: nodes[i]
    });
  }

  for (var i = 0; i < nodes.length; i++) {
    num = nodes[i].label.search(/\S/);
    targ = i;

    if (num >= 0) {
      for (let j = 0; j < i; j++) {
        let num2 = nodes[j].label.search(/\S/);
        if (num2 < num) {
          //console.log(j);
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

  var force = d3.layout
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
  //console.log(labelAnchors)
  var force2 = d3.layout
    .force()
    .nodes(labelAnchors)
    .links(labelAnchorLinks)
    .gravity(0)
    .linkDistance(0)
    .linkStrength(8)
    .charge(-100)
    .size([w, h]);
  force2.start();

  var link = vis.selectAll("line.link").data(links);
  link.remove();
  link = vis.selectAll("line.link").data(links);
  link
    .enter()
    .append("svg:line")
    .attr("class", "link")
    .style("stroke", "#CCC");

  var node = vis.selectAll("g.node").data(force.nodes());
  node.exit().remove();
  node = vis.selectAll("g.node").data(force.nodes());
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

  var anchorLink = vis.selectAll("line.anchorLink").data(labelAnchorLinks);
  anchorLink.remove();

  var anchorNode = vis.selectAll("g.anchorNode").data(force2.nodes());
  anchorNode.remove();
  anchorNode = vis.selectAll("g.anchorNode").data(force2.nodes());
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
    .style("fill", "#d63031")
    .style("font-family", "Lucida Console, Monaco, monospace")
    .style("font-size", 15)
    .style("font-weight", "bold");

  vis
    .selectAll("g.anchorNode")
    .data(force2.nodes())
    .exit()
    .remove();

  force.on("tick", function() {
    force2.start();

    node.call(updateNode);

    anchorNode.each(function(d, i) {
      if (i % 2 == 0) {
        d.x = d.node.x;
        d.y = d.node.y;
      } else {
        var b = this.childNodes[1].getBBox();

        var diffX = d.x - d.node.x;
        var diffY = d.y - d.node.y;

        var dist = Math.sqrt(diffX * diffX + diffY * diffY);

        var shiftX = (b.width * (diffX - dist)) / (dist * 2);
        shiftX = Math.max(-b.width, Math.min(0, shiftX));
        var shiftY = 5;
        this.childNodes[1].setAttribute(
          "transform",
          "translate(" + shiftX + "," + shiftY + ")"
        );
      }
    });

    anchorNode.call(updateNode);

    link.call(updateLink);
    anchorLink.call(updateLink);
  });
});

// Set-up the export button
d3.select("#saveButton").on("click", function() {
  var svgString = getSVGString(svg.node());
  svgString2Image(svgString, 2 * width, 2 * height, "png", save); // passes Blob and filesize String to the callback

  function save(dataBlob, filesize) {
    saveAs(dataBlob, "D3 vis exported to PNG.png"); // FileSaver.js function
  }
});

// Below are the functions that handle actual exporting:
// getSVGString ( svgNode ) and svgString2Image( svgString, width, height, format, callback )
function getSVGString(svgNode) {
  svgNode.setAttribute("xlink", "http://www.w3.org/1999/xlink");
  var cssStyleText = getCSSStyles(svgNode);
  appendCSS(cssStyleText, svgNode);

  var serializer = new XMLSerializer();
  var svgString = serializer.serializeToString(svgNode);
  svgString = svgString.replace(/(\w+)?:?xlink=/g, "xmlns:xlink="); // Fix root xlink without namespace
  svgString = svgString.replace(/NS\d+:href/g, "xlink:href"); // Safari NS namespace fix

  return svgString;

  function getCSSStyles(parentElement) {
    var selectorTextArr = [];

    // Add Parent element Id and Classes to the list
    selectorTextArr.push("#" + parentElement.id);
    for (var c = 0; c < parentElement.classList.length; c++)
      if (!contains("." + parentElement.classList[c], selectorTextArr))
        selectorTextArr.push("." + parentElement.classList[c]);

    // Add Children element Ids and Classes to the list
    var nodes = parentElement.getElementsByTagName("*");
    for (var i = 0; i < nodes.length; i++) {
      var id = nodes[i].id;
      if (!contains("#" + id, selectorTextArr)) selectorTextArr.push("#" + id);

      var classes = nodes[i].classList;
      for (var c = 0; c < classes.length; c++)
        if (!contains("." + classes[c], selectorTextArr))
          selectorTextArr.push("." + classes[c]);
    }

    // Extract CSS Rules
    var extractedCSSText = "";
    for (var i = 0; i < document.styleSheets.length; i++) {
      var s = document.styleSheets[i];

      try {
        if (!s.cssRules) continue;
      } catch (e) {
        if (e.name !== "SecurityError") throw e; // for Firefox
        continue;
      }

      var cssRules = s.cssRules;
      for (var r = 0; r < cssRules.length; r++) {
        if (contains(cssRules[r].selectorText, selectorTextArr))
          extractedCSSText += cssRules[r].cssText;
      }
    }

    return extractedCSSText;

    function contains(str, arr) {
      return arr.indexOf(str) === -1 ? false : true;
    }
  }

  function appendCSS(cssText, element) {
    var styleElement = document.createElement("style");
    styleElement.setAttribute("type", "text/css");
    styleElement.innerHTML = cssText;
    var refNode = element.hasChildNodes() ? element.children[0] : null;
    element.insertBefore(styleElement, refNode);
  }
}

function svgString2Image(svgString, width, height, format, callback) {
  var format = format ? format : "png";

  var imgsrc =
    "data:image/svg+xml;base64," +
    btoa(unescape(encodeURIComponent(svgString))); // Convert SVG string to data URL

  var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");

  canvas.width = width;
  canvas.height = height;

  var image = new Image();
  image.onload = function() {
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    canvas.toBlob(function(blob) {
      var filesize = Math.round(blob.length / 1024) + " KB";
      if (callback) callback(blob, filesize);
    });
  };

  image.src = imgsrc;
}