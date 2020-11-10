# BoxShadowManager

## Description

设置控件元素阴影的管理器

## 使用的接口

BoxShadowManagerInterface

- spinButtonPosition ：旋转按钮移动的点
- distance ： 用户设置的阴影偏移量
- setSpinButtonRect ：旋转按钮所在父控件（圆盘）的位置信息
- getShadowAngle ： 旋钮旋转之后的回调函数

## 使用方法

- 实例化 manager

```
示例：
const manager = new BoxShadowManager();
```

- 设置属性（set）

```
示例：
// 注意，要先设置rect，再设置spinButtonPosition
manager.setSpinButtonRect(new DOMRect(10, 10, 20, 20));
manager.distance = 30;
manager.spinButtonPosition = { x: 10, y: 10 };
```

- 调用 getShadowAngle，传入回调函数，监听角度变化

```
示例：
manager.getShadowAngle(
  (result: {
    angle: number;
    horizontalOffset: number;
    verticalOffset: number;
  }) => {
    //拿到回调结果： angle 、horizontalOffset、verticalOffset
    //处理其他业务逻辑
  }
);
```

## 反向初始化工具

在 box.shadow.manager.ts 中提供了一个方法：传入当前控件的阴影在水平方向（horizontal）和垂直方向（vertical）的设置，
返回当前角度（0-360）

```
示例：
const h = 10;
const v = 10;
const res = manager.getAngleByParameter({horizontal:h, vertical:v});
const final = `输入的控件(h：v) => (${h}:${v}) =>角度 ${res}`;
window.alert(final);
```
