/* edit/input your data */
d3.csv('/data/pop_years_rangeAges.csv',function (error,data) {
  //error handle
  if (error) throw error;
	
  //parsing data
  data.forEach(function(d) {
  	                
  						 d.F = +d.F;
  						 d.M = +d.M;
  });
  
  
  var curYear = d3.select("#year").property("value");
  console.log(curYear);
  var data_curYear = data.filter(d => {return d.Year == curYear   } )
 								 .map(obj => {
		  							var row = {};
		  							row['eth'] = obj.Ethnicity;
		  							row['age'] = obj.Age_Range;
		  							row['f'] = obj.F; // /1000;
		  							row['m'] = obj.M; // /1000;
		  							return row;
							})
  
  console.log(data_curYear); 
     
  // CSV section
  var body = d3.select('body')
  //Create Eth filter/grouping  
  var nestData = d3.nest()
						   .key(d => d.Ethnicity)
						   .rollup(v=> v.length)
						   .entries(data);
    
  var selectData = nestData.map(k => k.key);
  selectData.splice(0,1,"All");
  
  console.log(selectData);
  
  var total_byAge = d3.nest()
					   .key(d => d.age)
					   .sortKeys(d3.descending)
					   .rollup(function(v) { return {
					   	            //"length": v.length,
					   					"f": Math.round(d3.sum(v,function(d) {return d.f})), 
					   					"m": Math.round(d3.sum(v,function(d) {return d.m})),
					   		}})
					   .entries(data_curYear);	
  
  var totals = total_byAge.map(obj => {
  							var row = {};
  							row['age'] = obj.key;
  							row['f'] = obj.value.f;
  							row['m'] = obj.value.m;
  							return row;
  						});
  						
  
  // Select X-axis Variable - combox
  var filters = d3.select('#filter')
  var span = filters.append('span')
    .text('Select Ethnicity ')
  var yInput = filters.append('select')
      .attr('id','xSelect')
      .on('change',xChange) //call function when values change
    .selectAll('option')
      .data(selectData)
      .enter()
    .append('option')
      .attr('value', function (d) { return d })
      .text(function (d) { return d ;})
  filters.append('p')
    
  /* edit these settings freely */  
  var w = 600,
	    h = 400,
	    topMargin = 15,
	    labelSpace = 40,
	    innerMargin = w/2+labelSpace,
	    outerMargin = 15,
	    gap = 2,
	    dataRange = d3.max(totals.map(function(d) { return Math.max(d.m, d.f) })),
	    leftLabel = "Male",
	    rightLabel = "Female";
	    
 console.log(dataRange);
  	
 /* edit with care */
 var chartWidth = w - innerMargin - outerMargin,
	    barWidth = h / totals.length,
	    yScale = d3.scaleLinear().domain([0, totals.length]).range([0, h-topMargin]),
	    total = d3.scaleLinear().domain([0, dataRange]).range([0, chartWidth - labelSpace]),
	    commas = d3.format(",.0f");
	
 console.log(total);
 
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
  
 /* ageAxis label */
 vis.append("text")
  .attr("class", "label")
  .text("Age Range")
  .attr("x", innerMargin - 10)
  .attr("y", topMargin-3)
  .attr("text-anchor", "end");
 

 /* female bars and data labels */ 
 var bar = vis.selectAll("g.bar")
    .data(totals)
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
    
 d3.select("").on("input",function() {update(+this.value)}); 
    
 function updateScale(newData) {
 	dataRange = d3.max(newData.map(function(d) { return Math.max(d.m, d.f) }))
 	total = d3.scaleLinear().domain([0, dataRange]).range([0, chartWidth - labelSpace])
 }
 
 function xChange() {
    var value = this.value // get the new x value
    console.log(value);
    //filter by Eth
    var filteredData = value == "All"? totals : (
															    data_curYear.filter(d => {return d.eth == value   } )
												    							 .map(obj => {
															  							var row = {};
															  							row['age'] = obj.age;
															  							row['f'] = Math.round(obj.f);
															  							row['m'] = Math.round(obj.m);
															  							return row;
																				})
			  						);
			  						
    console.log(filteredData);
    updateScale(filteredData);
        
    refresh(filteredData);
    
  }
	
 refresh(totals);

 //OJO - check this part to find bug	
 function refresh(tot) {
	  var bars = d3.selectAll("g.bar")
	      .data(tot);
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
 
 function updateYear(year) {
    //adjust text on the range slider
    d3.select("#slider_value").text(year);
    d3.select("").property("value",year);
    
    refresh(filteredData);
 }
  
});  



