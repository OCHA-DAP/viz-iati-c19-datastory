function formatValue(value) {
  return (d3.format("$.2s")(value)).replace('G', 'B');
}

function make_x_gridlines(x) {   
  return d3.axisBottom(x)
    .ticks(5)
}  

function make_y_gridlines(y) {   
  return d3.axisLeft(y)
    .ticks(5)
}


function lineChart() {
  var marginL = (isMobile) ? 60 : 90;
  var margin = {top: 10, right: 90, bottom: 40, left: marginL},
      width = chartW - margin.left - margin.right,
      height = chartH - margin.top - margin.bottom;

  //init svg
  var svg = d3.select("#lineChart")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  //init tooltip
  var tool_tip = d3.tip()
      .attr("class", "d3-tip")
      .offset([-8, 0])
      .html(function(d) { return d.name + '<br>' + d3.timeFormat('%b %Y')(d.date) + ': ' + d.value; });
    svg.call(tool_tip);


  //get data
  d3.csv("data/iati-c19-publishers.csv", 
    function(d) {
      if (d['Publisher Group']!='') {
        return { date: d3.timeParse("%Y-%m")(d.Date), value: d['SUM of # Publishers'], name: d['Publisher Group'] }
      }
    },

    function(data) {
      //group the data
      var sumstat = d3.nest()
        .key(function(d) { return d.name; })
        .entries(data);

      //x axis
      var x = d3.scaleTime()
        .domain(d3.extent(data, function(d) { return d.date; }))
        .range([ 0, width ]);
      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)
          .ticks(5)
          .tickFormat(d3.timeFormat('%b %Y'))
          .tickSizeOuter(0)
        );

      //y axis
      var y = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return +d.value; })])
        .range([ height, 0 ]);
      svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y)
          .ticks(5)
        );

      //y gridlines
      svg.append("g")     
        .attr("class", "grid")
        .call(make_y_gridlines(y)
          .tickSize(-width)
          .tickFormat("")
        )

      //y axis label
      svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "middle")
        .attr("x", -height/2)
        .attr("y", -margin.left)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Number of publishers");

      //colors
      var res = sumstat.map(function(d){ return d.key }) // list of group names
      var color = d3.scaleOrdinal()
        .domain(res)
        .range(['#418FDE', '#E56A54', '#ECA154', '#A4D65E'])

      //line
      svg.selectAll(".line")
        .data(sumstat)
        .enter()
        .append("path")
          .attr("class", "pubLine")
          .attr("fill", "none")
          .attr("id", function(d, i) { return "pubLine"+i; })
          .attr("stroke", function(d){ return color(d.key) })
          .attr("stroke-width", 1.5)
          .attr("d", function(d){
            return d3.line()
              .curve(d3.curveCatmullRom)
              .x(function(d) { return x(d.date); })
              .y(function(d) { return y(+d.value); })
              (d.values)
          })

      //dots
      svg.selectAll("dot")
          .data(data)
        .enter().append("circle")
          .attr("r", 3)
          .attr("opacity", 1)
          .attr("class", function(d) { 
            var className = (d.name=='Non Governmental Organization') ? 'pubDot pubDot2' : 'pubDot';
            return className
          })
          .attr("fill", function(d){ return color(d.name) })
          .attr("cx", function(d) { return x(d.date); })
          .attr("cy", function(d) { return y(d.value); })
          .on('mouseover', tool_tip.show)
          .on('mouseout', tool_tip.hide);

      //legend
      var legend = svg.append('g')
        .attr('class', 'legend')
        .attr("transform",
            "translate(" + 10 + ", 0)");

      //sort legend items
      var legendArray = [];
      sumstat.forEach(function(stat) {
        var max = d3.max(stat.values, d => +d.value);
        var obj = {key: stat.key, val: max};
        legendArray.push(obj);
      });
      legendArray.sort((a,b) => (a.val < b.val) ? 1 : ((b.val < a.val) ? -1 : 0));

      var legendItem = legend.selectAll('.legend-item')
        .data(legendArray)
        .enter().append('g');

      legendItem.append('rect')
        .attr('x', 0)
        .attr('y', function(d, i) { return i * 18; })
        .attr('width', 10)
        .attr('height', 10)
        .style('fill', function(d) { return color(d.key); });

      legendItem.append('text')
        .attr('x', 14)
        .attr('y', function(d, i) { return (i * 18) + 9; })
        .text(function(d) { return d.key; });
    }
  )
}

function growthChart() {
  var marginL = (isMobile) ? 60 : 90;
  var margin = {top: 3, right: 90, bottom: 40, left: marginL},
      width = chartW - margin.left - margin.right,
      height = chartH - margin.top - margin.bottom;

  //init svg
  var svg = d3.select("#growthChart")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  //init tooltip
  var tool_tip = d3.tip()
      .attr("class", "d3-tip")
      .offset([-8, 0])
      .html(function(d) { return d.name + '<br>' + d3.timeFormat('%b %Y')(d.date) + ': ' + formatValue(d.value); });
    svg.call(tool_tip);

  //get data
  d3.csv('data/iati-c19-commitments-by-org-type.csv', 
    function(d) {
      return { date: d3.timeParse("%Y-%m")(d['Month']), value: d['Net new commitments'], name: d['Reporting org type'] }
    },

    function(data) {
      data.shift(); //drop first row of headers

      //group the data
      var sumstat = d3.nest()
        .key(function(d) { return d.name; })
        .entries(data);

      //x axis
      var maxTicks = (isMobile) ? 3 : 5;
      var x = d3.scaleTime()
        .domain(d3.extent(data, function(d) { return d.date; }))
        .range([ 0, width ]);
      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)
          .ticks(maxTicks)
          .tickFormat(d3.timeFormat('%b %Y'))
          .tickSizeOuter(0)
        );

      //y axis
      var y = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return +d.value; })])
        .range([ height, 0 ]);
      svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y)
          .ticks(5)
          .tickFormat(formatValue)
        );

      //y gridlines
      svg.append("g")     
        .attr("class", "grid")
        .call(make_y_gridlines(y)
          .tickSize(-width)
          .tickFormat("")
        )

      //y axis label
      svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "middle")
        .attr("x", -height/2)
        .attr("y", -margin.left)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Commitments (USD)");

      //colors
      var res = sumstat.map(function(d){ return d.key })
      var color = d3.scaleOrdinal()
        .domain(res)
        .range(['#418FDE', '#E56A54', '#ECA154', '#A4D65E'])
        
      //line
      svg.selectAll(".line")
        .data(sumstat)
        .enter()
        .append("path")
          .attr("class", "orgLine")
          .attr("fill", "none")
          .attr("id", function(d, i) { return "orgLine"+i; })
          .attr("stroke", function(d){ return color(d.key) })
          .attr("stroke-width", 1.5)
          .attr("d", function(d){
            return d3.line()
              .curve(d3.curveCatmullRom)
              .x(function(d) { return x(d.date); })
              .y(function(d) { return y(+d.value); })
              (d.values)
          });

      //highlight lines
      svg.selectAll("highlight")
          .data(data)
        .enter().append('line')
          .attr("class", function(d) { 
            return (d.date.getMonth()==2 || d.date.getMonth()==5 || d.date.getMonth()==8 || d.date.getMonth()==11) ? "highlightLine" : ""; 
          })
          .style("stroke", "#CCC")
          .style("stroke-width", 1)
          .attr("stroke-dasharray", "4 2")
          .attr("opacity", "0")
          .attr("x1", function(d) { return x(d.date); })
          .attr("y1", 0)
          .attr("x2", function(d) { return x(d.date); })
          .attr("y2", height);

      //dots
      var dots = svg.selectAll("dot")
          .data(data)
        .enter().append("circle")
          .attr("r", 3)
          .attr("opacity", 1)
          .attr("class", "orgDot")
          .attr("class", function(d) {
            var className = 'orgDot';
            if (d.name=='Multilateral')
              className += ' orgDot1';
            if (d.name=='Government & Public Sector')
              className += ' orgDot0';
            return className
          })
          .attr("fill", function(d){ return color(d.name) })
          .attr("cx", function(d) { return x(d.date); })
          .attr("cy", function(d) { return y(d.value); })
          .on('mouseover', tool_tip.show)
          .on('mouseout', tool_tip.hide);

      //legend
      var legend = svg.append('g')
        .attr('class', 'legend')
        .attr("transform",
            "translate(" + (width-180) + ", 0)");

      //sort legend
      var legendArray = [];
      sumstat.forEach(function(stat) {
        var max = d3.max(stat.values, d => +d.value);
        legendArray.push( {key: stat.key, val: max} );
      });
      legendArray.sort((a,b) => (a.val < b.val) ? 1 : ((b.val < a.val) ? -1 : 0));

      var legendItem = legend.selectAll('.legend-item')
        .data(legendArray)
        .enter().append('g');

      legendItem.append('rect')
        .attr('x', 0)
        .attr('y', function(d, i) { return i * 18; })
        .attr('width', 10)
        .attr('height', 10)
        .style('fill', function(d) { return color(d.key); });

      legendItem.append('text')
        .attr('x', 14)
        .attr('y', function(d, i) { return (i * 18) + 9; })
        .text(function(d) { return d.key; });
    }
  )
}


function lollipopChart() {
  var margin = {top: 0, right: 90, bottom: 40, left: 90},
      width = chartW - margin.left - margin.right,
      height = chartH - margin.top - margin.bottom;

  //init svg
  var svg = d3.select("#lollipopChart")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  //init tooltip
  var tool_tip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-8, 0])
    .html(function(d) {
      var content = '<span class="label type">Spending: ' + formatValue(d['Net spending']);
      content += '<br>Commitments: ' + formatValue(d['Net commitments']);
      content += '<br>Percentage gap: ' + d['Percentage gap'] + '%</span>';
      return content; 
    });
  svg.call(tool_tip);

  //get data
  d3.csv("data/iati-c19-commitment-spending-by-country.csv", function(data) {
    data.shift(); //remove headers

    //get curated list
    var countryList = ['Egypt','Angola','Nigeria','Turkey','Guatemala','Ecuador','Myanmar','Kenya','Niger','Kazakhstan'];
    var chartData = [];
    data.forEach(function(d) {
      countryList.forEach(function(c, i) {
        if (d['Recipient country'] == c) {
          chartData.push(d);
          countryList.splice(i, 1);
        }
      })
    });

    //sort by gap percentage
    data = data.sort((a, b) =>
      +a['Percentage gap'] > +b['Percentage gap'] ? -1 : 1
    )

    //x axis
    gapX = d3.scaleLinear()
      .domain([0, d3.max(chartData, d => +d['Net commitments'])])
      .range([0, width]);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(gapX)
        .tickFormat(function(d, i) {
          return i % 2 === 0 ? formatValue(d) : null; 
        })
        .tickSizeOuter(0)
      )

    //x axis label
    svg.append("text")
      .attr("class", "x label")
      .attr("text-anchor", "middle")
      .attr("x", width/2)
      .attr("y", height + margin.bottom)
      .text("(USD)");

    //y axis
    var y = d3.scaleBand()
      .range([0, height])
      .domain(chartData.map(function(d) { return d['Recipient country']; }))
      .padding(1);
    svg.append("g")
      .call(d3.axisLeft(y)
        .tickSizeOuter(0)
      )

    //y axis label
    svg.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "middle")
      .attr("x", -height/2)
      .attr("y", -margin.left)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text("Recipient country");

    //lines
    var lines = svg.selectAll("deficitLine")
      .data(chartData)
      .enter()
      .append('g')
        .attr("class", "gapLines")
        .attr("id", function(d) {
          return (d['Recipient country']).toLowerCase()
        });

    lines.append("line")
        .attr("class", "gapLine")
        .attr("stroke", "#CCC")
        .attr("stroke-width", "1px")
        .attr("x1", function(d) { return gapX(d['Net spending']); })
        .attr("x2", function(d) { return gapX(d['Net commitments']); })
        .attr("y1", function(d) { return y(d['Recipient country']); })
        .attr("y2", function(d) { return y(d['Recipient country']); });

    lines.append("circle")
        .style("fill", "#F2645A")
        .attr("class", "spending")
        .attr("r", "6")
        .attr("cx", function(d) { return gapX(d['Net spending']); })
        .attr("cy", function(d) { return y(d['Recipient country']); });

    lines.append("circle")
        .style("fill", "#007CE1")
        .attr("class", "commitments")
        .attr("r", "6")
        .attr("cx", function(d) { return gapX(d['Net commitments']); })
        .attr("cy", function(d) { return y(d['Recipient country']); });

    lines.append("rect")
      .style("fill", "#000")
      .style("opacity", 0)
      .attr("x", function(d) { return gapX(d['Net spending']) - 8 })
      .attr("y", function(d) { return y(d['Recipient country']) - 8 })
      .attr("width", function(d) { return gapX(d['Net commitments']) - gapX(d['Net spending']) + 16 })
      .attr("height", 16)
        .on('mouseover', tool_tip.show)
        .on('mouseout', tool_tip.hide);
  })
}


function barChart() {
  var marginL = (isMobile) ? 160 : 260;
  var margin = {top: 0, right: 90, bottom: 50, left: marginL},
      width = chartW - margin.left - margin.right,
      height = chartH - margin.top - margin.bottom;

  //init svg
  var svg = d3.select("#barChart")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //init tooltip
  var tool_tip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-8, 0])
    .html(function(d) {
      return d.Sector + ': ' + formatValue(d['Net new commitments']); 
    });
  svg.call(tool_tip);


  //get data
  d3.csv("data/iati-c19-spending-by-sector.csv", function(data) {

    //remove header and get top ten by spending
    data.shift();
    var chartData = [];
    data.slice(0, 10).map((d, i) => {
      if (d['Net new commitments']!='')
        chartData.push(d);
    });

    //x axis
    spendingX = d3.scaleLinear()
      .domain([0, d3.max(chartData, d => +d['Net new commitments'])])
      .range([ 0, width]);
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(spendingX)
        .ticks(5)
        .tickFormat(formatValue)
      )

    //x axis label
    svg.append("text")
      .attr("class", "x label")
      .attr("text-anchor", "middle")
      .attr("x", width/2)
      .attr("y", height + margin.bottom - 10)
      .text("Highest Spending (USD)");

    //y gridlines
    svg.append("g")     
      .attr("class", "grid")
      .call(make_x_gridlines(spendingX)
        .tickSize(height)
        .tickFormat("")
      )

    //y axis
    var y = d3.scaleBand()
      .range([ 0, height ])
      .domain(chartData.map(function(d) { return d.Sector; }))
      .padding(.3);
    svg.append("g")
      .attr("class", "y axis")
      .attr("alt", function(d) { return d; })
      .call(d3.axisLeft(y)
        .tickFormat(function(d, i) {
          var maxChars = 28;
          var sector = (d.length>maxChars && isMobile) ? d.slice(0, maxChars) + '...' : d;
          return sector
        })
      )

    //bars
    svg.selectAll(".bar")
      .data(chartData)
      .enter()
      .append("rect")
      .attr("x", spendingX(0) )
      .attr("y", function(d) { return y(d.Sector); })
      .attr('width', function(d, i) { return spendingX(d['Net new commitments']); })
      .attr("height", y.bandwidth() )
      .attr("fill", "#007CE1")
      .attr("class", "spendingBar")
      .attr("id", function(d, i) { return "spendingBar" + i; })
      .on('mouseover', tool_tip.show)
      .on('mouseout', tool_tip.hide);
  })
}

function healthChart() {
  var marginL = (isMobile) ? 60 : 90;
  var margin = {top: 8, right: 90, bottom: 40, left: marginL},
      width = chartW - margin.left - margin.right,
      height = chartH - margin.top - margin.bottom;

  //init svg
  var svg = d3.select("#healthChart")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  //init tooltip
  var tool_tip = d3.tip()
      .attr("class", "d3-tip")
      .offset([-8, 0])
      .html(function(d) { return d3.timeFormat('%b %Y')(d.date) + ': ' + formatValue(d.value); });
    svg.call(tool_tip);


  //Read the data
  d3.csv("data/iati-c19-health-spending-by-month.csv",
    //format vars
    function(d){
      return { date: d3.timeParse("%Y-%m")(d.Month), value: d['Net new commitments'] }
    },
    
    function(data) {
      data.shift(); //clear headers

      //x axis
      var maxTicks = (isMobile) ? 3 : 5;
      var x = d3.scaleTime()
        .domain(d3.extent(data, function(d) { return d.date; }))
        .range([ 0, width ]);
      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)
          .ticks(maxTicks)
          .tickFormat(d3.timeFormat('%b %Y'))
        );

      //y axis
      var y = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return +d.value; })])
        .range([ height, 0 ]);
      svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y)
          .ticks(5)
          .tickFormat(formatValue)
        );

      //y gridlines
      svg.append("g")     
        .attr("class", "grid")
        .call(make_y_gridlines(y)
          .tickSize(-width)
          .tickFormat("")
        )

      //y axis label
      svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "middle")
        .attr("x", -height/2)
        .attr("y", -margin.left)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Spending (USD)");

      //line
      var path = svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#007CE1")
        .attr("stroke-width", 1.5)
        .attr("id", "healthLine")
        .attr("d", d3.line()
          .curve(d3.curveCatmullRom)
          .x(function(d) { return x(d.date) })
          .y(function(d) { return y(d.value) })
        )

      //dots
      var dots = svg
        .append("g")
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
          .attr("cx", function(d) { return x(d.date) } )
          .attr("cy", function(d) { return y(d.value) } )
          .attr("r", 3)
          .attr("fill", "#007CE1")
          .attr("class", "healthDot")
          .attr("opacity", 1)
          .on('mouseover', tool_tip.show)
          .on('mouseout', tool_tip.hide);

      //highlights
      var ring = svg
        .append("g")
        .selectAll("ring")
        .data(data)
        .enter()
        .append("circle")
          .attr("cx", function(d) { return x(d.date) } )
          .attr("cy", function(d) { return y(d.value) } )
          .attr("r", function(d) { if (d.value>1000000000) return 8; })
          .attr("stroke", "#F2645A")
          .attr("fill", "none")
          .attr("stroke-dasharray", "4 2")
          .attr("class", function(d) {
            return (d.date.getFullYear()==2020) ? "highlightRing highlightRing0" : "highlightRing highlightRing1"
          })
          .attr("opacity", 0);

  })
}

function truncateLabel(text, width) {
  text.each(function() {
    gameName = d3.select(this).text();
    if(gameName.length > 10){
        gameName = gameName.slice(0,10)
    }
    d3.select(this).text(gameName)
  })
}


function wrap(text, width) {
  console.log(text)
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em")
    while (word = words.pop()) {
      line.push(word)
      tspan.text(line.join(" "))
      if (tspan.node().getComputedTextLength() > width) {
        line.pop()
        tspan.text(line.join(" "))
        line = [word]
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", `${++lineNumber * lineHeight + dy}em`).text(word)
      }
    }
  })
}