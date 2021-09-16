let spendingX, gapX;
let animComplete = false;
let isMobile = $(window).width()<768? true : false;
let chartH = (isMobile) ? 300 : 350;
let chartW = (isMobile) ? $(window).width() + 50 : 750;

$( document ).ready(function() {
  function init() {
    lineChart();
    growthChart();
    lollipopChart();
    barChart();
    healthChart();

    setHandlers();
    console.log(isMobile)

    if (isMobile) {
      //stack the elements for mobile
      for (var i=0; i<=$('.step').length; i++) {
        $('#chart'+i).insertAfter($('section[data-chart='+i+']'));
      }
      
    }
    else {
      initScroller();
    }
  }

  function setHandlers() {
    $('mark').on('mouseover', function() {
      if (animComplete) {
        d3.selectAll('.spendingBar')
          .transition()
          .duration(300)
          .attr("fill", "#CCE5F9")

        d3.selectAll('#spendingBar'+$(this).attr("id"))
          .transition()
          .duration(300)
          .attr("fill", "#007CE0")
      }
    });

    $('mark').on('mouseout', function() {
      if (animComplete) {
        d3.selectAll('.spendingBar')
          .transition()
          .duration(300)
          .attr("fill", "#007CE0")
      }
    })


    $('.ocha-services').on('click', function() {
      $('.ocha-header .dropdown-menu').toggle();
    });
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
        animComplete = false;
        var id = $(e.target.triggerElement()).data('chart');
        $('.visual-col .container').fadeOut(0);
        $('#chart'+id).clearQueue().fadeIn(600);

        if (id=='1') {
          animPubLine();
        }
        if (id=='2') {
          animOrgLine();
        }
        if (id=='3') {
          animGap();
        }
        if (id=='4') {
          animSpendingBar();
        }
        if (id=='5') {
          animHealthLine();
        }
      })
      .on('leave', function(e) {
        var id = $(e.target.triggerElement()).data('chart');
        $('.visual-col .container').fadeOut(0);
        $('#chart'+(id-1)).clearQueue().fadeIn(600);
      })
      //.addIndicators()
      .addTo(controller);
    }

    //footer
    new ScrollMagic.Scene({
      triggerElement: document.querySelector('#footer'),
      triggerHook: 0.8
    })
    .on('enter', function(e) {
      $('.visual-col .container').clearQueue().fadeOut(0);
    })
    //.addIndicators()
    .addTo(controller);
  }

  function animPubLine() {
    var paths = d3.selectAll('.pubLine')
      paths._groups[0].forEach(function(path, index) {
        var pathLength = path.getTotalLength();
        d3.selectAll('#pubLine'+index)
          .attr('stroke-dashoffset', pathLength)
          .attr('stroke-dasharray', pathLength)
          .transition()
          .duration(2000)
          .ease(d3.easeLinear)
          .attr('stroke-dashoffset', 0);
      });
      
      d3.selectAll('.pubDot')
        .attr('opacity', 0)
        .transition()
          .duration(200)
          .delay(function(d, i) { return i*30; })
          .ease(d3.easeLinear)
            .attr("opacity", 1)
  }

  function animOrgLine() {
    var paths = d3.selectAll('.orgLine')
      paths._groups[0].forEach(function(path, index) {
        var pathLength = path.getTotalLength();
        d3.selectAll('#orgLine'+index)
          .attr('stroke-dashoffset', pathLength)
          .attr('stroke-dasharray', pathLength)
          .transition()
          .duration(2000)
          .ease(d3.easeLinear)
          .attr('stroke-dashoffset', 0);
      });
      
      d3.selectAll('.orgDot')
        .attr('opacity', 0)
        .transition()
          .duration(200)
          .delay(function(d, i) { return i*25; })
          .ease(d3.easeLinear)
            .attr("opacity", 1)
  }

  function animGap() {
    d3.selectAll('.commitments')
      .attr('cx', function(d) { return gapX(d['Net spending']); })
      .transition()
      .duration(800)
      .ease(d3.easeQuadOut)
      .attr('cx', function(d) { return gapX(d['Net commitments']); })

    d3.selectAll('.gapLine')
      .attr('x2', function(d) { return gapX(d['Net spending']); })
      .transition()
      .duration(800)
      .ease(d3.easeQuadOut)
      .attr('x2', function(d) { return gapX(d['Net commitments']); })
  }

  function animSpendingBar() {
    d3.selectAll('.spendingBar')
      .attr('width', 0)
      .transition()
      .duration(800)
      .ease(d3.easeQuadOut)
      .attr('width', function(d, i) { return spendingX(d['Net new commitments']); })
      .on('end', function(d, i) {
        if (i==9) {
          animComplete = true;
        }
      });
  }

  function animHealthLine() {    
    var path = d3.selectAll('#healthLine')
    if (path.node() != null) {
      var pathLength = path.node().getTotalLength();
      path
        .attr('stroke-dashoffset', pathLength)
        .attr('stroke-dasharray', pathLength)
        .transition()
          .duration(2000)
          .ease(d3.easeLinear)
          .attr('stroke-dashoffset', 0);

      d3.selectAll('.healthDot')
        .attr('opacity', 0)
        .transition()
          .duration(200)
          .delay(function(d, i) { return i*100; })
          .ease(d3.easeLinear)
            .attr('opacity', 1)
    }
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