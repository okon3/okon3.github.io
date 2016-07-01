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
        defaultCenter: [44.45534933372025, 10.5413818359375]
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
            $.getJSON("data/"+ layer +".topo.json")
                .done(function(data) {
                    console.log("Loaded layer:" + layer);
                    reerMap.layers[layer].layer = new L.TopoJSON(data, {style : reerMap.style});
                    reerMap.layers[layer].enabled = false;
                    $("#" + layer).removeClass("loading");
                    reerMap.toggleLayer(layer);
                });
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
        
    }
}
