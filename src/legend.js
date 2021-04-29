export const Legend = (data, props, colorScale, container) => {
  const {
    width = 600,
    margin
  } = props;

  const legend = container.selectAll('g')
    .data(data.children)
    .enter()
    .append("g");

  legend
    .append('rect')
    .attr('class', 'legend-item')
    .attr('width', "15px")
    .attr('height', "15px")
    .attr('y', (d, i) => i % 4 * 20)
    .attr('x', (d, i) => width / 4 * Math.floor(i / 4) + 20)
    .attr("fill", d => colorScale(d.name))

  legend
    .append('text')
    .attr('y', (d, i) => i % 4 * 20 + 12)
    .attr('x', (d, i) => width / 4 * Math.floor(i / 4) + 20 + 20)
    .style('font-size', "15px")
    .text((d) => d.name);

  return container
}