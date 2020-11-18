/*
 * @author kaysaith
 * @date 2020/4/4 01:43
 */
import { GridAreaService } from './service/grid.area.service/grid.area.service';

export * from './service/grid.area.service/grid.area.service';
export * from './service/grid.area.service/grid.area.service.interface';
export * from './manager/box.shadow.manager/box.shadow.manager';
export * from './manager/box.shadow.manager/box.shadow.manager.interface';
export * from './manager/color.manager/color.manager.interface';
export * from './manager/color.manager/color.manager';
export * from './manager/color.manager/color.model';
export * from './manager/color.manager/solver.model';


GridAreaService.getInstance().setParentGridSize(500, 500);
GridAreaService.getInstance().setParentGridCount(2, 2);
GridAreaService.getInstance().setDroppedRect({
  x: 150.8,
  y: 200.35,
  width: 200,
  height: 200
});
const a = GridAreaService.getInstance().getDroppedGridInfo();
console.log(a, 'dropped rect');

const gridLineList = GridAreaService.getInstance().getGridLineList(false);
console.log(gridLineList, 'grid line');
