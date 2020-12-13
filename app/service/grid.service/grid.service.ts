/*
 * @author allen
 * @data 2020/11/23 22:24
 */
import {
  CustomGrid,
  GridArea,
  GridGap,
  SizeUnit,
  SpacingPadding,
  UISize
} from 'towify-editor-common-values';
import { GridServiceInterface } from './grid.service.interface';
import {
  DefaultGridArea,
  GridChildInfo,
  RectInfo,
  SizeInfo
} from '../../type/common.type';
import { GridManager } from '../../manager/gird.manager/grid.manager';
import { GridLineUtils } from '../../utils/grid.utils/grid.line.utils';
import { ErrorUtils } from '../../utils/error.utils/error.utils';
import { WindowUtils } from '../../utils/window.utils/window.utils';

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
    WindowUtils.WindowSize = {
      width,
      height
    };
    return this;
  }

  setGridSize(width: number, height: number): GridServiceInterface {
    this.gridManager.setGridSize(width, height);
    return this;
  }

  setGridColumnInfo(info: UISize[]): GridServiceInterface {
    this.gridManager.setGridColumnInfo(info);
    return this;
  }

  setGridRowInfo(info: UISize[]): GridServiceInterface {
    this.gridManager.setGridRowInfo(info);
    return this;
  }

  setGridInfo(info: CustomGrid): GridServiceInterface {
    this.gridManager.setGridColumnInfo(info.column);
    this.gridManager.setGridRowInfo(info.row);
    return this;
  }

  setGridCount(params: {
    row: number;
    column: number;
    gap?: GridGap;
  }): GridServiceInterface {
    this.gridManager.setGridCount(params);
    return this;
  }

  setGridGap(gap: GridGap): GridServiceInterface {
    this.gridManager.setGap(gap);
    return this;
  }

  setGridPaddingInfo(padding: SpacingPadding): GridServiceInterface {
    this.gridManager.setPadding(padding);
    return this;
  }

  setGridBorderInfo(border: SpacingPadding): GridServiceInterface {
    this.gridManager.setBorder(border);
    return this;
  }

  setChildrenGridInfo(childrenInfo: GridChildInfo[]): GridServiceInterface {
    if (!this.gridManager.gridSize) {
      ErrorUtils.GridError('GridSize is undefined');
      return this;
    }
    this.gridManager.setChildrenInfo(childrenInfo);
    const gridItemRectList = this.gridManager.getGridItemRectList();
    this.gridManager.childInfoList.forEach(childInfo => {
      this.gridManager.updateChildRect(childInfo, gridItemRectList);
    });
    return this;
  }

  setDroppedInfo(dropped: {
    id: string;
    x: number;
    y: number;
    size: SizeInfo;
    gridArea?: GridArea;
  }): {
    info: GridChildInfo;
    needUpdateGridChildren: boolean;
  } {
    if (!this.gridManager.gridSize) {
      ErrorUtils.GridError('GridSize is undefined');
      return {
        info: {
          id: dropped.id,
          gridArea: DefaultGridArea,
          size: {
            width: { value: 0, unit: SizeUnit.PX },
            height: { value: 0, unit: SizeUnit.PX }
          },
          margin: {
            left: { value: 0, unit: SizeUnit.PX },
            right: { value: 0, unit: SizeUnit.PX },
            top: { value: 0, unit: SizeUnit.PX },
            bottom: { value: 0, unit: SizeUnit.PX }
          }
        },
        needUpdateGridChildren: false
      };
    }
    const childIndex = this.gridManager.childInfoList.findIndex(
      childInfo => childInfo.id === dropped.id
    );
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
        dropped.size.width,
        droppedParentRect.width
      );
      droppedRect.height = this.gridManager.convertSizeInfoToNumber(
        dropped.size.height,
        droppedParentRect.height
      );
    } else {
      droppedRect.width = this.gridManager.convertSizeInfoToNumber(
        dropped.size.width
      );
      droppedRect.height = this.gridManager.convertSizeInfoToNumber(
        dropped.size.height
      );
    }
    const gridInfo = this.gridManager.getChildGridAreaInfoByRect({
      rect: droppedRect,
      gridItemRectList
    });
    const droppedParentRect = this.gridManager.convertChildSizeInfoToNumber({
      gridArea: gridInfo.gridArea,
      gridItemRectList
    });
    const width = this.gridManager.convertNumberToSizeInfo({
      valueNumber: droppedRect.width,
      unit: dropped.size.width.unit,
      maxValue: droppedParentRect.width
    });
    const height = this.gridManager.convertNumberToSizeInfo({
      valueNumber: droppedRect.height,
      unit: dropped.size.height.unit,
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
    const droppedInfo = {
      id: dropped.id,
      gridArea: gridInfo.gridArea,
      margin: {
        top: { value: gridInfo.marginTop, unit: SizeUnit.PX },
        left: { value: gridInfo.marginLeft, unit: SizeUnit.PX },
        right: { value: marginRight, unit: SizeUnit.PX },
        bottom: { value: marginBottom, unit: SizeUnit.PX }
      },
      size: {
        width,
        height
      }
    };
    this.gridManager.childInfoList.push(
      this.gridManager.updateChildRect(droppedInfo, gridItemRectList)
    );
    return {
      info: droppedInfo,
      needUpdateGridChildren: this.gridManager.needUpdateGridChildren()
    };
  }

  deleteChildByIdAndGetParentGridChildrenUpdateStatus(
    childId: string
  ): boolean {
    const childIndex = this.gridManager.childInfoList.findIndex(
      childInfo => childInfo.id === childId
    );
    if (childIndex !== -1) {
      this.gridManager.childInfoList.splice(childIndex, 1);
    }
    return this.gridManager.needUpdateGridChildren();
  }

  updateChildInfoAndGetParentGridChildrenUpdateStatus(
    child: GridChildInfo
  ): boolean {
    const updateChildInfo = this.gridManager.childInfoList.find(
      childInfo => childInfo.id === child.id
    );
    if (updateChildInfo) {
      updateChildInfo.gridArea = child.gridArea;
      updateChildInfo.margin = child.margin;
      updateChildInfo.size = child.size;
      const gridItemRectList = this.gridManager.getGridItemRectList();
      this.gridManager.updateChildRect(updateChildInfo, gridItemRectList);
    }
    return this.gridManager.needUpdateGridChildren();
  }

  adjustChildrenAndResetAutoGridInfo(): GridChildInfo[] {
    if (!this.gridManager.gridSize) {
      ErrorUtils.GridError('GridSize is undefined');
      return [];
    }
    if (!this.gridManager.childInfoList.length) return [];
    const gridItemRectList = this.gridManager.getGridItemRectList(false);
    let areaInfo: {
      gridArea: GridArea;
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
      areaInfo = this.gridManager.getChildGridAreaInfoByRect({
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

  getModifiedChildrenGirdInfo(): GridChildInfo[] {
    if (!this.gridManager.gridSize || !this.gridManager.childInfoList.length) {
      ErrorUtils.GridError('GridSize is undefined');
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
          childInfo.margin.top,
          childGridRect.height
        ) +
        this.gridManager.convertSizeInfoToNumber(
          childInfo.margin.bottom,
          childGridRect.height
        ) +
        childInfo.rect.height;
      const rightOffset =
        this.gridManager.convertSizeInfoToNumber(
          childInfo.margin.left,
          childGridRect.width
        ) +
        this.gridManager.convertSizeInfoToNumber(
          childInfo.margin.right,
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
      ErrorUtils.GridError('GridSize is undefined');
      return {
        area: [],
        lines: []
      };
    }
    return GridLineUtils.getGridPaddingAreaAndLine({
      gridPadding: this.gridManager.padding,
      border: this.gridManager.border,
      gridSize: this.gridManager.gridSize,
      lineSpace
    });
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
    gridArea: GridArea;
    rightOffset: number;
    bottomOffset: number;
  }): GridChildInfo {
    if (!params.childInfo.rect) return params.childInfo;
    const marginLeft = this.gridManager.convertNumberToSizeInfo({
      valueNumber: params.areaInfo.marginLeft,
      unit: params.childInfo.margin.left.unit,
      maxValue: params.childGridRect.width
    });
    const marginTop = this.gridManager.convertNumberToSizeInfo({
      valueNumber: params.areaInfo.marginTop,
      unit: params.childInfo.margin.top.unit,
      maxValue: params.childGridRect.height
    });
    const width = this.gridManager.convertNumberToSizeInfo({
      valueNumber: params.childInfo.rect.width,
      unit: params.childInfo.size.width.unit,
      maxValue: params.childGridRect.width
    });
    const height = this.gridManager.convertNumberToSizeInfo({
      valueNumber: params.childInfo.rect.height,
      unit: params.childInfo.size.height.unit,
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
        unit: params.childInfo.margin.bottom.unit,
        maxValue: params.childGridRect.height
      });
    } else {
      marginBottom = {
        value: 0,
        unit: params.childInfo.margin.bottom.unit
      };
    }
    if (columnAutoNumber) {
      const rightValueNumber =
        params.rightOffset -
        params.areaInfo.marginLeft -
        params.childInfo.rect.width;
      marginRight = this.gridManager.convertNumberToSizeInfo({
        valueNumber: rightValueNumber,
        unit: params.childInfo.margin.right.unit,
        maxValue: params.childGridRect.width
      });
    } else {
      marginRight = {
        value: 0,
        unit: params.childInfo.margin.right.unit
      };
    }
    params.childInfo.gridArea = params.gridArea;
    params.childInfo.margin.left = marginLeft;
    params.childInfo.margin.right = marginRight;
    params.childInfo.margin.top = marginTop;
    params.childInfo.margin.bottom = marginBottom;
    params.childInfo.size.width = width;
    params.childInfo.size.height = height;
    return params.childInfo;
  }
}
