# BoxShadowManager

## Description

设置控件元素阴影的管理器

## 核心功能 / 接口

BoxShadowManagerInterface

- spinButtonPosition ：旋转按钮移动的点
- distance ： 用户设置的阴影偏移量
- setSpinButtonRect ：旋转按钮所在父控件（圆盘）的位置信息
- getShadowAngle ： 旋钮旋转之后的回调函数

BoxShadowManager

- 实现 BoxShadowManagerInterface 接口
- getShadowAngle ：实时获取阴影偏移量
- getAngleByHorizontalAndVertical（工具方法） ：根据阴影的偏移量，返回角度
- getHorizontalAndVerticalAndPositionByAngle（工具方法） ： 根据角度和distance，返回阴影偏移量和拖拽圆点的坐标


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

## 工具方法：反向初始化angle

box.shadow.manager.ts 中的方法getAngleByHorizontalAndVertical：传入当前控件的阴影在水平方向（horizontal）和垂直方向（vertical）的设置，
返回当前角度（0-360），角度返回值做了向下取整处理。

```
示例：
const h = 10;
const v = 10;
const res = manager.getAngleByParameter({horizontal:h, vertical:v});
const final = `输入的控件(h：v) => (${h}:${v}) =>角度 ${res}`;
//处理其他业务逻辑

```

## 根据角度和distance获取实际阴影的偏移量和小圆点的坐标

box.shadow.manager.ts 提供的方法 getHorizontalAndVerticalAndPositionByAngle，可以获取阴影偏移量和拖拽圆点的坐标

```
示例：

manager.setSpinButtonRect(new DOMRect(10, 10, 20, 20));
manager.setSpinPointRect(new DOMRect(0, 0, 6, 6));
manager.distance = 30;
// 注意，一定要先传入 拖拽父控件的rect 和 圆点的rect
const res = manager.getHorizontalAndVerticalAndPositionByAngle(30, 10);
//处理其他业务逻辑


```
