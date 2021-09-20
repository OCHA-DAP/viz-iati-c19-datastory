let spendingX, gapX;
let animComplete = false;
let isMobile = $(window).width() < 768 ? true : false;
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

    if (isMobile) {
      //stack the elements for mobile
      for (var i=0; i<=$('.step').length; i++) {
        $('#chart'+i).insertAfter($('section[data-chart='+i+']'));
      }
    }
    initScroller();
  }

  function setHandlers() {
    //highlights handler
    if (!isMobile) {
      $('mark').on('mouseover', function(e) {
        if (animComplete) {
          var idArray = $(e.currentTarget).attr('id').split('-');
          highlightOver(idArray[0], idArray[1]);
        }
      });

      $('mark').on('mouseout', function(e) {
        if (animComplete) {
          var idArray = $(e.currentTarget).attr('id').split('-');
          highlightOut(idArray[0], idArray[1]);
        }
      });
    }

    //ocha header handler
    $('.ocha-services').on('click', function() {
      $('.ocha-header .dropdown-menu').toggle();
    });
  }

  function initScroller() {
    var controller = new ScrollMagic.Controller();
    var sections = document.querySelectorAll('.step');
    for (var i=0; i<sections.length; i++) {
      var el = (isMobile) ? document.querySelector('#chart' + $(sections[i]).attr('data-chart')) : sections[i];
      var hook = (isMobile) ? 1 : 0.5;
      new ScrollMagic.Scene({
        triggerElement: el,
        triggerHook: hook
      })
      .on('enter', function(e) {
        animComplete = false;
        var id = (isMobile) ? $(e.target.triggerElement()).attr('id').split('chart')[1] : $(e.target.triggerElement()).data('chart');
        $('.visual-col .container').fadeOut(0);
        $('#chart'+id).clearQueue().fadeIn(600);

        animateChart(id);
      })
      .on('leave', function(e) {
        animComplete = true;
        var id = (isMobile) ? $(e.target.triggerElement()).attr('id').split('chart')[1] : $(e.target.triggerElement()).data('chart');
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
    .on('leave', function(e) {
       $('#chart7').clearQueue().fadeIn(600);
    })
    //.addIndicators()
    .addTo(controller);
  }


  /** HIGHLIGHT FUNCTIONS **/
  function highlightOver(chart, id) {
    if (chart=='chart1') {
      d3.selectAll('.pubLine, .pubDot')
        .filter(function() {
          return $(this).attr('id')!='pubLine'+id && !this.classList.contains('pubDot2')
        })
        .transition()
        .duration(300)
        .attr('opacity', 0.3);
    }
    if (chart=='chart2') {
      if (id==2) {
        d3.selectAll('.highlightLine')
          .transition()
          .duration(300)
          .attr('opacity', 1);
      }
      else {
        d3.selectAll('.orgLine, .orgDot')
          .filter(function() {
            return $(this).attr('id')!='orgLine'+id && !this.classList.contains('orgDot'+id)
          })
          .transition()
          .duration(300)
          .attr('opacity', 0.3);
      }
    }
    if (chart=='chart3') {
      var selectArray = ['#ecuador, #myanmar, #kenya, #niger, #kazakhstan', '#egypt, #nigeria, #turkey, #guatemala, #angola']
      d3.selectAll(selectArray[id])
        .transition()
        .duration(300)
        .attr('opacity', 0.3);
    }
    if (chart=='chart4') {
      d3.selectAll('.spendingBar')
        .filter(function() {
          return $(this).attr('id')!='spendingBar'+id
        })
        .transition()
        .duration(300)
        .attr('fill', '#CCE5F9')
    }
    if (chart=='chart5') {
      d3.selectAll('.highlightRing'+id)
        .attr('opacity', 1);
    }
  }

  function highlightOut(chart, id) {
    if (chart=='chart1') {
      d3.selectAll('.pubLine, .pubDot')
        .transition()
        .duration(300)
        .attr('opacity', 1)
    }
    if (chart=='chart2') {
      if (id==2) {
        d3.selectAll('.highlightLine')
          .transition()
          .duration(300)
          .attr('opacity', 0);
      }
      else {
        d3.selectAll('.orgLine, .orgDot')
          .transition()
          .duration(300)
          .attr('opacity', 1);
      }
    }
    if (chart=='chart3') {
      d3.selectAll('.gapLines')
        .transition()
        .duration(300)
        .attr('opacity', 1);
    }
    if (chart=='chart4') {
      d3.selectAll('.spendingBar')
        .transition()
        .duration(300)
        .attr("fill", "#007CE0")
    }
    if (chart=='chart5') {
      d3.selectAll('.highlightRing')
        .attr('opacity', 0);
    }
  }

  /** ANIMATION FUNCTIONS **/
  function animateChart(id) {
    if (id==1) {
      var paths = d3.selectAll('.pubLine')
        paths._groups[0].forEach(function(path, index) {
          var pathLength = path.getTotalLength();
          d3.selectAll('#pubLine'+index)
            .attr('stroke-dashoffset', pathLength)
            .attr('stroke-dasharray', pathLength)
            .transition()
            .duration(2000)
            .ease(d3.easeLinear)
            .attr('stroke-dashoffset', 0)
            .on('end', function(d, i) {
              animComplete = true;
            });
        });
        
        d3.selectAll('.pubDot')
          .attr('opacity', 0)
          .transition()
            .duration(200)
            .delay(function(d, i) { return i*30; })
            .ease(d3.easeLinear)
              .attr("opacity", 1)
    }
    if (id==2) {
      var paths = d3.selectAll('.orgLine')
        paths._groups[0].forEach(function(path, index) {
          var pathLength = path.getTotalLength();
          d3.selectAll('#orgLine'+index)
            .attr('stroke-dashoffset', pathLength)
            .attr('stroke-dasharray', pathLength)
            .transition()
            .duration(2000)
            .ease(d3.easeLinear)
            .attr('stroke-dashoffset', 0)
            .on('end', function(d, i) {
              animComplete = true;
            });
        });
        
        d3.selectAll('.orgDot')
          .attr('opacity', 0)
          .transition()
            .duration(200)
            .delay(function(d, i) { return i*25; })
            .ease(d3.easeLinear)
              .attr("opacity", 1)
    }
    if (id==3) {
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
        .on('end', function(d, i) {
          animComplete = true;
        });
    }
    if (id==4) {
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
    if (id==5) {
      var path = d3.selectAll('#healthLine')
      if (path.node() != null) {
        var pathLength = path.node().getTotalLength();
        path
          .attr('stroke-dashoffset', pathLength)
          .attr('stroke-dasharray', pathLength)
          .transition()
            .duration(2000)
            .ease(d3.easeLinear)
            .attr('stroke-dashoffset', 0)
            .on('end', function(d, i) {
              animComplete = true;
            });

        d3.selectAll('.healthDot')
          .attr('opacity', 0)
          .transition()
            .duration(200)
            .delay(function(d, i) { return i*100; })
            .ease(d3.easeLinear)
              .attr('opacity', 1)
      }
    }
  }


  function initTracking() {
    //initialize mixpanel
    let MIXPANEL_TOKEN = window.location.hostname==='data.humdata.org'? '5cbf12bc9984628fb2c55a49daf32e74' : '99035923ee0a67880e6c05ab92b6cbc0';
    mixpanel.init(MIXPANEL_TOKEN);
    mixpanel.track('page view', {
      'page title': document.title,
      'page type': 'datavis'
    });
  }

  init();
  initTracking();
});