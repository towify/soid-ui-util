# soid-ui-util

## Description

utils for ui render

## Grid Area

use grid Area service to manage grid area.

### Get Dropped GridInfo

after set grid rect / grid row info / grid column info / drop rect, base grid row / column info get dropped grid info

```typescript
const gridService: GridAreaService = GridAreaService.getInstance();
gridService
  .setWindowSize(1024, 768)
  .setGridRect(new DOMRect(0, 0, 400, 300))
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
  .setDroppedRect(new DOMRect(10, 20, 150, 100))
  .getDroppedGridInfo();
```

### Adjust Children Grid Info

after set grid children rect info, change grid row / column info , you can adjust children grid info

```typescript
gridService
  .setChildrenRectInfo([
    {
      id: '112421321321',
      gridArea: [1, 2, 2, 3],
      marginLeft: 10,
      marginTop: 10,
      width: 150,
      height: 100
    },
    {
      id: '112421321321',
      gridArea: [1, 2, 2, 3],
      marginLeft: 10,
      marginTop: 10,
      width: 150,
      height: 100
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
