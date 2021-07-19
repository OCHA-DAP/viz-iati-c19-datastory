$( document ).ready(function() {
  let isMobile = $(window).width()<600? true : false;
  let tooltip;

  function init() {
    lineChart();
    growthChart();
    lollipopChart();
    barChart();
    healthChart();
  }

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
        var type = $(this).attr('class')
        return "<span class='label type'>" + type + '</span>: ' + formatValue(d[type]); 
      });
    svg.call(tool_tip);

    //get data
    d3.csv("data/g3_deficit.csv", function(data) {
      //sort by deficit size
      data = data.sort((a, b) =>
        a.deficit > b.deficit ? -1 : 1
      )

      //chart title
      svg.append("text")
        .attr("class", "label title")
        .attr("text-anchor", "left")
        .attr("x", 0)
        .attr("y", 0 - margin.top)
        .attr("dy", ".75em")
        .text("Commitments and Spending Deficits by Country");

      //x axis
      var x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.commitments)])
        .range([0, width]);
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)
          .tickFormat(function(d, i) {
            return i % 3 === 0 ? formatValue(d) : null; 
          })
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
        .domain(data.map(function(d) { return d.country; }))
        .padding(1);
      svg.append("g")
        .call(d3.axisLeft(y))

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
        .data(data)
        .enter()
        .append("line")
          .attr("x1", function(d) { return x(d.spending); })
          .attr("x2", function(d) { return x(d.commitments); })
          .attr("y1", function(d) { return y(d.country); })
          .attr("y2", function(d) { return y(d.country); })
          .attr("stroke", "#CCC")
          .attr("stroke-width", "1px")

      //spending
      svg.selectAll("spendingCircle")
        .data(data)
        .enter()
        .append("circle")
          .attr("class", "spending")
          .attr("cx", function(d) { return x(d.spending); })
          .attr("cy", function(d) { return y(d.country); })
          .attr("r", "6")
          .style("fill", "#F2645A")
          .on('mouseover', tool_tip.show)
          .on('mouseout', tool_tip.hide);

      //commitments
      svg.selectAll("commitmentsCircle")
        .data(data)
        .enter()
        .append("circle")
          .attr("class", "commitments")
          .attr("cx", function(d) { return x(d.commitments); })
          .attr("cy", function(d) { return y(d.country); })
          .attr("r", "6")
          .style("fill", "#007CE1")
          .on('mouseover', tool_tip.show)
          .on('mouseout', tool_tip.hide);
    })
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
    d3.csv("data/g1_count_publishers.csv", 
      function(d) {
        return { date: d3.timeParse("%m/%d/%Y")(d.Date), value: d.values, name: d['Publisher.Group'] }
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
          .text("Growth in IATI Publishing Over Time");

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
          .range(['#418FDE', '#E56A54', '#ECA154'])

        //line
        svg.selectAll(".line")
          .data(sumstat)
          .enter()
          .append("path")
            .attr("fill", "none")
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
            .attr("fill", function(d){ return color(d.name) })
            .attr("cx", function(d) { return x(d.date); })
            .attr("cy", function(d) { return y(d.value); })
            .on('mouseover', tool_tip.show)
            .on('mouseout', tool_tip.hide);

        //legend
        var legend = svg.selectAll('.legend-item')
          .data(sumstat)
          .enter().append('g')
          .attr('class', 'legend');

        legend.append('rect')
          .attr('x', width + 10)
          .attr('y', function(d, i) { return i * 18; })
          .attr('width', 10)
          .attr('height', 10)
          .style('fill', function(d) { return color(d.key); });

        legend.append('text')
          .attr('x', width + 24)
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
        .html(function(d) { return d.name + '<br>' + d3.timeFormat('%b %Y')(d.date) + ': ' + d.value; });
      svg.call(tool_tip);

    //get data
    d3.csv("data/g2_commitments.csv", 
      function(d) {
        return { date: d3.timeParse("%Y-%m-%d")(d.date), value: d.mean_val, name: d['Publisher.Group'] }
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
          .text("Commitments in millions (USD)");

        //colors
        var res = sumstat.map(function(d){ return d.key })
        var color = d3.scaleOrdinal()
          .domain(res)
          .range(['#418FDE', '#E56A54', '#ECA154'])

        //line
        svg.selectAll(".line")
          .data(sumstat)
          .enter()
          .append("path")
            .attr("fill", "none")
            .attr("stroke", function(d){ return color(d.key) })
            .attr("stroke-width", 1.5)
            .attr("d", function(d){
              return d3.line()
                //.curve(d3.curveCatmullRom)
                .x(function(d) { return x(d.date); })
                .y(function(d) { return y(+d.value); })
                (d.values)
            })

        //dots
        svg.selectAll("dot")
            .data(data)
          .enter().append("circle")
            .attr("r", 3)
            .attr("fill", function(d){ return color(d.name) })
            .attr("cx", function(d) { return x(d.date); })
            .attr("cy", function(d) { return y(d.value); })
            .on('mouseover', tool_tip.show)
            .on('mouseout', tool_tip.hide);

        //legend
        var legend = svg.selectAll('.legend-item')
          .data(sumstat)
          .enter().append('g')
          .attr('class', 'legend');

        legend.append('rect')
          .attr('x', width + 10)
          .attr('y', function(d, i) { return i * 18; })
          .attr('width', 10)
          .attr('height', 10)
          .style('fill', function(d) { return color(d.key); });

        legend.append('text')
          .attr('x', width + 24)
          .attr('y', function(d, i) { return (i * 18) + 9; })
          .text(function(d) { return d.key; });
      }
    )
  }


  function barChart() {
    var margin = {top: 30, right: 190, bottom: 50, left: 200},
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
        return d.Sector + ': ' + formatValue(d.sum_val); 
      });
    svg.call(tool_tip);

    //get data
    d3.csv("data/g5_sector_spend.csv", function(data) {

      //x axis
      var x = d3.scaleLinear()
        .domain([0, d3.max(data, d => +d.sum_val)])
        .range([ 0, width]);
      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)
          .ticks(5)
          .tickFormat(formatValue)
        )

      //x axis label
      svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("x", width/2)
        .attr("y", height + margin.bottom - 10)
        .text("Highest Spending in millions (USD)");

      //y gridlines
      svg.append("g")     
        .attr("class", "grid")
        .call(make_x_gridlines(x)
          .tickSize(height)
          .tickFormat("")
        )

      //y axis
      var y = d3.scaleBand()
        .range([ 0, height ])
        .domain(data.map(function(d) { return d.Sector; }))
        .padding(.3);
      svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y))

      //bars
      svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", x(0) )
        .attr("y", function(d) { return y(d.Sector); })
        .attr("width", function(d) { return x(d.sum_val); })
        .attr("height", y.bandwidth() )
        .attr("fill", "#007CE1")
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
        .html(function(d) { return d.name + '<br>' + d3.timeFormat('%b %Y')(d.date) + ': ' + d.value; });
      svg.call(tool_tip);

    //Read the data
    d3.csv("data/g5.1_health_timeline.csv",
      //format vars
      function(d){
        return { date: d3.timeParse("%Y-%m-%d")(d.date), value: d.sum_val, name: d.Sector }
      },
      
      function(data) {
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
          .text("Spending in millions (USD)");

        //line
        svg.append("path")
          .datum(data)
          .attr("fill", "none")
          .attr("stroke", "#007CE1")
          .attr("stroke-width", 1.5)
          .attr("d", d3.line()
            .curve(d3.curveCatmullRom)
            .x(function(d) { return x(d.date) })
            .y(function(d) { return y(d.value) })
            )

        //dots
        svg
          .append("g")
          .selectAll("dot")
          .data(data)
          .enter()
          .append("circle")
            .attr("cx", function(d) { return x(d.date) } )
            .attr("cy", function(d) { return y(d.value) } )
            .attr("r", 3)
            .attr("fill", "#007CE1")
            .on('mouseover', tool_tip.show)
            .on('mouseout', tool_tip.hide);
    })
  }

  function initTracking() {
    //initialize mixpanel
    let MIXPANEL_TOKEN = '';
    mixpanel.init(MIXPANEL_TOKEN);
    mixpanel.track('page view', {
      'page title': document.title,
      'page type': 'datavis'
    });
  }

  init();
  //initTracking();
});