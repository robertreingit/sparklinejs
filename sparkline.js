var sparkline = (function() {
  "use strict";

  var svg_ns = 'http://www.w3.org/2000/svg';
  
  function create_SVG(type) {
    var element = document.createElementNS(svg_ns, type);
    return element;
  }

  function add_SVG_attributes(element, attrs) {
    for (name in attrs) {
      element.setAttribute(name, attrs[name]);
    }
  }

  var Scale = function(x0,x1,y0,y1) {
    function transform(x) {
      return (x - x0)/(x1-x0) * (y1-y0) + y0;
    }
    return function apply(data) {
      return Array.isArray(data) ? 
        data.map(function(d) { return transform(d); }) :
        transform(data);
    }
  };

  //
  var path_generator = function(x, y) {
    var path = 'M';
    path += x[0] + ',' + y[0];
    path += y.slice(1).reduce(function(pre,curr,i) {
      return pre + 'L' + x[i+1] + ',' + curr;
    },'');
    return path;
  };

  var min = function(data) {
    return Math.min.apply(null, data);
  }

  var max = function(data) {
    return Math.max.apply(null, data);
  }

  var mean = function(data) {
    return data.reduceRight(function(a,b) { return a+b; })/data.length;
  }

  var get_height = function(sel) {
    var styles = window.getComputedStyle(sel, null);
    return parseInt(styles['fontSize'],10) || 18;
  }

  // Calculates the quartiles using Tukey's method
  var quartile = function(data) {
    var data_cp = data.slice().sort(function(a,b) { return a-b; });
    var no_pts = data_cp.length;
    var q1, q2;
    if (no_pts % 2) { // odd number of data pts
      q1 = Math.floor((no_pts+3)/4);
      q2 = Math.floor((3*no_pts+3)/4);

    }
    else { // even number of data pts
      q1 = Math.floor((no_pts+2)/4);
      q2 = Math.floor((3*no_pts+2)/4);
    }
    return [data_cp[q1],data_cp[q2]];
  };

  var range = function(d) {
    var r = [];
    for (var i = 0; i < d; i += 1) r.push(i);
    return r;
  }

  // This is the working horse function
  // sel:   css style selector of the element to which the 
  //        sparkline will be attached to
  // data:  array of numeric values
  // highlight_pt: index of the point which should be highlighted with
  //        a red dot.
  function spark(sel, data, highlight_pt, show_quartile ) {

    var spark_node;
    if (typeof sel === 'string') {
      spark_node = document.querySelector(sel);
      if (!spark_node) throw Error("Couldn't find " + sel );
    }
    else {
      spark_node = sel;
    }

    var no_pts = data.length;
    if (!no_pts) throw Error('No data provided.');

    var hl_idx = highlight_pt || no_pts - 1;

    var height = get_height(spark_node),
        ratio = 2,
        width = height * ratio,
        margin = 2;

    var svg = create_SVG('svg');
    add_SVG_attributes(svg, {'width': width, 'height': height});
    spark_node.appendChild(svg);

    var xScale = Scale(0,no_pts-1, margin, width-margin);
    var yScale = Scale(min(data), max(data), height-margin, margin);

    var x = xScale(range(no_pts));
    var y = yScale(data);
    var d = path_generator(x, y);

    var qu = quartile(data);
    var qu_x = xScale([0,no_pts-1,no_pts-1,0]);
    var qu_y = yScale([qu[1],qu[1],qu[0],qu[0]]);
    var qu_d = path_generator(qu_x, qu_y);
    qu_d += 'Z';

    var path_quart = create_SVG('path');
    add_SVG_attributes(path_quart, {'d': qu_d, 'class': 'quartile'});
    svg.appendChild(path_quart);

    var path = create_SVG('path');
    add_SVG_attributes(path, {'d': d});
    svg.appendChild(path);

    var circle = create_SVG('circle');
    add_SVG_attributes(circle, {
      cx: x[hl_idx],
      cy: y[hl_idx],
      r: 2
    });
    svg.appendChild(circle);

  }

  function bootstrap() {
    var sparks = document.querySelectorAll('span.spark');
    Array.prototype.forEach.call(sparks,function(span) {
      var data = span.getAttribute('data').split(',').map(function(d) {
        return parseFloat(d);
      });
      var show_quartile = span.getAttribute('data-quartile');
      var highlight_idx = span.getAttribute('data-quartile');
      spark(span, data);
    });
  }

  return {
    spark: spark,
    bootstrap: bootstrap
  };

})();

