//some constants
var margin = {
  top: 100,
  right: 50,
  left: 60,
  bottom: 120
};
w = 800-margin.right-margin.left;
h = 600-margin.top-margin.bottom;

//tooltip creation
const tool = d3.select('body')
                   .append('div')
                   .attr("id", "tooltip")
                   .attr("class", 'd3-tip')
                   .style("visibility", "hidden")
                   .style("position", "absolute");
web = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"

d3.json(web)
  .then(data => {
  //format the months
  data.monthlyVariance.forEach(function (val) {
    val.month -= 1;
  });
//description
  d3.select('body').append('h3')
    .html("Temperatures in "+  data.monthlyVariance[0].year+ " - "+ data.monthlyVariance[data.monthlyVariance.length-1].year+" with base temperature of " + data.baseTemperature+' Celsius')
//create the svg
  var svg = d3.select('body')
              .append('svg')
              .attr('width', w + margin.right+margin.left)
              .attr('height', h + margin.top+margin.bottom);
  //create the y-axis
  var yScale = d3.scaleBand()
                 .domain([0,1,2,3,4,5,6,7,8,9,10,11])
                 .range([0,h]);
  
  var yAxis = d3.axisLeft()
                .scale(yScale)
                .tickValues(yScale.domain())
                .tickFormat(function(m) {
                            var date = new Date(0);
                            date.setUTCMonth(m);
                            var format = d3.utcFormat('%B');
                            return format(date);
                            })
                .tickSize(10,1);
  svg.append('g')
     .classed('y-axis', true)
     .attr('id', 'y-axis')
     .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
     .call(yAxis)
     .append('text')
     .text('Months')
     .attr('x', -30)
     .attr('y', -10)
     .style('font-size', '14px')
     .style('text-anchor', 'middle')
     .attr('fill', 'black');
  //create the x-axis
   var xScale = d3.scaleBand()
                  .domain(
                    data.monthlyVariance.map(function (val) {
                        return val.year;
                        })
                         )
                  .range([0, w]);
                  
  var xAxis = d3.axisBottom()
                .scale(xScale)
                .tickValues(
                            xScale.domain().filter(function (year) {
                                  return year % 10 === 0;
                            })
                            )
                .tickFormat(function (year) {
                            var date = new Date(0);
                            date.setUTCFullYear(year);
                            var format = d3.utcFormat('%Y');
                            return format(date);
                            })
                .tickSize(10, 1);
  
  svg.append('g')
     .classed('x-axis', true)
     .attr('id', 'x-axis')
     .attr('transform', 'translate(' + margin.left + ',' + (h+margin.top) + ')')
     .call(xAxis)
     .append("text")
     .text("Years")
     .attr('x', w/2)
     .attr('y', 36)
     .style('font-size', '14px')
     .style('text-anchor', 'middle')
     .attr('fill', 'black');

  //create the color scheme
  var temp_base = data.baseTemperature
  var temp_min = Math.min(...data.monthlyVariance.map(item => item.variance))+temp_base
  var temp_max = Math.max(...data.monthlyVariance.map(item => item.variance))+temp_base
  var i = d3.interpolateNumber(temp_min, temp_max)
  var legend_nums = [i(0), i(0.1), i(0.2), i(0.3), i(0.4), i(0.5),
                    i(0.6), i(0.7), i(0.8), i(0.9), i(1)];
  function interpolate(num){
    return (num-temp_min)/(temp_max-temp_min)
  }
  //create the legend
  var legendScale = d3.scaleLinear()
                      .domain([temp_min, temp_max])
                      .range([20, 40*legend_nums.length+20])
  var legendxAxis = d3.axisBottom()
                      .scale(legendScale)
                      .tickSize(10,1)
                      .tickValues(legend_nums)
                      .tickFormat(d3.format('.1f'));
  var legend = svg.append('g')
                  .classed('legend', true)
                  .attr('id', 'legend')
                  .attr('transform', 'translate('+ margin.left+ ',' +(margin.top+h+margin.bottom - 80)+')');
  legend.append('g')
        .selectAll('rect')
        .data(legend_nums)
        .enter()
        .append('rect')
        .style('fill', function (d){
            b = interpolate(d)
            return d3.interpolatePlasma(b);
  })
        .attr('x', (d, i)=> i*44)
        .attr('y', 0)
        .attr('width', 44)
        .attr('height', 44);
  legend.append('g')
        .attr('transform', 'translate('+0+','+ 50+ ')')
        .call(legendxAxis)
  
  
  
  //graph the heat map
  svg.append('g')
     .classed('map', true)
     .attr('transform', 'translate(' + margin.left + ',' + (margin.top) + ')')
     .selectAll('rect')
     .data(data.monthlyVariance)
     .enter()
     .append('rect')
     .attr('class', 'cell')
     .attr('data-month', function (d){return (d.month)})
     .attr('data-year', function(d){ return d.year})
     .attr('data-temp', function (d){ return  temp_base + d.variance})
     .attr('x', d => xScale(d.year))
     .attr('y', d => yScale(d.month))
     .attr('width', d => xScale.bandwidth(d.year))
     .attr('height', d =>yScale.bandwidth(d.month))
     .attr('fill', function(d){
                        c = temp_base + d.variance
                        cc = interpolate(c)
                        return d3.interpolatePlasma(cc);
                                })
     .on('mouseover', function(event, d){
        var date = new Date(d.year, d.month);
        tool.style('visibility', 'visible')
        tool.attr('data-year', d.year);
        
        var st = "<span class = 'date'>" +
                  d3.utcFormat('%Y - %B')(date) +
                 "</span>" +
                 '<br />' + 
                  "<span class= tempp>" + 
                  d3.format('.1f')(temp_base+d.variance)+' celcius' +
                 "</span>" +
                  '<br />' +
                 "<span>" +
                  d3.format('+.1f')(d.variance) +" change in celcius"+ 
                 '</span>';
       
      
       tool.html(st)
                .style('left', event.pageX+10+'px')
                .style('top', event.pageY-10+'px')
       })
       .on('mouseout', function(){
         tool.style('visibility', 'hidden');
       });
                
})