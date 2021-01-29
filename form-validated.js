/**
 * 初始化表单验证
 * @param {String} $form 需要进行初始化的表达, 样式选择器
 */
function initValid(form) {
	let formElem = document.querySelector(form);  // 要进行验证的表单元素
	let arr_contorlElems = [];  // 表单里的控件数组

  // 如果表单元素存在，则获取其内部的控件
	if (formElem) {
		arr_contorlElems = formElem.querySelectorAll('input,select,textarea');
	}

  // 遍历表单控件，对每个控件添加 change 事件，change 事件触发将会对当前控件进行表单验证
	arr_contorlElems.forEach((element) => {
		element.onchange = function () {
      // 延迟 300 ms 在进行表单验证
			setTimeout(() => {
				rules(element);
			}, 300);
		};
	});
}

/**
 * 检验全部表单控件
 * @param {*} form 要校验的表单
 */
function vaildAll(form, callback) {
	let $formElem = $(form).find('input, select, textarea'); // 获取全部表单控件
	let vaild_retult = false;
	let arr_valid = [];
	$formElem.each(function () {
		arr_valid.push(rules($(this)));
	});
	if (arr_valid.indexOf(false) > -1) {
		vaild_retult = false;
	} else {
		vaild_retult = true;
	}
	callback(vaild_retult);
}

/**
 * 检验规则,保证每次只检验一个规则
 * @param {DOM} elem 需要检验的DOM
 */
function rules(elem) {
	if (!required($(elem))) {
		return false;
	}
	if (!positiveInt($(elem))) {
		return false;
	}
	if (!decimal($(elem))) {
		return false;
	}
	if (!minLengthAndMaxLength($(elem))) {
		return false;
	}
	if (!minAndMax($(elem))) {
		return false;
	}
}

/**
 *  错误提示显示
 * @param {DOM} $formControl 发生错误的表单控件
 * @param {Boolean} isFalse
 * @param {String} tipText 需要显示的错误文本
 * @returns False/true
 */
function showTip($formControl, isFalse, tipText) {
	let $tipElem = $($formControl)
		.parent()
		.parent()
		.find(`p[data-tip=${$($formControl).attr('id')}]`); // 根据 data-tip 属性获取当前输入框的提示语元素

	// 验证出错
	if (isFalse) {
		if ($tipElem.length > 0) {
			// 如果已存在对应的提示语直接修改 text
			$tipElem.text(tipText);
		} else {
			// r如果不存在，则插入一个新的提示语元素，data-tip 属性用于识别提示语的唯一性
			let $tip = `<p class="form-tip" data-tip="${$($formControl).attr(
				'id'
			)}">${tipText}</p>`;
			$($formControl).parent().after($tip);
			$($formControl).addClass('form-error');

			// 对于模拟输入框组件，可以通过给模拟输入框的元素添加 class="tip-anchor"。系统回自动识别 .tip-anchor 以添加错误提示样式
			$($formControl).parent().find('.tip-anchor').addClass('form-error');
		}

		return false;
	} else if (!isFalse && $tipElem.length > 0) {
		// 验证正确，且存在对应提示语元素，则移除提示语元素和输入框错误样式
		$tipElem.remove();
		$($formControl).removeClass('form-error');
		$($formControl).parent().find('.tip-anchor').removeClass('form-error');

		return true;
	} else {
		// 验证成功且不存在提示语元素，直接返回 true
		return true;
	}
}

/********************** 验证规则 *********************************/

/**
 * 必填
 * @param {*} elem
 */
function required(elem) {
	if ($(elem).data('required') != undefined) {
		let $lable = $(elem).parents('.form-group').find('label').text();
		let $requiredText = $(elem).data('required-text');
		let $tipText = $requiredText ? $requiredText : `${$lable} 栏位不能为空`;
		let isFlase = $(elem).val().trim() == '';
		return showTip($(elem), isFlase, $tipText);
	} else {
		return true;
	}
}

/**
 * 最大长度
 * @param {*} elem
 */
function minLengthAndMaxLength(elem) {
	let minLength = $(elem).data('min-length');
	let maxLength = $(elem).data('max-length');
	let val = $(elem).val();
	let regRes = true;
	let $tipText = '';
	if (!val) {
		return true;
	}
	if (minLength && !maxLength) {
		regRes = val.length >= minLength;
		$tipText =
			$(elem).data('min-length-text') || `请输入大于${minLength}个字符`;
		return showTip($(elem), !regRes, $tipText);
	} else if (!minLength && maxLength) {
		regRes = val.length <= maxLength;
		$tipText =
			$(elem).data('max-length-text') || `请输入小于${maxLength}个字符`;
		return showTip($(elem), !regRes, $tipText);
	} else if (minLength && maxLength) {
		regRes = val.length >= minLength && val.length <= maxLength;
		$tipText =
			$(elem).data('minAndmax-length-text') ||
			`请输入${minLength} - ${maxLength}个字符`;
		return showTip($(elem), !regRes, $tipText);
	} else {
		return true;
	}
}

/**
 * 小数点位数
 * @param {DOM} elem
 */
function decimal(elem) {
	if ($(elem).data('decimal') != undefined) {
		let decimal = $(elem).data('decimal');
		let regRule = new RegExp(`^\\d+(.?\\d{1,${decimal}})?$`);
		let regRes = $(elem).val() ? regRule.test($(elem).val()) : true;
		let $requiredText = $(elem).data('decimal-text');
		let $tipText = $requiredText
			? $requiredText
			: `该栏位为数字，保留${decimal}位小数`;
		return showTip($(elem), !regRes, $tipText);
	} else {
		return true;
	}
}

/**
 * 正整数
 * @param {DOM} elem
 */
function positiveInt(elem) {
	if ($(elem).data('positiveint') != undefined) {
		let regRule = new RegExp(`^\\d+$`);
		let regRes = $(elem).val() ? regRule.test($(elem).val()) : true;
		let $requiredText = $(elem).data('positiveint-text');
		let $tipText = $requiredText ? $requiredText : `该栏位为整数`;
		return showTip($(elem), !regRes, $tipText);
	} else {
		return true;
	}
}

/**
 * 最小值
 * @param {DOM} elem
 */
function minAndMax(elem) {
	let val = $(elem).val();
	let min = parseFloat($(elem).data('min'));
	let max = parseFloat($(elem).data('max'));
	let regRes = true;
	let $tipText = '';
	if (!val) {
		return true;
	}
	if (min && !max) {
		regRes = val >= min;
		$tipText = $(elem).data('min-text') || `请输入大于${min}的数`;
		return showTip($(elem), !regRes, $tipText);
	} else if (!min && max) {
		regRes = val <= max;
		$tipText = $(elem).data('max-text') || `请输入小于${max}的数`;
		return showTip($(elem), !regRes, $tipText);
	} else if (min && max) {
		regRes = val >= min && val <= max;
		$tipText =
			$(elem).data('minandmax-text') || `请输入介于${min} - ${max}的数`;
		return showTip($(elem), !regRes, $tipText);
	} else {
		return true;
	}
}
