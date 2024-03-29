[TOC]

# soid-ui-util

## Description

utils for ui render

- Color 颜色值管理

* Grid
* Shadow
* Operate
* ColorGradientUtils
* Size
* Number

## Install

This project uses `node` and `npm`.Go check them out if you don`t have them locally installed.

```
npm install soid-ui-util
```

## Usage

### 1.Color

颜色值管理

**ColorManager 中的方法：**

| 方法     | 说明                                           |
| -------- | ---------------------------------------------- |
| fromRgba | 通过 RGBA 形式的颜色值构建 ColorManager 实例   |
| fromHex  | 通过十六进制形式的颜色值构建 ColorManager 实例 |
| rgba     | 获取 RGBA 格式的颜色值                         |
| filter   | 转换颜色值                                     |

**使用示例**

```
// 导入 ColorManager
import { ColorManager } from 'soid-ui-util';

// 构建 ColorManager
const color = ColorManager.fromHex('#FFB6C1');
const color = ColorManager.fromRgba({red:225,green:182,blue:193,alpha:1});

// 获取 RGBA 颜色值
const rgbaColor = color.rgba;

// 转换颜色值
const filterColor = color.filter;
```

## Grid Service

Use grid service to manage grid info.

### Get Dropped GridInfo

After set grid rect / grid row info / grid column info / drop rect, base grid row / column info set dropped info , get dropped grid info

```typescript
const gridService = ComponentGridManager.getInstance();
const droppedInfo = gridService
  .setWindowSize(1024, 768)
  .setGridRect({
    x: 0,
    y: 0,
    width: 500,
    height: 400
  })
  .setGridRowInfo([
    {
      value: 20,
      unit: '%'
    },
    {
      value: 150,
      unit: 'px'
    }
  ])
  .setGridColumnInfo([
    {
      value: 20,
      unit: '%'
    },
    {
      value: 150,
      unit: 'px'
    }
  ])
  .setDroppedInfo({
    id: 'test',
    x: 10,
    y: 10,
    width: {
      value: 20,
      unit: '%'
    },
    height: {
      value: 200,
      unit: 'px'
    },
    gridArea: {
      rowStart: 1,
      columnStart: 1,
      rowEnd: 2,
      columnEnd: 2
    }
  });

if (droppedInfo.needUpdateGridChildren) {
  const childrenGridInfo = gridService.getModifiedChildrenGirdInfo();
}
```

### Update Child Grid Info

update child width / height / margin

```typescript
const gridService = ComponentGridManager.getInstance();
const isNeedUpdateGridChildren = gridService.updateChildInfoAndGetParentGridChildrenUpdateStatus(
  {
    id: 'test',
    x: 10,
    y: 10,
    width: {
      value: 20,
      unit: '%'
    },
    height: {
      value: 200,
      unit: 'px'
    },
    gridArea: {
      rowStart: 1,
      columnStart: 1,
      rowEnd: 2,
      columnEnd: 2
    }
  }
);

if (isNeedUpdateGridChildren) {
  const childrenGridInfo = gridService.getModifiedChildrenGirdInfo();
}
```

### Delete Child Grid Info

delete child grid

```typescript
const gridService = ComponentGridManager.getInstance();
const isNeedUpdateGridChildren = gridService.deleteChildByIdAndGetParentGridChildrenUpdateStatus(
  'test'
);

if (isNeedUpdateGridChildren) {
  const childrenGridInfo = gridService.getModifiedChildrenGirdInfo();
}
```

### Update Children Gird Info

After change grid gap \ grid padding \ children info, you can update children grid info.

```typescript
const gridService = ComponentGridManager.getInstance();
gridService.setGridGap({ value: 10, unit: 'px' }, { value: 10, unit: 'px' });

const childrenGridInfo = gridService.getModifiedChildrenGirdInfo();
```

### Adjust Children Grid Info

After change grid row / column info , you can adjust children grid info.

```typescript
const gridService = ComponentGridManager.getInstance();
gridService
  .setWindowSize(1024, 768)
  .setGridRect({
    x: 0,
    y: 0,
    width: 500,
    height: 400
  })
  .setGridCount(2, 2)
  .setChildrenGridInfo([
    {
      id: '1234',
      gridArea: [1, 1, 2, 2],
      marginLeft: {
        value: 200,
        unit: 'px'
      },
      marginTop: {
        value: 200,
        unit: 'px'
      },
      width: {
        value: 20,
        unit: '%'
      },
      height: {
        value: 200,
        unit: 'px'
      }
    }
  ])
  .setGridRowInfo([
    {
      value: 20,
      unit: '%'
    }
  ])
  .setParentGridColumnInfo([
    {
      value: 20,
      unit: '%'
    }
  ])
  .adjustChildrenGridInfo();
```

### Get Grid Lines

If you want draw grid lines, you can get grid lines coordinates(eg: { fromX: 0; fromY: 0; toX: 100; toY: 0 }) to draw grid line

```typescript
const gridService = ComponentGridManager.getInstance();
gridService
  .setWindowSize(1024, 768)
  .setGridRect({
    x: 0,
    y: 0,
    width: 500,
    height: 400
  })
  .setGridRowInfo([
    {
      value: 20,
      unit: '%'
    },
    {
      value: 150,
      unit: 'px'
    }
  ])
  .setParentGridColumnInfo([
    {
      value: 20,
      unit: '%'
    },
    {
      value: 150,
      unit: 'px'
    }
  ]);
const gridLineList = gridService.getGridLines();
```

```HTML
// draw line in angular eg:
<svg>
  <g>
    <line *ngFor="let line of gridLineList"
          [attr.x1]="line.fromX"
          [attr.x2]="line.toX"
          [attr.y1]="line.fromY"
          [attr.y2]="line.toY"
          [attr.stroke]="'#178df7'"
          [attr.stroke-width]="1"
          [attr.stroke-dasharray]="'4, 1'"></line>
  </g>
</svg>
```

### Get Grid Gap Area And Lines

If you want draw grid gap area and lines, you can get grid gap area rects and lines coordinates(eg: { fromX: 0; fromY: 0; toX: 100; toY: 0 })

```typescript
const gridService = ComponentGridManager.getInstance();
gridService
  .setWindowSize(1024, 768)
  .setGridRect({
    x: 0,
    y: 0,
    width: 500,
    height: 400
  })
  .setGridRowInfo([
    {
      value: 20,
      unit: '%'
    },
    {
      value: 150,
      unit: 'px'
    }
  ])
  .setGridColumnInfo([
    {
      value: 20,
      unit: '%'
    },
    {
      value: 150,
      unit: 'px'
    }
  ]);
const gridGapLines = gridService.getGridGapAreaAndLines(5).lines;
const gridGapArea = gridService.getGridGapAreaAndLines(5).area;
```

```HTML
// draw area and line in angular eg:
<line *ngFor="let line of gridGapLines"
          [attr.x1]="line.fromX"
          [attr.x2]="line.toX"
          [attr.y1]="line.fromY"
          [attr.y2]="line.toY"
          [attr.stroke]="'purple'"
          [attr.stroke-width]="0.5"
          [attr.stroke-dasharray]="'3, 2'"></line>

<rect *ngFor="let gapRect of gridGapArea"
          [attr.x]="gapRect.x"
          [attr.y]="gapRect.y"
          [attr.width]="gapRect.width"
          [attr.height]="gapRect.height"
          [attr.fill]="'purple'"
          fill-opacity="0.4"></rect>
```

### Get Grid Padding Area And Lines

If you want draw grid gap area and lines, you can get grid gap area rects and lines coordinates(eg: { fromX: 0; fromY: 0; toX: 100; toY: 0 })

```typescript
const gridService = ComponentGridManager.getInstance();
gridService
  .setWindowSize(1024, 768)
  .setGridRect({
    x: 0,
    y: 0,
    width: 500,
    height: 400
  })
  .setGridRowInfo([
    {
      value: 20,
      unit: '%'
    },
    {
      value: 150,
      unit: 'px'
    }
  ])
  .setGridColumnInfo([
    {
      value: 20,
      unit: '%'
    },
    {
      value: 150,
      unit: 'px'
    }
  ])
  .setGridPaddingInfo({
    left: {
      value: 20,
      unit: '%'
    },
    right: {
      value: 20,
      unit: '%'
    },
    top: {
      value: 20,
      unit: '%'
    },
    bottom: {
      value: 20,
      unit: '%'
    }
  });
const gridPaddingLines = gridService.getGridPaddingAreaAndLines(5).lines;
const gridPaddingArea = gridService.getGridPaddingAreaAndLines(5).area;
```

```HTML
// draw area and line in angular eg:
<line *ngFor="let line of gridPaddingLines"
          [attr.x1]="line.fromX"
          [attr.x2]="line.toX"
          [attr.y1]="line.fromY"
          [attr.y2]="line.toY"
          [attr.stroke]="'green'"
          [attr.stroke-width]="0.5"
          [attr.stroke-dasharray]="'3, 2'"></line>

<rect *ngFor="let paddingRect of gridPaddingArea"
          [attr.x]="paddingRect.x"
          [attr.y]="paddingRect.y"
          [attr.width]="paddingRect.width"
          [attr.height]="paddingRect.height"
          [attr.fill]="'green'"
          fill-opacity="0.4"></rect>
```

### Assist Line And Align Line

```typescript
const moveX = 100;
const moveY = 100;
const gridService = ComponentGridManager.getInstance();
gridService.startMovingChildById('testing');
gridService.movingChild({
  x: moveX,
  y: moveY
});

const alignAndAssistLineInfo = gridService.getAlignAndAssistLineInfo();
const { alignLines } = alignAndAssistLineInfo;
const { assistLines } = alignAndAssistLineInfo;
const { assistSigns } = alignAndAssistLineInfo;
const { offset } = alignAndAssistLineInfo;
```

```HTML
// draw area and line in angular eg:
<line *ngFor="let line of alignLines"
            [attr.x1]="line.fromX"
            [attr.x2]="line.toX"
            [attr.y1]="line.fromY"
            [attr.y2]="line.toY"
            [attr.stroke]="'red'"
            [attr.stroke-width]="1"
            [attr.stroke-dasharray]="'3, 2'"></line>

<line *ngFor="let line of assistLines"
            [attr.x1]="line.fromX"
            [attr.x2]="line.toX"
            [attr.y1]="line.fromY"
            [attr.y2]="line.toY"
            [attr.stroke]="'white'"
            [attr.stroke-width]="1"
            [attr.stroke-dasharray]="'3, 2'"></line>

<text *ngFor="let sign of assistSigns"
            text-anchor="middle"
            [attr.stroke]="'white'"
            [attr.x]="sign.x"
            [attr.y]="sign.y"
            [attr.font-size]="10">{{sign.sign}}</text>
```

## Operator Service

Use operator service to manage you handle

```typescript
const operatorService = OperatorService.getInstance();
operatorService.minDistance = 10;
operatorService
  .setPageContainerRectList([
    {
      x: 0,
      y: 0,
      width: 100,
      height: 100
    }
  ])
  .setParentRect({
    x: 50,
    y: 50,
    width: 100,
    height: 100
  })
  .setOperatorSize(50, 20);
const operatorRect = operatorService.getOperatorRect();
```
