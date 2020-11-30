/*
 * @author allen
 * @data 2020/11/23 22:24
 */
import { GridServiceInterface } from './grid.service.interface';
import {
  GridAreaInfo,
  GridChildInfo,
  PaddingInfo,
  RectInfo
} from '../../type/common.type';
import { GridManager } from '../../manager/gird.manager/grid.manager';
import { GridLineUtils } from '../../utils/grid.utils/grid.line.utils';
import { GridUtils } from '../../utils/grid.utils/grid.utils';

export class GridService implements GridServiceInterface {
  private static instance?: GridServiceInterface;

  #gridManager?: GridManager;

  static getInstance(): GridServiceInterface {
    GridService.instance ??= new GridService();
    return GridService.instance;
  }

  get gridManager(): GridManager {
    this.#gridManager ??= new GridManager();
    return this.#gridManager;
  }

  setWindowSize(width: number, height: number): GridServiceInterface {
    this.gridManager.setWindowSize(width, height);
    return this;
  }

  setGridSize(width: number, height: number): GridServiceInterface {
    this.gridManager.setGridSize(width, height);
    return this;
  }

  setGridColumnInfo(
    info: { value: number; unit: string }[]
  ): GridServiceInterface {
    this.gridManager.setGridColumnInfo(info);
    return this;
  }

  setGridRowInfo(
    info: { value: number; unit: string }[]
  ): GridServiceInterface {
    this.gridManager.setGridRowInfo(info);
    return this;
  }

  setGridInfo(
    row: { value: number; unit: string }[],
    column: { value: number; unit: string }[]
  ): GridServiceInterface {
    this.gridManager.setGridColumnInfo(column);
    this.gridManager.setGridRowInfo(row);
    return this;
  }

  setGridCount(params: {
    row: number;
    column: number;
    rowGap?: { value: number; unit: string };
    columnGap?: { value: number; unit: string };
  }): GridServiceInterface {
    this.gridManager.setGridCount(params);
    return this;
  }

  setGridGap(
    row: { value: number; unit: string },
    column: { value: number; unit: string }
  ): GridServiceInterface {
    this.gridManager.setGridGap(row, column);
    return this;
  }

  setGridPaddingInfo(padding: PaddingInfo): GridServiceInterface {
    this.gridManager.setGridPaddingInfo(padding);
    return this;
  }

  setChildrenGridInfo(childrenInfo: GridChildInfo[]): GridServiceInterface {
    if (!this.gridManager.gridSize) {
      console.error('SOID-UI-UTIL', 'GridAreaService', 'gridRect is undefined');
      return this;
    }
    this.gridManager.childInfoList = childrenInfo;
    const gridItemRectList = this.gridManager.getGridItemRectList();
    this.gridManager.childInfoList.forEach(childInfo => {
      this.getChildRect(childInfo, gridItemRectList);
    });
    return this;
  }

  droppedChild(dropped: {
    id: string;
    x: number;
    y: number;
    width: { value: number; unit: string };
    height: { value: number; unit: string };
    gridArea?: GridAreaInfo;
  }): GridChildInfo {
    if (!this.gridManager.gridSize) {
      console.error('SOID-UI-UTIL', 'GridAreaService', 'gridRect is undefined');
      return {
        id: dropped.id,
        gridArea: {
          rowStart: 1,
          columnStart: 1,
          rowEnd: 2,
          columnEnd: 2
        },
        marginLeft: { value: 0, unit: 'px' },
        marginTop: { value: 0, unit: 'px' },
        marginRight: { value: 0, unit: 'px' },
        marginBottom: { value: 0, unit: 'px' },
        width: { value: 0, unit: 'px' },
        height: { value: 0, unit: 'px' }
      };
    }
    const childIndex = this.gridManager.childInfoList.findIndex(childInfo => {
      if (childInfo.id === dropped.id) {
        return true;
      }
      return false;
    });
    if (childIndex !== -1) {
      this.gridManager.childInfoList.splice(childIndex, 1);
    }
    const gridItemRectList = this.gridManager.getGridItemRectList();
    const droppedRect = {
      x: dropped.x,
      y: dropped.y,
      width: 0,
      height: 0
    };
    if (dropped.gridArea) {
      const droppedParentRect = this.gridManager.convertChildSizeInfoToNumber({
        gridArea: dropped.gridArea,
        gridItemRectList
      });
      droppedRect.width = this.gridManager.convertSizeInfoToNumber(
        dropped.width,
        droppedParentRect.width
      );
      droppedRect.height = this.gridManager.convertSizeInfoToNumber(
        dropped.height,
        droppedParentRect.height
      );
    } else {
      droppedRect.width = this.gridManager.convertSizeInfoToNumber(
        dropped.width
      );
      droppedRect.height = this.gridManager.convertSizeInfoToNumber(
        dropped.height
      );
    }
    const gridInfo = this.gridManager.getGridAreaInfoByRect({
      rect: droppedRect,
      gridItemRectList
    });
    const droppedParentRect = this.gridManager.convertChildSizeInfoToNumber({
      gridArea: gridInfo.gridArea,
      gridItemRectList
    });
    const width = this.gridManager.convertNumberToSizeInfo({
      valueNumber: droppedRect.width,
      unit: dropped.width.unit,
      maxValue: droppedParentRect.width
    });
    const height = this.gridManager.convertNumberToSizeInfo({
      valueNumber: droppedRect.height,
      unit: dropped.height.unit,
      maxValue: droppedParentRect.height
    });
    const rowAutoNumber = this.gridManager.getGridAreaAutoNumber({
      start: gridInfo.gridArea.rowStart - 1,
      end: gridInfo.gridArea.rowEnd - 1,
      sizeInfoList: this.gridManager.gridRowInfo
    });
    const columnAutoNumber = this.gridManager.getGridAreaAutoNumber({
      start: gridInfo.gridArea.columnStart - 1,
      end: gridInfo.gridArea.columnEnd - 1,
      sizeInfoList: this.gridManager.gridColumnInfo
    });
    let marginBottom = 0;
    if (rowAutoNumber) {
      marginBottom = 0 - gridInfo.marginTop - droppedRect.height;
    }
    let marginRight = 0;
    if (columnAutoNumber) {
      marginRight = 0 - gridInfo.marginLeft - droppedRect.width;
    }
    const droppedInfo: GridChildInfo = {
      id: dropped.id,
      gridArea: gridInfo.gridArea,
      marginTop: { value: gridInfo.marginTop, unit: GridUtils.PXUnit },
      marginLeft: { value: gridInfo.marginLeft, unit: GridUtils.PXUnit },
      marginRight: { value: marginRight, unit: GridUtils.PXUnit },
      marginBottom: { value: marginBottom, unit: GridUtils.PXUnit },
      width,
      height
    };
    this.gridManager.childInfoList.push(
      this.getChildRect(droppedInfo, gridItemRectList)
    );
    return droppedInfo;
  }

  deleteChild(childId: string): GridServiceInterface {
    const childIndex = this.gridManager.childInfoList.findIndex(childInfo => {
      if (childInfo.id === childId) {
        return true;
      }
      return false;
    });
    if (childIndex !== -1) {
      this.gridManager.childInfoList.splice(childIndex, 1);
    }
    return this;
  }

  updateChild(child: GridChildInfo): GridServiceInterface {
    const childIndex = this.gridManager.childInfoList.findIndex(childInfo => {
      if (childInfo.id === child.id) {
        return true;
      }
      return false;
    });
    if (childIndex !== -1) {
      const updateChildInfo = this.gridManager.childInfoList[childIndex];
      updateChildInfo.gridArea = child.gridArea;
      updateChildInfo.marginLeft = child.marginLeft;
      updateChildInfo.marginTop = child.marginTop;
      updateChildInfo.marginRight = child.marginRight;
      updateChildInfo.marginBottom = child.marginBottom;
      updateChildInfo.width = child.width;
      updateChildInfo.height = child.height;
      const gridItemRectList = this.gridManager.getGridItemRectList();
      this.gridManager.childInfoList[childIndex] = this.getChildRect(
        updateChildInfo,
        gridItemRectList
      );
    }
    return this;
  }

  adjustChildrenGridInfo(): GridChildInfo[] {
    if (!this.gridManager.gridSize || !this.gridManager.childInfoList.length) {
      console.error('SOID-UI-UTIL', 'GridAreaService', 'gridRect is undefined');
      return [];
    }
    const gridItemRectList = this.gridManager.getGridItemRectList(false);
    let areaInfo: {
      gridArea: GridAreaInfo;
      marginLeft: number;
      marginTop: number;
    };
    let childGridRect: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    return this.gridManager.childInfoList.map(childInfo => {
      if (!childInfo.rect) return childInfo;
      areaInfo = this.gridManager.getGridAreaInfoByRect({
        rect: childInfo.rect,
        gridItemRectList
      });
      childGridRect = this.gridManager.convertChildSizeInfoToNumber({
        gridArea: areaInfo.gridArea,
        gridItemRectList
      });
      return this.adjustChildGridInfo({
        childInfo,
        areaInfo,
        gridArea: areaInfo.gridArea,
        childGridRect,
        rightOffset: 0,
        bottomOffset: 0
      });
    });
  }

  updateChildrenGirdInfo(): GridChildInfo[] {
    if (!this.gridManager.gridSize || !this.gridManager.childInfoList.length) {
      console.error('SOID-UI-UTIL', 'GridAreaService', 'gridRect is undefined');
      return [];
    }
    const gridItemRectList = this.gridManager.getGridItemRectList();
    let areaInfo: {
      marginLeft: number;
      marginTop: number;
    };
    let childGridRect: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    return this.gridManager.childInfoList.map(childInfo => {
      if (!childInfo.rect) return childInfo;
      areaInfo = this.gridManager.getGridMarginInfoByRect({
        rect: childInfo.rect,
        gridArea: childInfo.gridArea,
        gridItemRectList
      });
      childGridRect = this.gridManager.convertChildSizeInfoToNumber({
        gridArea: childInfo.gridArea,
        gridItemRectList
      });
      const bottomOffset =
        this.gridManager.convertSizeInfoToNumber(
          childInfo.marginTop,
          childGridRect.height
        ) +
        this.gridManager.convertSizeInfoToNumber(
          childInfo.marginBottom,
          childGridRect.height
        ) +
        childInfo.rect.height;
      const rightOffset =
        this.gridManager.convertSizeInfoToNumber(
          childInfo.marginLeft,
          childGridRect.width
        ) +
        this.gridManager.convertSizeInfoToNumber(
          childInfo.marginRight,
          childGridRect.width
        ) +
        childInfo.rect.width;
      return this.adjustChildGridInfo({
        childInfo,
        childGridRect,
        areaInfo,
        gridArea: childInfo.gridArea,
        bottomOffset,
        rightOffset
      });
    });
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

  private getChildRect(
    child: GridChildInfo,
    gridItemRectList: RectInfo[][]
  ): GridChildInfo {
    const childGridRect = this.gridManager.convertChildSizeInfoToNumber({
      gridArea: child.gridArea,
      gridItemRectList
    });
    const childWidth = this.gridManager.convertSizeInfoToNumber(
      child.width,
      childGridRect.width
    );
    const childHeight = this.gridManager.convertSizeInfoToNumber(
      child.height,
      childGridRect.height
    );
    const childX =
      childGridRect.x +
      this.gridManager.convertSizeInfoToNumber(
        child.marginLeft,
        childGridRect.width
      );
    const childY =
      childGridRect.y +
      this.gridManager.convertSizeInfoToNumber(
        child.marginTop,
        childGridRect.height
      );
    child.rect = {
      x: childX,
      y: childY,
      width: childWidth,
      height: childHeight
    };
    return child;
  }

  private adjustChildGridInfo(params: {
    childInfo: GridChildInfo;
    areaInfo: {
      marginLeft: number;
      marginTop: number;
    };
    childGridRect: {
      width: number;
      height: number;
    };
    gridArea: GridAreaInfo;
    rightOffset: number;
    bottomOffset: number;
  }): GridChildInfo {
    if (!params.childInfo.rect) return params.childInfo;
    const marginLeft = this.gridManager.convertNumberToSizeInfo({
      valueNumber: params.areaInfo.marginLeft,
      unit: params.childInfo.marginLeft.unit,
      maxValue: params.childGridRect.width
    });
    const marginTop = this.gridManager.convertNumberToSizeInfo({
      valueNumber: params.areaInfo.marginTop,
      unit: params.childInfo.marginTop.unit,
      maxValue: params.childGridRect.height
    });
    const width = this.gridManager.convertNumberToSizeInfo({
      valueNumber: params.childInfo.rect.width,
      unit: params.childInfo.width.unit,
      maxValue: params.childGridRect.width
    });
    const height = this.gridManager.convertNumberToSizeInfo({
      valueNumber: params.childInfo.rect.height,
      unit: params.childInfo.height.unit,
      maxValue: params.childGridRect.height
    });
    const rowAutoNumber = this.gridManager.getGridAreaAutoNumber({
      start: params.gridArea.rowStart - 1,
      end: params.gridArea.rowEnd - 1,
      sizeInfoList: this.gridManager.gridRowInfo
    });
    const columnAutoNumber = this.gridManager.getGridAreaAutoNumber({
      start: params.gridArea.columnStart - 1,
      end: params.gridArea.columnEnd - 1,
      sizeInfoList: this.gridManager.gridColumnInfo
    });
    let marginBottom;
    let marginRight;
    if (rowAutoNumber) {
      const bottomValueNumber =
        params.bottomOffset -
        params.areaInfo.marginTop -
        params.childInfo.rect.height;
      marginBottom = this.gridManager.convertNumberToSizeInfo({
        valueNumber: bottomValueNumber,
        unit: params.childInfo.marginBottom.unit,
        maxValue: params.childGridRect.height
      });
    } else {
      marginBottom = {
        value: 0,
        unit: params.childInfo.marginBottom.unit
      };
    }
    if (columnAutoNumber) {
      const rightValueNumber =
        params.rightOffset -
        params.areaInfo.marginLeft -
        params.childInfo.rect.width;
      marginRight = this.gridManager.convertNumberToSizeInfo({
        valueNumber: rightValueNumber,
        unit: params.childInfo.marginRight.unit,
        maxValue: params.childGridRect.width
      });
    } else {
      marginRight = {
        value: 0,
        unit: params.childInfo.marginRight.unit
      };
    }
    params.childInfo.gridArea = params.gridArea;
    params.childInfo.marginLeft = marginLeft;
    params.childInfo.marginRight = marginRight;
    params.childInfo.marginTop = marginTop;
    params.childInfo.marginBottom = marginBottom;
    params.childInfo.width = width;
    params.childInfo.height = height;
    return params.childInfo;
  }
}
