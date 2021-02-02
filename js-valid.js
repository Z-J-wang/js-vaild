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
					const validate = new Validate(propControl, rule, prop, formName);
					validate.validate();
				});
			});
		});
	});
}

/**
 * 向指定元素一次性绑定多个监听器
 * @param {DOM} tragetDom  目标元素
 * @param {String} prop 表单验证的prop
 * @param {string|array} events 事件监听器
 * @param {*} callback 回调函数
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
 * @param {String} formName form 的 name 属性值
 */
function validateAll(formName) {
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
				const validate = new Validate(propControl, rule, prop, formName);
				validate.validate();
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
 * @param {String} formName form 的 name 属性值
 * @param {String} propVal prop 的属性值
 */
function validateProp(formName, propVal) {
	return new Promise((resolve, reject) => {
		const formElem = document.querySelector(`form[name=${formName}]`); // 获取要进行验证的表单
		const obj_Rules = formElem.rules; // 获取当前 form 的 rules
		const propElem = formElem.querySelector(`*[prop=${propVal}]`); // 获取 propVal 对应的元素
		const propControl = propElem.querySelector('input, select, areatext'); // 获取 prop 元素中的表单元素，即需要验证的元素

		// 根据 prop 属性值从 rules 中提取对应的验证规则数组，然后根据数组中的验证规则逐条对需要验证的元素进行验证
		obj_Rules[propVal].forEach((rule) => {
			const validate = new Validate(propControl, rule, propVal, formName);
			validate.validate();
		});
		setTimeout(() => {
			const tipElem = propElem.querySelector('.valid-tip');
			resolve(tipElem == null);
		}, 50);
	});
}

/**
 * 表单验证对象创建(用于具体表单控件的验证)
 * 这里采用了构造函数模式和原型模式来创建对象
 * @param {DOM} tragetDom 要验证的元素
 * @param {Object} rule 用户填写的 rules 数组中以一条 rule
 * @param {String} prop 验证的 prop
 * @param {String} formName 表单 name 属性
 */
function Validate(tragetDom, rule, prop, formName) {
	this.tragetDom = tragetDom;
	this.rule = rule;
	this.prop = prop;
	this.formElem = document.querySelector(`form[name=${formName}]`);
}

Validate.prototype = {
	constructor: Validate,

	/**
	 * 表单验证
	 */
	validate: function () {
		// 提取 rule 对象中的全部属性逐一遍历
		Object.keys(this.rule).forEach((key) => {
			// 借助 switch 语句对不同的 key 进行不同的处理
			switch (key.trim()) {
				case 'message':
				case 'trigger':
					// message、trigger 不需要进行处理，直接忽略
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
				default:
					//  既不是默认的表单验证关键字，又不是message、trigger，则直接抛错 "未定义"
					console.error(`${this.prop} rule 的 ${key} 未定义`);
					break;
			}
		});
	},
	/**
	 * 提示语处理
	 * @param {*} ret 验证结果
	 * @param {*} msg 提示语文本
	 * @param {*} ruleName 当前验证规则名
	 */
	dealWithTip: function (ret, msg, ruleName) {
		if (!ret) {
			// 验证失败
			console.warn(`${this.prop}：${msg}`);
			this.addTipLabel(msg, ruleName);
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
		let val = this.tragetDom.value.trim();
		let isTrue = false;
		let msg = '';
		this.rule.validator(this.rule, val, (error) => {
			// 判断 error 是否存在，存在则表示验证出错
			if (error != undefined) {
				isTrue = false;
				msg = error.message;
			} else {
				isTrue = true;
			}

			// 验证是否已存在提示语
			let ret = this.hasValidTip('custom-validate');
			if (!ret) {
				return false;
			}

			this.dealWithTip(isTrue, msg, 'custom-validate');
		});
	},

	// 必填
	required: function () {
		let val = this.tragetDom.value.trim();

		// 验证是否已存在提示语
		let ret = this.hasValidTip('required');
		if (!ret) {
			return false;
		}

		this.dealWithTip(val != '', this.rule.message, 'required');
	},

	// 最小值
	min: function () {
		let val = this.tragetDom.value;

		// 验证是否已存在提示语
		let ret = this.hasValidTip('min');
		if (!ret) {
			return false;
		}

		this.dealWithTip(val >= this.rule.min, this.rule.message, 'min');
	},

	// 最大值
	max: function () {
		let val = this.tragetDom.value;

		// 验证是否已存在提示语
		let ret = this.hasValidTip('max');
		if (!ret) {
			return false;
		}

		this.dealWithTip(val <= this.rule.max, this.rule.message, 'max');
	}
};
