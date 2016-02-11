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

  var mapper = function(x0,x1,y0,y1) {
    return function(x) {
      return (x - x0)/(x1-x0) * (y1-y0) + y0;
    }
  };

  var path_generator = function(data, x, y) {
    var path = 'M';
    path += x(0) + ',' + y(data[0]);
    data.slice(1).forEach(function(d,i) {
      path += 'L' + x(i+1) + ',' + y(d);
    });
    return path;
  };

  var min = function(data) {
    return Math.min.apply(null, data);
  }

  var max = function(data) {
    return Math.max.apply(null, data);
  }

  var get_height = function(sel) {
    var styles = window.getComputedStyle(sel, null);
    return parseInt(styles['fontSize'],10) || 18;
  }

  /**
   *
   **/
  function spark(sel, data, highlight_pt ) {

    var spark_node = document.querySelector(sel);
    if (!spark_node) throw Error("Couldn't find " + sel );

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

    var x = mapper(0,no_pts-1, margin, width-margin);
    var y = mapper(min(data), max(data), height-margin, margin);
    var d = path_generator(data, x, y);

    var path = create_SVG('path');
    add_SVG_attributes(path, {'d': d});
    svg.appendChild(path);

    var circle = create_SVG('circle');
    add_SVG_attributes(circle, {
      cx: x(hl_idx),
      cy: y(data[hl_idx]),
      r: 2
    });
    svg.appendChild(circle);

  }

  return {
    spark: spark
  };

})();

