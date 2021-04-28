import { Legend } from "./src/legend.js"

const datasets = {
  kickstarter: {
    name: 'kickstarter',
    title: 'Kickstarter Pledges',
    description: 'Top 100 highest funded projects on Kickstarter grouped by category',
    url: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json'
  },
  videogames: {
    name: 'videogames',
    title: 'Video Games Sales',
    description: 'Top 100 best-selling video games grouped by platform',
    url: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json'
  },
  movies: {
    name: 'movies',
    title: 'Movie Sales',
    description: 'Top 100 highest grossing movies grouped by genre',
    url: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json'
  },
};

// design inspired from : https://observablehq.com/@d3/animated-treemap

//Radio selection logic
const radios = document.getElementsByName('selection');
let selection = "";

const margin = { top: 10, right: 10, bottom: 10, left: 10 },
  width = 1000 - margin.left - margin.right,
  height = 700 - margin.top - margin.bottom;


//tooltip stuff
var tooltip = d3.select("body")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .attr("id", "tooltip")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "2px")
  .style("border-radius", "5px")
  .style("padding", "5px")

// Three function that change the tooltip when user hover / move / leave a cell
var mouseover = function (d) {
  tooltip
    .style("opacity", 1)
  d3.select(this)
    .style("stroke", "white")
  // .style("opacity", 1)
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
    .style("stroke", "black")
}


// The svg
// append the svg object to the body of the page
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

d3.queue()
  .defer(d3.json, datasets.kickstarter.url)
  .defer(d3.json, datasets.movies.url)
  .defer(d3.json, datasets.videogames.url)
  .await((error, kickstarterData, movieSalesData, videoGameSalesData) => {
    if (error) throw error;

    selection = 0;

    const data = [kickstarterData, movieSalesData, videoGameSalesData]
    const colorScale = d3.scaleOrdinal(d3.schemeCategory20)

    if (error)
      throw error;

    // Give the data to this cluster layout:
    let root = d3.hierarchy(data[selection])
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value) // Here the size of each leave is given in the 'value' field in input data

    // Computing the position of each element of the hierarchy
    let treeLayout = d3.treemap()
      .size([width, height])
      (root)

    let categories = root.leaves()

    // use this information to add rectangles:
    let cell = svg
      .selectAll("g")
      .data(categories)
      .enter()
      .append("g")
      .attr("class", "cell")
      .attr("transform", d => `translate(${d.x0},${d.y0})`)

    let tile = cell.append("rect")
      .attr('class', 'tile')
      .attr('data-name', d => d.data.name)
      .attr('data-category', d => d.data.category)
      .attr('data-value', d => d.data.value)
      .attr('id', d => d.data.id)
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      // .attr("fill", d => { while (d.depth > 1) d = d.parent; return colorScale(d.value); })
      .attr("fill", d => colorScale(d.data.category))
      .style("stroke", "white")
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);

    cell.append("text")
      .selectAll("tspan")
      .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
      .enter().append("tspan")
      .attr("class", "tile-container")
      .style("font-size", "10px")
      .attr("x", 4)    // +10 to adjust position (more right)
      .attr("y", (d, i) => 10 + i * 10)    // +20 to adjust position (lower)
      .text(d => d)

    let legend = Legend(data[selection], { width, margin, height }, colorScale)

    //When Selection Changes
    d3.selectAll("input").on("change", function change(input) {

      selection = this.value

      svg.selectAll("*").remove();
      d3.selectAll("Body").selectAll("#legend").remove();

      // //Solution found here : https://bl.ocks.org/ganezasan/52fced34d2182483995f0ca3960fe228
      // //     const newRoot = d3.hierarchy(data, (d) => d.children)
      // //     .sum(value);

      // //   node.data(treemap(newRoot).leaves())
      // //     .transition()
      // //       .duration(1500)
      // //       .style("left", (d) => d.x0 + "px")
      // //       .style("top", (d) => d.y0 + "px")
      // //       .style("width", (d) => Math.max(0, d.x1 - d.x0 - 1) + "px")
      // //       .style("height", (d) => Math.max(0, d.y1 - d.y0  - 1) + "px")
      // // });

      // Give the data to this cluster layout:
      root = d3.hierarchy(data[selection])
        .sum((d) => d.value)
        .sort((a, b) => b.value - a.value) // Here the size of each leave is given in the 'value' field in input data

      // Computing the position of each element of the hierarchy
      treeLayout = d3.treemap()
        .size([width, height])
        (root)

      // use this information to add rectangles:
      cell = svg
        .selectAll("g")
        .data(root.leaves())
        .enter()
        .append("g")
        .attr("class", "cell")
        .attr("transform", d => `translate(${d.x0},${d.y0})`)

      tile = cell.append("rect")
        .attr('class', 'tile')
        .attr('data-name', d => d.data.name)
        .attr('data-category', d => d.data.category)
        .attr('data-value', d => d.data.value)
        .attr('id', d => d.data.id)
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        // .attr("fill", d => { while (d.depth > 1) d = d.parent; return colorScale(d.value); })
        .attr("fill", d => colorScale(d.data.category))
        .style("stroke", "white")

      cell.append("text")
        .selectAll("tspan")
        .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
        .enter().append("tspan")
        .attr("class", "tile-container")
        .style("font-size", "10px")
        .attr("x", 4)    // +10 to adjust position (more right)
        .attr("y", (d, i) => 10 + i * 10)    // +20 to adjust position (lower)
        .text(d => d)

      legend = Legend(data[selection], { width, margin, height }, colorScale)

      // legend = legendContainer.selectAll('g')
      //   .data(data[selection].children)
      //   .enter()
      //   .append("g");

      // legend
      //   .append('rect')
      //   .attr('width', "15px")
      //   .attr('height', "15px")
      //   .attr('y', (d, i) => i % 4 * 20)
      //   .attr('x', (d, i) => width / 4 * Math.floor(i / 4) + 20)
      //   .attr("fill", d => colorScale(d.name))

      // legend
      //   .append('text')
      //   .attr('y', (d, i) => i % 4 * 20 + 12)
      //   .attr('x', (d, i) => width / 4 * Math.floor(i / 4) + 20 + 20)
      //   .style('font-size', "15px")
      //   .text((d) => d.name);

      // var tooltip = d3.select("body")
      //   .append("div")
      //   .style("opacity", 0)
      //   .attr("class", "tooltip")
      //   .attr("id", "tooltip")
      //   .style("background-color", "white")
      //   .style("border", "solid")
      //   .style("border-width", "2px")
      //   .style("border-radius", "5px")
      //   .style("padding", "5px")

      // Three function that change the tooltip when user hover / move / leave a cell
      var mouseover = function (d) {
        tooltip
          .style("opacity", 1)
        d3.select(this)
          .style("stroke", "black")
          .style("opacity", 1)
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
          .style("stroke", "none")
      }

    });
  })