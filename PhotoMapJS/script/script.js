var allPhotos = [];
var directory = document.getElementById("directoryinput");
var windowHeight = window.innerHeight;
var windowWidth = window.innerWidth;
var examplePhotos = [ "https://dl.dropboxusercontent.com/u/5692098/PhotoMapJS%20Test/Atomic%20Dome.JPG",
                      "https://dl.dropboxusercontent.com/u/5692098/PhotoMapJS%20Test/Fushimi%20Inari.JPG",
                      "https://dl.dropboxusercontent.com/u/5692098/PhotoMapJS%20Test/Great%20buddha.JPG",
                      "https://dl.dropboxusercontent.com/u/5692098/PhotoMapJS%20Test/Itsukuschima.jpg",
                      "https://dl.dropboxusercontent.com/u/5692098/PhotoMapJS%20Test/Kinkaku-Ji.jpg",
                      "https://dl.dropboxusercontent.com/u/5692098/PhotoMapJS%20Test/Miyajima.jpg",
                      "https://dl.dropboxusercontent.com/u/5692098/PhotoMapJS%20Test/Osaka.jpg",
                      "https://dl.dropboxusercontent.com/u/5692098/PhotoMapJS%20Test/Tokyo%20Tower.jpg"];

//Sidebar Handling
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

ebutton.addEventListener("click", function() {
  readExamplePhotos();
}, false);

var markers = new L.MarkerClusterGroup();

var map = L.map('map').setView([0.5626948, 23.3427851], 2);
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

map.addLayer(markers);

var handleFile = function (event) {
  var reader = new FileReader();
  var iFiles = 0;
  var single_file;

  function process_one(){
    do{
     single_file = event.target.files[iFiles];
     iFiles++
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
            var x = typeof(tags['PixelXDimension']) != 'undefined' ? tags['PixelXDimension'].value : tags['ImageWidth'].value;
            var y = typeof(tags['PixelYDimension']) != 'undefined' ? tags['PixelYDimension'].value : tags['ImageLength'].value;
            var newsize = calculateAspectRatioFit(x,y,windowWidth*0.79,500);

            allPhotos.push({
              photo: single_file,
              type : 'l',
              realWidth : x,
              realHeight : y,
              height: Math.floor(newsize.height) ,
              width: Math.floor(newsize.width),
              latlng : [tags['GPSLatitude'].description,tags['GPSLongitude'].description]
            });

            var marker = L.marker([tags['GPSLatitude'].description,tags['GPSLongitude'].description],{alt : allPhotos.length-1});
            marker.on('click', onMarkerClick);
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

function onMarkerClick(e){
  var j = e.target.options.alt;
  var photo = allPhotos[j];
  if(photo.type=='l'){
    var reader = new FileReader();

    reader.onload = function(event){

      var arrayBufferView = new Uint8Array( event.target.result );
      var blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } );
      var urlCreator = window.URL || window.webkitURL;
      var imageUrl = urlCreator.createObjectURL( blob );
      var popup = L.popup({maxWidth:windowWidth*0.80})
      .setLatLng(photo.latlng)
      .setContent('<img src="'+imageUrl+'" height="'+photo.height+'" width="'+photo.width+'"/>')
      .openOn(map);
    };

    reader.readAsArrayBuffer(photo.photo);
  }else if(photo.type=='r'){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', photo.photo, true);
    xhr.responseType = 'blob';

    xhr.onload = function(e) {
      if (this.status == 200) {
        var blob = this.response;
        var urlCreator = window.URL || window.webkitURL;
        var imageUrl = urlCreator.createObjectURL( blob );
        var popup = L.popup({maxWidth:windowWidth*0.80})
        .setLatLng(photo.latlng)
        .setContent('<img src="'+imageUrl+'" height="'+photo.height+'" width="'+photo.width+'"/>')
        .openOn(map);
      }
    }
    xhr.send();
  }
  

}

function readExamplePhotos(){
  $.each(examplePhotos,function(index,url){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';

    xhr.onload = function(e) {
      if (this.status == 200) {
        exif = new ExifReader();

        exif.load(this.response);
        exif.deleteTag('MakerNote');

        tags = exif.getAllTags();
        if(typeof tags['GPSLatitude'] != 'undefined' && typeof tags['GPSLongitude'] != 'undefined'){
          var x = typeof(tags['PixelXDimension']) != 'undefined' ? tags['PixelXDimension'].value : tags['ImageWidth'].value;
          var y = typeof(tags['PixelYDimension']) != 'undefined' ? tags['PixelYDimension'].value : tags['ImageLength'].value;
          var newsize = calculateAspectRatioFit(x,y,windowWidth*0.79,500);

          allPhotos.push({
              photo: url,
              type: 'r',
              realWidth : x,
              realHeight : y,
              height: Math.floor(newsize.height) ,
              width: Math.floor(newsize.width),
              latlng : [tags['GPSLatitude'].description,tags['GPSLongitude'].description]
            });

            var marker = L.marker([tags['GPSLatitude'].description,tags['GPSLongitude'].description],{alt : allPhotos.length-1});
            marker.on('click', onMarkerClick);
            markers.addLayer(marker);
        }
      }
    }
    xhr.send();
  });

}