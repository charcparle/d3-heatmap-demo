const req = new XMLHttpRequest();
req.open("GET",'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json', true);
req.send();
req.onload=function(){
    const w=1200;
    const h=500;
    const padding = 80;
    let cellH = 20;
    let cellW = 3;
    let legendAnchorX = padding;
    let legendAnchorY = h-20;
    let legendW = 200;

    //https://github.com/d3/d3-scale-chromatic
    let color = d3.scaleSequential(d3.interpolateRdYlBu)

    let svg = d3.select('#canvas').append("svg").attr("width",w).attr("height",h)

    const title = svg.append("text").text("Monthly Global Land-Surface Temperature")
                        .attr("x", w/2).attr("y", padding/3).attr("id","title").attr("text-anchor","middle")
    const description = svg.append("text").text("1753 - 2015: base temperature 8.66 deg C")
                        .attr("x",w/2).attr("y",padding-25).attr("id","description").attr("text-anchor","middle")      
    
  const json = JSON.parse(req.responseText);
  //document.getElementById('canvas').innerHTML = JSON.stringify(json);
  const dataset = json.monthlyVariance;
  const baseTemp = json.baseTemperature;
  //document.getElementById('parsePage').innerHTML = (dataset); 
  //console.log(typeof(json))
  //console.log(dataset)
  
  //https://d3-wiki.readthedocs.io/zh_CN/master/Time-Formatting/
  let parseTime = d3.timeParse("%Y-%m-%d")
  let parseMonth = d3.timeParse("%m")
  let parseYear = d3.timeParse("%Y")
  let formatMonth = d3.timeFormat("%B")
  
  let years=[];
  let months=[];
  let temps=[];
  dataset.forEach((s)=>{
    years.push(parseYear(s.year));
    months.push(new Date(Date.UTC(70,s.month*1-1,1,3,4,5)));
    temps.push(Math.floor((s.variance*1+baseTemp*1)*1000)/1000);
  });
  
  color.domain([d3.max(temps),d3.min(temps)]);
  //console.log(color(temps[4]))
  
  let yCeiling = new Date(d3.max(months));
  //yCeiling = yCeiling.setMonth(yCeiling.getMonth());
  let yFloor = new Date(d3.min(months));
  //yFloor = yFloor.setMonth(yFloor.getMonth());
  const yScale = d3.scaleBand().domain(months).range([padding,h-padding]);
  console.log("yScale(yFloor): ",yScale(yFloor))
  
  let xCeiling = new Date(d3.max(years))
  xCeiling.setFullYear(xCeiling.getFullYear()+1)
  let xFloor = new Date(d3.min(years));
  xFloor.setFullYear(xFloor.getFullYear()-0)
  const xScale = d3.scaleTime().domain([xFloor,xCeiling]).range([padding, w-padding])
  
  cellH = yScale(new Date(Date.UTC(70,1,1,3,4,5)))-yScale(new Date(Date.UTC(70,0,1,3,4,5)))
  console.log("cellH: ",cellH)
  cellW = Math.floor(xScale(parseYear("2015"))-xScale(parseYear("2014")))+1
  let tooltip = d3.select("#canvas").append("div").attr("id","tooltip").style("opacity",0)
  
  svg.selectAll("rect")
            .data(dataset)
            .enter()
            .append("rect")
            .attr("class","cell")
            .attr("width",cellW)
            .attr("height",cellH)
            .attr("x",(d,i)=>xScale(years[i]))
            .attr("y",(d,i)=>yScale(months[i]))
            .attr("data-year",(d,i)=>d.year)
            .attr("data-month",(d,i)=>d.month*1-1)
            .attr("data-temp",(d,i)=>temps[i])
            .attr("fill", (d,i)=>color(temps[i]))
            .on('mouseover', showTooltip)
            .on('mouseout', hideTooltip);

  function showTooltip (e,d){
    const i = dataset.indexOf(d)
    tooltip.transition().duration(100).style('opacity', 0.9);
    tooltip.html(d.year + " - " + formatMonth(months[i]) + "<br>" + temps[i] + "&#8451;")
      .attr("data-year", d.year)
      .style('left', (xScale(years[i])) + 'px')
      .style('top', (yScale(months[i])-cellH/2+100) + 'px');
  }
  function hideTooltip (e,d){
    tooltip.transition().duration(100).style('opacity', 0);
  } 
  
  
  const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%B"))
  svg.append("g").attr("id","y-axis").attr("transform","translate("+padding+","+0+")")
     .call(yAxis)
  
  const xAxis = d3.axisBottom().scale(xScale).tickFormat(d3.timeFormat("%Y"))
  svg.append("g").attr("id","x-axis").attr("transform","translate(0,"+(h-padding)+")")
     .call(xAxis)
  
  //console.log(color.domain());
  const legendScale = d3.scaleLinear()
                        .domain([d3.min(temps), d3.max(temps)+0])
                        .range([legendAnchorX,legendAnchorX+legendW]);
  legendScale.nice();
  //legendScale.ticks();
  const legendAxis = d3.axisBottom(legendScale);
  
  let legend = svg.append("g").attr("id", "legend")
    .selectAll("#legend")
    .data(temps)
    .enter()
    .append("g")
    .attr("class", "legend-label")
    .attr("transform", (d,i)=> {
      return 'translate(' + legendScale(d) + ' ,' + (legendAnchorY-20) + ')';
    });
  
  legend
    .append('rect')
    .attr('width', 5)
    .attr('height', 20)
    .style('fill', (d,i)=>color(temps[i]));
  
  svg.append("g").attr("id","legendAxis")
     .attr("transform","translate("+0+","+(legendAnchorY)+")")
     .call(legendAxis)
  
};

