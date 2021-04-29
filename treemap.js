import { Legend } from "./src/legend.js"

const datasets = [
  {
    name: 'Kickstarter',
    title: 'Kickstarter Pledges',
    description: 'Top 100 highest funded projects on Kickstarter grouped by category',
    url: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json'
  },
  {
    name: 'Movies',
    title: 'Movie Sales',
    description: 'Top 100 highest grossing movies grouped by genre',
    url: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json'
  },
  {
    name: 'Video Game Sales Data Top 100',
    title: 'Video Games Sales',
    description: 'Top 100 best-selling video games grouped by platform',
    url: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json'
  },
];

const colorScale = d3.scaleOrdinal(d3.schemeCategory20)
const margin = { top: 0, right: 0, bottom: 0, left: 0 },
  width = 960 - margin.left - margin.right,
  height = 570 - margin.top - margin.bottom;

//tooltip stuff
var tooltip = d3.select("body")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .attr("id", "tooltip")
  .style("background-color", "black")
  .style("color", "white")
  .style("border", "solid")
  .style("border-width", "2px")
  .style("border-radius", "5px")
  .style("padding", "5px")

// Three function that change the tooltip when user hover / move / leave a cell
var mouseover = function (d) {
  tooltip
    .style("opacity", 1)
  d3.select(this)
    .style("stroke", "black")
    .style("fill", "#ccff00")
}
var mousemove = function (d) {

  tooltip
    .html(d.data.name + "<br>" + d.data.category + "<br>" + d.data.value)
    .attr("data-value", d.data.value)
    .style("top", (d3.event.pageY + 16) + "px")
    .style("left", (d3.event.pageX + 16) + "px");

}
var mouseleave = function (d) {
  tooltip
    .style("opacity", 0)
  d3.select(this)
    .style("stroke", "white")
    .style("fill", d => colorScale(d.data.category))
}

// Treemap SVG Initialization
const svg = d3.select("body")
  .append("svg")
  .attr("id", "treemap")
  .attr("class", "treemap")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("id", "treemap-container")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")")

// Legend SVG Initialization
const legendContainer = d3.select("body")
  .append("svg")
  .attr("id", "legend")
  .attr("class", "legend")
  .attr("width", width + margin.left + margin.right)
  .attr("height", 100)
  .append("g")
  .attr("id", "legend-container")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")")

function drawTree(data) {
  // Give the data to this cluster layout:
  let root = d3.hierarchy(data)
    .sum((d) => d.value)
    .sort((a, b) => b.value - a.value) // Here the size of each leave is given in the 'value' field in input data

  // Computing the position of each element of the hierarchy
  let treeLayout = d3.treemap()
    .size([width, height])
    (root)

  let categories = root.leaves()

  // use this information to add svg elements representing each tiles
  let cell = svg
    .selectAll("g")
    .data(categories)
    .enter()
    .append("g")
    .attr("class", "cell")
    .style("text-overflow", "clip")

    .attr("transform", d => `translate(${d.x0},${d.y0})`)

  let tile = cell.append("rect")
    .attr('class', 'tile')
    .attr('data-name', d => d.data.name)
    .attr('data-category', d => d.data.category)
    .attr('data-value', d => d.data.value)
    .attr('id', d => d.data.id)
    .attr('width', d => d.x1 - d.x0)
    .attr('height', d => d.y1 - d.y0)
    .attr("fill", d => colorScale(d.data.category))
    .style("stroke", "white")

    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);

  // Clip path
  cell.selectAll('clipPath').append('clipPath')
    .attr('id', d => 'clip-' + d.data.name)
    .append('use')
    .attr('xlink:href', d => '#' + d.data.name);

  // Text
  const textEnter = cell.append('text')
    .attr('class', 'tile-text')
    .attr('clip-path', d => 'url(#clip-' + d.data.id + ')');

  const tspan = textEnter.selectAll('tspan')
    .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g));

  tspan.enter().append('tspan')
    .merge(tspan)
    .style("font-size", "10px")

    .attr("x", 4)    // +10 to adjust position (more right)
    .attr("y", (d, i) => 10 + i * 10)    // +20 to adjust position (lower)
    .attr('width', d => d.x1 - d.x0)
    .text(d => d)
}

const clearSVG = (selection) => {
  selection.selectAll("*").remove();
}


//Main Loop
d3.queue()
  .defer(d3.json, datasets[0].url)
  .defer(d3.json, datasets[1].url)
  .defer(d3.json, datasets[2].url)
  .await((error, kickstarterData, movieSalesData, videoGameSalesData) => {
    if (error) throw error;

    const data = [kickstarterData, movieSalesData, videoGameSalesData]
    // Initial State
    let dataset = data[0]

    drawTree(dataset)
    Legend(dataset, { width, margin, height }, colorScale, legendContainer)

    //When Selection Changes
    d3.selectAll("input").on("change", function change(input) {

      console.log(data)
      console.log(this.value)
      dataset = data[this.value]

      console.log(dataset)

      // Find the new Dataset in the list 
      let datasetEntry = datasets.find(element => element.name === dataset.name)

      // Update Title and description
      document.getElementById("title").innerHTML = datasetEntry.title;
      document.getElementById("description").innerHTML = datasetEntry.description;

      // Clear everything
      clearSVG(svg);
      clearSVG(legendContainer);

      // Re-draw the elements
      drawTree(dataset)
      Legend(dataset, { width, margin, height }, colorScale, legendContainer)

    });
  })