var practiceApp = angular.module('practiceApp', ['ngAnimate', 'pascalprecht.translate']);

practiceApp.config(function ($translateProvider) {
	// Initialize angular-translate
	$translateProvider.useStaticFilesLoader({
		prefix: 'i18n/locale-',
		suffix: '.json'
	});
	$translateProvider.preferredLanguage('hu');
	$translateProvider.useSanitizeValueStrategy('escaped');
});

practiceApp.factory('TemplateService', function ($http) {
	var cache = {};
    var getTemplate = function (content) {
		if (!cache[content]) {
			cache[content] = $http.get('templates/' + content + '.html');
			console.log("load " + content);
		}
        return cache[content];
    };

    return {
        getTemplate: getTemplate
    };
});

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
				'inputHour': '',
				'inputMinute': ''
			};
		},
		'template': 'clock',
		'validate': function(excercise) {
			return excercise.inputHour == excercise.hour && excercise.inputMinute == excercise.minute;
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

var timer;

practiceApp.controller('OperationsCtrl', function ($scope, $interval, $compile) {
	var focusTopInput = function() {
		setTimeout(function(){ $("#selectedEq input:enabled").first().focus(); }, 300);
	};
	$scope.checked=false;
	$scope.settings = {
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
			'no': 2
		},
		'timeInSec': 120
	};
	$scope.reset = function() {
		$scope.running = true;
		$scope.checked = true;
		var settings = $scope.settings;
		$scope.second = settings.timeInSec;
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
		$scope.startTimer();
		focusTopInput();
	};
	$scope.getSign = function(operationName) {
		var op = operations[operationName];
		return op ? op.sign : undefined;
	};
	//Timer
	$scope.startTimer = function() {
		if ($scope.second > 0) {
			timer = $interval(function() {
				$scope.second = $scope.second-1;
				if ($scope.second == 0) {
					$scope.finish();
				}
			}, 1000);
		}
	};
	$scope.initialize = function() {
		$scope.running = false;
	};	
	$scope.finish = function() {
		if (timer) {
			$interval.cancel(timer);
			timer == undefined;
		}
		var succesNo = ExcerciseUtil.validate($scope.equations);
		var tryNo = $scope.result ? $scope.result.tryNo+1 : 1;
		$scope.result = {
			'time'		: $scope.second,
			'succesNo'	: succesNo,
			'failedNo'	: $scope.equations.length - succesNo,
			'tryNo'		: tryNo
		};
		$('#resultModal').modal('show');
	};
	$scope.prev = function() {
		$scope.eq = $scope.equations[$scope.eq.itemIndex-1];
		focusTopInput();
	};
	$scope.next = function() {
		$scope.eq = $scope.equations[$scope.eq.itemIndex+1];
		focusTopInput();
	};
	$scope.focus = function(idx) {
		$scope.eq = $scope.equations[idx];
	};
	$scope.submit = function() {
		console.log("submit");
	};
	
	$scope.initialize();
})
.directive('excercise', function($compile, TemplateService){
	var getTemplate = function(eq) {
	};
	return {
		restrict: "E",
		require: 'ngModel',
		link: function($scope, element, attrs, modelCtrl) {
			$scope.$watch(attrs['ngModel'], function (value) {
				$scope.actExcercise = value;
				if (value) {
					TemplateService.getTemplate(value.template).then(function (response) {
						element.html(response.data);
						$compile(element.contents())($scope);
					});		
				}
			});
		}
	};
})
.directive('clock', function(){
	return {
		link: function($scope, element, attrs, modelCtrl) {
			ClockUtil.drawClock(element.get(0), $scope.actExcercise);
		}
	};
})
.directive('numbersOnly', function(){
	return {
		require: 'ngModel',
		link: function(scope, element, attrs, modelCtrl) {
			modelCtrl.$parsers.push(function (inputValue) {
				if (inputValue == undefined) {
					return undefined;
				}
				var transformedInputStr = inputValue.toString().replace(/[^0-9]/g, ''); 
				var transformedInput = transformedInputStr.length > 0 ? Number(transformedInputStr) : undefined;
				if (transformedInputStr != inputValue) {
					modelCtrl.$setViewValue(transformedInput);
					modelCtrl.$render();
				}         
				return transformedInput;         
			});
		}
	};
})
;


var ClockUtil = {	
	drawClock: function(canvas, attrs) {
		var radius = canvas.height / 2;
		if (!canvas._drawContext) {
			canvas._drawContext = canvas.getContext("2d");
			canvas._drawContext.translate(radius, radius);
		}
		radius = radius * 0.90;
		ClockUtil.drawFace(canvas._drawContext, radius);
		ClockUtil.drawNumbers(canvas._drawContext, radius);
		ClockUtil.drawTime(canvas._drawContext, radius, attrs);
	},

	drawFace: function(ctx, radius) {
		var grad;
		ctx.beginPath();
		ctx.arc(0, 0, radius, 0, 2*Math.PI);
		ctx.fillStyle = 'white';
		ctx.fill();
		grad = ctx.createRadialGradient(0,0,radius*0.95, 0,0,radius*1.05);
		grad.addColorStop(0, '#333');
		grad.addColorStop(0.5, 'white');
		grad.addColorStop(1, '#333');
		ctx.strokeStyle = grad;
		ctx.lineWidth = radius*0.1;
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(0, 0, radius*0.1, 0, 2*Math.PI);
		ctx.fillStyle = '#333';
		ctx.fill();
	},

	drawNumbers: function(ctx, radius) {
		var ang;
		var num;
		ctx.font = radius*0.15 + "px arial";
		ctx.textBaseline="middle";
		ctx.textAlign="center";
		for(num = 1; num < 13; num++){
			ang = num * Math.PI / 6;
			ctx.rotate(ang);
			ctx.translate(0, -radius*0.85);
			ctx.rotate(-ang);
			ctx.fillText(num.toString(), 0, 0);
			ctx.rotate(ang);
			ctx.translate(0, radius*0.85);
			ctx.rotate(-ang);
		}
	},

	drawTime: function(ctx, radius, attrs){
		//var now = new Date();
		var hour = attrs.hour;
		var minute = attrs.minute;
		var second = 0;
		//hour
		hour=hour%12;
		hour=(hour*Math.PI/6)+
		(minute*Math.PI/(6*60))+
		(second*Math.PI/(360*60));
		ClockUtil.drawHand(ctx, hour, radius*0.5, radius*0.05);
		//minute
		minute=(minute*Math.PI/30)+(second*Math.PI/(30*60));
		ClockUtil.drawHand(ctx, minute, radius*0.7, radius*0.03);
		// second
		// second=(second*Math.PI/30);
		// drawHand(ctx, second, radius*0.8, radius*0.015);
	},

	drawHand: function(ctx, pos, length, width) {
		ctx.beginPath();
		ctx.lineWidth = width;
		ctx.lineCap = "round";
		ctx.moveTo(0,0);
		ctx.rotate(pos);
		ctx.lineTo(0, -length);
		ctx.stroke();
		ctx.rotate(-pos);
	}
};
