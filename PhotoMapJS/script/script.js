var directory = document.getElementById("directoryinput");
var windowHeight = window.innerHeight;
var windowWidth = window.innerWidth;

$('#arrow').click(function(){
  if($(this).hasClass('show')){
    $( "#arrow, #panel" ).animate({
    right: "+=290"
    }, 700, function() {
    // Animation complete.
    });
    $(this).html('<img src="img/arrow-close.png" width="30px" height="60px"/>').removeClass('show').addClass('hide');
    }
  else {    
    $( "#arrow, #panel" ).animate({
      right: "-=290"
    }, 700, function() {
    // Animation complete.
    });
    $(this).html('<img src="img/arrow-open.png" width="30px" height="60px"/>').removeClass('hide').addClass('show');    
  }
});


dbutton.addEventListener("click", function() {
  document.getElementById('directoryinput').click()
}, false);

var markers = new L.MarkerClusterGroup();

var map = L.map('map').setView([0.5626948, 23.3427851], 2);
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

map.addLayer(markers);

var handleFile = function (event) {
  var reader = new FileReader();
  var i = 0;

  function process_one(){
    var single_file;
    do{
     single_file = event.target.files[i];
     i++
    }while(typeof(single_file) != 'undefined' && !single_file.type.match('image.*'));

    if(single_file === undefined){
      return;
    }

    (function dummy_function(file){
      reader.onload = function(event){

        try {

          exif = new ExifReader();

          exif.load(event.target.result);
          exif.deleteTag('MakerNote');

          tags = exif.getAllTags();
          if(typeof tags['GPSLatitude'] != 'undefined' && typeof tags['GPSLongitude'] != 'undefined'){

            var arrayBufferView = new Uint8Array( event.target.result );
            var blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } );
            var urlCreator = window.URL || window.webkitURL;
            var imageUrl = urlCreator.createObjectURL( blob );
            var x = typeof(tags['PixelXDimension']) != 'undefined' ? tags['PixelXDimension'].value : tags['ImageWidth'].value;
            var y = typeof(tags['PixelYDimension']) != 'undefined' ? tags['PixelYDimension'].value : tags['ImageLength'].value;
            
            var newsize = calculateAspectRatioFit(x,y,1200,500);

            var popup = L.popup({maxWidth:windowWidth*0.75}).setContent('<img src="'+imageUrl+'" height="'+Math.floor(newsize['height'])+'" width="'+Math.floor(newsize['width'])+'"/>');

            var marker = L.marker([tags['GPSLatitude'].description,tags['GPSLongitude'].description]).bindPopup(popup);

            markers.addLayer(marker);
          }

        } catch (error) {
          //alert(error);
          console.log(error);
        }

        process_one();
      };

    reader.readAsArrayBuffer(file);
    })(single_file);
  }
  process_one();
};

directory.addEventListener("change", handleFile, false);  

function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {

    var ratio = [maxWidth / srcWidth, maxHeight / srcHeight ];
    ratio = Math.min(ratio[0], ratio[1]);

    return { width:srcWidth*ratio, height:srcHeight*ratio };
}
