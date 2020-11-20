# soid-ui-util

## Description

utils for ui render

## Grid Area

Use grid Area service to manage grid area.

### Get Dropped GridInfo

After set grid rect / grid row info / grid column info / drop rect, base grid row / column info get dropped grid info.

```typescript
const gridService: GridAreaService = GridAreaService.getInstance();
gridService
  .setWindowSize(1024, 768)
  .setParentGridSize(500, 400)
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
  .setGridRowInfo([
    {
      value: 20,
      unit: '%'
    }
  ])
  .setGridColumnInfo([
    {
      value: 20,
      unit: '%'
    }
  ])
  .adjustChildrenGridInfo();
```

### Get Grid Line List

If you want draw grid line, you can get grid line coordinates(eg: { fromX: 0; fromY: 0; toX: 100; toY: 0 }) to draw grid line

```typescript
const gridService: GridAreaService = GridAreaService.getInstance();
gridService
  .setWindowSize(1024, 768)
  .setParentGridSize(500, 400)
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
  .getGridLineList();
```

````HTML
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
````
