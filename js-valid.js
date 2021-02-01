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
		const rules = JSON.parse(form.getAttribute('rules')); // 获取当前 form 的 rules
		const props = Object.keys(rules); // 从 rules 中提取 prop

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
					validate(propControl, rule, prop);
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
 * 表单验证
 * @param {DOM} tragetDom 要验证的元素
 * @param {Object} rule 用户填写的 rules 数组中以一条 rule
 * @param {*} prop 验证的 prop
 */
function validate(tragetDom, rule, prop) {
	const validate = new Validate(tragetDom, rule, prop);
	// 提取 rule 对象中的全部属性逐一遍历
	Object.keys(rule).forEach((key) => {
		// 借助 switch 语句对不同的 key 进行不同的处理
		switch (key.trim()) {
			case 'message':
			case 'trigger':
				// message、trigger 不需要进行处理，直接忽略
				break;
			case 'required': {
				validate.required();
				break;
			}
			case 'min': {
				validate.min();
				break;
			}
			case 'max': {
				validate.max();
				break;
			}
			default:
				//  既不是默认的表单验证关键字，又不是message、trigger，则直接抛错 "未定义"
				console.error(`${prop} rule 的 ${key} 未定义`);
				break;
		}
	});
}

/**
 * 表单验证规则对象创建
 * @param {*} tragetDom 验证元素
 * @param {*} rule 用户设置的验证规则
 * @param {*} prop prop 属性名
 */
function Validate(tragetDom, rule, prop) {
	this.tragetDom = tragetDom;
	this.rule = rule;
	this.prop = prop;
}

Validate.prototype = {
	constructor: Validate,

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

		this.dealWithTip(this.prop, val <= this.rule.max, this.rule.message, 'max');
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
		let validTipElem = document.querySelector(
			`*[prop=${this.prop}] .valid-tip`
		);
		let tipAnchor = document.querySelector(`*[prop=${this.prop}] .tip-anchor`);
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
			document.querySelector(`*[prop=${this.prop}]`).append(tipELem);
		}
	},

	/**
	 * 以携带 prop 属性的元素为参照点，移除提示语元素
	 * @param {*} ruleName 当前验证规则的名字
	 */
	removeTipLabel: function (ruleName) {
		// 获取 prop 元素内部已存在的提示语元素
		let validTipElem = document.querySelector(
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
		let validTipElem = document.querySelector(
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
	}
};
