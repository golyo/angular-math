'use strict';

/* Controllers */

mathApp.controller('MainController', function ($scope, $interval, $compile, $location, $cookieStore, $state) {
	//Timer
	var timer;
		
	var resetTimer = function() {
		if (timer) {
			$interval.cancel(timer);
			timer == undefined;
		}
	};
	var startTimer = function() {
		if ($scope.second > 0) {
			timer = $interval(function() {
				$scope.second = $scope.second-1;
				if ($scope.second == 0) {
					$scope.finish();
				}
			}, 1000);
		}
	};
	
	var focusTopInput = function() {
		setTimeout(function(){ $("#selectedEq input:enabled").first().focus(); }, 300);
	};
	
	var loadSettings = function() {
		$scope.settings = $cookieStore.get('mathSettings') || DefaultSettings;
	};
	
	$scope.checked=false;
	
	$scope.changeSettings = function() {
		$cookieStore.put('mathSettings', $scope.settings);		
		$scope.reset();
	};
		
	$scope.reset = function() {
		resetTimer();
		loadSettings();
		$scope.running = true;
		$scope.checked = true;
		$scope.second = $scope.settings.timeInSec;
		$scope.equations = new Array();
		$scope.settings.substraction.min = $scope.settings.addition.min;
		$scope.settings.substraction.max = $scope.settings.addition.max;
		$scope.settings.division.min = $scope.settings.multiply.min;
		$scope.settings.division.max = $scope.settings.multiply.max;
		ExcerciseUtil.create($scope.equations, 'addition', $scope.settings.addition);
		ExcerciseUtil.create($scope.equations, 'substraction', $scope.settings.substraction);
		ExcerciseUtil.create($scope.equations, 'multiply', $scope.settings.multiply);
		ExcerciseUtil.create($scope.equations, 'division', $scope.settings.division);
		ExcerciseUtil.create($scope.equations, 'clock', $scope.settings.clock);
		$scope.eq = $scope.equations[0];
		$scope.result = undefined;
		startTimer();
		if ($scope.settings.showAll) {
			$location.path('/excercises/all');
		} else {
			$location.path('/excercises/do');
			focusTopInput();
		}
	};
	
	$scope.getSign = function(operationName) {
		var op = operations[operationName];
		return op ? op.sign : undefined;
	};
	$scope.initialize = function() {
		$scope.running = false;
	};	
	$scope.check = function() {
		$location.path('/excercises/all');
		startTimer();
	};
	$scope.finish = function() {
		resetTimer();
		var succesNo = ExcerciseUtil.validate($scope.equations);
		var tryNo = $scope.result ? $scope.result.tryNo+1 : 1;
		$scope.result = {
			'time'		: $scope.second,
			'succesNo'	: succesNo,
			'failedNo'	: $scope.equations.length - succesNo,
			'tryNo'		: tryNo
		};		
		$location.path('/excercises/result');
	};
	$scope.$on('$viewContentLoading', function(event, viewConfig) { 
		if (viewConfig.view.name != "excercises.do" && viewConfig.view.name != "excercises.all") {
			resetTimer();
		}
	});
	$scope.prev = function() {
		//$("#selectedEqCopy").append($("#selectedEq div:first").clone(false));
		doAnimation('#selectedEq', 'fadeInLeft');
		//doAnimation('#selectedEqCopy', 'rotateOutDownLeft', function() {$("#selectedEqCopy").empty();});
		$scope.eq = $scope.equations[$scope.eq.itemIndex-1];
		focusTopInput();
	};
	$scope.next = function() {
		//$("#selectedEqCopy").append($("#selectedEq div:first").clone(false));
		doAnimation('#selectedEq', 'fadeInRight');
		//doAnimation('#selectedEqCopy', 'rotateOutUpLeft', function() {$("#selectedEqCopy").empty();});
		$scope.eq = $scope.equations[$scope.eq.itemIndex+1];
		focusTopInput();
	};
	$scope.focus = function(idx) {
		$scope.eq = $scope.equations[idx];
	};
	$scope.settingsAccordion = function($event) {
		console.log($event);
		return false;
	};
	console.log($state.current);
	console.log($location.path());
	loadSettings();
	$scope.initialize();
	if ("/excercises/all" == $location.path() || "/excercises/do" == $location.path() || "/excercises/result" == $location.path()) {
		$location.path("/excercises");
	};
});

mathApp.controller('LanguageController', function ($scope, $translate, LanguageService) {
        $scope.changeLanguage = function (languageKey) {
            $translate.use(languageKey);

            LanguageService.getBy(languageKey).then(function(languages) {
                $scope.languages = languages;
            });
        };

        LanguageService.getBy().then(function (languages) {
            $scope.languages = languages;
        });
    });

mathApp.controller('MenuController', function ($scope) {
    });

	
var DefaultSettings = {
	'addition' : {
		'min': 10,
		'max': 20,
		'no': 2
	},
	'substraction' : {
		'min': 10,
		'max': 20,
		'no': 2
	},
	'multiply' : {
		'min': 1,
		'max': 10,
		'no': 2
	},
	'division' : {
		'min': 1,
		'max': 10,
		'no': 2
	},
	'clock' : {
		'no': 2,
		'tolerance' : 2
	},
	'showAll' : false, 
	'timeInSec': 120
};
	
var ExcerciseDefs = {
	'addition' : {
		'create': function(configuration) {
			var r = ExcerciseUtil.rnd(configuration.max, configuration.min);
			var a = ExcerciseUtil.rnd(r);
			var vals = [a, r-a, r];
			var idx = ExcerciseUtil.rnd(2);
			vals[idx] = null;
			return {
				'values': vals,
				'idx': idx,
				'sign': '+'				
			};
		},
		'template': 'equation',
		'validate': function(excercise) {
			return excercise.values[excercise.idx] != undefined && (excercise.values[0] + excercise.values[1] == excercise.values[2]);
		}
	},
	'substraction' : {
		'create': function(config) {
			var r = ExcerciseUtil.rnd(config.max, config.min);
			var a = ExcerciseUtil.rnd(r);
			var vals = [r, a, r-a];
			var idx = ExcerciseUtil.rnd(2);
			vals[idx] = null;
			return {
				'values': vals,
				'idx': idx,
				'sign': '-'				
			};
		},
		'template': 'equation',
		'validate': function(excercise) {
			return excercise.values[excercise.idx] != undefined && (excercise.values[0] - excercise.values[1] == excercise.values[2]);
		}
	},
	'multiply' : {
		'create': function(config) {
			var a = ExcerciseUtil.rnd(config.max, config.min);
			var b = ExcerciseUtil.rnd(config.max, config.min);
			var vals = [a, b, a*b];
			var idx = ExcerciseUtil.rnd(2);
			vals[idx] = null;
			return {
				'values': vals,
				'idx': idx,
				'sign': '*'				
			};
		},
		'template': 'equation',
		'validate': function(excercise) {
			return excercise.values[excercise.idx] != undefined && (excercise.values[0] * excercise.values[1] == excercise.values[2]);
		}
	},
	'division' : {
		'create': function(config) {
			var a = ExcerciseUtil.rnd(config.max, config.min);
			var b = ExcerciseUtil.rnd(config.max, config.min);
			var vals = [a*b, a, b];
			var idx = ExcerciseUtil.rnd(2);
			vals[idx] = null;
			return {
				'values': vals,
				'idx': idx,
				'sign': '/'				
			};
		},
		'template': 'equation',
		'validate': function(excercise) {
			return excercise.values[excercise.idx] != undefined && (excercise.values[0] / excercise.values[1] == excercise.values[2]);
		}
	},
	'clock' : {
		'create': function(config) {
			var hour = ExcerciseUtil.rnd(12);
			var minute = ExcerciseUtil.rnd(60);
			return {
				'hour': hour,
				'minute': minute,
				'tolerance': config.tolerance,
				'inputHour': null,
				'inputMinute': null
			};
		},
		'template': 'clock',
		'validate': function(excercise) {
			if (excercise.inputHour == undefined || excercise.inputMinute == undefined) {
				return false;
			}
			var maxDiff = excercise.tolerance || 0;
			var actual = (excercise.hour * 60) + excercise.minute;
			return Math.abs(actual - (excercise.inputHour * 60) - excercise.inputMinute) <= maxDiff;
		} 
	}
};

var ExcerciseUtil = {
	rnd : function(max, min) {
		if (!min) {
			min = 0;
		}
		return min + Math.floor((Math.random() * (max-min)));
	},
	create: function(excercises, excerciseName, config) {
		var length = excercises.length;
		var exDef = ExcerciseDefs[excerciseName];
		for (var i=0; i<config.no; i++) {
			var exc = exDef.create(config);
			exc.resultIcon = '';
			exc.itemIndex = length + i;
			exc.excerciseName = excerciseName;
			exc.template = exDef.template;
			excercises.push(exc);
		}		
	},
	validate: function(excercises) {
		var succesNo = 0;
		for (var i=0; i < excercises.length; i++) {
			var eq = excercises[i];
			var exDef = ExcerciseDefs[eq.excerciseName];
			if (exDef.validate(eq)) {
				eq.resultIcon = "glyphicon glyphicon-ok success";
				eq.resultClass = "has-success";
				succesNo++;
			} else {
				eq.resultIcon = "glyphicon glyphicon-remove error";
				eq.resultClass = "has-error";
			}
		}
		return succesNo;
	}
};

