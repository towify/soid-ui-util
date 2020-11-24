/*
 * @author allen
 * @data 2020/11/23 22:51
 */
import { GridLineServiceInterface } from './grid.line.service.interface';
import { PaddingInfo, RectInfo } from '../../type/common.type';
import { GridManager } from '../../manager/gird.manager/grid.manager';
import { GridLineUtils } from '../../utils/grid.utils/grid.line.utils';

export class GridLineService implements GridLineServiceInterface {
  private static instance?: GridLineServiceInterface;

  #gridManager?: GridManager;

  static getInstance(): GridLineServiceInterface {
    GridLineService.instance ??= new GridLineService();
    return GridLineService.instance;
  }

  get gridManager(): GridManager {
    this.#gridManager ??= new GridManager();
    return this.#gridManager;
  }

  setWindowSize(width: number, height: number): GridLineServiceInterface {
    this.gridManager.setWindowSize(width, height);
    return this;
  }

  setGridSize(width: number, height: number): GridLineServiceInterface {
    this.gridManager.setGridSize(width, height);
    return this;
  }

  setGridRowInfo(
    info: { value: number; unit: string }[]
  ): GridLineServiceInterface {
    this.gridManager.setGridRowInfo(info);
    return this;
  }

  setGridColumnInfo(
    info: { value: number; unit: string }[]
  ): GridLineServiceInterface {
    this.gridManager.setGridColumnInfo(info);
    return this;
  }

  setGridInfo(
    row: { value: number; unit: string }[],
    column: { value: number; unit: string }[]
  ): GridLineServiceInterface {
    this.gridManager.setGridRowInfo(row);
    this.gridManager.setGridColumnInfo(column);
    return this;
  }

  setGridCount(params: {
    row: number;
    column: number;
    rowGap?: { value: number; unit: string };
    columnGap?: { value: number; unit: string };
  }): GridLineServiceInterface {
    this.gridManager.setGridCount(params);
    return this;
  }

  setGridPaddingInfo(info: PaddingInfo): GridLineServiceInterface {
    this.gridManager.setGridPaddingInfo(info);
    return this;
  }

  setGridGap(
    row: { value: number; unit: string },
    column: { value: number; unit: string }
  ): GridLineServiceInterface {
    this.gridManager.setGridGap(row, column);
    return this;
  }

  getGridLines(): { fromX: number; fromY: number; toX: number; toY: number }[] {
    return GridLineUtils.getGridLineList(
      this.gridManager.getGridItemRectList()
    );
  }

  getGridGapAreaAndLines(
    lineSpace: number
  ): {
    area: RectInfo[];
    lines: { fromX: number; fromY: number; toX: number; toY: number }[];
  } {
    return GridLineUtils.getGridGapAreaAndLine({
      gridItemRectList: this.gridManager.getGridItemRectList(),
      lineSpace
    });
  }

  getGridPaddingAreaAndLines(
    lineSpace: number
  ): {
    area: RectInfo[];
    lines: { fromX: number; fromY: number; toX: number; toY: number }[];
  } {
    if (!this.gridManager.gridSize) {
      console.error('SOID-UI-UTIL', 'GridAreaService', 'gridRect is undefined');
      return {
        area: [],
        lines: []
      };
    }
    return this.gridManager.getGridPaddingAreaAndLine(lineSpace);
  }
}
