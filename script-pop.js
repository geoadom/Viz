d3.csv('/data/population2021_rangeAges.csv',function (error,data) {
  //error handle
  if (error) throw error;
	
  //parsing data
  data.forEach(function(d) {
  	                
  						 d.F = +d.F;
  						 d.M = +d.M;
  });
  
  // CSV section
  var body = d3.select('body')
  //Create Eth filter/grouping  
  var nestData = d3.nest()
						   .key(d => d.Ethnicity)
						   .rollup(v=> v.length)
						   .entries(data);
  //console.log(JSON.stringify(nestData));
  
  var selectData = nestData.map(k => k.key);
  console.log(selectData);
   
  var totals = d3.nest()
					   .key(d => d.Age_Range)
					   .rollup(function(v) { return {
					   	            "length": v.length,
					   					"F": d3.sum(v,function(d) {return d.F}) / 1000.0,
					   					"M": d3.sum(v,function(d) {return d.M})/ 1000.0,
					   		}})
					   .entries(data);
  //console.log(totals);
  
  //Filtering by Ethnicity
  //See how to do it
  //Using filter function & sum ??
  
  var population = totals;
  
  // Select X-axis Variable - combox
  var span = body.append('span')
    .text('Select x-Ethnicity variable: ')
  var yInput = body.append('select')
      .attr('id','xSelect')
      .on('change',xChange) //call function when values change
    .selectAll('option')
      .data(selectData)
      .enter()
    .append('option')
      .attr('value', function (d) { return d })
      .text(function (d) { return d ;})
  body.append('br')

  // Select Y-axis Variable - combox
  var span = body.append('span')
      .text('Select Y-Axis variable: ')
  var yInput = body.append('select')
      .attr('id','ySelect')
      .on('change',yChange)
    .selectAll('option')
      .data(selectData)
      .enter()
    .append('option')
      .attr('value', function (d) { return d })
      .text(function (d) { return d ;})
  body.append('br')

  // Variables
  var body = d3.select('.graph-container');
  var margin = { top: 50, right: 50, bottom: 50, left: 50 }
  var h = 500 - margin.top - margin.bottom
  var w = 500 - margin.left - margin.right
  var formatPercent = d3.format('.2%')
  
  // Scales
  var colorScale = d3.scale.category20()
  var yScale = d3.scale.linear()
					  .domain(population.map(d => d.key) )
					  
  var xScale_M = d3.scale.linear()
				     .domain([0,d3.max(population,function (d) { return d['M'] })])
				     .range([1000,0])
  var xScale_F = d3.scale.linear()
				     .domain([0,d3.max(population,function (d) { return d['F'] })])
				     .range([0,1000]) 
				      
  // SVG
  var svg_M = body.append('svg')
      .attr('height',h + margin.top + margin.bottom)
      .attr('width',w + margin.left + margin.right)
    .append('g')
      .attr('transform','translate(' + margin.left + ',' + margin.top + ')')
      
  var svg_F = body.append('svg')
      .attr('height',h + margin.top + margin.bottom)
      .attr('width',w + margin.left + margin.right)
    .append('g')
      .attr('transform','translate(' + margin.left + ',' + margin.top + ')')
  
  // X-axis
  var xAxis_M = d3.svg.axis()
    .scale(xScale_M)
    .tickFormat(formatPercent)
    .ticks(5)
    .orient('bottom')
  // Y-axis
  var xAxis_F = d3.svg.axis()
    .scale(xScale_F)
    .tickFormat(formatPercent)
    .ticks(5)
    .orient('bottom')
    
  // Circles
  var bars = svg_M.selectAll('.bar')
      .data(population)
      .enter()
    .append('rect')
      .attr("class","bar")
      .attr('x',function (d) { return xScale_M(d['M']) })
      .attr("width",x.bandwith())
      .attr('y',function (d) { return y(d.key) })
      .attr('height',function (d) { return height -  y(d.key)})
      .on('mouseover', function () {
        d3.select(this)
          .transition()
          .duration(500)
          .attr('r',20)
          .attr('stroke-width',3)
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(500)
          .attr('r',10)
          .attr('stroke-width',1)
      })
    .append('title') // Tooltip
      .text(function (d) { return d.Age_Range + '\nMale: ' + d['M'] })
      
  // X-axis
  svg_M.append('g')
      .attr('class','axis')
      .attr('id','xAxis')
      .attr('transform', 'translate(0,' + h + ')')
      .call(xAxis)
    .append('text') // X-axis Label
      .attr('id','xAxisLabel')
      .attr('y',-10)
      .attr('x',w)
      .attr('dy','.71em')
      .style('text-anchor','end')
      .text('Annualized Return')
  // Y-axis
  svg_M.append('g')
      .attr('class','axis')
      .attr('id','yAxis')
      .call(yAxis)
    .append('text') // y-axis Label
      .attr('id', 'yAxisLabel')
      .attr('transform','rotate(-90)')
      .attr('x',0)
      .attr('y',5)
      .attr('dy','.71em')
      .style('text-anchor','end')
      .text('Annualized Return')

  function yChange() {
    var value = this.value // get the new y value
    yScale // change the yScale
      .domain([
        d3.min([0,d3.min(data,function (d) { return d[value] })]),
        d3.max([0,d3.max(data,function (d) { return d[value] })])
        ])
    yAxis.scale(yScale) // change the yScale
    d3.select('#yAxis') // redraw the yAxis
      .transition().duration(1000)
      .call(yAxis)
    d3.select('#yAxisLabel') // change the yAxisLabel
      .text(value)    
    d3.selectAll('circle') // move the circles
      .transition().duration(1000)
      .delay(function (d,i) { return i*100})
        .attr('cy',function (d) { return yScale(d[value]) })
  }

  function xChange() {
    var value = this.value // get the new x value
    xScale // change the xScale
      .domain([
        d3.min([0,d3.min(data,function (d) { return d[value] })]),
        d3.max([0,d3.max(data,function (d) { return d[value] })])
        ])
    xAxis.scale(xScale) // change the xScale
    d3.select('#xAxis') // redraw the xAxis
      .transition().duration(1000)
      .call(xAxis)
    d3.select('#xAxisLabel') // change the xAxisLabel
      .transition().duration(1000)
      .text(value)
    d3.selectAll('circle') // move the circles
      .transition().duration(1000)
      .delay(function (d,i) { return i*100})
        .attr('cx',function (d) { return xScale(d[value]) })
  }
})