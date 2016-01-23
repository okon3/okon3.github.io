$(document).ready(function(){
	TperMap.init();
});

var TperMap = {
	map : {},
	baseLayer : {},
	fermate : [],
	fermateLinee : [],
	init: function(){
		TperMap.initMap();
		TperMap.initLineeFermate();
		TperMap.initFermate();
	},
	initMap : function(){
		TperMap.baseLayer = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
		});

		TperMap.map = L.map('map', {
			scrollWheelZoom: false,
			center: [44.49528086931113, 11.346988677978516],
			zoom: 13
		});

		TperMap.map.addLayer(TperMap.baseLayer);
	},
	initFermate : function(){
		$.ajax({
			method: "GET",
			url: "data/fermate.json",
		})
		.done(function( msg ) {
			TperMap.fermate = msg;
			TperMap.drawFermate();
		});
	},
	initLineeFermate : function(){
		$.ajax({
			method: "GET",
			url: "data/fermate_linee.json",
			async : false
		})
		.done(function( msg ) {
			TperMap.fermateLinee = msg;
		});
	},
	drawFermate : function(){
		var count = 0;
		var markers = L.markerClusterGroup();
		$.each(TperMap.fermate,function(index,fermata){
			if(fermata.codice_zona == 500){
				var marker = L.marker([parseFloat(fermata.latitudine.replace(',','.')), parseFloat(fermata.longitudine.replace(',','.'))]);
				marker.codice_fermata = fermata.codice;
				marker.on('click', TperMap.onMarkerClick);
				markers.addLayer(marker);
				count++;
			}
		});
		TperMap.map.addLayer(markers);
		console.log('Disegnate ' + count + ' fermate');
	},
	onMarkerClick : function(e){
		console.log(TperMap.fermateLinee[e.target.codice_fermata]);

		var popupContent = "<ul>";

		$.each(TperMap.fermateLinee[e.target.codice_fermata],function(index,linea){
			popupContent += '<li><a href="javascript:void(0)" onclick="TperMap.onLineaClick('+e.target.codice_fermata+','+linea+')">'+ linea +'</a></li>';
		})

		popupContent += "</ul>";

		var popup = L.popup()
		.setLatLng(e.target.getLatLng())
		.setContent(popupContent)
		.openOn(TperMap.map);
	},
	onLineaClick : function(fermata,linea){
		var d = new Date();
		var HH = d.getHours();
		var MM = d.getMinutes();
		$.ajax({
			method: "POST",
			url: "https://hellobuswsweb.tper.it/web-services/hello-bus.asmx/QueryHellobus",
			async : false,
			data : {
				fermata : fermata,
				linea : linea,
				oraHHMM : HH+''+MM,
			}
		})
		.done(function( msg ) {
			console.log(msg);
		});
	}
}

function convertLineeFermate2FermateLinee(){
	$.ajax({
			method: "GET",
			url: "data/linee_fermate.json",
		})
		.done(function( msg ) {
			var data = msg;
			var fermate = {};
			$.each(data,function(index,fermata){
				if(fermata.codice_zona = "500"){
					if(!fermate.hasOwnProperty(fermata.codice_fermata))
						fermate[fermata.codice_fermata] = [];
					fermate[fermata.codice_fermata].push(fermata.codice_linea);
				}
			})

			console.log(JSON.stringify(fermate));
		});
}