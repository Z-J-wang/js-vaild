# JS-Vaild

## 介绍
本项目是参考 element-ui 的  [async-validator](https://github.com/yiminghe/async-validator) 插件，通过原生 JS 实现了 [async-validator](https://github.com/yiminghe/async-validator) 的部分表单功能。


## 安装教程

1.  下载 js-valid.js 文件放到项目中即可。

## 使用说明

本插件的使用方法基本和在 element-ui 中使用 [async-validator](https://github.com/yiminghe/async-validator) 类似。

### 第一步：在您的项目中引入 JS-Valid

```html
<script src="/js-valid.js"></script>
```



### 第二部：在项目中使用

在项目中使用 JS-Valid 是非常简单的，只需要您为你想要使用表单验证的的 `<form>` 添加 `rules` 属性，然后通过给表单控件添加标识属性`prop`即可。如下：

```html
<form name="ruleName">
  <div prop="username">
    <label for="">用户名：</label>
    <input type="text" />
  </div>
  <div prop="pass">
    <label for="">密码：</label>
    <input type="text" />
  </div>
</form>
<script>
  window.onload = function () {
    const formELem = document.querySelector('form[name=ruleName]');
    let rules = {
      username: [
        {
          required: true,
          message: '用户名不能为空',
          trigger: ['blur', 'change']
        },
      ],
      pass: [
        {
          required: true,
          message: '密码不能为空',
          trigger: ['blur', 'change']
        }
      ]
    };
    
    // 添加 rules 属性
    formELem.rules = rules;
  };
</script>
```



这里有几点需要注意：



#### 必须设定 `name`

`<form>` 元素一定要添加 `name` 属性，JS-Valid 通过 `name` 属性来区分 `<form>`。



#### `rules` 属性的添加

`rules` 属性的添加，必须通过`.` 来设置 `property` 属性。因为`setAttribute` 设置的 `attribute` 属性，其值只能是字符串。

详细可查阅：[HTML中的attribute属性和JavaScript中的property属性的详解以及区别](https://blog.csdn.net/zhy13087344578/article/details/79036967)



#### `prop` 属性的添加

 JS-Valid 识别表单中的哪些表单控件（如：`input`、`select`等）需要验证是通过 `prop` 属性来进行的。此外，JS-Valid 还需通过 `prop` 属性值在 `rules` 中查找用户设定的验证规则。所以，在使用时必须为要进行表单验证的表单控件添加 `prop`，而且 `prop` 的值还需要和 `rules` 中对应。

此外，`prop` 属性应该添加在表单控件的父级以及以上。验证错误的提示语元素默认添加在 `prop` 属性元素的子级的最后一个子元素后面。如下：

```html
<!-- 错误的添加方式 -->
<input type="text" prop="username"/>

<!-- 正确的添加方式 -->
<div prop="username">
  <label for="">用户名：</label>
  <input type="text" />
</div>
```



## 详细说明

接下是 JS-Valid 用法的详细说明。



### 自定义提示语位置

JS-Valid 的提示语默认添加在 `prop` 元素的子级的最后一个子元素后面。如下：

```html
<!-- 未验证 -->
<div prop="username">
  <label for="">用户名：</label>
  <input type="text" />
</div>

<!-- 验证错误 -->
<div prop="username">
  <label for="">用户名：</label>
  <input type="text" />
  <lable class="valid-tip" rule="required" style="display: block; color: red;">用户名不能为空</lable>
</div>
```

但是有些时候，我们可能需要让提示语在其他地方显示。我们可以通过class `tip-anchor` 来实现自定义提示语位置。

> JS-Valid 的提示语位置的原理是这样的：JS-Valid 首先查找 `prop` 元素内部是否存在设置了 `tip-anchor` 类的元素。如果存在，JS-Valid 将会把提示语元素作为子元素插入设置了 `tip-anchor` 类的元素的内部。如果不存在，则将提示语作为 `prop` 元素的最后一个子元素插入。

```html
<!-- 未验证 -->
<div prop="username">
  <!-- 自定义提示语位置 -->
  <div class="tip-anchor"></div>
  <label for="">用户名：</label>
  <input type="text" />
</div>

<!-- 验证错误 -->
<div prop="username">
  <!-- 自定义提示语位置 -->
  <div class="tip-anchor">
  	<lable class="valid-tip" rule="required" style="display: block; color: red;">用户名不能为空</lable>
  </div>
  <label for="">用户名：</label>
  <input type="text" />
</div>
```



### 验证规则

JS-Valid 验证规则的写法和 [async-validator](https://github.com/yiminghe/async-validator) 基本一致。如下：

```js
let rules = {
  username: [
    { required: true, message: '用户名不能为空', trigger: ['blur', 'change'] },
    { minLength: 6, message: '用户名不少于6个字符', trigger: ['blur', 'change'] }
  ]
};
```

`rules` 是一个对象，其`key` 对应 `prop` 的值，`value` 是一个数组，数组内部是一条条 `rule`（验证规则）。

#### `rule` 属性介绍

+ `message`

  + 类型: `string|Function`

  + 是否必填：是

  + 用法：

    `message` 可以接收可以接收字符串和函数。当其接受的值是函数时，函数必须返回一个字符串来充当提示语。此外，当前表单控件的 value 会被作为函数的唯一参数传递给函数内部。

    ```js
    let rules = {
      username: [
        {
          required: true,
          message(value) {
            return '用户名不能为空';
          },
          trigger: ['blur', 'change']
        }
      ]
    }
    ```

    

+ trigger:

  + 类型：`string|Array`

  + 是否必填：是

  + 可选值：HTML 原生事件都可以。（如：`change`、`blur`、`input`等等）

  + 用法：

    `trigger` 类型可以说字符串和数组。当其值只有一个时，字符串或者数组都可以；当其值为多个时，需为数组。

    ```js
    username: [
      { required: true, message: '用户名不能为空', trigger: 'change' },
      { minLength: 6, message: '用户名不少于6个字符', trigger: ['blur', 'change'] }
    ]
    ```

  

+ validator：

  + 类型：`Function`

  + 是否必填：否

  + 用法：

    如果您发现内置的验证规则无法满足你的需求时，您还可以自定义验证规则。通过 `validator` 即可实现。具体请看 “自定义验证规则”部分。

+ transform：

  + 类型：`Function`

  + 是否必填：否

  + 用法：有些时候，我们可能不需要对 `value` 进行直接验证，而是需要经过处理后再验证，但是这个处理又不能改变用户输入的`value`。这时就可以借助`transform` 来实现了。`transform` 接收一个函数，这个函数有一个参数 `value` 和需要返回一个值。参数 `value` 是对应表单控件的值，返回值则被用作验证的真正值。如下例子：

    ```js
    username: [
      {
        required: true,
        message: '用户名不能为空',
        transform(value) {
          return value.trim();
        },
        trigger: ['blur', 'change']
      }
    ],
    ```

  

+ 内置规则

  JS-Valid 内置了一些常用的验证规则，以满足平常的使用。一条 `rule` 最少需要设定一个规则，可以是内置规则，也可以是通过`validator` 设置的自定义规则。

  ```js
  username: [
    { required: true, message: '用户名不能为空', trigger: 'change' },
    { minLength: 6, maxLength: 18, message: '用户名介于6-18个字符之间', trigger: ['blur', 'change'] }
  ]
  ```

  > 建议：
  >
  > 一条 `rule` 建议只设定一个规则。这样利于阅读。

  内置验证规则列表：

  | 规则       | 默认值  | 类型      | 描述   | 举例             |
  | ---------- | ------- | --------- | ------ | ---------------- |
  | `required` | `false` | `Boolean` | 必填   | `required: true` |
  | `min`      |         | `Number`  | 最小值 | `min:5`          |
  | `max`      |         | `Number`  | 最大值 | `max:16`         |

  



#### 自定义验证规则

JS-Valid 自定义验证规则的用法跟  [async-validator](https://github.com/yiminghe/async-validator)  类似。通过一个函数来进行设置。

自定义验证规则的函数接受三个参数：

+ rule:

  + 类型：`Object`
  + 说明：当前规则的 `rule` 本身

+ value：

  + 说明：表单控件的 value

+ callback

  + 类型：`Function`

  + 说明：回调函数，用于向 JS-Valid 反馈验证的成功与失败。

    + 成功：`callback` 不携带任何参数标识验证成功
    + 失败：`callback` 携带`new Error()` 标识失败

    ```js
    let validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'));
      } else {
        callback();
      }
    };
    ```

    



### JS-Valid 的方法

##### validateAll 表单验证



##### validateProp 单一控件验证



##### resetForm 表单重置



##### resetProp 单一控件重置



##### clearValidate 表单验证状态重置









#### 参与贡献

1.  Fork 本仓库
2.  新建 Feat_xxx 分支
3.  提交代码
4.  新建 Pull Request


#### 特技

1.  使用 Readme\_XXX.md 来支持不同的语言，例如 Readme\_en.md, Readme\_zh.md
2.  Gitee 官方博客 [blog.gitee.com](https://blog.gitee.com)
3.  你可以 [https://gitee.com/explore](https://gitee.com/explore) 这个地址来了解 Gitee 上的优秀开源项目
4.  [GVP](https://gitee.com/gvp) 全称是 Gitee 最有价值开源项目，是综合评定出的优秀开源项目
5.  Gitee 官方提供的使用手册 [https://gitee.com/help](https://gitee.com/help)
6.  Gitee 封面人物是一档用来展示 Gitee 会员风采的栏目 [https://gitee.com/gitee-stars/](https://gitee.com/gitee-stars/)
