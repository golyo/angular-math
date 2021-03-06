'use strict';

var mathApp = angular.module('mathApp', ['ngCookies', 'ngSanitize', 'ui.router', 'pascalprecht.translate', 'angular-google-analytics', 'ui.bootstrap']);

var MathJax = undefined;
var useMathJax = false;
var mathJaxUrl = 'http:\/\/cdn.mathjax.org\/mathjax\/2.2-latest\/MathJax.js?config=TeX-AMS_HTML';

mathApp
    .config(function ($stateProvider, $urlRouterProvider, $translateProvider, AnalyticsProvider) {
		if (useMathJax) {
			$("body").append('<script src="' + mathJaxUrl + '"></script>');
		}
		$stateProvider
			.state('home', {
				url: '/home',
				templateUrl: 'views/home.html'
			})
			.state('excercises', {
				controller:'MainController',
				abstract: true,
				url: '/excercises',
				template: '<ui-view/>'
			})
			.state('excercises.start', {
				url: '',
				templateUrl: 'views/excercises_start.html'
			})
			.state('excercises.do', {
				url: '/do',
				templateUrl: 'views/excercises_do.html'
			})
			.state('excercises.all', {
				url: '/all',
				templateUrl: 'views/excercises_all.html'
			})
			.state('excercises.result', {
				url: '/result',
				templateUrl: 'views/excercises_result.html'
			})
			.state('excercises.settings', {
				url: '/settings',
				templateUrl: 'views/excercises_settings.html'
			})
			.state('maintain', {
				controller:'MaintainController',
				abstract: true,
				url: '/maintain',
				template: '<ui-view/>'
			})
			.state('maintain.start', {
				url: '',
				templateUrl: 'views/maintainance.html'			
			})
			.state('maintain.view', {
				url: '/view',
				templateUrl: 'views/maintainance_view.html'			
			})
			;
		$urlRouterProvider
			.otherwise('/home');

		$translateProvider.useStaticFilesLoader({
			prefix: 'i18n/locale-',
			suffix: '.json'
		});
		$translateProvider.preferredLanguage('hu');
		$translateProvider.useSanitizeValueStrategy('escaped');
		
		AnalyticsProvider.setAccount('UA-5633719-2');
		AnalyticsProvider.trackPages(true);
		AnalyticsProvider.setPageEvent('$stateChangeSuccess');
	})
	.factory('TemplateService', function ($http) {
		var cache = {};
		return { 
			getTemplate : function (content) {
					if (!cache[content]) {
						cache[content] = $http.get('templates/' + content + '.html');
					}
					return cache[content];
				}
			};
	})
	;
	
function doAnimation(selector, animation, callback) {
	var $act = $(selector).removeClass().addClass(animation + ' animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
		$(this).removeClass();
		if (callback) {
			callback();
		}
	});
};

