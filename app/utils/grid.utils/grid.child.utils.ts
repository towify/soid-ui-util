/*
 * @author allen
 * @data 2020/12/14 16:43
 */
import { GridArea, SizeUnit } from 'towify-editor-common-values';
import {
  DefaultGridArea, DefaultSizeInfo,
  GridChildInfo, RectInfo,
  SizeInfo
} from '../../type/common.type';
import { GridManager } from '../../manager/gird.manager/grid.manager';
import { ErrorUtils } from '../error.utils/error.utils';
import {UISizeUtils} from '../ui.size.utils/ui.size.utils';

export class GridChildUtils {
  static adjustChildGridInfo(params: {
    childInfo: GridChildInfo;
    margin: {
      marginLeft: number;
      marginTop: number;
    };
    childGridRect: RectInfo;
    gridArea: GridArea;
    rightOffset: number;
    bottomOffset: number;
    gridManager: GridManager;
  }): GridChildInfo {
    if (!params.childInfo.rect) return params.childInfo;
    if (!params.childInfo.placeSelf.justifySelf) {
      const marginLeft = params.gridManager.convertNumberToSizeInfo({
        valueNumber: params.margin.marginLeft,
        unit: params.childInfo.margin.left.unit,
        maxValue: params.childGridRect.width
      });
      const columnAutoNumber = params.gridManager.getGridAreaAutoNumber({
        start: params.gridArea.columnStart - 1,
        end: params.gridArea.columnEnd - 1,
        sizeInfoList: params.gridManager.gridColumnInfo
      });
      let marginRight;
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
      params.childInfo.margin.left = marginLeft;
      params.childInfo.margin.right = marginRight;
    }
    if (!params.childInfo.placeSelf.justifySelf) {
      const marginTop = params.gridManager.convertNumberToSizeInfo({
        valueNumber: params.margin.marginTop,
        unit: params.childInfo.margin.top.unit,
        maxValue: params.childGridRect.height
      });
      const rowAutoNumber = params.gridManager.getGridAreaAutoNumber({
        start: params.gridArea.rowStart - 1,
        end: params.gridArea.rowEnd - 1,
        sizeInfoList: params.gridManager.gridRowInfo
      });
      let marginBottom;
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
      params.childInfo.margin.top = marginTop;
      params.childInfo.margin.bottom = marginBottom;
    }
    params.childInfo.gridArea = params.gridArea;
    params.childInfo.size.width = UISizeUtils.convertSizeToParent({
      sizeInfo: params.childInfo.size.width,
      oldParentValue: params.childInfo.parentRect?.width ?? 0,
      newParentValue: params.childGridRect.width
    });
    params.childInfo.size.minWidth = UISizeUtils.convertSizeToParent({
      sizeInfo: params.childInfo.size.minWidth,
      oldParentValue: params.childInfo.parentRect?.width ?? 0,
      newParentValue: params.childGridRect.width
    });
    params.childInfo.size.maxWidth = UISizeUtils.convertSizeToParent({
      sizeInfo: params.childInfo.size.maxWidth,
      oldParentValue: params.childInfo.parentRect?.width ?? 0,
      newParentValue: params.childGridRect.width
    });
    params.childInfo.size.height = UISizeUtils.convertSizeToParent({
      sizeInfo: params.childInfo.size.height,
      oldParentValue: params.childInfo.parentRect?.height ?? 0,
      newParentValue: params.childGridRect.height
    });
    params.childInfo.size.minHeight = UISizeUtils.convertSizeToParent({
      sizeInfo: params.childInfo.size.minHeight,
      oldParentValue: params.childInfo.parentRect?.height ?? 0,
      newParentValue: params.childGridRect.height
    });
    params.childInfo.size.maxHeight = UISizeUtils.convertSizeToParent({
      sizeInfo: params.childInfo.size.maxHeight,
      oldParentValue: params.childInfo.parentRect?.height ?? 0,
      newParentValue: params.childGridRect.height
    });
    params.childInfo.parentRect = params.childGridRect;
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
        UISizeUtils.convertSizeInfoToNumber(
          childInfo.margin.top,
          childGridRect.height
        ) +
        UISizeUtils.convertSizeInfoToNumber(
          childInfo.margin.bottom,
          childGridRect.height
        ) +
        childInfo.rect.height;
      const rightOffset =
        UISizeUtils.convertSizeInfoToNumber(
          childInfo.margin.left,
          childGridRect.width
        ) +
        UISizeUtils.convertSizeInfoToNumber(
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
      childInfo.placeSelf.justifySelf = '';
      childInfo.placeSelf.alignSelf = '';
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
          size: DefaultSizeInfo,
          placeSelf: {
            justifySelf: '',
            alignSelf: ''
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
    let droppedOldParentRect: RectInfo | undefined;
    if (dropped.gridArea) {
      droppedOldParentRect = gridManager.convertChildSizeInfoToNumber({
        gridArea: dropped.gridArea,
        gridItemRectList
      });
    }
    const rectWidth = gridManager.convertSizeInfoToNumber({
      value: dropped.size.width,
      max: dropped.size.maxWidth,
      min: dropped.size.minWidth,
      maxValue: droppedOldParentRect?.width
    });
    const rectHeight = gridManager.convertSizeInfoToNumber({
      value: dropped.size.height,
      max: dropped.size.maxHeight,
      min: dropped.size.minHeight,
      maxValue: droppedOldParentRect?.height
    });
    const droppedRect = {
      x: dropped.x,
      y: dropped.y,
      width: rectWidth,
      height: rectHeight
    };
    const gridInfo = gridManager.getChildGridAreaInfoByRect({
      rect: droppedRect,
      gridItemRectList
    });
    const droppedParentRect = gridManager.convertChildSizeInfoToNumber({
      gridArea: gridInfo.gridArea,
      gridItemRectList
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
      placeSelf: {
        justifySelf: '',
        alignSelf: ''
      },
      size: {
        width: UISizeUtils.convertSizeToParent({
          sizeInfo: dropped.size.width,
          oldParentValue: droppedOldParentRect?.width ?? 0,
          newParentValue: droppedParentRect.width
        }),
        maxWidth: UISizeUtils.convertSizeToParent({
          sizeInfo: dropped.size.maxWidth,
          oldParentValue: droppedOldParentRect?.width ?? 0,
          newParentValue: droppedParentRect.width
        }),
        minWidth: UISizeUtils.convertSizeToParent({
          sizeInfo: dropped.size.minWidth,
          oldParentValue: droppedOldParentRect?.width ?? 0,
          newParentValue: droppedParentRect.width
        }),
        height: UISizeUtils.convertSizeToParent({
          sizeInfo: dropped.size.height,
          oldParentValue: droppedOldParentRect?.height ?? 0,
          newParentValue: droppedParentRect.height
        }),
        maxHeight: UISizeUtils.convertSizeToParent({
          sizeInfo: dropped.size.maxHeight,
          oldParentValue: droppedOldParentRect?.height ?? 0,
          newParentValue: droppedParentRect.height
        }),
        minHeight: UISizeUtils.convertSizeToParent({
          sizeInfo: dropped.size.minHeight,
          oldParentValue: droppedOldParentRect?.height ?? 0,
          newParentValue: droppedParentRect.height
        })
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
