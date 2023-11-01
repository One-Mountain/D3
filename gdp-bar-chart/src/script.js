// Initializing some constants
const w = 550;
const h = 550;
const padd = 80; 
// grab the appropriate data from: 
//https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json
//JSON stuff:
d3.select('body')
  .append('h3')
  .attr('id', 'title')
  .text("US GDP");

//creating the bar graph:
const svg = d3.select("body")
              .append("svg")
              .attr("id", "bar-chart")
              .style("width", w)
              .style("height", h)
const tool = d3.select('body')
                   .append('div')
                   .attr("id", "tooltip")
                   .style("visibility", "hidden")
                   .style("position", "absolute") 
                   .text("Tool");

svg.on("mousemove", function(d){tool.style("left", `${d + 15}px`); tool.style("top", `370px`)});

//grab some data
web = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";

const req = new XMLHttpRequest();
req.open("GET", web, true); 
req.send();
   
req.onload = function() {
   const json = JSON.parse(req.responseText);
  const dataset = json.data;
  //text output of data for reference
  // it is an array of arrays with date and amount
  //console.log(dataset); 

//working with dates:
  var parseTime = d3.timeParse("%Y-%m-%d");
  var dates = [];
  for (let i = 0; i < dataset.length; i++){
       dates.push(parseTime(dataset[i][0]))
     }
  var domain = d3.extent(dates);

  var values = [];
     for (let i = 0; i < dataset.length; i++){
       values.push(dataset[i][1])
     }
  const max = values.reduce((a, b) => Math.max(a, b), -Infinity);
  const xScale = d3.scaleTime()
                 .domain(domain)
                 .range([padd, w-padd]);
  const yScale = d3.scaleLinear()
                       .domain([0, max])
                       .range([h-padd, padd]);
  new_data = dates.map(function(a,b){
    return [a, values[b]];
  });
  const formatTime = d3.timeFormat("%Y-%m-%d");
  svg.selectAll("rect")
           .data(new_data)
           .enter()
           .append("rect")
           .attr("class", "bar")
           .attr("x", (d) => xScale(d[0]))
           .attr("y", (d) => yScale(d[1]))
           .style("width", '5px')
           .style("height",(d) => h-yScale(d[1])-padd)
           .attr("data-date", function(d){ return`${formatTime(d[0])}`})
           .attr("data-gdp", function(d){ return`${d[1]}`})
           .on("mouseover", function(d){
            tool.text(`${d3.select(this).attr("data-date")} $${d3.select(this).attr("data-gdp")} Billion`); tool.attr("data-date", `${d3.select(this).attr("data-date")}`); 
            return tool.style("visibility", "visible");
            })
           .on("mouseout", function(d){
              return tool.style("visibility","hidden")});
           
  const xAxis = d3.axisBottom(xScale);
  
  svg.append("g")
     .attr("transform", "translate(0," + (h-padd)+")")
     .attr("id", "x-axis")   
     .call(xAxis);
  
  const yAxis = d3.axisLeft(yScale);
  svg.append("g")
     .attr("transform", "translate("+padd+", 0)")
     .attr("id", "y-axis")
     .call(yAxis);  
                 
}

  