$(document).ready(function(){
    reerMap.init();
});

/* To handle TopoJsons */
L.TopoJSON = L.GeoJSON.extend({  
  addData: function(jsonData) {    
    if (jsonData.type === "Topology") {
      for (key in jsonData.objects) {
        geojson = topojson.feature(jsonData, jsonData.objects[key]);
        L.GeoJSON.prototype.addData.call(this, geojson);
      }
    }    
    else {
      L.GeoJSON.prototype.addData.call(this, jsonData);
    }
  }  
});

var reerMap = {
    options : {
        baseLayerUrl : "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        defaultZoom : 8,
        defaultCenter: [44.45534933372025, 10.5413818359375],
        tileOptions : {
            maxZoom: 20,  // max zoom to preserve detail on
            tolerance: 5, // simplification tolerance (higher means simpler)
            extent: 4096, // tile extent (both width and height)
            buffer: 64,   // tile buffer on each side
            debug: 0,      // logging level (0 to disable, 1 or 2)
            indexMaxZoom: 0,        // max zoom in the initial tile index
            indexMaxPoints: 100000, // max number of points per tile in the index
        }
    },
    map : {},
    baseLayer : {},
    layers : [],
    style : {
        color: "#ff0000",
        weight: 2,
        opacity: 1
    },
    init: function(){
		reerMap.initEvents();
		reerMap.initMap();
        pad = 0;
	},
    initEvents : function(){
        $("#sidebar-toggle").click(function(e) {
            e.preventDefault();
            var sidebarVisible = $("#sidebar-wrapper" ).width() > 0 ? 1 : 0;
            var width = sidebarVisible ? 0 : 250;
            $("#sidebar-wrapper").animate({width: width},750,function(){
                reerMap.map.invalidateSize({pan: false},false);
            })
        });

		$("#button_findMe").on("click", function(e) {
			reerMap.map.locate({setView:true});
		});

        $(".layer-control").on("click",function(e) {
            reerMap.loadAndToggleLayer($(e.target).attr("id"));
        })
	},
    initMap : function(){
		reerMap.baseLayer = L.tileLayer(reerMap.options.baseLayerUrl, {
			attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
		});

		reerMap.map = L.map("map", {
			center: reerMap.options.defaultCenter,
			zoom: reerMap.options.defaultZoom
		});
		reerMap.map.addLayer(reerMap.baseLayer);
	},
    loadAndToggleLayer : function(layer){
        console.log("Toggling layer: " + layer);
        if(typeof reerMap.layers[layer] === "undefined"){
            $("#" + layer).addClass("loading");
            reerMap.layers[layer] = {};

            console.log("Loading layer:" + layer);
            reerMap.layers[layer].layer = L.tileLayer.wms('http://185.122.59.236:8080/geoserver/reer/wms?',
                {
                    layers : 'reer',
                    transparent: true,
                    format: 'image/png8',
                }
            );
            reerMap.layers[layer].enabled = false;
            reerMap.toggleLayer(layer);


            // $.getJSON("data/"+ layer +".json")
            //     .done(function(data) {
            //         console.log("Loaded layer:" + layer);
            //         reerMap.layers[layer].layer = L.canvasTiles()
            //           .params({ debug: false, padding: 5 })
            //           .drawing(reerMap.drawingOnCanvas);
            //         //reerMap.layers[layer].layer = new L.TopoJSON(data, {style : reerMap.style});
            //         tileIndex = geojsonvt(data, reerMap.options.tileOptions);
            //         reerMap.layers[layer].enabled = false;
            //         $("#" + layer).removeClass("loading");
            //         reerMap.toggleLayer(layer);
            //     });
        }else{
            reerMap.toggleLayer(layer);
        }
    },
    toggleLayer : function(layer){
        if(reerMap.layers[layer].enabled){
            $("#" + layer).removeClass("enabled");
            if(reerMap.map.hasLayer(reerMap.layers[layer].layer)){
                reerMap.map.removeLayer(reerMap.layers[layer].layer);
            }
            reerMap.layers[layer].enabled = false;
        }else{
            $("#" + layer).addClass("enabled");
            reerMap.map.addLayer(reerMap.layers[layer].layer);
            reerMap.layers[layer].enabled = true;
        }
    },
    drawingOnCanvas : function(canvasOverlay, params) {

            var bounds = params.bounds;
            params.tilePoint.z = params.zoom;

            var ctx = params.canvas.getContext('2d');
            ctx.globalCompositeOperation = 'source-over';


            console.log('getting tile z' + params.tilePoint.z + '-' + params.tilePoint.x + '-' + params.tilePoint.y);

            var tile = tileIndex.getTile(params.tilePoint.z, params.tilePoint.x, params.tilePoint.y);
            if (!tile) {
                console.log('tile empty');
                return;
            }

            ctx.clearRect(0, 0, params.canvas.width, params.canvas.height);

            var features = tile.features;

            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;


            for (var i = 0; i < features.length; i++) {
                var feature = features[i],
                    type = feature.type;

                ctx.fillStyle = feature.tags.color ? feature.tags.color : 'rgba(255,0,0,0.05)';
                ctx.beginPath();

                for (var j = 0; j < feature.geometry.length; j++) {
                    var geom = feature.geometry[j];

                    if (type === 1) {
                        ctx.arc(geom[0] * ratio + pad, geom[1] * ratio + pad, 2, 0, 2 * Math.PI, false);
                        continue;
                    }

                    for (var k = 0; k < geom.length; k++) {
                        var p = geom[k];
                        var extent = 4096;
                       
                        var x = p[0] / extent * 256;
                        var y = p[1] / extent * 256;
                        if (k) ctx.lineTo(x  + pad, y   + pad);
                        else ctx.moveTo(x  + pad, y  + pad);
                    }
                }

                if (type === 3 || type === 1) ctx.fill('evenodd');
                ctx.stroke();
            }
        },
        colorizeFeatures : function(data) {
            var counter = 0;
            for (var i = 0; i < data.features.length; i++) {
                data.features[i].properties.color = '#ff0000';
                counter += data.features[i].geometry.coordinates[0].length;
            }
            return counter;
        }
}
