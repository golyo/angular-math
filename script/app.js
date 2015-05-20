'use strict';

var mathApp = angular.module('mathApp', ['ngAnimate', 'ngCookies', 'ui.router', 'pascalprecht.translate']);

mathApp
    .config(function ($stateProvider, $urlRouterProvider, $translateProvider) {
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
			});
		$urlRouterProvider
			.otherwise('/home');

		$translateProvider.useStaticFilesLoader({
			prefix: 'i18n/locale-',
			suffix: '.json'
		});
		$translateProvider.preferredLanguage('hu');
		$translateProvider.useSanitizeValueStrategy('escaped');
		
		//AnalyticsProvider.setAccount('UA-5633719-2');
		//AnalyticsProvider.trackPages(true);
		//AnalyticsProvider.setPageEvent('$stateChangeSuccess');
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

