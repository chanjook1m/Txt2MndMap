function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
      words = text
        .text()
        .split(/\s+/)
        .reverse(),
      word,
      line = [],
      lineNumber = 0, //<-- 0!
      lineHeight = 1.2, // ems
      x = text.attr("x"), //<-- include the x!
      y = text.attr("y"),
      dy = text.attr("dy") ? text.attr("dy") : 0; //<-- null check
    let tspan = text
      .text(null)
      .append("tspan")
      .attr("x", x)
      .attr("y", y)
      .attr("dy", dy + "em");

    // if last element is "", delete it
    if (words[words.length - 1] === "") words.pop(); //
    //
    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(" "));

      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text
          .append("tspan")
          .attr("x", 1)
          .attr("y", 1)
          .attr("dy", ++lineNumber * lineHeight + dy + "em")
          .text(word);
      }
    }
  });
}

export { wrap };
