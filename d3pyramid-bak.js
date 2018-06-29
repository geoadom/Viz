/* edit/input your data */
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
    
  var selectData = nestData.map(k => k.key);
   
  var totals = d3.nest()
					   .key(d => d.Age_Range)
					   .rollup(function(v) { return {
					   	            //"length": v.length,
					   					"F": Math.floor(d3.sum(v,function(d) {return d.F}) / 1000),
					   					"M": Math.floor(d3.sum(v,function(d) {return d.M})/ 1000),
					   		}})
					   .entries(data);	
  
  var total_byAge = totals.map(obj => {
  							var row = {};
  							row['age'] = obj.key;
  							row['f'] = obj.value.F;
  							row['m'] = obj.value.M;
  							return row;
  						});
    
  /* edit these settings freely */  
  var w = 600,
	    h = 400,
	    topMargin = 15,
	    labelSpace = 40,
	    innerMargin = w/2+labelSpace,
	    outerMargin = 15,
	    gap = 2,
	    dataRange = d3.max(total_byAge.map(function(d) { return Math.max(d.m, d.f) })),
	    leftLabel = "Male",
	    rightLabel = "Female";
	    
 console.log(total_byAge.length);
  	
 /* edit with care */
 var chartWidth = w - innerMargin - outerMargin,
	    barWidth = h / total_byAge.length,
	    yScale = d3.scaleLinear().domain([0, total_byAge.length]).range([0, h-topMargin]),
	    total = d3.scaleLinear().domain([0, dataRange]).range([0, chartWidth - labelSpace]),
	    commas = d3.format(",.0f");
	
  
 /* main panel */
 var vis = d3.select("#graph-container").append("svg")
    .attr("width", w)
    .attr("height", h);

 /* barData1 label */
 vis.append("text")
  .attr("class", "label")
  .text(leftLabel)
  .attr("x", w-innerMargin)
  .attr("y", topMargin-3)
  .attr("text-anchor", "end");

 /* barData2 label */
 vis.append("text")
  .attr("class", "label")
  .text(rightLabel)
  .attr("x", innerMargin)
  .attr("y", topMargin-3);

 /* female bars and data labels */ 
 var bar = vis.selectAll("g.bar")
    .data(total_byAge)
  .enter().append("g")
    .attr("class", "bar")
    .attr("transform", function(d, i) {
      return "translate(0," + (yScale(i) + topMargin) + ")";
    });

 var wholebar = bar.append("rect")
    .attr("width", w)
    .attr("height", barWidth-gap)
    .attr("fill", "none")
    .attr("pointer-events", "all");

 var highlight = function(c) {
  return function(d, i) {
    bar.filter(function(d, j) {
      return i === j;
    }).attr("class", c);
  };
 };

 bar
  .on("mouseover", highlight("highlight bar"))
  .on("mouseout", highlight("bar"));

 bar.append("rect")
    .attr("class", "femalebar")
    .attr("height", barWidth-gap);

 bar.append("text")
    .attr("class", "femalebar")
    .attr("dx", -3)
    .attr("dy", "1em")
    .attr("text-anchor", "end");

 bar.append("rect")
    .attr("class", "malebar")
    .attr("height", barWidth-gap)
    .attr("x", innerMargin);

 bar.append("text")
    .attr("class", "malebar")
    .attr("dx", 3)
    .attr("dy", "1em");

 /* sharedLabels */
 bar.append("text")
    .attr("class", "shared")
    .attr("x", w/2)
    .attr("dy", "1em")
    .attr("text-anchor", "middle")
    .text(function(d) { return d.age; });
    
    
 //Randonise data - update pyramids
 d3.select("#generate").on("click", function() {
	  for (var i=0; i<total_byAge.length; i++) {
	    total_byAge[i].m = Math.random() * dataRange;
	    total_byAge[i].f = Math.random() * dataRange;
	  }
	  refresh(total_byAge);
	  
 });
	
 refresh(total_byAge);
	
 function refresh(total_byAge) {
	  var bars = d3.selectAll("g.bar")
	      .data(total_byAge);
	  bars.selectAll("rect.malebar")
	    .transition()
	      .attr("width", function(d) { return total(d.m); });
	  bars.selectAll("rect.femalebar")
	    .transition()
	      .attr("x", function(d) { return innerMargin - total(d.f) - 2 * labelSpace; }) 
	      .attr("width", function(d) { return total(d.f); });
	
	  bars.selectAll("text.malebar")
	      .text(function(d) { return commas(d.m); })
	    .transition()
	      .attr("x", function(d) { return innerMargin + total(d.m); });
	  bars.selectAll("text.femalebar")
	      .text(function(d) { return commas(d.f); })
	    .transition()
	      .attr("x", function(d) { return innerMargin - total(d.f) - 2 * labelSpace; });
 }

});  



