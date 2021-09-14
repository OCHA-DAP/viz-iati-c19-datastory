let spendingX;
let animComplete = false;

$( document ).ready(function() {
  function init() {
    lineChart();
    growthChart();
    lollipopChart();
    barChart();
    healthChart();

    setHandlers();
    initScroller();
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

        if (id=='1') {
          resetPubLine();
        }
        if (id=='2') {
          resetOrgLine();
        }
        if (id=='4') {
          resetSpendingBar();
        }
        if (id=='5') {
          resetHealthLine();
        }
      })
      //.addIndicators()
      .addTo(controller);
    }
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
        .transition()
          .duration(200)
          .delay(function(d, i) { return i*30; })
          .ease(d3.easeLinear)
            .attr("opacity", 1)
  }

  function resetPubLine() {
    d3.selectAll('.pubDot')
      .attr('opacity', 0)
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
        .transition()
          .duration(200)
          .delay(function(d, i) { return i*25; })
          .ease(d3.easeLinear)
            .attr("opacity", 1)
  }

  function resetOrgLine() {
    d3.selectAll('.orgDot')
      .attr('opacity', 0)
  }

  function animSpendingBar() {
    d3.selectAll('.spendingBar')
      .transition()
      .duration(800)
      .ease(d3.easeQuadOut)
      .attr("width", function(d, i) { return spendingX(d['Net new commitments']); })
      .on("end", function(d, i) {
        if (i==9) {
          animComplete = true;
        }
      });
  }

  function resetSpendingBar() {
    d3.selectAll('.spendingBar')
      .attr("width", 0)
  }

  function animHealthLine() {    
    var path = d3.selectAll('#healthLine')
    if (path!=null) {
      var pathLength = path.node().getTotalLength();
      path
        .attr('stroke-dashoffset', pathLength)
        .attr('stroke-dasharray', pathLength)
        .transition()
          .duration(1500)
          .delay(700)
          .ease(d3.easeQuadInOut)
          .attr('stroke-dashoffset', 0);

      d3.selectAll('.healthDot')
        .transition()
          .duration(200)
          .delay(function(d, i) { return i*50; })
          .ease(d3.easeLinear)
            .attr('opacity', 1)
    }
  }

  function resetHealthLine() {
    d3.selectAll('.healthDot')
      .attr('opacity', 0)
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