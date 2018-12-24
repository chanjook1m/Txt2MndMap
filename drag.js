function dragstarted(d) {
  d3.event.sourceEvent.stopPropagation();
  d3.event.sourceEvent.preventDefault;
}

function dragged(svg) {
  var t = d3.transform(svg.attr("transform")).translate;
  svg.attr(
    "transform",
    "translate(" + [t[0] + d3.event.dx, t[1] + d3.event.dy] + ")"
  );
}

function dragended(d) {}

export { dragstarted, dragged, dragended };
