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

const radios = document.getElementsByName('selection');
var selection = "";

const margin = { top: 40, right: 10, bottom: 10, left: 10 },
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom,
  color = d3.scaleOrdinal().range(d3.schemeCategory20c);

const treemap = d3.treemap().size([width, height]);

const div = d3.select("body").append("div")
  .style("position", "relative")
  .style("width", (width + margin.left + margin.right) + "px")
  .style("height", (height + margin.top + margin.bottom) + "px")
  .style("left", margin.left + "px")
  .style("top", margin.top + "px");

d3.queue()
  .defer(d3.json, datasets.kickstarter.url)
  .defer(d3.json, datasets.movies.url)
  .defer(d3.json, datasets.videogames.url)
  .await((error, kickstarterData, movieSalesData, videoGameSalesData) => {
    if (error) throw error;

    selection = 0;

    const data = [kickstarterData, movieSalesData, videoGameSalesData]

    const colorScheme = ['#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#42d4f4', '#f032e6', '#bfef45', '#fabed4', '#469990', '#dcbeff', '#9A6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1'];

    const colorScale = d3.scaleOrdinal()
      .domain(data[selection].children.map(d => d.name))
      .range(colorScheme);

    var root = d3.hierarchy(data[selection])
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value) // Here the size of each leave is given in the 'value' field in input data

    var tree = treemap(root);

    var node = div.datum(root).selectAll(".node")
      .data(tree.leaves())
      .enter().append("div")
      .attr("class", "node")
      .style("left", (d) => d.x0 + "px")
      .style("top", (d) => d.y0 + "px")
      .style("width", (d) => Math.max(0, d.x1 - d.x0 - 1) + "px")
      .style("height", (d) => Math.max(0, d.y1 - d.y0 - 1) + "px")
      .style("background", (d) => colorScale(d.parent.data.name))
      .text((d) => d.data.name);

    d3.selectAll("input").on("change", function change(input) {
      const selection = this.value

      const newRoot = d3.hierarchy(data[selection]).sum((d) => d.value).sort((a, b) => b.value - a.value)

      node.data(treemap(newRoot).leaves())
        .transition()
        .duration(1500)
        .style("left", (d) => d.x0 + "px")
        .style("top", (d) => d.y0 + "px")
        .style("width", (d) => Math.max(0, d.x1 - d.x0 - 1) + "px")
        .style("height", (d) => Math.max(0, d.y1 - d.y0 - 1) + "px")
        .style("background", (d) => colorScale(d.parent.data.name))
        .text((d) => d.data.name);

    });
  })
