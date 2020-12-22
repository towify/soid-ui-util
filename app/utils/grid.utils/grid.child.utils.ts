/*
 * @author allen
 * @data 2020/12/14 16:43
 */
import { GridArea, SizeUnit } from 'towify-editor-common-values';
import {
  DefaultGridArea,
  GridChildInfo,
  SizeInfo
} from '../../type/common.type';
import { GridManager } from '../../manager/gird.manager/grid.manager';
import { ErrorUtils } from '../error.utils/error.utils';

export class GridChildUtils {
  static adjustChildGridInfo(params: {
    childInfo: GridChildInfo;
    margin: {
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
    gridManager: GridManager;
  }): GridChildInfo {
    if (!params.childInfo.rect) return params.childInfo;
    const marginLeft = params.gridManager.convertNumberToSizeInfo({
      valueNumber: params.margin.marginLeft,
      unit: params.childInfo.margin.left.unit,
      maxValue: params.childGridRect.width
    });
    const marginTop = params.gridManager.convertNumberToSizeInfo({
      valueNumber: params.margin.marginTop,
      unit: params.childInfo.margin.top.unit,
      maxValue: params.childGridRect.height
    });
    const width = params.gridManager.convertNumberToSizeInfo({
      valueNumber: params.childInfo.rect.width,
      unit: params.childInfo.size.width.unit,
      maxValue: params.childGridRect.width
    });
    const height = params.gridManager.convertNumberToSizeInfo({
      valueNumber: params.childInfo.rect.height,
      unit: params.childInfo.size.height.unit,
      maxValue: params.childGridRect.height
    });
    const rowAutoNumber = params.gridManager.getGridAreaAutoNumber({
      start: params.gridArea.rowStart - 1,
      end: params.gridArea.rowEnd - 1,
      sizeInfoList: params.gridManager.gridRowInfo
    });
    const columnAutoNumber = params.gridManager.getGridAreaAutoNumber({
      start: params.gridArea.columnStart - 1,
      end: params.gridArea.columnEnd - 1,
      sizeInfoList: params.gridManager.gridColumnInfo
    });
    let marginBottom;
    let marginRight;
    if (rowAutoNumber) {
      const bottomValueNumber =
        params.bottomOffset -
        params.margin.marginTop -
        params.childInfo.rect.height;
      marginBottom = params.gridManager.convertNumberToSizeInfo({
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
        params.margin.marginLeft -
        params.childInfo.rect.width;
      marginRight = params.gridManager.convertNumberToSizeInfo({
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

  static getModifiedChildrenGirdInfo(
    gridManager: GridManager
  ): GridChildInfo[] {
    const gridItemRectList = gridManager.getGridItemRectList();
    let margin: {
      marginLeft: number;
      marginTop: number;
    };
    let childGridRect: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    return gridManager.childInfoList.map(childInfo => {
      if (!childInfo.rect) return childInfo;
      margin = gridManager.getGridMarginInfoByRect({
        rect: childInfo.rect,
        gridArea: childInfo.gridArea,
        gridItemRectList
      });
      childGridRect = gridManager.convertChildSizeInfoToNumber({
        gridArea: childInfo.gridArea,
        gridItemRectList
      });
      const bottomOffset =
        gridManager.convertSizeInfoToNumber(
          childInfo.margin.top,
          childGridRect.height
        ) +
        gridManager.convertSizeInfoToNumber(
          childInfo.margin.bottom,
          childGridRect.height
        ) +
        childInfo.rect.height;
      const rightOffset =
        gridManager.convertSizeInfoToNumber(
          childInfo.margin.left,
          childGridRect.width
        ) +
        gridManager.convertSizeInfoToNumber(
          childInfo.margin.right,
          childGridRect.width
        ) +
        childInfo.rect.width;
      return GridChildUtils.adjustChildGridInfo({
        childInfo,
        childGridRect,
        margin,
        gridArea: childInfo.gridArea,
        bottomOffset,
        rightOffset,
        gridManager
      });
    });
  }

  static adjustChildrenAndResetAutoGridInfo(
    gridManager: GridManager
  ): GridChildInfo[] {
    const gridItemRectList = gridManager.getGridItemRectList(false);
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
    return gridManager.childInfoList.map(childInfo => {
      if (!childInfo.rect) return childInfo;
      areaInfo = gridManager.getChildGridAreaInfoByRect({
        rect: childInfo.rect,
        gridItemRectList
      });
      childGridRect = gridManager.convertChildSizeInfoToNumber({
        gridArea: areaInfo.gridArea,
        gridItemRectList
      });
      return GridChildUtils.adjustChildGridInfo({
        childInfo,
        margin: areaInfo,
        gridArea: areaInfo.gridArea,
        childGridRect,
        rightOffset: 0,
        bottomOffset: 0,
        gridManager
      });
    });
  }

  static setDroppedInfo(
    dropped: {
      id: string;
      x: number;
      y: number;
      size: SizeInfo;
      gridArea?: GridArea;
    },
    gridManager: GridManager
  ): {
    info: GridChildInfo;
    needUpdateGridChildren: boolean;
  } {
    if (!gridManager.activeStatus) {
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
    const childIndex = gridManager.childInfoList.findIndex(
      childInfo => childInfo.id === dropped.id
    );
    if (childIndex !== -1) {
      gridManager.childInfoList.splice(childIndex, 1);
    }
    const gridItemRectList = gridManager.getGridItemRectList();
    const droppedRect = {
      x: dropped.x,
      y: dropped.y,
      width: 0,
      height: 0
    };
    if (dropped.gridArea) {
      const droppedParentRect = gridManager.convertChildSizeInfoToNumber({
        gridArea: dropped.gridArea,
        gridItemRectList
      });
      droppedRect.width = gridManager.convertSizeInfoToNumber(
        dropped.size.width,
        droppedParentRect.width
      );
      droppedRect.height = gridManager.convertSizeInfoToNumber(
        dropped.size.height,
        droppedParentRect.height
      );
    } else {
      droppedRect.width = gridManager.convertSizeInfoToNumber(
        dropped.size.width
      );
      droppedRect.height = gridManager.convertSizeInfoToNumber(
        dropped.size.height
      );
    }
    const gridInfo = gridManager.getChildGridAreaInfoByRect({
      rect: droppedRect,
      gridItemRectList
    });
    const droppedParentRect = gridManager.convertChildSizeInfoToNumber({
      gridArea: gridInfo.gridArea,
      gridItemRectList
    });
    const width = gridManager.convertNumberToSizeInfo({
      valueNumber: droppedRect.width,
      unit: dropped.size.width.unit,
      maxValue: droppedParentRect.width
    });
    const height = gridManager.convertNumberToSizeInfo({
      valueNumber: droppedRect.height,
      unit: dropped.size.height.unit,
      maxValue: droppedParentRect.height
    });
    const rowAutoNumber = gridManager.getGridAreaAutoNumber({
      start: gridInfo.gridArea.rowStart - 1,
      end: gridInfo.gridArea.rowEnd - 1,
      sizeInfoList: gridManager.gridRowInfo
    });
    const columnAutoNumber = gridManager.getGridAreaAutoNumber({
      start: gridInfo.gridArea.columnStart - 1,
      end: gridInfo.gridArea.columnEnd - 1,
      sizeInfoList: gridManager.gridColumnInfo
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
    gridManager.childInfoList.push(
      gridManager.updateChildRect(droppedInfo, gridItemRectList)
    );
    return {
      info: droppedInfo,
      needUpdateGridChildren: gridManager.needUpdateGridChildren()
    };
  }
}
