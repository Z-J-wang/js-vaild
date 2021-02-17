/**
 * 因为 JS 不允许存在多个 window.onload，所以先暂存的旧的 window.onload，然后判断旧的 window.onload 是否已被赋值函数。
 * 如果是，则将新增的函数和旧的 window.onload 中的函数依次在新的 window.onload 中执行；
 * 如果不是，则直接将新增的函数赋值给 window.onload。
 *
 * 具体请参考：https://www.jb51.net/article/45332.htm
 */
!(function addLoadEvent(newLoadEvent) {
	let oldOnLoad = window.onload; // 因为JS 不允许存在多个 window.onload，所以先暂存已存在的 window.onload

	if (typeof oldOnLoad == 'function') {
		window.onload = function () {
			oldOnLoad();
			newLoadEvent();
		};
	} else {
		window.onload = newLoadEvent;
	}
})(initValid);

/**
 * 表单验证初始化
 */
function initValid() {
	let formElem = document.querySelectorAll('form');
	formElem.forEach(function (form) {
		const rules = form.rules; // 获取当前 form 的 rules
		const props = Object.keys(rules); // 从 rules 中提取 prop
		let formName = form.name; // 表单的 name

		// 遍历 props, 通过 prop 查找表单控件
		props.forEach((prop) => {
			const propControl = form
				.querySelector(`*[prop=${prop}]`)
				.querySelector('input, select, areatext'); // prop 对应的表单控件
			const propRules = rules[prop]; // prop 对应的验证规则

			// 判断 prop 里是否存在表单控件，没有则在控制台打印警告信息
			if (!propControl) {
				console.warn(`prop=${prop} 缺少表单控件，如 input, select, areatext`);

				return false;
			}

			propRules.forEach((rule) => {
				// propControl 添加事件监听器
				addMoreEvents(propControl, prop, rule.trigger, function (e) {
					const validator = new Validator(propControl, rule, prop, formName);
					validator.validate();
				});
			});
		});
	});
}

/**
 * 向指定元素一次性绑定多个监听器
 * @param {DOM} tragetDom  必填：目标元素
 * @param {String} prop 必填：表单验证的prop
 * @param {string|array} events 必填：事件监听器
 * @param {*} callback 必填：回调函数
 */
function addMoreEvents(tragetDom, prop, events, callback) {
	let triggers = '';
	if (typeof events == 'string') {
		// 判断 events 是否是字符串，如果是字符串则转为数组
		triggers = events.split(',');
	} else if (events instanceof Array) {
		// 判断 events 是否是数组，如果是直接赋值
		triggers = events;
	} else {
		// 既不是字符串也不是数组，直接抛错

		console.warn(`prop=${prop} 的 trigger 类型错误，应为 string 或 array`);
		return false;
	}

	triggers.forEach((trigger) => {
		tragetDom.addEventListener(trigger.trim(), callback);
	});
}

/**
 * 根据表单的 name 属性值，对表单进行全部字段验证
 * @param {String} formName 必填：form 的 name 属性值
 */
function validateAll(formName) {
	if (!formName) {
		console.error('参数 formName 不能为空');
		return false;
	}

	return new Promise((resolve, reject) => {
		const formElem = document.querySelector(`form[name=${formName}]`); // 获取要进行验证的表单
		const arr_propsElem = formElem.querySelectorAll(`*[prop]`); // 获取当前表单中全部的 prop 元素
		const obj_Rules = formElem.rules; // 获取当前 form 的 rules

		// 对 arr_propsElem 进行遍历，逐一验证
		arr_propsElem.forEach(function (propElem) {
			const propControl = propElem.querySelector('input, select, areatext'); // 获取 prop 元素中的表单元素，即需要验证的元素
			let prop = propElem.getAttribute('prop'); // 获取 propElem 元素的的 prop 属性值

			// 根据 prop 属性值从 rules 中提取对应的验证规则数组，然后根据数组中的验证规则逐条对需要验证的元素进行验证
			obj_Rules[prop].forEach((rule) => {
				const validator = new Validator(propControl, rule, prop, formName);
				validator.validate();
			});
		});

		setTimeout(() => {
			const arr_Tip = formElem.querySelectorAll('.valid-tip');
			resolve(arr_Tip.length <= 0);
		}, 50);
	});
}

/**
 * 验证具体的表单字段
 * @param {String} formName 必填：form 的 name 属性值
 * @param {String} propVal 必填：prop 的属性值
 */
function validateProp(formName, propVal) {
	if (!formName) {
		console.error('参数 formName 不能为空');
		return false;
	}
	if (!propVal) {
		console.error('参数 propVal 不能为空');
		return false;
	}
	return new Promise((resolve, reject) => {
		const formElem = document.querySelector(`form[name=${formName}]`); // 获取要进行验证的表单
		const obj_Rules = formElem.rules; // 获取当前 form 的 rules
		const propElem = formElem.querySelector(`*[prop=${propVal}]`); // 获取 propVal 对应的元素
		const propControl = propElem.querySelector('input, select, areatext'); // 获取 prop 元素中的表单元素，即需要验证的元素

		// 根据 prop 属性值从 rules 中提取对应的验证规则数组，然后根据数组中的验证规则逐条对需要验证的元素进行验证
		obj_Rules[propVal].forEach((rule) => {
			const validator = new Validator(propControl, rule, propVal, formName);
			validator.validate();
		});
		setTimeout(() => {
			const tipElem = propElem.querySelector('.valid-tip');
			resolve(tipElem == null);
		}, 50);
	});
}

/**
 * 表单整体重置
 * @param {String} formName 必填：表单名
 */
function resetForm(formName) {
	if (!formName) {
		console.error('参数 formName 不能为空');
		return false;
	}
	// 获取表单中的 prop 元素
	let arr_propElems = document.querySelectorAll(
		`form[name=${formName}] *[prop]`
	);

	// 遍历 prop 元素，逐一进行重置操作
	arr_propElems.forEach(function (propElem) {
		let propControl = propElem.querySelector('input, select, areatext');
		propControl.value = ''; // 重置 value
		forceRemoveTip(propElem);
	});
}

/**
 * 重置指定表单的指定 prop
 * @param {String} formName 必填：表单名
 * @param {String} propName 必填：prop 名
 */
function resetProp(formName, propName) {
	if (!formName) {
		console.error('参数 formName 不能为空');
		return false;
	}
	if (!propName) {
		console.error('参数 propName 不能为空');
		return false;
	}
	// 获取表单中的 prop 元素
	let propElem = document.querySelector(
		`form[name=${formName}] *[prop=${propName}]`
	);
	if (propElem) {
		let propControl = propElem.querySelector('input, select, areatext');
		propControl.value = ''; // 重置 value
		forceRemoveTip(propElem);
	}
}

/**
 * 根据 formName 移除表单项的校验结果。
 * @param {String} formName 必填参数：表单名
 * @param {Array} arr_propNames 可选参数：propName 数组
 */
function clearValidate(formName, arr_propNames) {
	if (!formName) {
		console.error('缺少参数第一个参数 formName');
	}

	if (!arr_propNames) {
		// 获取表单中的 prop 元素
		let arr_propElems = document.querySelectorAll(
			`form[name=${formName}] *[prop]`
		);
		arr_propElems.forEach((propElem) => {
			forceRemoveTip(propElem);
		});
	} else if (arr_propNames && arr_propNames.length > 0) {
		arr_propNames.forEach((propName) => {
			// 获取表单中的 prop 元素
			let propElem = document.querySelector(
				`form[name=${formName}] *[prop=${propName}]`
			);
			if (propElem) {
				forceRemoveTip(propElem);
			}
		});
	} else if (arr_propNames && !(arr_propNames instanceof Array)) {
		console.error('参数 arr_propName 类型应为 Array');
	}
}

/**
 * 强制删除 prop 的提示语
 * @param {Dom} propElem prop 元素
 */
function forceRemoveTip(propElem) {
	let tipElem = propElem.querySelector('.valid-tip');
	if (tipElem) {
		tipElem.remove(); // 删除提示语元素
	}
}

/**
 * 表单验证对象创建(用于具体表单控件的验证)
 * 这里采用了构造函数模式和原型模式来创建对象
 * @param {DOM} tragetDom 要验证的元素
 * @param {Object} rule 用户填写的 rules 数组中以一条 rule
 * @param {String} prop 验证的 prop
 * @param {String} formName 表单 name 属性
 */
function Validator(tragetDom, rule, prop, formName) {
	this.tragetDom = tragetDom;
	this.rule = rule;
	this.prop = prop;
	this.formElem = document.querySelector(`form[name=${formName}]`);
	this.value = tragetDom.value; // 获取当前验证元素的 value
}

Validator.prototype = {
	constructor: Validator,

	/**
	 * 表单验证
	 */
	validate: function () {
		let arr_key = Object.keys(this.rule); // 获取 rule 对象中的全部 key
		// 判断是否存在 transform 属性
		// transform 属性用于转化验证前的 value，所以应最先处理
		if (arr_key.includes('transform')) {
			this.value = this.rule.transform(this.value);
		}

		// 提取 rule 对象中的全部属性逐一遍历
		arr_key.forEach((key) => {
			// 借助 switch 语句对不同的 key 进行不同的处理
			switch (key.trim()) {
				case 'message':
				case 'trigger':
				case 'transform':
					// message、trigger 不需要进行处理，transform 已经处理过，直接忽略
					break;
				case 'validator':
					this.customValidate();
					break;
				case 'required': {
					this.required();
					break;
				}
				case 'min': {
					this.min();
					break;
				}
				case 'max': {
					this.max();
					break;
				}
				case 'maxLength': {
					this.maxLength();
					break;
				}
				case 'minLength': {
					this.minLength();
					break;
				}
				case 'pattern': {
					this.pattern();
					break;
				}
				case 'type': {
					this.type();
					break;
				}
				case 'decimal': {
					this.decimal();
					break;
				}
				default:
					//  既不是默认的表单验证关键字，又不是message、trigger，则直接抛错 "未定义"
					console.error(`${this.prop} rule 的 ${key} 未定义`);
					break;
			}
		});
	},

	/**
	 * 提示语处理
	 * @param {*} value 用户输入值
	 * @param {*} ret 验证结果
	 * @param {String|Function|HTML String} msg 提示语
	 * @param {*} ruleName 当前验证规则名
	 */
	dealWithTip: function (ret, msg, ruleName) {
		// 验证是否已存在提示语
		let validTip = this.hasValidTip(ruleName);
		if (!validTip) {
			return false;
		}

		if (!ret) {
			// 验证失败
			let message = msg;

			// 判断 msg 是否是 function, 如果是，则 提示文本为 function 的返回值
			// msg 接收一个参数，即用户输入值
			if (typeof msg == 'function') {
				message = msg(this.value);
			}
			this.addTipLabel(message, ruleName);
			console.warn(`${this.prop}：${msg}`);
		} else {
			// 验证成功
			this.removeTipLabel(ruleName);
		}
	},

	/**
	 * 以携带 prop 属性的元素为参照点，将错误提示作为其最后的子元素添加到页面上
	 * @param {String} msg 提示语
	 * @param {String} ruleName 当前验证规则的名字
	 */
	addTipLabel: function (msg, ruleName) {
		// 获取 prop 元素内部已存在的提示语元素
		let validTipElem = this.formElem.querySelector(
			`*[prop=${this.prop}] .valid-tip`
		);
		let tipAnchor = this.formElem.querySelector(
			`*[prop=${this.prop}] .tip-anchor`
		);
		let tipELem = document.createElement('lable');

		// 如果已存在提示语，则移除
		if (validTipElem) {
			validTipElem.remove();
		}

		// 提示语元素初始化
		tipELem.style.display = 'block';
		tipELem.style.color = 'red';
		tipELem.classList.add('valid-tip');
		tipELem.setAttribute('rule', ruleName); // rule 属性用于唯一性判断
		tipELem.innerHTML = msg;

		// 判断 prop 是否存在提示语锚点
		if (tipAnchor) {
			// 存在，则将提示语元素插入到锚点中
			tipAnchor.append(tipELem);
		} else {
			// 不存在，则将提示语元素插入到 prop 元素中
			this.formElem.querySelector(`*[prop=${this.prop}]`).append(tipELem);
		}
	},

	/**
	 * 以携带 prop 属性的元素为参照点，移除提示语元素
	 * @param {*} ruleName 当前验证规则的名字
	 */
	removeTipLabel: function (ruleName) {
		// 获取 prop 元素内部已存在的提示语元素
		let validTipElem = this.formElem.querySelector(
			`*[prop=${this.prop}] .valid-tip`
		);

		if (validTipElem) {
			let attr_rule = validTipElem.getAttribute('rule');
			if (attr_rule == ruleName) {
				// 如果，已存在的提示语元素的 rule 属性值和当前验证规则的名字一致，则删除提示语元素
				validTipElem.remove();
			}
		}
	},

	/**
	 * 用于判断是否已存在提示语。如果已存在提示语，则只允许对已存在的提示语的对应校验规则进行校验。
	 * 这样是为了防止，其他验证规则覆盖的其他验证规则的提示语
	 * @param {String} ruleName 当前验证规则的名字
	 * @returns {Boolean} 是否允许进一步的表单验证
	 */
	hasValidTip: function (ruleName) {
		let ret = false; // return 结果
		let validTipElem = this.formElem.querySelector(
			`*[prop=${this.prop}] .valid-tip`
		); // 获取 prop 元素内部已存在的提示语元素

		if (validTipElem) {
			// 已存在提示语，则判断是否在当前验证规则的提示语
			let attr_rule = validTipElem.getAttribute('rule');
			if (attr_rule != ruleName) {
				// 不是当前验证规则的提示语，停止验证
				ret = false;
			} else {
				// 是当前验证的提示语，进入具体的验证
				ret = true;
			}
		} else {
			// 不存在，直接放回 true 进行进一步的验证
			ret = true;
		}

		return ret;
	},

	/**
	 * 自定义验证规则
	 * 用户可以通过给回调函数传递 new Error() 参数来表示验证错误
	 */
	customValidate: function () {
		let isTrue = false;
		let msg = '';
		this.rule.validator(this.rule, this.value, (error) => {
			// 判断 error 是否存在，存在则表示验证出错
			if (error != undefined) {
				isTrue = false;
				msg = error.message;
			} else {
				isTrue = true;
			}

			this.dealWithTip(isTrue, msg, 'custom-validate');
		});
	},

	// 必填
	required: function () {
		this.dealWithTip(this.value != '', this.rule.message, 'required');
	},

	// 最小值
	min: function () {
		this.dealWithTip(this.value >= this.rule.min, this.rule.message, 'min');
	},

	// 最大值
	max: function () {
		this.dealWithTip(this.value <= this.rule.max, this.rule.message, 'max');
	},

	// 最大长度
	maxLength: function () {
		this.dealWithTip(
			this.value.length <= this.rule.maxLength,
			this.rule.message,
			'maxLength'
		);
	},

	// 最小长度
	minLength: function () {
		this.dealWithTip(
			this.value.length >= this.rule.minLength,
			this.rule.message,
			'minLength'
		);
	},

	type: function () {
		let type = this.rule.type;
		let isTrue = false;
		switch (type) {
			case 'string': {
				isTrue = typeof this.value == 'string';
				break;
			}
			case 'number': {
				let reg = /^[0-9]+.?[0-9]*/;
				isTrue = reg.test(this.value);
				break;
			}
			case 'boolean': {
				isTrue = typeof this.value == 'boolean';
				break;
			}
			case 'array': {
				isTrue = this.value instanceof Array;
				break;
      }
      case 'mail':{
        let reg = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4})*$/;
        isTrue = reg.test(this.value);
      }
    }
		this.dealWithTip(isTrue, this.rule.message, 'type');
  },
  
  // 自定义小数点后最大位数
	decimal: function () {
		let reg = new RegExp(`^\\d+(.?\\d{1,${this.rule.decimal}})?$`);
		this.dealWithTip(reg.test(this.value), this.rule.message, 'pattern');
	},

	// 自定义正则表达
	pattern: function () {
		let reg = new RegExp(this.rule.pattern);
		this.dealWithTip(reg.test(this.value), this.rule.message, 'pattern');
	}
};
