// https://observablehq.com/d/6aec17920ae9d4e3@38
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Parallel Dimension visualisation`
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require('d3@5')
)});
  main.variable(observer("top10")).define("top10", ["d3"], function(d3){return(
d3.csv('https://raw.githubusercontent.com/sankomil/COMP4462-Project/master/top10s.csv')
)});
  main.variable(observer()).define(["d3","DOM","width","top10"], function(d3,DOM,width,top10)
{
  const height = 300
  const svg = d3.select(DOM.svg(width, height))
  
  const margin = { left: 30, top: 30, right: 10, bottom: 20 }
  
  const dimensions = ['bpm', 'nrgy', 'dnce', 'live', 'val', 'acous', 'spch', 'pop']
  const data = top10.map(d => dimensions.map(dimension => d[dimension]))
  
  // Use scalePoint because x-axis domain is discrete
  const xScale = d3.scalePoint()
    .range([margin.left, width - margin.right])
    .domain(dimensions)
  
  // Plot x-axis at the top, remove the line stroke
  svg.append('g')
    .call(d3.axisTop(xScale))
    .attr('transform', `translate(0,${margin.top})`)
    .selectAll('path')
      .attr('stroke', 'none')

  // Make one y-scale for each dimension
  const yScales = dimensions.map(dimension =>
    d3.scaleLinear()
      .range([height - margin.bottom, margin.top])
      .domain(d3.extent(top10.map(d => d[dimension])))
  )

  // Plot axes for each dimension
  dimensions.forEach((dimension, i) => {
    svg.append('g')
      .call(d3.axisLeft(yScales[i]))
      .attr('transform', `translate(${xScale(dimension)},0)`)
  })

  // Line generator, carefully handle each dimension
  const line = d3.line()
    .x((d, i) => xScale(dimensions[i]))
    .y((d, i) => yScales[i](d))
  
  // Just like a line chart!
  svg.append('g')
    .selectAll('path')
    .data(data)
    .enter()
    .append('path')
      .attr('d', d => line(d))
      .attr('fill', 'none')
      .attr('stroke', 'SteelBlue')

  return svg.node()
}
);
  return main;
}
