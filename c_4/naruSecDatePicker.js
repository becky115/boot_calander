/**
 * Created by ejlee on 2016. 10. 14..
 * update bootstrap 4
 */


function NaruDateTimePicker(selector, options) {
	this.$selector = null;
	this.selectorSt = null;
	this.selectorEd = null;
	this._eventTarget = null;
	this.options = null;

	this.message = {
		"ko": {
			"stTitle": "시작일",
			"edTitle": "종료일",
			"okBtn": "확인",
			"closeBtn": "닫기",
			"maxMessage": function(date) {
				return "최대 설정 범위는 " + date + "일 입니다.";
			},
			"notAvailableMessage": "이후로 설정하실 수 없습니다."
		},
		"en": {
			"stTitle": "Start date",
			"edTitle": "End date",
			"okBtn": "ok",
			"closeBtn": "close",
			"maxMessage": function(date) {
				return "Max Range " + date + "day(s)";
			},
			"notAvailableMessage": "after that is not avaliable."
		}
	};

	this._initOptions(options);
	this._init(selector);

	let objThis = this;
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
		changeStDateByEd: function() {
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
	};

	this._initOptions = function(options) {
		this.options = $.extend({}, NaruDateTimePicker.defaultOptions, options);

		if(!$("#" + this.options.inputSt)[0]) {
			console.error("invalid inputSt id");
			return;
		}
		if(!$("#" + this.options.inputEd)[0]) {
			console.error("invalid inputEd id");
			return;
		}

		this.selectorSt = this.options.inputSt + "Time";
		this.selectorEd = this.options.inputEd + "Time";
	};

	this._initDraw = function() {
		//set id
		let inputSt = this.options.inputSt;
		let inputEd = this.options.inputEd;

		let $inputSt = this.$selector.find("#" + inputSt);
		let $inputEd = this.$selector.find("#" + inputEd);
		$inputSt.addClass("naru-calendar-input");
		$inputEd.addClass("naru-calendar-input");

		let calWrapperSt = $("<div class='input-group naru-calendar-wrapper'></div>");
		let calWrapperEd = $("<div class='input-group naru-calendar-wrapper'></div>");
		calWrapperSt.attr("id", this.selectorSt);
		calWrapperEd.attr("id", this.selectorEd);

		$inputSt.wrap(calWrapperSt);
		$inputEd.wrap(calWrapperEd);

		let calWrapper = this.$selector.find(".naru-calendar-wrapper");
		calWrapper.each(function() {
			//bootstrap4
			let spanIcon = $("<span class='input-group-addon input-group-append naru-calendar-icon'></span>");
			spanIcon.append("<span class='input-group-text glyphicon glyphicon-calendar'></span>");
			$(this).append(spanIcon);
		});

		this.createPicker();

		let selectorSt = this.selectorSt;
		let selectorEd = this.selectorEd;
		let $stDateTimePicker = this._getDateTimePicker(selectorSt);
		let $edDateTimePicker = this._getDateTimePicker(selectorEd);

		$("#" + inputSt).on("click", function() {
			$stDateTimePicker.toggle();
		});

		$("#" + inputEd).on("click", function() {
			$edDateTimePicker.toggle();
		});
	};

	this._initEvent = function() {
		let selectorSt = this.selectorSt;
		let selectorEd = this.selectorEd;
		let $selectorSt = $("#" + selectorSt);
		let $selectorEd = $("#" + selectorEd);

		let selectorPattern = this.options.selectorPattern;
		let $stDateTimePicker = this._getDateTimePicker(selectorSt);
		let $edDateTimePicker = this._getDateTimePicker(selectorEd);
		let hideEvent = this.options.hideEvent;


		let objThis = this;
		$selectorSt.on('dp.error', function (e) {
			if(NaruDateTimePicker.debug) console.error("st dp error invalid date: " + moment(e.date).format());
		});

		$selectorEd.on('dp.error', function (e) {
			if(NaruDateTimePicker.debug) console.error("ed dp error invalid date: " + moment(e.date).format());
		});

		$selectorSt.on('dp.change', function (e) {
			if(moment(e.date, selectorPattern).isValid()) {
				objThis._eventTarget = e.target.id;
				$edDateTimePicker.minDate(e.date);

//				if(objThis.constructor === NaruDateTimePicker) {
//					objThis._checkRange();
//				}

			}
		});

		$selectorEd.on('dp.change', function (e) {
			if(moment(e.date, selectorPattern).isValid()) {
				objThis._eventTarget = e.target.id;
				if(selectorPattern === "YYYY-MM-DD") {
					$stDateTimePicker.maxDate(moment(e.date).hours(23).minutes(59).seconds(59));
				} else {
					$stDateTimePicker.maxDate(e.date);
				}

//				if(objThis.constructor === NaruDateTimePicker) {
//					objThis._checkRange();
//				}
//
			}
		});

		if(objThis.constructor === NaruDateTimePicker) {
			$selectorSt.on('dp.hide', function() {
				objThis._checkRange();

				if(hideEvent !== null && typeof hideEvent === "function") {
					hideEvent();
				}
			});

			$selectorEd.on('dp.hide', function() {
				objThis._checkRange();

				if(hideEvent !== null && typeof hideEvent === "function") {
					hideEvent();
				}
			});
		}

	};

	/**
	 * user 입력 or confirm click
	 * @returns {boolean}
	 */
	this._checkRange = function() {
		let check = false;
		let selectorSt = this.selectorSt;
		let selectorEd = this.selectorEd;
		let eventTarget = this._eventTarget;

		let inputSt = this.options.inputSt;
		let inputEd = this.options.inputEd;
		let $inputSt = $("#" + inputSt);
		let $inputEd = $("#" + inputEd);
		let maxRange = this.options.maxRange;
		let minRange = this.options.minRange;
		let tooltip = this.options.tooltip;
		let locale = this.options.locale;
		//console.log("checkRange........", $inputSt.val(), $inputEd.val(), this.getDiff('m'))

		//check min range
		if(this.getDiff('m') < minRange) {
			if(!eventTarget || eventTarget === selectorEd) {
				check = this.changeStDateByEd(-1 * minRange, "m");
			} else if(eventTarget === selectorSt) {
				check = this._changeEdDateBySt(minRange, "m");
			}
		}

		//check max range
		if(maxRange != null && this.getDiff('m') > maxRange) {
			let maxMessage = this.message[locale].maxMessage(maxRange/60/24);
			let placement = tooltip != null && tooltip.hasOwnProperty("placement") ? tooltip["placement"]:"bottom";
			let title = tooltip != null && tooltip.hasOwnProperty("title") ? tooltip["title"]:maxMessage;

			if(!eventTarget || eventTarget === selectorEd) {
				this._showTooltip($inputSt, {"title":title, "placement":placement});
				check = this.changeStDateByEd(-1 * maxRange, "m");
			} else if(eventTarget === selectorSt) {
				this._showTooltip($inputEd, {"title":title, "placement":placement});
				check = this._changeEdDateBySt(maxRange, "m");
			}

		}

		return check;

	};

	this.createPicker = function() {
		let selectorSt = this.selectorSt;
		let selectorEd = this.selectorEd;
		let $selectorSt = $("#" + selectorSt);
		let $selectorEd = $("#" + selectorEd);
		let locale = this.options.locale;
		let selectorPattern = this.options.selectorPattern;
		let inlineFlag = !(this.constructor === NaruDateTimePicker);//this.options.inlineFlag

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

	};

	this._initValue = function() {
		let inputSt = this.options.inputSt;
		let inputEd = this.options.inputEd;
		let originPattern = this.options.originPattern;

		let $inputSt = $("#" + inputSt);
		let $inputEd = $("#" + inputEd);
		let stValue = $inputSt.val();
		let edValue = $inputEd.val();

		let selectorSt = this.selectorSt;
		let selectorEd = this.selectorEd;
		let $stDateTimePicker = this._getDateTimePicker(selectorSt);
		let $edDateTimePicker = this._getDateTimePicker(selectorEd);

		if(NaruDateTimePicker.debug) console.log("_initValue user first" , stValue,  edValue);

		let stMoment = null;
		if(stValue !== undefined && stValue !== "" && moment(stValue, originPattern).isValid()) {
			stMoment = moment(stValue, originPattern);
		} else {
			$stDateTimePicker.clear();
			stMoment = $stDateTimePicker.date();
		}

		let edMoment = null;
		if(edValue !== undefined && edValue !== "" && moment(edValue, originPattern).isValid()) {
			edMoment = moment(edValue, originPattern);
		} else {
			$edDateTimePicker.clear();
			edMoment = $edDateTimePicker.date();
		}

		this.checkValidation(stMoment, edMoment);

	};

	/**
	 * input value -> set datetimepicker date
	 */
	this.setDate = function() {
		let inputSt = this.options.inputSt;
		let inputEd = this.options.inputEd;
		let selectorPattern = this.options.selectorPattern;

		let selectorSt = this.selectorSt;
		let selectorEd = this.selectorEd;
		let $stDateTimePicker = this._getDateTimePicker(selectorSt);
		let $edDateTimePicker = this._getDateTimePicker(selectorEd);

		let $inputSt = $("#" + inputSt);
		let $inputEd = $("#" + inputEd);
		let stValue = $inputSt.val();
		let edValue = $inputEd.val();

		if(NaruDateTimePicker.debug) console.log("setDate user first" , stValue, edValue);

		let stMoment = null;
		if(stValue !== undefined && stValue !== "" && moment(stValue, selectorPattern).isValid()) {
			stMoment = moment(stValue, selectorPattern);
		} else {
			$stDateTimePicker.clear();
		}

		let edMoment = null;
		if(edValue !== undefined && edValue !== "" && moment(edValue, selectorPattern).isValid()) {
			edMoment = moment(edValue, selectorPattern);
		} else {
			$edDateTimePicker.clear();
		}

		//console.log("--after --", stMoment.format(selectorPattern), edMoment.format(selectorPattern));

		this.checkValidation(stMoment, edMoment);

	};

	this.checkValidation = function(stMoment, edMoment) {
		let inputSt = this.options.inputSt;
		let inputEd = this.options.inputEd;
		let maxDate = this.options.maxDate;
		let originPattern = this.options.originPattern;
		let selectorPattern = this.options.selectorPattern;

		let selectorSt = this.selectorSt;
		let selectorEd = this.selectorEd;
		let $stDateTimePicker = this._getDateTimePicker(selectorSt);
		let $edDateTimePicker = this._getDateTimePicker(selectorEd);

		let $inputSt = $("#" + inputSt);
		let $inputEd = $("#" + inputEd);

		if(stMoment !== null && edMoment !== null) {
			$edDateTimePicker.minDate(false);
			$edDateTimePicker.maxDate(false);
			$stDateTimePicker.minDate(false);
			$stDateTimePicker.maxDate(false);

			if(stMoment.diff(edMoment) > 0) {
				if(NaruDateTimePicker.debug) console.log("_initValue st > ed", stMoment.format(selectorPattern), edMoment.format(selectorPattern));
				edMoment = stMoment;
			}

			let maxDateMoment = edMoment;
			if(maxDate === "today") {
				maxDateMoment = moment();
			}

			if(maxDate && moment(maxDate, originPattern).isValid()) {
				maxDateMoment = moment(maxDate, originPattern);

				maxDateMoment.hours(23).minutes(59).seconds(59);

				let placement = "bottom";
				if(edMoment != null && edMoment.diff(maxDateMoment) > 0) {
					edMoment = maxDateMoment;
					let title = edMoment.format(selectorPattern) +" 이후로 설정하실 수 없습니다.";
					this._showTooltip($inputEd, {"title":title, "placement":placement});
					if(NaruDateTimePicker.debug) console.log("check user maxdate > ed", edMoment.format())
				}
				if(stMoment != null && stMoment.diff(maxDateMoment) > 0) {
					stMoment = maxDateMoment;
					let title = stMoment.format(selectorPattern) +" 이후로 설정하실 수 없습니다.";
					this._showTooltip($inputSt, {"title":title, "placement":placement});
					if(NaruDateTimePicker.debug) console.log("check user maxdate > st", stMoment.format());
				}

				$edDateTimePicker.maxDate(maxDateMoment);
				$stDateTimePicker.maxDate(maxDateMoment);
			}

			$edDateTimePicker.minDate(stMoment);
			let changeSt = stMoment.format(selectorPattern);
			$inputSt.val(changeSt);

			let changeEd = edMoment.format(selectorPattern);
			$inputEd.val(changeEd);

			$stDateTimePicker.date(changeSt);
			$stDateTimePicker.viewDate(changeSt);
			$stDateTimePicker.locale($stDateTimePicker.locale());

			$edDateTimePicker.date(changeEd);
			$edDateTimePicker.viewDate(changeEd);
			$edDateTimePicker.locale($edDateTimePicker.locale());

		}

	};

	this.getAddDate = function(selector, number, type) {
		let selectorPattern = this.options.selectorPattern;

		let resultDate = null;
		let mDate = moment($("#" + selector).data('date'), selectorPattern);

		if(mDate.isValid()) {
			if(selectorPattern === "YYYY-MM-DD") {
				mDate.hours(23).minutes(59).seconds(59);
			}

			let check = mDate.add(number, type).isValid();
			if(check) {
				if(selectorPattern === "YYYY-MM-DD") {
					mDate.add(1, "s");
				}
				resultDate = mDate.format(selectorPattern);
			}
		}
		if(resultDate == null) {
			if(NaruDateTimePicker.debug) console.log("invalid getAddDate");
		}

		return resultDate;

	};

	this.getMoment = function(selector) {
		let selectorPattern = this.options.selectorPattern;

		let mDate = moment($("#" + selector).data('date'), selectorPattern);
		if(!mDate.isValid()) {
			mDate = null;
		}
		if(mDate == null) {
			if(NaruDateTimePicker.debug) console.log("invalid getMoment");
		}

		return mDate;

	};

	/**
	 * get datetimepicker value
	 * @param selectorId
	 * @param pattern
	 * @returns {string}
	 * @private
	 */
	this._getDate = function(selectorId, pattern) {
		let selector = this._getSelector(selectorId);
		let dateTimePicker = this._getDateTimePicker(selector);
		let $objInput = $("#" + selectorId);
		let selectorPattern = this.options.selectorPattern;

		let result = "";
		if(dateTimePicker === undefined) {
			result = "";
			$objInput.val(result);
		} else {
			if(pattern) {
				if(moment(dateTimePicker.date(), pattern).isValid()) {
					result = dateTimePicker.date().format(pattern);
				}
			} else {
				result = dateTimePicker.date().format(selectorPattern);
			}
			$objInput.val(dateTimePicker.date().format(selectorPattern));
		}

		return result;

	};

	/**
	 * get input value
	 * @param selectorId
	 * @param pattern
	 * @returns {string}
	 */
	this.getDate = function(selectorId, pattern) {
		let selectorPattern = this.options.selectorPattern;

		let $objInput = $("#" + selectorId);
		let value = $objInput[0] === undefined ? "":$objInput.val();

		let result = "";
		if(value !== "") {
			if(moment(value, selectorPattern).isValid()) {
				result = moment(value, selectorPattern).format(pattern);
			} else {
				result = this._getDate(selectorId, pattern);
			}
		}

		return result;

	};

	this.getTime = function(selectorId) {
		let $objInput = $("#" + selectorId);
		let value = $objInput[0] === undefined ? "":$objInput.val();

		let result = 0;
		if(value !== "") {
			let selector = this._getSelector(selectorId);
			let dateTimePicker = this._getDateTimePicker(selector);
			result = dateTimePicker.date().toDate().getTime();
		}

		return result;

	};

	this._getSelector = function(selectorId) {
		let inputSt = this.options.inputSt;
		let inputEd = this.options.inputEd;

		let gSelector = null;
		if(selectorId === inputSt) {
			gSelector = this.selectorSt;
		}
		if(selectorId === inputEd) {
			gSelector = this.selectorEd;
		}

		return gSelector;

	};

	this._getDateTimePicker = function(selector) {
		return $("#" + selector).data("DateTimePicker");
	};

	this.getDiff = function(type) {
		let selectorSt = this.selectorSt;
		let selectorEd = this.selectorEd;
		let $stDateTimePicker = this._getDateTimePicker(selectorSt);
		let $edDateTimePicker = this._getDateTimePicker(selectorEd);

		let selectorPattern = this.options.selectorPattern;
		let dateDiff = 0;
		if(undefined !== $stDateTimePicker && undefined !== $edDateTimePicker) {
			if(selectorPattern === "YYYY-MM-DD") {
				dateDiff = moment($edDateTimePicker.date(), selectorPattern).hours(23).minutes(59).seconds(59)
					- moment($stDateTimePicker.date(), selectorPattern).hours(0).minutes(0).seconds(0);
			} else {
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
	};

	this.initDate = function(data) {
		let inputSt = this.options.inputSt;
		let inputEd = this.options.inputEd;
		let $inputSt = $("#" + inputSt);
		let $inputEd = $("#" + inputEd);

		if(data instanceof Object && (data.hasOwnProperty(inputSt) || data.hasOwnProperty(inputEd))) {
			if(data.hasOwnProperty(inputSt)) $inputSt.val(data[inputSt]);
			if(data.hasOwnProperty(inputEd)) $inputEd.val(data[inputEd]);

			this.setDate();
		}

	};

	this.clearDate = function() {
		let inputSt = this.options.inputSt;
		let inputEd = this.options.inputEd;
		let $inputSt = $("#" + inputSt);
		let $inputEd = $("#" + inputEd);

		$inputSt.val('');
		$inputEd.val('');
		this.setDate();

	};

	/**
	 *  종료시간 기준으로 시작시간 변경
	 * @param num
	 * @param type
	 * @returns {boolean}
	 */
	this.changeStDateByEd = function(num, type) {
		let selectorEd = this.selectorEd;
		let inputSt = this.options.inputSt;

		let number = parseInt(num);
		let check = false;
		if(!isNaN(number) && number !== 0) {
			let changeDate = this.getAddDate(selectorEd, number, type);

			if(changeDate != null) {
				$("#" + inputSt).val(changeDate);
				this.setDate();
				check = true;
			}
		}

		return check;

	};

	/**
	 *  시작시간 기준으로 종료시간 변경
	 * @param num
	 * @param type
	 * @returns {boolean}
	 * @private
	 */
	this._changeEdDateBySt = function(num, type) {
		let selectorSt = this.selectorSt;
		let inputEd = this.options.inputEd;

		let number = parseInt(num);
		let check = false;
		if(!isNaN(number) && number !== 0) {
			let changeDate = this.getAddDate(selectorSt, number, type);

			if(changeDate != null) {
				$("#" + inputEd).val(changeDate);
				this.setDate();
				check = true;
			}
		}

		return check;

	};

	this._showTooltip = function($objInput, option) {
		if(typeof $objInput.bstooltip !== "function") {
			$objInput.bstooltip = $objInput.tooltip;
		}

		let $parent = $objInput.parent();
		let inputId = $objInput.attr("id");
		let tooltipOptions = {
			"title": option.title,
			"placement": option.placement,
			"trigger": "manual"
		};

		let tooltipId = "";
		if($parent.length > 0) {
			if(this.constructor === NaruDateTimeMultiPicker) {
				tooltipId = inputId + "ToolTip";
				$parent.attr("id", tooltipId);
			}
			tooltipOptions["container"] = "#" + $parent.attr("id");
		}

		$objInput.bstooltip(tooltipOptions);

		$objInput.bstooltip('show');
		$objInput.on("shown.bs.tooltip", function() {
			setTimeout(function() {
				$objInput.bstooltip('hide');
				$objInput.bstooltip('dispose');
				if(tooltipId !== "") $parent.removeAttr("id");
			}, 2000);
		});
	};

}).call(NaruDateTimePicker.prototype);




//range
function NaruDateTimeMultiPicker(selector, options) {
	arguments[1] = $.extend({}, NaruDateTimeMultiPicker.defaultOptions, options);
	return NaruDateTimePicker.apply(this, arguments);
}

let NaruDateTimePickerTemp = function() {};
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

//bootstrap4
NaruDateTimeMultiPicker.prototype._initDraw = function() {
	let inputSt = this.options.inputSt;
	let inputEd = this.options.inputEd;

	let selectorSt = this.selectorSt;
	let selectorEd = this.selectorEd;

	let $inputSt = this.$selector.find("#" + inputSt);
	let $inputEd = this.$selector.find("#" + inputEd);
	$inputSt.addClass("naru-calendar-input");
	$inputEd.addClass("naru-calendar-input");

	let calWrapperSt = $("<div class='input-group naru-calendar-wrapper'></div>");
	let calWrapperEd = $("<div class='input-group naru-calendar-wrapper'></div>");
	$inputSt.wrap(calWrapperSt);
	$inputEd.wrap(calWrapperEd);

	let calWrapper = this.$selector.find(".naru-calendar-wrapper");
	calWrapper.each(function() {
		let spanIcon = $("<span class='input-group-addon input-group-append naru-calendar-icon'></span>");
		spanIcon.append("<span class='input-group-text glyphicon glyphicon-calendar'></span>");
		$(this).append(spanIcon);
	});

	let locale = this.options.locale;
	let stTitle = this.message[locale].stTitle;
	let edTitle = this.message[locale].edTitle;
	let okBtn = this.message[locale].okBtn;
	let closeBtn = this.message[locale].closeBtn;

	let $dateLayer = $("<div class='naru-date-layer'></div>");
	let $dateBoxSt = $("<div class='naru-date-box'></div>");
	let $dateTitleSt = $("<div class='naru-date-title'></div>");
	$dateTitleSt.append(stTitle);
	let $dateContentSt = $("<div class='naru-date-content'></div>");
	let $objDaySt = $("<div></div>");
	$objDaySt.attr("id", selectorSt);
	$dateContentSt.append($objDaySt);
	$dateBoxSt.append($dateTitleSt);
	$dateBoxSt.append($dateContentSt);

	let $dateBoxEd = $("<div class='naru-date-box'></div>");
	let $dateTitleEd = $("<div class='naru-date-title'></div>");
	$dateTitleEd.append(edTitle);
	let $dateContentEd = $("<div class='naru-date-content'></div>");
	let $objDayEd = $("<div></div>");
	$objDayEd.attr("id", selectorEd);
	$dateContentEd.append($objDayEd);
	$dateBoxEd.append($dateTitleEd);
	$dateBoxEd.append($dateContentEd);

	let $dateBtnLayer = $("<div class='naru-date-btn-layer'></div>");
	let $confirmBtn = $("<span class='btn btn-outline-dark naru-date-confirm-btn'>" + okBtn + "</span>");
	let $closeBtn = $("<span class='btn btn-outline-dark naru-date-close-btn'>" + closeBtn + "</span>");
	$dateBtnLayer.append($confirmBtn);
	$dateBtnLayer.append($closeBtn);

	$dateLayer.append($dateBoxSt);
	$dateLayer.append($dateBoxEd);
	$dateLayer.append($dateBtnLayer);
	this.$selector.append($dateLayer);

	this.createPicker();
};

NaruDateTimeMultiPicker.prototype._initEvent = function() {
	NaruDateTimePicker.prototype._initEvent.call(this);

	let selectorPattern = this.options.selectorPattern;
	let selectorSt = this.selectorSt;
	let selectorEd = this.selectorEd;
	let $stDateTimePicker = this._getDateTimePicker(selectorSt);
	let $edDateTimePicker = this._getDateTimePicker(selectorEd);

	let dateLayerClass = "naru-date-layer";
	let $dateLayerSelector = this.$selector.find("." + dateLayerClass);

	let inputSt = this.options.inputSt;
	let inputEd = this.options.inputEd;
	let $inputSt = $('#' + inputSt);
	let $inputEd = $('#' + inputEd);

	let objThis = this;
	$inputSt.on("keyup", function() {
		if(moment($(this).val(), selectorPattern, true).isValid()) {
			$(this).data({"origin":$(this).val()});
		} else {
			let data = $(this).data();
			if(!data.hasOwnProperty("origin")) {
				$(this).data({"origin":$stDateTimePicker.date().format(selectorPattern)});
			}
		}
	});

	$inputSt.on("focusout", function() {
		//valid
		let data = $(this).data();
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
		} else {
			let data = $(this).data();
			if(!data.hasOwnProperty("origin")) {
				$(this).data({"origin":$edDateTimePicker.date().format(selectorPattern)});
			}
		}
	});

	$inputEd.on("focusout", function() {
		//valid
		let data = $(this).data();
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
		let confirmEvent = this.options.confirmEvent;

		let stDate = $stDateTimePicker.date();
		let edDate = $edDateTimePicker.date();

		if(stDate != null) {
			$inputSt.val(stDate.format(selectorPattern));
		}

		if(edDate != null) {
			$inputEd.val(edDate.format(selectorPattern));
		}

		//TEST
		let check = this._checkRange();//.apply(this);
		if(!check) this.setDate();

		$dateLayerSelector.hide(0, function() {
			$(document).off("click.narusec-date-picker");
		});

		if(confirmEvent !== null && typeof confirmEvent === "function") {
			confirmEvent();
		}
	}, this));

	this.$selector.find(".naru-date-close-btn").on("click", $.proxy(function(event) {
		event.stopPropagation();
		this.setDate();

		$dateLayerSelector.hide(0, function() {
			$(document).off("click.narusec-date-picker");
		});
	}, this));

	this.$selector.find(".naru-calendar-icon,.naru-calendar-input").closest(".naru-calendar-wrapper").on("click", function(event) {
		event.stopPropagation();

		let $wrapper = $(this);
		$dateLayerSelector.appendTo($wrapper);

		//let wrapperPos = $wrapper.position();
		let content = objThis.$selector;
		let contentRight = content.offset().left + content.width();
		let dateLayerRight = $wrapper.offset().left + $dateLayerSelector.width();
		let wrapperHeight = $wrapper.height();
		let dateLayerPosition = {
			//"top": (wrapperPos.top + wrapperHeight) + "px"
			"top": wrapperHeight + "px"
		};

		if(dateLayerRight > contentRight) {
			dateLayerPosition.left = "";
			dateLayerPosition.right = "0px";
		} else {
			dateLayerPosition.left = "0px";
			dateLayerPosition.right = "";
		}

		dateLayerDisplay(dateLayerPosition);
	});

	function dateLayerDisplay(dateLayerPosition) {
		$dateLayerSelector.css(dateLayerPosition);

		if($dateLayerSelector.is(":visible")) {
			//$dateLayerSelector.hide();
		} else {
			$stDateTimePicker.hide();
			$edDateTimePicker.hide();

			let today = moment().format(selectorPattern);
			if($stDateTimePicker.date() === null) $stDateTimePicker.date(today);
			if($edDateTimePicker.date() === null) $edDateTimePicker.date(today);

			$stDateTimePicker.show();
			$edDateTimePicker.show();

			$dateLayerSelector.show(0, function() {
				let eventHandler = function(event) {
					if($(event.target).is("." + dateLayerClass, "." + dateLayerClass + " *")) return;
					objThis.setDate();
					$dateLayerSelector.hide(0, function() {
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
 */
