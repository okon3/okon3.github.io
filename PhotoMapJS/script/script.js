var fotos;
var directory = document.getElementById("directoryinput");
var windowHeight = window.innerHeight;
var windowWidth = window.innerWidth;

var markers = new L.MarkerClusterGroup();

var map = L.map('map').setView([49.5626948, 23.3427851], 5);
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

map.addLayer(markers);

var handleFile = function (event) {
  var files;
  files = event.target.files;

  for(var i = 0,f;f= files[i];i++){

     if (!f.type.match('image.*')) {
      continue;
    }
    var reader = new FileReader();

    reader.onload = (function (theFile) {
      return function(event){
        try {

          exif = new ExifReader();

          exif.load(event.target.result);
          exif.deleteTag('MakerNote');

          tags = exif.getAllTags();

          var arrayBufferView = new Uint8Array( event.target.result );
          var blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } );
          var urlCreator = window.URL || window.webkitURL;
          var imageUrl = urlCreator.createObjectURL( blob );
          
          var newsize = calculateAspectRatioFit(tags['PixelXDimension'].description,tags['PixelYDimension'].description,1200,500);

          var popup = L.popup({maxWidth:windowWidth*0.75}).setContent('<img src="'+imageUrl+'" height="'+Math.floor(newsize['height'])+'" width="'+Math.floor(newsize['width'])+'"/>');

          var marker = L.marker([tags['GPSLatitude'].description,tags['GPSLongitude'].description]).bindPopup(popup);

          markers.addLayer(marker);

        } catch (error) {
          //alert(error);
          console.log(theFile.name);
          console.log(error);
        }
      };

    })(f);
  reader.readAsArrayBuffer(f); 
  }
};

directory.addEventListener("change", handleFile, false);  

function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {

    var ratio = [maxWidth / srcWidth, maxHeight / srcHeight ];
    ratio = Math.min(ratio[0], ratio[1]);

    return { width:srcWidth*ratio, height:srcHeight*ratio };
}
