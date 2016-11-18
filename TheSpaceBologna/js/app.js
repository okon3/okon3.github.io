var weekday = new Array(7);
weekday[0]=  "Domenica";
weekday[1] = "Lunedì";
weekday[2] = "Martedì";
weekday[3] = "Mercoledì";
weekday[4] = "Giovedì";
weekday[5] = "Venerdì";
weekday[6] = "Sabato";

//Startup
(function($){
    $(function(){
        setDays();

        if(isMobile()){
            $("#app").swipe( {
                swipeLeft:function(event, direction, distance, duration, fingerCount) {
                    var currentDay = parseInt($('.tabs a.active').attr('href').substr(-1));
                    if(fingerCount > 0)
                        $('ul.tabs').tabs('select_tab', 'container-'+(++currentDay));
                },
                swipeRight:function(event, direction, distance, duration, fingerCount) {
                    var currentDay = parseInt($('.tabs a.active').attr('href').substr(-1));
                    if(fingerCount > 0)
                        $('ul.tabs').tabs('select_tab', 'container-'+(--currentDay));
                },
                threshold: 75
            });
        }

        loadFilms();
    });
})(jQuery);

function isMobile() {
  try{ document.createEvent("TouchEvent"); return true; }
  catch(e){ return false; }
}

//Set days accordingly
function setDays(){
    var today = new Date();
    for(var i = 1; i <= app.config.days; i++){
        var curDay = addDays(today,i-1);
        var giorno = $('<a/>');
        giorno.text(weekday[curDay.getDay()]);
        giorno.attr('href', '#container-' + i);
        if(i === 1){
            giorno.addClass("active");
            giorno.text('Oggi');
        }
        if(i === 2){
            giorno.text('Domani');
        }
        $('#day-' + i).html(giorno);
    }
}

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function loadFilms(){
    //Request movies
    $.ajax({
        url: app.config.UrlMovies,
        dataType: "json",
        success: function (response) {
            app._programmazione = response.programmazione; //copy the real programmazione
            app.lengthProgrammazione = response.programmazione.length > app.config.days ? app.config.days : response.programmazione.length;
            var _codMovies = [];
            for(var i = 0; i < app.lengthProgrammazione; i++){
                var programmazione = response.programmazione[i];

                /* Daily movies*/
                var _programmazione = $.map(programmazione, function (el, idx) {
                    return el.codFilm;
                });

                _codMovies = _codMovies.concat(_programmazione); //concat to all movies

                app.programmazione.push(_programmazione.filter(function(item, pos) {
                    return _programmazione.indexOf(item) == pos;
                }));
            }

            app.codMovies = _codMovies.filter(function(item, pos) {
                return _codMovies.indexOf(item) == pos;
            });

            //Get info for movies of the first `app.config.days` days
            var params = {
                level : 'cdn,meta,seo,cats',
                universalCodes : app.codMovies.join(',')
            };

            $.ajax({
                url: app.config.UrlMoviesInfo,
                dataType: "json",
                data : params,
                success: function (response) {
                    //Gather info for each film
                    //TODO: Check if response.films has lenght > 0
                    for(var i = 0; i < app.codMovies.length; i++){
                        var codMovie = app.codMovies[i];
                        var _film = response.films.filter(function(item, pos) {
                            return item.tscCode === codMovie;
                        });

                        if(_film.length > 0){
                            var film = {};
                            film.title = _film[0].seo.seoTitle.replace('&amp;','&');
                            film.director = _film[0].regia;
                            film.duration = app.minToHours(_film[0].durata);
                            film.genres = _film[0].categories;
                            film.imageURL = 'http://cdn.thespacecinema.it/portal/rest/jcr/repository/collaboration' + _film[0].path + '/illustration';
                            film.times = [];
                            for(var j = 0; j < app.config.days; j++){
                                var tempProg = app._programmazione[j].filter(function(item, pos) {return item.codFilm === codMovie;});
                                film.times[j] = $.map(tempProg, function (el, indexOrKey) {
                                    var time = {};
                                    time.time = el.eventTime;
                                    time.iddata = el.eventDate;
                                    time.idsala = el.codSala;
                                    time.idevento = el.codEvento;
                                    time.idfilm = el.codFilm;
                                    return time;
                                });
                            }
                            
                            app.movies[codMovie] = film;
                        }
                    }

                    //Sort films by default
                    app.sortMovies();

                    app.loaded = true;

                    //Force reload tabs
                    $('ul.tabs').tabs();
                },
                error: function(response){
                    console.log(response);
                }
            });
        },
        error: function(response){
            console.log(response);
        }
    });
}

var app = new Vue({
    el: '#app',
    data: {
        config : {
            UrlMovies : 'http://cdn.thespacecinema.it/rest/programmazione/3/get',
            UrlMoviesInfo : 'http://cdn.thespacecinema.it/rest/film/films-by-universalCodes',
            UrlOccupancyInfo : 'http://ecomm.thespacecinema.it/web/gateway', 
            idCinema : 3,
            days : 4, //Number of days (today, tommorrow, after tomorrow, after after tomorrow)
            isFABActive : false,
            listMode : false,
            sortIndex : 0,
            sorts : [
                {
                    title: 'Ordine alfabetico',
                    icon : 'fa-sort-alpha-asc',
                    function : function(codMovie1, codMovie2){ //Sort by title asc
                        var title1 = app.movies[codMovie1].title.replace("(3D) ","").replace("(NO 3D) ","");
                        var title2 = app.movies[codMovie2].title.replace("(3D) ","").replace("(NO 3D) ","");
                        if(title1 < title2) return -1
                        if(title1 > title2) return 1
                        return 0;
                    }
                },
                {
                    title: 'Ordine alfabetico inverso',
                    icon : 'fa-sort-alpha-desc',
                    function : function(codMovie1, codMovie2){ //Sort by title desc
                        var title1 = app.movies[codMovie1].title.replace("(3D) ","").replace("(NO 3D) ","");
                        var title2 = app.movies[codMovie2].title.replace("(3D) ","").replace("(NO 3D) ","");
                        if(title1 < title2) return 1
                        if(title1 > title2) return -1
                        return 0;
                    }
                }
            ]
        },
        codMovies : [],
        movies : {},
        _programmazione : [],
        programmazione : [],
        loaded: false
    },
    methods : {
        changeListMode : function(){
            this.config.listMode = !this.config.listMode;
            $('.fixed-action-btn').closeFAB();
            this.config.isFABActive = false;
        },
        changeSort : function(event){
            this.config.sortIndex = (this.config.sortIndex + 1 ) % (this.config.sorts.length);
            this.sortMovies();
            $('.fixed-action-btn').closeFAB();
            this.config.isFABActive = false;
        },
        checkOccupancy : function(time,event){
            var params = {};
            params.service = 115;
            params.iddata = time.iddata;
            params.idcinema = this.config.idCinema;
            params.idsala = time.idsala;
            params.idevento = time.idevento;
            params.idfilm = time.idfilm;
            params.tipoop = 'ACQUISTO';
            params.modpag = 0;
            var source = event.target || event.srcElement;
            $(source).append(' <i class="fa fa-spinner fa-pulse fa-fw"></i>');
            $.get({
                url: 'https://crossorigin.me/' + app.config.UrlOccupancyInfo,
                dataType: "html",
                data : params,
                success: function (response) {
                    var free = $(response).find('.Mappa_Poltrona_Libera').length;
                    var full = $(response).find('.Mappa_Poltrona_Occupata').length;
                    var total = free + full;
                    var ratio = Math.round(full / total * 100 * 100 ) / 100;
                    var ratioStr = ratio + '%'; 
                    console.log('free: ' + free + ' full: ' + full + ' total: ' + total + ' ratio: ' + ratio);

                    var colorClass = 'chip light-green darken-2 white-text';
                    if (ratio > 50) colorClass = 'chip yellow darken-3 white-text';
                    if (ratio > 75) colorClass = 'chip red darken-3 white-text';
                    if (ratio > 90) colorClass = 'chip grey darken-4 white-text';;

                    $(source).removeClass().addClass(colorClass);
                    $(source).find('i').remove();
                },
                error: function(response){
                    console.log(response);
                }
            });
        },
        generateContainerID : function(n){
            return "container-" + n;
        },
        handleFAB : function(){
            this.config.isFABActive = !this.config.isFABActive;
        },
        minToHours : function(minutes){
            var h = Math.floor(minutes/60);
            var m = minutes - (60*h);
            return h + ':' + m;
        },
        sortMovies : function(){
            for(var i = 0 ; i < this.programmazione.length; i++){
                this.programmazione[i].sort(this.config.sorts[this.config.sortIndex].function);
            }
        }
    },
    computed : {
        FABIcon : function(){
            return this.config.isFABActive ? 'close' : 'menu';
        },
        sortIcon : function(){
            return this.config.sorts[(this.config.sortIndex + 1 ) % (this.config.sorts.length)].icon;
        },
        sortTitle : function(){
            return this.config.sorts[(this.config.sortIndex + 1 ) % (this.config.sorts.length)].title;
        },
        viewIcon : function(){
            return this.config.listMode ? 'view_module' : 'view_list';
        },
    }
})

Vue.component('movie-card', {
    computed : {
        listMode : function(){
            return app.config.listMode;
        }
    },
    props: ['movie', 'day', 'isDesktop'],
    template: '<div class="col s12 m6 l6" v-bind:class="{\'hide-on-med-and-down\':isDesktop, l6:isDesktop,\'hide-on-large-only\':!isDesktop, s12:!isDesktop, m6:!isDesktop}">'+ 
                '	<div class="card hoverable" v-bind:class="{horizontal:isDesktop}">'+
                '		<div class="card-image" v-if="!listMode">'+
                '			<img v-bind:src="movie.imageURL">'+
                '		</div>'+
                '		<div class="card-stacked">'+
                '			<div class="card-content">'+
                '				<span class="card-title">{{movie.title}}</span>'+
                '				<ul class="fa-ul" v-if="!listMode">'+
                '					<li><i class="fa-li fa fa-genderless"></i> <strong>Genere</strong> : {{movie.genres.join(\', \')}} </li>'+
                '					<li><i class="fa-li fa fa-film"></i> <strong>Regia</strong> : {{movie.director}}</li>'+
                '					<li><i class="fa-li fa fa-play"></i> <strong>Durata</strong> : {{movie.duration}}</li>'+
                '				</ul>'+
                '               <p v-if="listMode"><strong>Genere</strong> : {{movie.genres.join(\', \')}} | <strong>Regia</strong> : {{movie.director}} | <strong>Durata</strong> : {{movie.duration}}</p>'+
                '			</div>'+
                '			<div class="card-action center-align">'+
                '				<div class="chip blue white-text" v-for="time in movie.times[day]" @click="checkOccupancy(time,$event)">{{time.time}}</div>'+
                '			</div>'+
                '		</div>'+
                '	</div>'+
                '</div>',
    methods : {
        checkOccupancy : function(time,event){
            app.checkOccupancy(time,event);
        }
    }
})