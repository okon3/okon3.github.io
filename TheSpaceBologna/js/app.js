(function($){
    $(function(){
        $('.button-collapse').sideNav();
        loadFilms();
    });
})(jQuery);

function loadFilms(){
    //Request movies
    $.ajax({
        url: app.config.UrlMovies,
        dataType: "json",
        success: function (response) {
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
                            film.title = _film[0].seo.seoTitle;
                            film.director = _film[0].regia;
                            film.duration = _film[0].durata;
                            film.genres = _film[0].categories;
                            film.imageURL = 'http://cdn.thespacecinema.it/portal/rest/jcr/repository/collaboration' + _film[0].path + '/illustration';

                            app.movies[codMovie] = film;
                        }
                    }
                    app.loaded = true;
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
            days : 4 //Number of days (today, tommorrow, after tomorrow, after after tomorrow)
        },
        codMovies : [],
        movies : {},
        programmazione : [],
        loaded: false
    }
})

Vue.component('movie-card-desktop', {
  props: ['movie', 'day'],
  template: '<div class="col l6 hide-on-med-and-down">'+
            '	<div class="card horizontal hoverable ">'+
            '		<div class="card-image">'+
            '			<img v-bind:src="movie.imageURL">'+
            '		</div>'+
            '		<div class="card-stacked">'+
            '			<div class="card-content">'+
            '				<span class="card-title">{{movie.title}}</span>'+
            '				<ul class="fa-ul">'+
            '					<li><i class="fa-li fa fa-genderless"></i> <strong>Genere</strong> : {{movie.genres.join(\',\')}} </li>'+
            '					<li><i class="fa-li fa fa-film"></i> <strong>Regia</strong> : {{movie.director}}</li>'+
            '					<li><i class="fa-li fa fa-play"></i> <strong>Durata</strong> : {{movie.duration}}</li>'+
            '				</ul>'+
            '			</div>'+
            '			<div class="card-action center-align">'+
            
            '			</div>'+
            '		</div>'+
            '	</div>'+
            '</div>'
})

Vue.component('movie-card-mobile', {
  props: ['movie'],
  template: '<div class="col s12 m6 hide-on-large-only">'+
            '	<div class="card hoverable ">'+
            '		<div class="card-image">'+
            '			<img v-bind:src="movie.imageURL">'+
            '		</div>'+
            '		<div class="card-stacked">'+
            '			<div class="card-content">'+
            '				<span class="card-title">{{movie.title}}</span>'+
            '				<ul class="fa-ul">'+
            '					<li><i class="fa-li fa fa-genderless"></i> <strong>Genere</strong> : {{movie.genres.join(\',\')}} </li>'+
            '					<li><i class="fa-li fa fa-film"></i> <strong>Regia</strong> : {{movie.director}}</li>'+
            '					<li><i class="fa-li fa fa-play"></i> <strong>Durata</strong> : {{movie.duration}}</li>'+
            '				</ul>'+
            '			</div>'+
            '			<div class="card-action center-align">'+
            '				<div class="chip blue white-text" v-for="time in movie.times">{{time}}</div>'+
            '			</div>'+
            '		</div>'+
            '	</div>'+
            '</div>'
})