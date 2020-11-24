# soid-ui-util

## Description

utils for ui render

## Grid Area

Use grid Area service to manage grid area.

### Get Dropped GridInfo

After set grid rect / grid row info / grid column info / drop rect, base grid row / column info get dropped grid info.

```typescript
const gridService = GridChildrenService.getInstance();
gridService
  .setWindowSize(1024, 768)
  .setParentGridSize(500, 400)
  .setParentGridRowInfo([
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
  ])
  .setDroppedInfo({
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
  })
  .getDroppedGridInfo();
```

### Adjust Children Grid Info

After set window size / parent grid size / grid row info / grid column info / grid children rect info and change grid row / column info , you can adjust children grid info.

```typescript
const gridService = GridChildrenService.getInstance();
gridService
  .setWindowSize(1024, 768)
  .setParentGridSize(500, 400)
  .setParentGridCount(2, 2)
  .setChildrenRectInfo([
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
  .setParentGridRowInfo([
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
const gridService = GridLineService.getInstance();
gridService
  .setWindowSize(1024, 768)
  .setGridSize(500, 400)
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
const gridService = GridLineService.getInstance();
gridService
  .setWindowSize(1024, 768)
  .setGridSize(500, 400)
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
const gridService = GridLineService.getInstance();
gridService
  .setWindowSize(1024, 768)
  .setGridSize(500, 400)
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
