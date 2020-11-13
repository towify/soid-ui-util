# BoxShadowManager

## Description

设置控件元素阴影的管理器，并提供了两个工具方法

## 核心功能（接口）

BoxShadowManagerInterface

属性值：

- spinButtonPosition ：旋转按钮移动的点
- distance ： 用户设置的阴影偏移量
- setSpinButtonRect ：旋转按钮所在父控件（圆盘）的位置信息
- setSpinPointRect：旋转按钮自身的位置信息
- offsetFix: 修正小圆点坐标的偏移量

方法：

- getShadowAngle ： 旋钮旋转之后的回调函数，用于拖拽时实时返回阴影偏移量
- getAngleAndPositionByHorizontalAndVertical： 通过水平和垂直偏移量，获取角度和鼠标坐标
- getHorizontalAndVerticalAndPositionByAngle：通过角度和 distance，返回阴影偏移量和拖拽圆点的坐标

## getShadowAngle 的使用

- 实例化 manager

```
示例：
const manager = new BoxShadowManager();
```

- 设置属性（set）

```
示例：
// 注意，要先设置rect和pointRect，再设置spinButtonPosition
manager.setSpinButtonRect(new DOMRect(10, 10, 20, 20));
manager.setSpinPointRect(new DOMRect(0, 0, 6, 6));
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

## 工具方法：反向初始化 angle 和鼠标位置

box.shadow.manager.ts 中的方法 getAngleAndPositionByHorizontalAndVertical：传入当前控件的阴影在水平方向（horizontal）和垂直方向（vertical）的设置，
返回鼠标坐标和当前角度（0-360）

```
示例：
const res2 = manager.getAngleAndPositionByHorizontalAndVertical(9, 2);
console.log('获取angle , position :', res2);

```

## 工具方法：根据角度和 distance 获取实际阴影的偏移量和小圆点的坐标

box.shadow.manager.ts 提供的方法 getHorizontalAndVerticalAndPositionByAngle，可以获取阴影偏移量和拖拽圆点的坐标

```
示例：

manager.setSpinButtonRect(new DOMRect(10, 10, 20, 20));
manager.setSpinPointRect(new DOMRect(0, 0, 6, 6));
manager.distance = 30;
manager.offsetFix = 3;
// 注意，一定要先传入 拖拽父控件的rect 、 圆点的rect 、偏移量offsetFix
const res = manager.getHorizontalAndVerticalAndPositionByAngle(30, 10);
//处理其他业务逻辑


```
