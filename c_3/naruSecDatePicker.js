/**
 * Created by ejlee on 2016. 10. 14..
 */


function NaruDateTimePicker(selector, options) {
	this.$selector = null;
	this.selectorSt = null;
	this.selectorEd = null;
	this.options = null;

	this.message = {
		"ko": {
			"stTitle": "시작일",
			"edTitle": "종료일",
			"okBtn": "확인",
			"closeBtn": "닫기",
			"maxMessage": function(date) {
				return "최대 설정 범위는 "+date+"일 입니다.";
			},
			"notAvailableMessage": "이후로 설정하실 수 없습니다."
		},
		"en": {
			"stTitle": "Start date",
			"edTitle": "End date",
			"okBtn": "ok",
			"closeBtn": "close",
			"maxMessage": function(date) {
				return "Max Range "+date+"day(s)";
			},
			"notAvailableMessage": "after that is not avaliable."
		}
	};

	this._initOptions(options);
	this._init(selector);

	var objThis = this;
	return {
		initDate: function() {
			return objThis.initDate.apply(objThis, arguments);
		},
		setDate: function() {
			return objThis.setDate.apply(objThis, arguments);
		},
		getDate: function() {
			return objThis.getDate.apply(objThis, arguments);
		},
		getTime: function() {
			return objThis.getTime.apply(objThis, arguments);
		},
		changeStDateByEd:function() {
			return objThis.changeStDateByEd.apply(objThis, arguments);
		},
		clearDate: function() {
			return objThis.clearDate.apply(objThis);
		}
	};
}

NaruDateTimePicker.debug = false;

NaruDateTimePicker.defaultOptions = {
	locale: "ko",
	inputSt: null, //id
	inputEd: null, //id,
	inlineFlag: false,
	originPattern: "YYYYMMDDHHmm",
	selectorPattern: "YYYY-MM-DD HH:mm",
	minRange: 0, //단위 m (최소시간차이)
	maxRange: null, //단위 m
	maxDate: null,//"today" or moment(maxDate); 년월일까지
	tooltip: null,//bootstrap tooltip
	hideEvent: null //달력 hide후 이벤트
};

(function() {
	this._init = function(selector) {
		if(!selector) return;
		this.$selector = $(selector);
		if(!this.$selector[0]) return;

		this._initDraw();
		this._initEvent();
		this._initValue();
	},

	this._initOptions = function(options) {
		this.options = $.extend({}, NaruDateTimePicker.defaultOptions, options);

		if(!$("#"+this.options.inputSt)[0]) {
			console.error("invalid inputSt id");
			return;
		}
		if(!$("#"+this.options.inputEd)[0]) {
			console.error("invalid inputEd id");
			return;
		}

		this.selectorSt = this.options.inputSt+"Time";
		this.selectorEd = this.options.inputEd+"Time";
	},

	this._initDraw = function() {
		//set id
		var inputSt = this.options.inputSt;
		var inputEd = this.options.inputEd;

		var $inputSt = this.$selector.find("#" + inputSt);
		var $inputEd = this.$selector.find("#" + inputEd);
		$inputSt.addClass("naru-calendar-input");
		$inputEd.addClass("naru-calendar-input");

		var calWrapperSt = $("<div class='input-group naru-calendar-wrapper'></div>");
		var calWrapperEd = $("<div class='input-group naru-calendar-wrapper'></div>");
		calWrapperSt.attr("id", this.selectorSt);
		calWrapperEd.attr("id", this.selectorEd);

		$inputSt.wrap(calWrapperSt);
		$inputEd.wrap(calWrapperEd);

		var calWrapper = this.$selector.find(".naru-calendar-wrapper");
		calWrapper.each(function() {
			var spanIcon = $("<span class='input-group-addon naru-calendar-icon'></span>");
			spanIcon.append("<span class='glyphicon glyphicon-calendar'></span>");
			$(this).append(spanIcon);
		});

		this.createPicker();

		var selectorSt = this.selectorSt;
		var selectorEd = this.selectorEd;
		var $stDateTimePicker = this._getDateTimePicker(selectorSt);
		var $edDateTimePicker = this._getDateTimePicker(selectorEd);

		$("#"+ inputSt).on("click", function() {
			$stDateTimePicker.toggle();
		});

		$("#"+ inputEd).on("click", function() {
			$edDateTimePicker.toggle();
		});
	},

	this._initEvent = function() {
		var selectorSt = this.selectorSt;
		var selectorEd = this.selectorEd;
		var $selectorSt = $("#" + selectorSt);
		var $selectorEd = $("#" + selectorEd);

		var selectorPattern = this.options.selectorPattern;
		var $stDateTimePicker = this._getDateTimePicker(selectorSt);
		var $edDateTimePicker = this._getDateTimePicker(selectorEd);
		var hideEvent = this.options.hideEvent;


		var objThis = this;
		$selectorSt.on('dp.error', function (e) {
			if(NaruDateTimePicker.debug) console.error("st dp error invalid date: " + moment(e.date).format());
		});

		$selectorEd.on('dp.error', function (e) {
			if(NaruDateTimePicker.debug) console.error("ed dp error invalid date: " + moment(e.date).format());
		});

		$selectorSt.on('dp.change', function (e) {
//			console.log("st", e.date)
			if(moment(e.date, selectorPattern).isValid()) {
				$edDateTimePicker.minDate(moment(e.date).format(selectorPattern));

//				if(objThis.constructor === NaruDateTimePicker) {
//					objThis._checkRange();
//				}

			}
		});

		$selectorEd.on('dp.change', function (e) {
//			console.log("ed", e.date)
			if(moment(e.date, selectorPattern).isValid()) {
				if(selectorPattern === "YYYY-MM-DD") {
					$stDateTimePicker.maxDate(moment(e.date).hours(23).minutes(59).seconds(59));
				} else{
					$stDateTimePicker.maxDate(e.date);
				}

//				if(objThis.constructor === NaruDateTimePicker) {
//					objThis._checkRange();
//				}
//
			}
		});

		if(objThis.constructor === NaruDateTimePicker) {
			$selectorSt.on('dp.hide', function(e) {
				objThis._checkRange();

				if(hideEvent !== null && typeof hideEvent === "function") {
					hideEvent();
				}
			});

			$selectorEd.on('dp.hide', function(e) {
				objThis._checkRange();

				if(hideEvent !== null && typeof hideEvent === "function") {
					hideEvent();
				}
			});
		}

	},
	/**
	 * user 입력 or confirm click
	 * @returns {boolean}
	 */
	this._checkRange = function() {
		var check = false;

		var inputSt = this.options.inputSt;
		//var inputEd = this.options.inputEd;
		var $inputSt = $("#" + inputSt);
		//var $inputEd = $("#" + inputEd);

		var maxRange = this.options.maxRange;
		var minRange = this.options.minRange;
		var tooltip = this.options.tooltip;
		//console.log("checkRange........", $inputSt.val(), $inputEd.val(), this.getDiff('m'))

		if(this.getDiff('m') < minRange) {
			check = this.changeStDateByEd(-1 * minRange, "m");
		}


		var locale = this.options.locale;
		if(maxRange != null && this.getDiff('m') > maxRange) {
			console.log(this.message[locale].maxMessage);
			var maxMessage = this.message[locale].maxMessage(maxRange/60/24);
			var placement = tooltip != null && tooltip.hasOwnProperty("placement") ? tooltip["placement"]:"bottom";
			var title = tooltip != null && tooltip.hasOwnProperty("title") ? tooltip["title"]:maxMessage;
			this._showTooltip($inputSt, {"title":title, "placement":placement});

			check = this.changeStDateByEd(-1 * maxRange, "m");
		}

		return check;

	},

	this.createPicker = function() {
		var selectorSt = this.selectorSt;
		var selectorEd = this.selectorEd;
		var $selectorSt = $("#" + selectorSt);
		var $selectorEd = $("#" + selectorEd);
		var locale = this.options.locale;
		var selectorPattern = this.options.selectorPattern;
		var inlineFlag = this.constructor === NaruDateTimePicker ? false:true;//this.options.inlineFlag

		$selectorSt.datetimepicker({
			locale: locale,
			format: selectorPattern,
			useCurrent: false,
			inline: inlineFlag
		});

		$selectorEd.datetimepicker({
			locale: locale,
			format: selectorPattern,
			useCurrent: false,
			inline: inlineFlag
		});

	},

	this._initValue = function() {
		var inputSt = this.options.inputSt;
		var inputEd = this.options.inputEd;
		var originPattern = this.options.originPattern;

		var $inputSt = $("#" + inputSt);
		var $inputEd = $("#" + inputEd);
		var stValue = $inputSt.val();
		var edValue = $inputEd.val();

		var selectorSt = this.selectorSt;
		var selectorEd = this.selectorEd;
		var $stDateTimePicker = this._getDateTimePicker(selectorSt);
		var $edDateTimePicker = this._getDateTimePicker(selectorEd);

		if(NaruDateTimePicker.debug) console.log("_initValue user first" , stValue,  edValue);

		var stMoment = null;
		if(stValue != undefined && stValue != "" && moment(stValue, originPattern).isValid()) {
			stMoment = moment(stValue, originPattern);
		} else{
			$stDateTimePicker.clear();
			stMoment = $stDateTimePicker.date();
		}

		var edMoment = null;
		if(edValue != undefined && edValue != "" && moment(edValue, originPattern).isValid()) {
			edMoment = moment(edValue, originPattern);
		} else{
			$edDateTimePicker.clear();
			edMoment = $edDateTimePicker.date();
		}

		this.checkValidation(stMoment, edMoment);

	},

	/**
	 * input value -> set datetimepicker date
	 * @private
	 */
	this.setDate = function() {
		var inputSt = this.options.inputSt;
		var inputEd = this.options.inputEd;
		var selectorPattern = this.options.selectorPattern;

		var selectorSt = this.selectorSt;
		var selectorEd = this.selectorEd;
		var $stDateTimePicker = this._getDateTimePicker(selectorSt);
		var $edDateTimePicker = this._getDateTimePicker(selectorEd);

		var $inputSt = $("#" + inputSt);
		var $inputEd = $("#" + inputEd);
		var stValue = $inputSt.val();
		var edValue = $inputEd.val();

		if(NaruDateTimePicker.debug) console.log("setDate user first" , stValue, edValue);

		var stMoment = null;
		if(stValue != undefined && stValue != "" && moment(stValue, selectorPattern).isValid()) {
			stMoment = moment(stValue, selectorPattern);
		} else{
			$stDateTimePicker.clear();
		}

		var edMoment = null;
		if(edValue != undefined && edValue != "" && moment(edValue, selectorPattern).isValid()) {
			edMoment = moment(edValue, selectorPattern);
		} else{
			$edDateTimePicker.clear();
		}

		//console.log("--after --", stMoment.format(selectorPattern), edMoment.format(selectorPattern));

		this.checkValidation(stMoment, edMoment);

	},

	/**
	 * minDate, maxDate check
	 * @param stMoment
	 * @param edMoment
	 * @private
	 */
	this.checkValidationB = function(stMoment, edMoment) {
		var inputSt = this.options.inputSt;
		var inputEd = this.options.inputEd;
		var maxDate = this.options.maxDate;
		var originPattern = this.options.originPattern;
		var selectorPattern = this.options.selectorPattern;

		var selectorSt = this.selectorSt;
		var selectorEd = this.selectorEd;
		var $stDateTimePicker = this._getDateTimePicker(selectorSt);
		var $edDateTimePicker = this._getDateTimePicker(selectorEd);

		var $inputSt = $("#" + inputSt);
		var $inputEd = $("#" + inputEd);

		var maxDateMoment = null;
		if(maxDate === "today") {
			maxDateMoment = moment();
		} else if(maxDate && moment(maxDate, originPattern).isValid()) {
			maxDateMoment = moment(maxDate, originPattern);
		}

		if(stMoment !== null && edMoment !== null) {
			if(stMoment.diff(edMoment) > 0) {
				if(NaruDateTimePicker.debug) console.log("_initValue st > ed", stMoment.format(selectorPattern), edMoment.format(selectorPattern));
				edMoment = stMoment;
			}
		}

		$edDateTimePicker.minDate(false);
		$edDateTimePicker.maxDate(false);
		$stDateTimePicker.minDate(false);
		$stDateTimePicker.maxDate(false);

		if(maxDate && maxDateMoment.isValid()) {
			maxDateMoment.hours(23).minutes(59).seconds(59);

			var placement = "bottom";
			var notAvailableMessage = this.message[locale].notAvailableMessage;
			if(edMoment != null && edMoment.diff(maxDateMoment) > 0) {
				edMoment = maxDateMoment;
				var title = edMoment.format(selectorPattern) + notAvailableMessage;
				this._showTooltip($inputEd, {"title":title, "placement":placement});
				if(NaruDateTimePicker.debug) console.log("check user maxdate > ed", edMoment.format())
			}
			if(stMoment != null && stMoment.diff(maxDateMoment) > 0) {
				stMoment = maxDateMoment;
				var title = stMoment.format(selectorPattern) + notAvailableMessage;
				this._showTooltip($inputSt, {"title":title, "placement":placement});
				if(NaruDateTimePicker.debug) console.log("check user maxdate > st", stMoment.format());
			}

			$edDateTimePicker.maxDate(maxDateMoment);
			$stDateTimePicker.maxDate(maxDateMoment);

		} else{
			if(edMoment != null) $stDateTimePicker.maxDate(edMoment);
		}
		if(stMoment != null) $edDateTimePicker.minDate(stMoment);

		var changeSt = null;
		if(stMoment != null) {
			changeSt = stMoment.format(selectorPattern);
			$inputSt.val(changeSt);
		} else{
			changeSt = moment().format(selectorPattern);
		}

		$stDateTimePicker.date(changeSt);

		$stDateTimePicker.viewDate(changeSt);
		$stDateTimePicker.locale($stDateTimePicker.locale());

		var changeEd = null;
		if(edMoment != null) {
			changeEd = edMoment.format(selectorPattern);
			$inputEd.val(changeEd);
		} else{
			changeEd = moment().format(selectorPattern);
		}

		$edDateTimePicker.date(changeEd);
		$edDateTimePicker.viewDate(changeEd);
		$edDateTimePicker.locale($edDateTimePicker.locale());

		if(stMoment == null) $stDateTimePicker.clear();
		if(edMoment == null) $edDateTimePicker.clear();
	},

	this.checkValidation = function(stMoment, edMoment) {
		var inputSt = this.options.inputSt;
		var inputEd = this.options.inputEd;
		var maxDate = this.options.maxDate;
		var originPattern = this.options.originPattern;
		var selectorPattern = this.options.selectorPattern;

		var selectorSt = this.selectorSt;
		var selectorEd = this.selectorEd;
		var $stDateTimePicker = this._getDateTimePicker(selectorSt);
		var $edDateTimePicker = this._getDateTimePicker(selectorEd);
		var locale = this.options.locale;

		var $inputSt = $("#" + inputSt);
		var $inputEd = $("#" + inputEd);

		if(stMoment !== null && edMoment !== null) {
			$edDateTimePicker.minDate(false);
			$edDateTimePicker.maxDate(false);
			$stDateTimePicker.minDate(false);
			$stDateTimePicker.maxDate(false);

			if(stMoment.diff(edMoment) > 0) {
				if(NaruDateTimePicker.debug) console.log("_initValue st > ed", stMoment.format(selectorPattern), edMoment.format(selectorPattern));
				edMoment = stMoment;
			}

			var maxDateMoment = edMoment;
			if(maxDate === "today") {
				maxDateMoment = moment();
			}

			if(maxDate && moment(maxDate, originPattern).isValid()) {
				maxDateMoment = moment(maxDate, originPattern);

				maxDateMoment.hours(23).minutes(59).seconds(59);

				var placement = "bottom";
				if(edMoment != null && edMoment.diff(maxDateMoment) > 0) {
					edMoment = maxDateMoment;
					var title = edMoment.format(selectorPattern) +" 이후로 설정하실 수 없습니다.";
					this._showTooltip($inputEd, {"title":title, "placement":placement});
					if(NaruDateTimePicker.debug) console.log("check user maxdate > ed", edMoment.format())
				}
				if(stMoment != null && stMoment.diff(maxDateMoment) > 0) {
					stMoment = maxDateMoment;
					var title = stMoment.format(selectorPattern) +" 이후로 설정하실 수 없습니다.";
					this._showTooltip($inputSt, {"title":title, "placement":placement});
					if(NaruDateTimePicker.debug) console.log("check user maxdate > st", stMoment.format());
				}

				$edDateTimePicker.maxDate(maxDateMoment);
				$stDateTimePicker.maxDate(maxDateMoment);
			}

			$edDateTimePicker.minDate(stMoment);
			var changeSt = stMoment.format(selectorPattern);
			$inputSt.val(changeSt);

			var changeEd = edMoment.format(selectorPattern);
			$inputEd.val(changeEd);

			$stDateTimePicker.date(changeSt);
			$stDateTimePicker.viewDate(changeSt);
			$stDateTimePicker.locale($stDateTimePicker.locale());


			$edDateTimePicker.date(changeEd);
			$edDateTimePicker.viewDate(changeEd);
			$edDateTimePicker.locale($edDateTimePicker.locale());

		}
	},

	this.getAddDate = function(selector, number, type) {
		var selectorPattern = this.options.selectorPattern;

		var resultDate = null;
		var mDate = moment($("#"+selector).data('date'), selectorPattern);

		if(mDate.isValid()) {
			if(selectorPattern === "YYYY-MM-DD") {
				mDate.hours(23).minutes(59).seconds(59);
			}

			var check = mDate.add(number, type).isValid();
			if(check) {
				if(selectorPattern === "YYYY-MM-DD") {
					mDate.add(1, "s")
				}
				resultDate = mDate.format(selectorPattern);
			}
		}
		if(resultDate == null) {
			//console.log("invalid getAddDate");
		}

		return resultDate;
	},

	this.getMoment = function(selector) {
		var selectorPattern = this.options.selectorPattern;

		var mDate = moment($("#"+selector).data('date'), selectorPattern);
		if(!mDate.isValid()) {
			mDate = null;
		}
		if(mDate == null) {
			//console.log("invalid getMoment");
		}

		return mDate;
	},

	/**
	 * get datetimepicker value
	 * @param selectorId
	 * @param pattern
	 * @returns {string}
	 * @private
	 */
	this._getDate = function(selectorId, pattern) {
		var selector = this._getSelector(selectorId);
		var dateTimePicker = this._getDateTimePicker(selector);
		var $objInput = $("#" + selectorId);
		var selectorPattern = this.options.selectorPattern;

		var result = "";
		if(dateTimePicker === undefined) {
			result = "";
			$objInput.val(result);
		} else{
			if(pattern) {
				if(moment(dateTimePicker.date(), pattern).isValid()) {
					result = dateTimePicker.date().format(pattern);
				}
			} else{
				result = dateTimePicker.date().format(selectorPattern);
			}
			$objInput.val(dateTimePicker.date().format(selectorPattern));
		}

		return result;

	},

	/**
	 * get input value
	 * @param selectorId
	 * @param pattern
	 * @returns {string}
	 */
	this.getDate = function(selectorId, pattern) {
		var selectorPattern = this.options.selectorPattern;

		var $objInput = $("#" + selectorId);
		var value = $objInput[0] === undefined ? "":$objInput.val();

		var result = "";
		if(value != "") {
			if(moment(value, selectorPattern).isValid()) {
				result = moment(value, selectorPattern).format(pattern);
			} else{
				result = this._getDate(selectorId, pattern);
			}
		}
		return result;
	},

	this.getTime = function(selectorId) {
		var $objInput = $("#" + selectorId);
		var value = $objInput[0] === undefined ? "":$objInput.val();

		var result = 0;
		if(value != "") {
			var selector = this._getSelector(selectorId);
			var dateTimePicker = this._getDateTimePicker(selector);
			result = dateTimePicker.date().toDate().getTime();
		}
		return result;
	},

	this._getSelector = function(selectorId) {
		var inputSt = this.options.inputSt;
		var inputEd = this.options.inputEd;

		var gSelector = null;
		if(selectorId === inputSt) {
			gSelector = this.selectorSt;
		}
		if(selectorId === inputEd) {
			gSelector = this.selectorEd;
		}

		return gSelector;
	},

	this._getDateTimePicker = function(selector) {
		return $("#"+selector).data("DateTimePicker");
	},

	this.getDiff = function(type) {
		var selectorSt = this.selectorSt;
		var selectorEd = this.selectorEd;
		var $stDateTimePicker = this._getDateTimePicker(selectorSt);
		var $edDateTimePicker = this._getDateTimePicker(selectorEd);

		var selectorPattern = this.options.selectorPattern;
		var dateDiff = 0;
		if(undefined !== $stDateTimePicker && undefined !== $edDateTimePicker) {
			if(selectorPattern === "YYYY-MM-DD") {
				dateDiff = moment($edDateTimePicker.date(), selectorPattern).hours(23).minutes(59).seconds(59)
				- moment($stDateTimePicker.date(), selectorPattern).hours(0).minutes(0).seconds(0);
			} else{
				dateDiff = $edDateTimePicker.date() - $stDateTimePicker.date();
			}
		}

		if(type) {
			switch(type) {
				case 'd': dateDiff = Math.ceil(dateDiff/(1000*60*60*24));
					break;
				case 'h': dateDiff = Math.ceil(dateDiff/(1000*60*60));
					break;
				case 'm': dateDiff = Math.ceil(dateDiff/(1000*60));
					break;
				case 's': dateDiff = Math.ceil(dateDiff/1000);
					break;
				default:
					break;

			}
		}
		return dateDiff;
	},

	this.initDate = function(data) {
		var inputSt = this.options.inputSt;
		var inputEd = this.options.inputEd;
		var $inputSt = $("#" + inputSt);
		var $inputEd = $("#" + inputEd);

		if(data instanceof Object && (data.hasOwnProperty(inputSt) || data.hasOwnProperty(inputEd))) {
			if(data.hasOwnProperty(inputSt)) $inputSt.val(data[inputSt]);
			if(data.hasOwnProperty(inputEd)) $inputEd.val(data[inputEd]);

			this.setDate();
		}

	},

	this.clearDate = function() {
		var inputSt = this.options.inputSt;
		var inputEd = this.options.inputEd;
		var $inputSt = $("#" + inputSt);
		var $inputEd = $("#" + inputEd);

		$inputSt.val('');
		$inputEd.val('');
		this.setDate();
	},

	/**
	 *  종료시간 기준으로 시작시간 변경
	 * @param num
	 * @param type
	 * @returns {boolean}
	 */
	this.changeStDateByEd = function(num, type) {
		var selectorEd = this.selectorEd;
		var inputSt = this.options.inputSt;

		var number = parseInt(num);
		var check = false;
		if(!isNaN(number) && parseInt(number) !== 0) {
			var changeDate = this.getAddDate(selectorEd, number, type);

			if(changeDate != null) {
				$("#"+inputSt).val(changeDate);
				this.setDate();
				check = true;
			}
		}

		return check;
	},

	/**
	 *  시작시간 기준으로 종료시간 변경
	 * @param num
	 * @param type
	 * @returns {boolean}
	 * @private
	this._changeEdDateBySt = function(num, type) {
		var selectorSt = this.selectorSt;
		var inputEd = this.options.inputEd;

		var number = parseInt(num);
		var check = false;
		if(!isNaN(number) && parseInt(number) !== 0) {
			var changeDate = this.getAddDate(selectorSt, number, type);

			if(changeDate != null) {
				$("#"+inputEd).val(changeDate);
				this.setDate();
				check = true;
			}
		}
		return check;
	},
	 */

	this._showTooltip = function($objInput, tooltipOption) {
		if(typeof $objInput.bstooltip !== "function") {
			$objInput.bstooltip = $objInput.tooltip;
		}

		$objInput.bstooltip({
			"title": tooltipOption.title,
			"placement":tooltipOption.placement,
			"trigger":"manual"
		});

		$objInput.bstooltip('show');
		$objInput.on("shown.bs.tooltip", function() {
			setTimeout(function() {
				$objInput.bstooltip('hide');
				$objInput.bstooltip('destroy');
			}, 2000);
		});
	}
}).call(NaruDateTimePicker.prototype);




//range
function NaruDateTimeMultiPicker(selector, options) {
	arguments[1] = $.extend({}, NaruDateTimeMultiPicker.defaultOptions, options);
	return NaruDateTimePicker.apply(this, arguments);
}

var NaruDateTimePickerTemp = function() {};
NaruDateTimePickerTemp.prototype = NaruDateTimePicker.prototype;
NaruDateTimeMultiPicker.prototype = new NaruDateTimePickerTemp();
NaruDateTimeMultiPicker.prototype.constructor = NaruDateTimeMultiPicker;


NaruDateTimeMultiPicker.defaultOptions = {
	locale: "ko",
	inputSt: null, //id
	inputEd: null, //id,
	inlineFlag: true,
	originPattern: "YYYYMMDDHHmm",
	selectorPattern: "YYYY-MM-DD HH:mm",
	minRange: 0, //단위 m (최소시간차이)
	maxRange: null,
	confirmEvent: null
};

NaruDateTimeMultiPicker.prototype._initDraw = function() {
	var inputSt = this.options.inputSt;
	var inputEd = this.options.inputEd;

	var selectorSt = this.selectorSt;
	var selectorEd = this.selectorEd;

	var $inputSt = this.$selector.find("#" + inputSt);
	var $inputEd = this.$selector.find("#" + inputEd);
	$inputSt.addClass("naru-calendar-input");
	$inputEd.addClass("naru-calendar-input");

	var calWrapperSt = $("<div class='input-group naru-calendar-wrapper'></div>");
	var calWrapperEd = $("<div class='input-group naru-calendar-wrapper'></div>");
	$inputSt.wrap(calWrapperSt);
	$inputEd.wrap(calWrapperEd);

	var calWrapper = this.$selector.find(".naru-calendar-wrapper");
	calWrapper.each(function() {
		var spanIcon = $("<span class='input-group-addon naru-calendar-icon'></span>");
		spanIcon.append("<span class='glyphicon glyphicon-calendar'></span>");
		$(this).append(spanIcon);
	});

	var locale = this.options.locale;
	var stTitle = this.message[locale].stTitle;
	var edTitle = this.message[locale].edTitle;
	var okBtn = this.message[locale].okBtn;
	var closeBtn = this.message[locale].closeBtn;

	var $dateLayer = $("<div class='naru-date-layer'></div>");

	var $dateBox1 = $("<div class='naru-date-box'></div>");
	var $dateTitle1 = $("<div class='naru-date-title'></div>");
	$dateTitle1.append(stTitle);
	var $dateContent1 = $("<div class='naru-date-content'></div>");
	var $objDay1 = $("<div></div>");
	$objDay1.attr("id", selectorSt);
	$dateContent1.append($objDay1);
	$dateBox1.append($dateTitle1);
	$dateBox1.append($dateContent1);

	var $dateBox2 = $("<div class='naru-date-box'></div>");
	var $dateTitle2 = $("<div class='naru-date-title'></div>");
	$dateTitle2.append(edTitle);
	var $dateContent2 = $("<div class='naru-date-content'></div>");
	var $objDay2 = $("<div></div>");
	$objDay2.attr("id", selectorEd);
	$dateContent2.append($objDay2);
	$dateBox2.append($dateTitle2);
	$dateBox2.append($dateContent2);

	var $dateBtnLayer = $("<div class='naru-date-btn-layer'></div>");
	var $confirmBtn = $("<span class='btn btn-default naru-date-confirm-btn'>"+okBtn+"</span>");
	var $closeBtn = $("<span class='btn btn-default naru-date-close-btn'>"+closeBtn+"</span>");
	$dateBtnLayer.append($confirmBtn);
	$dateBtnLayer.append($closeBtn);

	$dateLayer.append($dateBox1);
	$dateLayer.append($dateBox2);
	$dateLayer.append($dateBtnLayer);
	this.$selector.append($dateLayer);

	this.createPicker();
};

NaruDateTimeMultiPicker.prototype._initEvent = function() {
	NaruDateTimePicker.prototype._initEvent.call(this);

	var selectorPattern = this.options.selectorPattern;
	var selectorSt = this.selectorSt;
	var selectorEd = this.selectorEd;
	var $stDateTimePicker = this._getDateTimePicker(selectorSt);
	var $edDateTimePicker = this._getDateTimePicker(selectorEd);

	var dateLayerClass = "naru-date-layer";
	var dateLayerSelector = this.$selector.find("."+dateLayerClass);

	var inputSt = this.options.inputSt;
	var inputEd = this.options.inputEd;
	var $inputSt = $('#' + inputSt);
	var $inputEd = $('#' + inputEd);

	//var maxRange = this.options.maxRange;
	//var minRange = this.options.minRange;
	//var tooltip = this.options.tooltip;

	var objThis = this;
	$inputSt.on("keyup", function() {
		if(moment($(this).val(), selectorPattern, true).isValid()) {
			$(this).data({"origin":$(this).val()});
		} else{
			var data = $(this).data();
			if(!data.hasOwnProperty("origin")) {
				$(this).data({"origin":$stDateTimePicker.date().format(selectorPattern)});
			}
		}
	});

	$inputSt.on("focusout", function() {
		//valid
		var data = $(this).data();
		if(data.hasOwnProperty("origin")) {
			$(this).val(data.origin);
			//min,max check
			objThis.checkValidation(moment($(this).val(), selectorPattern), $edDateTimePicker.date());
			//range check
			//checkRange.apply(objThis);

			delete data["origin"];
		}
	});

	$inputEd.on("keyup", function() {
		if(moment($(this).val(), selectorPattern, true).isValid()) {
			$(this).data({"origin":$(this).val()});
		} else{
			var data = $(this).data();
			if(!data.hasOwnProperty("origin")) {
				$(this).data({"origin":$edDateTimePicker.date().format(selectorPattern)});
			}
		}
	});

	$inputEd.on("focusout", function() {
		//valid
		var data = $(this).data();
		if(data.hasOwnProperty("origin")) {
			//min,max check
			objThis.checkValidation($stDateTimePicker.date(), moment($(this).val(), selectorPattern));
			//range check
			//checkRange.apply(objThis);

			delete data["origin"];
		}

	});

	this.$selector.find(".naru-date-confirm-btn").on("click", $.proxy(function(event) {
		event.stopPropagation();
		var confirmEvent = this.options.confirmEvent;

		var stDate = $stDateTimePicker.date();
		var edDate = $edDateTimePicker.date();

		if(stDate != null) {
			$inputSt.val(stDate.format(selectorPattern));
		}

		if(edDate != null) {
			$inputEd.val(edDate.format(selectorPattern));
		}

		//TEST
		var check = this._checkRange();//.apply(this);
		if(!check) this.setDate();

		dateLayerSelector.hide(0, function() {
			$(document).off("click.narusec-date-picker");
		});

		if(confirmEvent !== null && typeof confirmEvent === "function") {
			confirmEvent();
		}
	}, this));

	this.$selector.find(".naru-date-close-btn").on("click", $.proxy(function(event) {
		event.stopPropagation();
		this.setDate();

		dateLayerSelector.hide(0, function() {
			$(document).off("click.narusec-date-picker");
		});
	}, this));

	this.$selector.find(".naru-calendar-icon,.naru-calendar-input").closest(".naru-calendar-wrapper").on("click", function(event) {
		event.stopPropagation();

		var wrapper = $(this);
		dateLayerSelector.appendTo(wrapper);

		var wrapperPos = wrapper.position();
		var content = objThis.$selector;
		var contentRight = content.offset().left + content.width();
		var dateLayerRight = wrapper.offset().left + dateLayerSelector.width();
		var wrapperHeight = wrapper.height();
		var dateLayerPosition = {
			"top": (wrapperPos.top + wrapperHeight)+"px"
		};

		if(dateLayerRight > contentRight) {
			dateLayerPosition.left = "";
			dateLayerPosition.right = "0px";
		} else{
			dateLayerPosition.left = "0px";
			dateLayerPosition.right = "";
		}

		dateLayerDisplay(dateLayerPosition);
	});

	function dateLayerDisplay(dateLayerPosition) {
		dateLayerSelector.css(dateLayerPosition);

		if(dateLayerSelector.is(":visible")) {
			//dateLayerSelector.hide();
		} else{
			$stDateTimePicker.hide();
			$edDateTimePicker.hide();

			var today = moment().format(selectorPattern);
			if($stDateTimePicker.date() === null) $stDateTimePicker.date(today);
			if($edDateTimePicker.date() === null) $edDateTimePicker.date(today);

			$stDateTimePicker.show();
			$edDateTimePicker.show();

			dateLayerSelector.show(0, function() {
				var eventHandler = function(event) {
					if($(event.target).is("."+dateLayerClass, "."+dateLayerClass +" *")) return;
					objThis.setDate();
					dateLayerSelector.hide(0, function() {
						$(document).off("click", eventHandler);
					});
				};
				$(document).on("click", eventHandler);

			});
		}
	}
};

/**
 * 1. 사용자 입력이나 확인버튼을 클릭할때 date값을 설정한다
 *    - 사용자가 값을 입력할 경우 올바르지 않게 입력했을때 마지막으로 올바르게 입력한 값으로 설정된다. 처음부터 입력 문제시 datepicker에 저장된 값으로 사용된다.
 *    - 사용자가 값을 입력할 경우 focusout시 입력한 값이 적용된다.
 * 2. 확인버튼 클릭 안하고 닫기를 누를시에는 input값에 저장된 값으로 date가 설정된다
 * 3. 사용자 입력 moment isValid  3번째 인자 : true 필요
 *
 * * setDate (checkValidation)
 *
 *  NaruDateTimePicker TODO minRange, maxRange
 */
