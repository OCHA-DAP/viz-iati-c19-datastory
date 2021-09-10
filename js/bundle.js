window.$ = window.jQuery = require('jquery');
// d3.tip
// Copyright (c) 2013 Justin Palmer
// ES6 / D3 v4 Adaption Copyright (c) 2016 Constantin Gavrilete
// Removal of ES6 for D3 v4 Adaption Copyright (c) 2016 David Gotz
//
// Tooltips for d3.js SVG visualizations

d3.functor = function functor(v) {
  return typeof v === "function" ? v : function() {
    return v;
  };
};

d3.tip = function() {

  var direction = d3_tip_direction,
      offset    = d3_tip_offset,
      html      = d3_tip_html,
      node      = initNode(),
      svg       = null,
      point     = null,
      target    = null

  function tip(vis) {
    svg = getSVGNode(vis)
    point = svg.createSVGPoint()
    document.body.appendChild(node)
  }

  // Public - show the tooltip on the screen
  //
  // Returns a tip
  tip.show = function() {
    var args = Array.prototype.slice.call(arguments)
    if(args[args.length - 1] instanceof SVGElement) target = args.pop()

    var content = html.apply(this, args),
        poffset = offset.apply(this, args),
        dir     = direction.apply(this, args),
        nodel   = getNodeEl(),
        i       = directions.length,
        coords,
        scrollTop  = document.documentElement.scrollTop || document.body.scrollTop,
        scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft

    nodel.html(content)
      .style('position', 'absolute')
      .style('opacity', 1)
      .style('pointer-events', 'all')

    while(i--) nodel.classed(directions[i], false)
    coords = direction_callbacks[dir].apply(this)
    nodel.classed(dir, true)
      .style('top', (coords.top +  poffset[0]) + scrollTop + 'px')
      .style('left', (coords.left + poffset[1]) + scrollLeft + 'px')

    return tip
  }

  // Public - hide the tooltip
  //
  // Returns a tip
  tip.hide = function() {
    var nodel = getNodeEl()
    nodel
      .style('top', 0)	
      .style('left', 0)
      .style('opacity', 0)
      .style('pointer-events', 'none')
    return tip
  }

  // Public: Proxy attr calls to the d3 tip container.  Sets or gets attribute value.
  //
  // n - name of the attribute
  // v - value of the attribute
  //
  // Returns tip or attribute value
  tip.attr = function(n, v) {
    if (arguments.length < 2 && typeof n === 'string') {
      return getNodeEl().attr(n)
    } else {
      var args =  Array.prototype.slice.call(arguments)
      d3.selection.prototype.attr.apply(getNodeEl(), args)
    }

    return tip
  }

  // Public: Proxy style calls to the d3 tip container.  Sets or gets a style value.
  //
  // n - name of the property
  // v - value of the property
  //
  // Returns tip or style property value
  tip.style = function(n, v) {
    // debugger;
    if (arguments.length < 2 && typeof n === 'string') {
      return getNodeEl().style(n)
    } else {
      var args = Array.prototype.slice.call(arguments);
      if (args.length === 1) {
        var styles = args[0];
        Object.keys(styles).forEach(function(key) {
          return d3.selection.prototype.style.apply(getNodeEl(), [key, styles[key]]);
        });
      }
    }

    return tip
  }

  // Public: Set or get the direction of the tooltip
  //
  // v - One of n(north), s(south), e(east), or w(west), nw(northwest),
  //     sw(southwest), ne(northeast) or se(southeast)
  //
  // Returns tip or direction
  tip.direction = function(v) {
    if (!arguments.length) return direction
    direction = v == null ? v : d3.functor(v)

    return tip
  }

  // Public: Sets or gets the offset of the tip
  //
  // v - Array of [x, y] offset
  //
  // Returns offset or
  tip.offset = function(v) {
    if (!arguments.length) return offset
    offset = v == null ? v : d3.functor(v)

    return tip
  }

  // Public: sets or gets the html value of the tooltip
  //
  // v - String value of the tip
  //
  // Returns html value or tip
  tip.html = function(v) {
    if (!arguments.length) return html
    html = v == null ? v : d3.functor(v)

    return tip
  }

  // Public: destroys the tooltip and removes it from the DOM
  //
  // Returns a tip
  tip.destroy = function() {
    if(node) {
      getNodeEl().remove();
      node = null;
    }
    return tip;
  }

  function d3_tip_direction() { return 'n' }
  function d3_tip_offset() { return [0, 0] }
  function d3_tip_html() { return ' ' }

  var direction_callbacks = {
    n:  direction_n,
    s:  direction_s,
    e:  direction_e,
    w:  direction_w,
    nw: direction_nw,
    ne: direction_ne,
    sw: direction_sw,
    se: direction_se
  };

  var directions = Object.keys(direction_callbacks);

  function direction_n() {
    var bbox = getScreenBBox()
    return {
      top:  bbox.n.y - node.offsetHeight,
      left: bbox.n.x - node.offsetWidth / 2
    }
  }

  function direction_s() {
    var bbox = getScreenBBox()
    return {
      top:  bbox.s.y,
      left: bbox.s.x - node.offsetWidth / 2
    }
  }

  function direction_e() {
    var bbox = getScreenBBox()
    return {
      top:  bbox.e.y - node.offsetHeight / 2,
      left: bbox.e.x
    }
  }

  function direction_w() {
    var bbox = getScreenBBox()
    return {
      top:  bbox.w.y - node.offsetHeight / 2,
      left: bbox.w.x - node.offsetWidth
    }
  }

  function direction_nw() {
    var bbox = getScreenBBox()
    return {
      top:  bbox.nw.y - node.offsetHeight,
      left: bbox.nw.x - node.offsetWidth
    }
  }

  function direction_ne() {
    var bbox = getScreenBBox()
    return {
      top:  bbox.ne.y - node.offsetHeight,
      left: bbox.ne.x
    }
  }

  function direction_sw() {
    var bbox = getScreenBBox()
    return {
      top:  bbox.sw.y,
      left: bbox.sw.x - node.offsetWidth
    }
  }

  function direction_se() {
    var bbox = getScreenBBox()
    return {
      top:  bbox.se.y,
      left: bbox.e.x
    }
  }

  function initNode() {
    var node = d3.select(document.createElement('div'))
    node
      .style('position', 'absolute')
      .style('top', '0')
      .style('opacity', '0')
      .style('pointer-events', 'none')
      .style('box-sizing', 'border-box')

    return node.node()
  }

  function getSVGNode(el) {
    el = el.node()
    if(el.tagName.toLowerCase() === 'svg')
      return el

    return el.ownerSVGElement
  }

  function getNodeEl() {
    if(node === null) {
      node = initNode();
      // re-add node to DOM
      document.body.appendChild(node);
    };
    return d3.select(node);
  }

  // Private - gets the screen coordinates of a shape
  //
  // Given a shape on the screen, will return an SVGPoint for the directions
  // n(north), s(south), e(east), w(west), ne(northeast), se(southeast), nw(northwest),
  // sw(southwest).
  //
  //    +-+-+
  //    |   |
  //    +   +
  //    |   |
  //    +-+-+
  //
  // Returns an Object {n, s, e, w, nw, sw, ne, se}
  function getScreenBBox() {
    var targetel   = target || d3.event.target;

    while ('undefined' === typeof targetel.getScreenCTM && 'undefined' === targetel.parentNode) {
        targetel = targetel.parentNode;
    }

    var bbox       = {},
        matrix     = targetel.getScreenCTM(),
        tbbox      = targetel.getBBox(),
        width      = tbbox.width,
        height     = tbbox.height,
        x          = tbbox.x,
        y          = tbbox.y

    point.x = x
    point.y = y
    bbox.nw = point.matrixTransform(matrix)
    point.x += width
    bbox.ne = point.matrixTransform(matrix)
    point.y += height
    bbox.se = point.matrixTransform(matrix)
    point.x -= width
    bbox.sw = point.matrixTransform(matrix)
    point.y -= height / 2
    bbox.w  = point.matrixTransform(matrix)
    point.x += width
    bbox.e = point.matrixTransform(matrix)
    point.x -= width / 2
    point.y -= height / 2
    bbox.n = point.matrixTransform(matrix)
    point.y += height
    bbox.s = point.matrixTransform(matrix)

    return bbox
  }

  return tip
};
function hxlProxyToJSON(input){
    var output = [];
    var keys=[]
    input.forEach(function(e,i){
        if(i==0){
            e.forEach(function(e2,i2){
                var parts = e2.split('+');
                var key = parts[0]
                if(parts.length>1){
                    var atts = parts.splice(1,parts.length);
                    atts.sort();                    
                    atts.forEach(function(att){
                        key +='+'+att
                    });
                }
                keys.push(key);
            });
        } else {
            var row = {};
            e.forEach(function(e2,i2){
                row[keys[i2]] = e2;
            });
            output.push(row);
        }
    });
    return output;
}
$( document ).ready(function() {
  let isMobile = $(window).width()<600? true : false;
  let spendingX;

  function init() {
    lineChart();
    growthChart();
    lollipopChart();
    barChart();
    healthChart();

    initScroller();

    $('mark').on('mouseover', function() {
      d3.selectAll('.spendingBar')
        .transition()
        .duration(300)
        .attr("fill", "#CCE5F9")

      d3.selectAll('#spendingBar'+$(this).attr("id"))
        .transition()
        .duration(300)
        .attr("fill", "#007CE0")
    });

    $('mark').on('mouseout', function() {
      d3.selectAll('.spendingBar')
        .transition()
        .duration(300)
        .attr("fill", "#007CE0")
    })
  }

  function initScroller() {
    var controller = new ScrollMagic.Controller();
    var sections = document.querySelectorAll('.step');
    for (var i=0; i<sections.length; i++) {
      new ScrollMagic.Scene({
        triggerElement: sections[i],
        triggerHook: 0.5
      })
      .on('enter', function(e) {
        var id = $(e.target.triggerElement()).data('chart');
        $('.visual-col .container').clearQueue().fadeOut(0);
        $('#chart'+id).fadeIn(600);

        if (id=='4') {
          d3.selectAll('.spendingBar')
            .transition()
            .duration(800)
            .ease(d3.easeQuadOut)
            .attr("width", function(d, i) { return spendingX(d.sum_val); })
        }
      })
      .on('leave', function(e) {
        var id = $(e.target.triggerElement()).data('chart');
        $('.visual-col .container').clearQueue().fadeOut(0);
        $('#chart'+(id-1)).fadeIn(600);

        if (id=='4') {
          d3.selectAll('.spendingBar')
            .attr("width", 0)
        }
      })
      //.addIndicators()
      .addTo(controller);
    }
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
        var legend = svg.append('g')
          .attr('class', 'legend')
          .attr("transform",
              "translate(" + 10 + ",10)");

        var legendItem = legend.selectAll('.legend-item')
          .data(sumstat)
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
        var legend = svg.append('g')
          .attr('class', 'legend')
          .attr("transform",
              "translate(" + (width-180) + ",10)");

        var legendItem = legend.selectAll('.legend-item')
          .data(sumstat)
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
      spendingX = d3.scaleLinear()
        .domain([0, d3.max(data, d => +d.sum_val)])
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
        .text("Highest Spending in millions (USD)");

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