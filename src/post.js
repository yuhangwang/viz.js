  function Viz(src) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var format = options.format === undefined ? "svg" : options.format;
    var engine = options.engine === undefined ? "dot" : options.engine;
    var scale = options.scale;
  
    if (format == "png-image-element") {
      return Viz.svgXmlToPngImageElement(render(src, "svg", engine), scale);
    } else {
      return render(src, format, engine);
    }
  }

  var graphviz;
  var errors;
  
  function appendError(buf) {
    errors += graphviz["Pointer_stringify"](buf);
  }
  
  function render(src, format, engine) {
    if (typeof graphviz === "undefined") {
      graphviz = Module();
    }
    
    errors = "";
    
    var resultPointer = graphviz["ccall"]("vizRenderFromString", "number", ["string", "string", "string"], [src, format, engine]);
    var resultString = graphviz["Pointer_stringify"](resultPointer);
    graphviz["_free"](resultPointer);
    
    if (errors != "") {
      throw errors;
    }
    
    return resultString;
  }
  
  Viz.svgXmlToPngImageElement = function(svgXml, scale) {
    if (scale === undefined) {
      if ("devicePixelRatio" in window && window.devicePixelRatio > 1) {
        scale = window.devicePixelRatio;
      } else {
        scale = 1;
      }
    }
    
    var pngImage = new Image();
    
    if (typeof fabric === "object" && fabric.loadSVGFromString) {
      fabric.loadSVGFromString(svgXml, function(objects, options) {
        var element = document.createElement("canvas");
        element.width = options.width;
        element.height = options.height;
      
        var canvas = new fabric.Canvas(element, { enableRetinaScaling: false });
        var obj = fabric.util.groupSVGElements(objects, options);
        canvas.add(obj).renderAll();
      
        pngImage.src = canvas.toDataURL({ multiplier: scale });
        pngImage.width = options.width;
        pngImage.height = options.height;
      });
    } else {
      var svgImage = new Image();
      svgImage.src = "data:image/svg+xml;base64," + btoa(svgXml);

      svgImage.onload = function() {
        var canvas = document.createElement("canvas");
        canvas.width = svgImage.width * scale;
        canvas.height = svgImage.height * scale;

        var context = canvas.getContext("2d");
        context.drawImage(svgImage, 0, 0, canvas.width, canvas.height);

        pngImage.src = canvas.toDataURL("image/png");
        pngImage.width = svgImage.width;
        pngImage.height = svgImage.height;
      }
    }
    
    return pngImage;
  }
  
  if (typeof module === "object" && module.exports) {
    module.exports = Viz;
  } else {
    global.Viz = Viz;
  }
  
})(this);
