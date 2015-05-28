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
	loadSettings();
	$scope.initialize();
	if ("/excercises/all" == $location.path() || "/excercises/do" == $location.path() || "/excercises/result" == $location.path()) {
		$location.path("/excercises");
	};
});

mathApp.controller('MaintainController', function ($scope, $interval, $compile, $location, $cookieStore, $state) {
	
	$scope.excercises = [
		{
			//html: "<p>title</p><p><span class=\"math-tex\">\\(x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}\\)</span></p>"
			html: "<p>test1</p>"
		}
	];
	$scope.addNew = function() {
		destroyEditor($scope);
		$("#excercises").append("<div class=\"nnnnnn\" id=\"excercise_" + $scope.excercises.length + "\"></div>");
		startEditor($scope, $scope.excercises.length);
	};
	$scope.cancel = function() {
		destroyEditor($scope, true);
		//addEditor($scope);
	};
	$scope.editItem = function(idx) {
		destroyEditor($scope, true);
		startEditor($scope, idx);
	};
	$scope.deleteItem = function(idx) {
		$scope.excercises.splice(idx,1);
		console.log("delete " + idx);
	};
	$scope.save = function() {
		destroyEditor($scope);
		//addEditor($scope);
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

mathApp.controller('ModalConfirmController', function ($scope, $modalInstance, confirmConfig) {
		$scope.confirmOk = function () {
			$modalInstance.close();
			confirmConfig.onSuccess();
			console.log("confirmOk");
		};
		$scope.confirmConfig = confirmConfig;
		$scope.confirmCancel = function () {
			$modalInstance.dismiss('cancel');
			console.log("confirmCancel");
		};
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

var destroyEditor = function($scope, revert) {
	if ($scope.actckeditor ) {
		var original = $scope.actual;
		var $original = $("#excercise_" + original.idx);
		if (original.idx >= $scope.excercises.length) {
			$original.remove();
		}
		if (!revert || original.idx < $scope.excercises.length) {
			$scope.excercises[original.idx] = {
				html: revert ? original.html : $scope.actckeditor.getData()
			};
			console.log("Saved: " + $scope.excercises[original.idx]);
		}
		
		$scope.actckeditor.destroy();
		$scope.actckeditor = undefined;
		$scope.actual = undefined;
	}
};

var startEditor = function($scope, index) {
	var $target = $("#excercise_" + index);
	if ($target && $target.size() > 0) {		
		$target.find("span.math-tex").each(function() {
			var $this = $(this);
			var $tscript = $this.find("script[type='math/tex']");
			$this.html("\\(" + $tscript.text() + "\\)");
		});
		//$scope.actckeditor = CKEDITOR.replace($target.get(0), {extraPlugins: 'mathjax' });
		$scope.actckeditor = CKEDITOR.replace($target.get(0));
		$scope.actual = {idx: index, html: $target.html()};
	}
};
