'use strict';

angular.module('mathApp')
	.directive('excercise', function($compile, TemplateService){
		var getTemplate = function(eq) {
		};
		return {
			restrict: "E",
			require: 'ngModel',
			link: function($scope, element, attrs, modelCtrl) {
				var onModelChanged = function(value) {
					$scope.actExcercise = value;
					if (value) {
						TemplateService.getTemplate(value.template).then(function (response) {
							element.html(response.data);
							$compile(element.contents())($scope);
						});		
					}
				};
				
				$scope.$watch(attrs['ngModel'], function (value) {
					onModelChanged(value);
					//doAnimation('#selectedEq', 'rotateInDownLeft', function() {
					//	onModelChanged(value);
					//});
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
	.directive('mathTest', function($timeout){
		return {
			restrict:'A',
			link: function($scope, element) {
				$timeout(function(){
					if (useMathJax && MathJax) {
						MathJax.Hub.Queue(["Typeset", MathJax.Hub, element.get(0)]);
					}
				},0)
			}
		};
	})
	/*
	.directive('ngDownloadData', function($timeout){
		return {
			restrict:'A',
			scope:{ getUrlData:'&ngDownloadData'},
			link:function (scope, element, attrs) {
				var url = URL.createObjectURL(scope.getUrlData());
				element.attr("href", url);
			}
		};
	})
	*/
	.directive('ngConfirmClick', function($parse, $modal){
		return {
			priority: -1,
			restrict: 'A',
			compile: function($element, attr) {
				var fn = $parse(attr.ngConfirmClick, null, true);
					return function ngEventHandler(scope, element) {
						element.on("click", function(event) {
							var $this = $(this);
							$modal.open({
								animation: true,
								templateUrl: 'confirmContent.html',
								controller: 'ModalConfirmController',
								resolve: {
									confirmConfig : function() {
										return {
											onSuccess: function() { fn(scope, {$event:event}); },
											title: $this.attr("confirm-title"),
											body: $this.attr("confirm-body")
										};
									}
								}								
							});								
						});
					};
				}
			}
		}
	)	
	;

//Clock draw script:
//http://www.w3schools.com/canvas/canvas_clock_start.asp
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
