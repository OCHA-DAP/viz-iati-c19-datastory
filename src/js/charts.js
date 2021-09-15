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
  var margin = {top: 30, right: 190, bottom: 40, left: 90},
      width = 750 - margin.left - margin.right,
      height = 350 - margin.top - margin.bottom;

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
        return { date: d3.timeParse("%Y-%m-%d")(d.Date), value: d['SUM of # Publishers'], name: d['Publisher Group'] }
      }
    },

    function(data) {
      //group the data
      var sumstat = d3.nest()
        .key(function(d) { return d.name; })
        .entries(data);

      //chart title
      svg.append("text")
        .attr("class", "label title")
        .attr("text-anchor", "left")
        .attr("x", 0)
        .attr("y", 0 - margin.top)
        .attr("dy", ".75em")
        .text("Growth in IATI Covid-19 Publishing Over Time");

      //x axis
      var x = d3.scaleLinear()
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
        .attr("y", -70)
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
          .attr("opacity", 0)
          .attr("class", "pubDot")
          .attr("fill", function(d){ return color(d.name) })
          .attr("cx", function(d) { return x(d.date); })
          .attr("cy", function(d) { return y(d.value); })
          .on('mouseover', tool_tip.show)
          .on('mouseout', tool_tip.hide);

      //legend
      var legend = svg.append('g')
        .attr('class', 'legend')
        .attr("transform",
            "translate(" + 10 + ",10)");

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
  var margin = {top: 30, right: 190, bottom: 40, left: 90},
      width = 750 - margin.left - margin.right,
      height = 350 - margin.top - margin.bottom;

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

      //chart title
      svg.append("text")
        .attr("class", "label title")
        .attr("text-anchor", "left")
        .attr("x", 0)
        .attr("y", 0 - margin.top)
        .attr("dy", ".75em")
        .text("Commitments Over Time by Organization Type");

      //x axis
      var x = d3.scaleLinear()
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
        .attr("y", -70)
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

      //dots
      var dots = svg.selectAll("dot")
          .data(data)
        .enter().append("circle")
          .attr("r", 3)
          .attr("opacity", 0)
          .attr("class", "orgDot")
          .attr("fill", function(d){ return color(d.name) })
          .attr("cx", function(d) { return x(d.date); })
          .attr("cy", function(d) { return y(d.value); })
          .on('mouseover', tool_tip.show)
          .on('mouseout', tool_tip.hide);

      //legend
      var legend = svg.append('g')
        .attr('class', 'legend')
        .attr("transform",
            "translate(" + (width-180) + ",10)");

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
  var margin = {top: 30, right: 190, bottom: 40, left: 90},
      width = 750 - margin.left - margin.right,
      height = 350 - margin.top - margin.bottom;

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
      var type = ($(this).attr('class')=='spending') ? 'Net spending' : 'Net commitments';
      return "<span class='label type'>" + type + '</span>: ' + formatValue(d[type]); 
    });
  svg.call(tool_tip);

  //get data
  d3.csv("data/iati-c19-commitment-spending-by-country.csv", function(data) {
    data.shift(); //remove headers

    //sort by gap size
    data = data.sort((a, b) =>
      +a['Commitment/spending gap'] > +b['Commitment/spending gap'] ? -1 : 1
    )

    //get top ten by gap
    var chartData = [];
    data.slice(0, 10).map((d, i) => {
      if (d['Net commitments']!='' && d['Net spending']!='')
        chartData.push(d);
    });

    //chart title
    svg.append("text")
      .attr("class", "label title")
      .attr("text-anchor", "left")
      .attr("x", 0)
      .attr("y", 0 - margin.top)
      .attr("dy", ".75em")
      .text("Commitments and Spending Gaps by Country");

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

    //line
    svg.selectAll("deficitLine")
      .data(chartData)
      .enter()
      .append("line")
        .attr("class", "gapLine")
        .attr("x1", function(d) { return gapX(d['Net spending']); })
        .attr("x2", function(d) { return gapX(d['Net commitments']); })
        .attr("y1", function(d) { return y(d['Recipient country']); })
        .attr("y2", function(d) { return y(d['Recipient country']); })
        .attr("stroke", "#CCC")
        .attr("stroke-width", "1px")

    //spending
    svg.selectAll("spendingCircle")
      .data(chartData)
      .enter()
      .append("circle")
        .attr("class", "spending")
        .attr("cx", function(d) { return gapX(d['Net spending']); })
        .attr("cy", function(d) { return y(d['Recipient country']); })
        .attr("r", "6")
        .style("fill", "#F2645A")
        .on('mouseover', tool_tip.show)
        .on('mouseout', tool_tip.hide);

    //commitments
    svg.selectAll("commitmentsCircle")
      .data(chartData)
      .enter()
      .append("circle")
        .attr("class", "commitments")
        .attr("cx", function(d) { return gapX(d['Net commitments']); })
        .attr("cy", function(d) { return y(d['Recipient country']); })
        .attr("r", "6")
        .style("fill", "#007CE1")
        .on('mouseover', tool_tip.show)
        .on('mouseout', tool_tip.hide);
  })
}


function barChart() {
  var margin = {top: 30, right: 190, bottom: 50, left: 260},
      width = 750 - margin.left - margin.right,
      height = 350 - margin.top - margin.bottom;

  //init svg
  var svg = d3.select("#barChart")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  //chart title
  svg.append("text")
    .attr("class", "label title")
    .attr("text-anchor", "left")
    .attr("x", 0)
    .attr("y", 0 - margin.top)
    .attr("dy", ".75em")
    .text("Spending by Sector");

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
      .call(d3.axisLeft(y))

    //bars
    svg.selectAll(".bar")
      .data(chartData)
      .enter()
      .append("rect")
      .attr("x", spendingX(0) )
      .attr("y", function(d) { return y(d.Sector); })
      .attr("width", 0)
      .attr("height", y.bandwidth() )
      .attr("fill", "#007CE1")
      .attr("class", "spendingBar")
      .attr("id", function(d, i) { return "spendingBar" + i; })
      .on('mouseover', tool_tip.show)
      .on('mouseout', tool_tip.hide);
  })
}

function healthChart() {
  var margin = {top: 30, right: 190, bottom: 40, left: 90},
      width = 750 - margin.left - margin.right,
      height = 350 - margin.top - margin.bottom;

  //init svg
  var svg = d3.select("#healthChart")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  //chart title
  svg.append("text")
    .attr("class", "label title")
    .attr("text-anchor", "left")
    .attr("x", 0)
    .attr("y", 0 - margin.top)
    .attr("dy", ".75em")
    .text("Spending in Health Sector Over Time");

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
      var x = d3.scaleTime()
        .domain(d3.extent(data, function(d) { return d.date; }))
        .range([ 0, width ]);
      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)
          .ticks(5)
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
          .attr("opacity", 0)
          .on('mouseover', tool_tip.show)
          .on('mouseout', tool_tip.hide);
  })
}