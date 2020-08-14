if($("#map").length != 0){ // if map exists, create it
  var map = L.map('map')
    .setView([0,0],3);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  	subdomains: 'abcd',
  	maxZoom: 19
  }).addTo(map);

  var marker = null;

  map.on('click',function(e){
     lat = e.latlng.lat;
     lon = e.latlng.lng;

     if(marker == null) marker = L.marker([lat,lon]).addTo(map);
     else marker.setLatLng(e.latlng);

     // Set coordinate field
     $("#coords").val(`${lat.toFixed(5)}, ${lon.toFixed(5)}`);

     // Prefill country values
     $.get(`/api/get-country?lat=${lat}&lon=${lon}`, function(data) {
       $("input[name='country']").val(data);
     });
  });
}

function goToSection(i){
  $("#sidebar a").removeClass("active");
  $("form section").addClass("is-hidden");
  $("#right-sidebar section").addClass("is-hidden");

  $("#sidebar > a:nth-of-type(" + i + ")").addClass("active");
  $("form section:nth-of-type(" + i + ")").removeClass("is-hidden");
  $("#right-sidebar section:nth-of-type(" + i + ")").removeClass("is-hidden");
}

function showInfo(info, label){
  $("#info").show();
  $("#info p").text(`${label}: ${info}`);
}

// Add Google translate
function googleTranslateElementInit() {
  new google.translate.TranslateElement({pageLanguage: 'en'}, 'google_translate_element');
}

// Info Button Handler
$(document).click(function(e){
  console.log("yooo");
  $("#info").hide();
});

$(".info-button").click(function(e){
  let data = $(this).data();
  e.stopPropagation();
  $("#info").show();
  $("#info p").text(`${data.label}: ${data.info}`);
})
