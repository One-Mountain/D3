// initialize some constants 
var margin = {
  top: 100,
  right: 90,
  bottom: 100,
  left: 100 },

w = 900 - margin.left - margin.right,
h = 600 - margin.top - margin.bottom;
var x = d3.scaleLinear().range([0, w]);
var y = d3.scaleTime().range([0, h]);
var color = d3.scaleOrdinal(d3.schemeCategory10);

var timeMS = d3.timeFormat('%M:%S');
var xAxis = d3.axisBottom(x).tickFormat(d3.format('d'));
var yAxis = d3.axisLeft(y).tickFormat(timeMS);

// initializing the graph title
d3.select('body').
append('h3').
attr('id', 'title').
text("Fastest Times up Alpe d'Huez");

//initialize the graph area 
const svg = d3.select("body").
append("svg").
attr("id", "scatter").
style("width", w + margin.left + margin.right).
style("height", h + margin.top + margin.bottom).
attr('class', 'graph').
append('g').
attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
const tool = d3.select('body').
append('div').
attr("id", "tooltip").
style("visibility", "hidden").
style("position", "absolute");

//data collection: 
web = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

d3.json(web).
then(data => {
  data.forEach(function (d) {
    d.Place = +d.Place;
    var parsedTime = d.Time.split(":");
    d.Time = new Date(1960, 0, 1, 0, parsedTime[0], parsedTime[1]);
  });
  //Domain and Range
  x.domain([
  d3.min(data, function (d) {
    return d.Year - 1;
  }),
  d3.max(data, function (d) {
    return d.Year + 1;
  })]);


  y.domain(
  d3.extent(data, function (d) {
    return d.Time;
  }));

  //add the x-axis
  svg.append('g').
  attr('class', 'x axis').
  attr('id', 'x-axis').
  attr('transform', 'translate(0,' + h + ")").
  call(xAxis).
  append('text').
  attr('class', 'x-axis-label').
  attr('x', w).
  attr('y', 0).
  attr('dy', '.71em').
  style('text-anchor', 'end').
  text('Year');
  //add the y-axis
  svg.append('g').
  attr('class', 'y axis').
  attr('id', 'y-axis').
  call(yAxis).
  append("text").
  attr('class', 'label').
  attr('transform', 'rotate(-90)').
  attr('y', 6).
  attr('dy', '.71em').
  style('text-anchor', 'end').
  text('Best Time(minutes)').
  attr('fill', 'black');;

  svg.append('text').
  attr('transform', 'rotate(-90)').
  attr('x', -250).
  attr('y', -44).
  style('font-size', 16).
  text("Time in Minutes").
  attr('fill', 'black');

  //adding the scatterplot
  svg.selectAll('.dot').
  data(data).
  enter().
  append('circle').
  attr('class', 'dot').
  attr('r', 5).
  attr('cx', function (d) {
    return x(d.Year);
  }).
  attr("cy", function (d) {
    return y(d.Time);
  }).
  attr('data-xvalue', function (d) {
    return d.Year;
  }).
  attr('data-yvalue', function (d) {
    return d.Time.toISOString();
  }).
  style('fill', function (d) {
    return color(d.Doping !== "");
  }).
  on('mouseover', function (event, d) {
    tool.style('visibility', 'visible');
    tool.attr('data-year', d.Year);
    tool.html(
    d.Name + ": " + d.Nationality + '</br>' +
    "Year: " + ', Time: ' + timeMS(d.Time) + (
    d.Doping ? '<br/><br/>' + d.Doping : "")).

    style("left", event.pageX + 20 + 'px').
    style('top', event.pageY - 28 + 'px');
  }).
  on('mouseout', function () {
    tool.style('visibility', 'hidden');
  });
  var legendCont = svg.append('g').attr('id', 'legend');

  var legend = legendCont.
  selectAll("#legend").
  data(color.domain()).
  enter().
  append('g').
  attr('class', 'legend-label').
  attr('transform', function (d, i) {
    return 'translate(0' + (h / 21 - i * 50) + ')';
  });
  legend.append('rect').
  attr('x', w - 5).
  attr('y', 4).
  attr('width', 10).
  attr('height', 10).
  style('fill', color);

  legend.append('text').
  attr('x', w - 10).
  attr('y', 9).
  attr('dy', '.35em').
  style('text-anchor', 'end').
  text(function (d) {
    if (d) {
      return 'Riders with doping allegations';
    } else
    {
      return 'No doping';
    }
  });
});