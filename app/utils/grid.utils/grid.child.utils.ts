/*
 * @author allen
 * @data 2020/12/14 16:43
 */
import { GridArea, SizeUnit } from '@towify/common-values';
import { GridChildInfo, RectInfo, SizeInfo, UnsetUnit } from '../../type/common.type';
import { GridMapping } from '../../mapping/grid.mapping/grid.mapping';
import { UISizeUtils } from '../ui.size.utils/ui.size.utils';
import { GridUtils } from './grid.utils';
import { NumberUtils } from '../number.utils/number.utils';

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
    gridMapping: GridMapping;
  }): GridChildInfo {
    if (!params.childInfo.rect) return params.childInfo;
    if (params.childInfo.placeSelf.justifySelf) {
      params.childInfo.margin.left = UnsetUnit;
      params.childInfo.margin.right = UnsetUnit;
    } else {
      const marginLeft = UISizeUtils.convertNumberToUISize({
        valueNumber: params.margin.marginLeft,
        unit: params.childInfo.margin.left.unit,
        maxValue: params.childGridRect.width
      });
      const columnAutoNumber = GridUtils.getGridAreaAutoNumber({
        start: params.gridArea.columnStart - 1,
        end: params.gridArea.columnEnd - 1,
        sizeInfoList: params.gridMapping.gridColumnInfo
      });
      let marginRight;
      if (columnAutoNumber) {
        const rightValueNumber =
          params.rightOffset - params.margin.marginLeft - params.childInfo.rect.width;
        marginRight = UISizeUtils.convertNumberToUISize({
          valueNumber: rightValueNumber,
          unit: params.childInfo.margin.right.unit,
          maxValue: params.childGridRect.width
        });
      } else {
        marginRight = {
          value: 0,
          unit: SizeUnit.Unset
        };
      }
      params.childInfo.margin.left = marginLeft;
      params.childInfo.margin.right = marginRight;
      params.childInfo.gridArea.columnStart = params.gridArea.columnStart;
      params.childInfo.gridArea.columnEnd = params.gridArea.columnEnd;
    }
    if (params.childInfo.placeSelf.alignSelf) {
      params.childInfo.margin.top = UnsetUnit;
      params.childInfo.margin.bottom = UnsetUnit;
    } else {
      const marginTop = UISizeUtils.convertNumberToUISize({
        valueNumber: params.margin.marginTop,
        unit: params.childInfo.margin.top.unit,
        maxValue: params.childGridRect.width
      });
      const rowAutoNumber = GridUtils.getGridAreaAutoNumber({
        start: params.gridArea.rowStart - 1,
        end: params.gridArea.rowEnd - 1,
        sizeInfoList: params.gridMapping.gridRowInfo
      });
      let marginBottom;
      if (rowAutoNumber) {
        const bottomValueNumber =
          params.bottomOffset - params.margin.marginTop - params.childInfo.rect.height;
        marginBottom = UISizeUtils.convertNumberToUISize({
          valueNumber: bottomValueNumber,
          unit: params.childInfo.margin.bottom.unit,
          maxValue: params.childGridRect.width
        });
      } else {
        marginBottom = {
          value: 0,
          unit: SizeUnit.Unset
        };
      }
      params.childInfo.margin.top = marginTop;
      params.childInfo.margin.bottom = marginBottom;
      params.childInfo.gridArea.rowStart = params.gridArea.rowStart;
      params.childInfo.gridArea.rowEnd = params.gridArea.rowEnd;
    }
    params.childInfo.size.width = UISizeUtils.convertUISizeWithParentValue({
      sizeInfo: params.childInfo.size.width,
      oldParentValue: params.childInfo.parentRect?.width ?? 0,
      newParentValue: params.childGridRect.width
    });
    params.childInfo.size.minWidth = UISizeUtils.convertUISizeWithParentValue({
      sizeInfo: params.childInfo.size.minWidth,
      oldParentValue: params.childInfo.parentRect?.width ?? 0,
      newParentValue: params.childGridRect.width
    });
    params.childInfo.size.maxWidth = UISizeUtils.convertUISizeWithParentValue({
      sizeInfo: params.childInfo.size.maxWidth,
      oldParentValue: params.childInfo.parentRect?.width ?? 0,
      newParentValue: params.childGridRect.width
    });
    params.childInfo.size.height = UISizeUtils.convertUISizeWithParentValue({
      sizeInfo: params.childInfo.size.height,
      oldParentValue: params.childInfo.parentRect?.height ?? 0,
      newParentValue: params.childGridRect.height
    });
    params.childInfo.size.minHeight = UISizeUtils.convertUISizeWithParentValue({
      sizeInfo: params.childInfo.size.minHeight,
      oldParentValue: params.childInfo.parentRect?.height ?? 0,
      newParentValue: params.childGridRect.height
    });
    params.childInfo.size.maxHeight = UISizeUtils.convertUISizeWithParentValue({
      sizeInfo: params.childInfo.size.maxHeight,
      oldParentValue: params.childInfo.parentRect?.height ?? 0,
      newParentValue: params.childGridRect.height
    });
    params.childInfo.parentRect = params.childGridRect;
    return params.childInfo;
  }

  static getModifiedChildrenGirdInfo(gridMapping: GridMapping): GridChildInfo[] {
    const gridItemRectList = gridMapping.getGridItemRectList();
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
    return gridMapping.childInfoList.map(childInfo => {
      if (!childInfo.rect || childInfo.isFullParent) return childInfo;
      margin = GridUtils.getChildGridMarginInfoByRect({
        rect: childInfo.rect,
        gridArea: childInfo.gridArea,
        gridItemRectList
      });
      childGridRect = GridUtils.convertChildSizeInfoToNumber({
        gridArea: childInfo.gridArea,
        gridItemRectList
      });
      const bottomOffset =
        UISizeUtils.convertUISizeToNumber(childInfo.margin.top, childGridRect.height) +
        UISizeUtils.convertUISizeToNumber(childInfo.margin.bottom, childGridRect.height) +
        childInfo.rect.height;
      const rightOffset =
        UISizeUtils.convertUISizeToNumber(childInfo.margin.left, childGridRect.width) +
        UISizeUtils.convertUISizeToNumber(childInfo.margin.right, childGridRect.width) +
        childInfo.rect.width;
      return GridChildUtils.adjustChildGridInfo({
        childInfo,
        childGridRect,
        margin,
        gridArea: childInfo.gridArea,
        bottomOffset,
        rightOffset,
        gridMapping
      });
    });
  }

  static adjustChildrenAndResetAutoGridInfo(
    gridMapping: GridMapping,
    resetPlaceSelf = false
  ): GridChildInfo[] {
    const gridItemRectList = gridMapping.getGridItemRectList(false);
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
    return gridMapping.childInfoList.map(childInfo => {
      if (!childInfo.rect || childInfo.isFullParent) return childInfo;
      if (resetPlaceSelf) {
        if (childInfo.placeSelf.alignSelf) {
          childInfo.placeSelf.alignSelf = '';
          childInfo.margin.top.unit = SizeUnit.PX;
        }
        if (childInfo.placeSelf.justifySelf) {
          childInfo.placeSelf.justifySelf = '';
          childInfo.margin.left.unit = SizeUnit.PX;
        }
      }
      areaInfo = gridMapping.getChildGridAreaInfoByRect({
        rect: childInfo.rect,
        gridItemRectList
      });
      childGridRect = GridUtils.convertChildSizeInfoToNumber({
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
        gridMapping
      });
    });
  }

  static setDroppedInfo(
    dropped: {
      id: string;
      x: number;
      y: number;
      size: SizeInfo;
      droppedOldParentRect?: RectInfo;
      gridArea?: GridArea;
    },
    gridMapping: GridMapping
  ): {
    info: GridChildInfo;
    needUpdateGridChildren: boolean;
  } {
    const gridItemRectList = gridMapping.getGridItemRectList();
    const childIndex = gridMapping.childInfoList.findIndex(
      childInfo => childInfo.id === dropped.id
    );
    let marginLeftUnit: SizeUnit = SizeUnit.PX;
    let marginRightUnit: SizeUnit = SizeUnit.PX;
    let marginTopUnit: SizeUnit = SizeUnit.PX;
    let marginBottomUnit: SizeUnit = SizeUnit.PX;
    let droppedOldParentRect = dropped.droppedOldParentRect;
    if (childIndex !== -1) {
      const margin = gridMapping.childInfoList[childIndex].margin;
      marginLeftUnit = margin.left.unit === SizeUnit.Percent ? SizeUnit.Percent : SizeUnit.PX;
      marginRightUnit = margin.right.unit === SizeUnit.Percent ? SizeUnit.Percent : SizeUnit.PX;
      marginTopUnit = margin.top.unit === SizeUnit.Percent ? SizeUnit.Percent : SizeUnit.PX;
      marginBottomUnit = margin.bottom.unit === SizeUnit.Percent ? SizeUnit.Percent : SizeUnit.PX;
      droppedOldParentRect = GridUtils.convertChildSizeInfoToNumber({
        gridArea: gridMapping.childInfoList[childIndex].gridArea,
        gridItemRectList
      });
    }
    const rectWidth = UISizeUtils.convertUISizeToNumber(
      UISizeUtils.getValidRenderSizeByComparing({
        origin: dropped.size.width,
        max: dropped.size.maxWidth,
        min: dropped.size.minWidth,
        parentSizeValue: droppedOldParentRect?.width
      }),
      droppedOldParentRect?.width
    );
    const rectHeight = UISizeUtils.convertUISizeToNumber(
      UISizeUtils.getValidRenderSizeByComparing({
        origin: dropped.size.height,
        max: dropped.size.maxHeight,
        min: dropped.size.minHeight,
        parentSizeValue: droppedOldParentRect?.height
      }),
      droppedOldParentRect?.height
    );
    const droppedRect = {
      x: dropped.x,
      y: dropped.y,
      width: rectWidth,
      height: rectHeight
    };
    const gridInfo = gridMapping.getChildGridAreaInfoByRect({
      rect: droppedRect,
      gridItemRectList
    });
    const droppedParentRect = GridUtils.convertChildSizeInfoToNumber({
      gridArea: gridInfo.gridArea,
      gridItemRectList
    });
    const rowAutoNumber = GridUtils.getGridAreaAutoNumber({
      start: gridInfo.gridArea.rowStart - 1,
      end: gridInfo.gridArea.rowEnd - 1,
      sizeInfoList: gridMapping.gridRowInfo
    });
    const columnAutoNumber = GridUtils.getGridAreaAutoNumber({
      start: gridInfo.gridArea.columnStart - 1,
      end: gridInfo.gridArea.columnEnd - 1,
      sizeInfoList: gridMapping.gridColumnInfo
    });
    let justifySelf = '';
    let alignSelf = '';
    if (
      NumberUtils.parseViewNumber(droppedRect.x) ===
      NumberUtils.parseViewNumber(droppedParentRect.x)
    ) {
      justifySelf = 'start';
      marginLeftUnit = SizeUnit.Unset;
      marginRightUnit = SizeUnit.Unset;
    } else if (
      NumberUtils.parseViewNumber(droppedRect.x + droppedRect.width / 2) ===
      NumberUtils.parseViewNumber(droppedParentRect.x + droppedParentRect.width / 2)
    ) {
      justifySelf = 'center';
      marginLeftUnit = SizeUnit.Unset;
      marginRightUnit = SizeUnit.Unset;
    } else if (
      NumberUtils.parseViewNumber(droppedRect.x + droppedRect.width) ===
      NumberUtils.parseViewNumber(droppedParentRect.x + droppedParentRect.width)
    ) {
      justifySelf = 'end';
      marginLeftUnit = SizeUnit.Unset;
      marginRightUnit = SizeUnit.Unset;
    }
    if (
      NumberUtils.parseViewNumber(droppedRect.y) ===
      NumberUtils.parseViewNumber(droppedParentRect.y)
    ) {
      alignSelf = 'start';
      marginTopUnit = SizeUnit.Unset;
      marginBottomUnit = SizeUnit.Unset;
    } else if (
      NumberUtils.parseViewNumber(droppedRect.y + droppedRect.height / 2) ===
      NumberUtils.parseViewNumber(droppedParentRect.y + droppedParentRect.height / 2)
    ) {
      alignSelf = 'center';
      marginTopUnit = SizeUnit.Unset;
      marginBottomUnit = SizeUnit.Unset;
    } else if (
      NumberUtils.parseViewNumber(droppedRect.y + droppedRect.height) ===
      NumberUtils.parseViewNumber(droppedParentRect.y + droppedParentRect.height)
    ) {
      alignSelf = 'end';
      marginTopUnit = SizeUnit.Unset;
      marginBottomUnit = SizeUnit.Unset;
    }
    const droppedInfo: GridChildInfo = {
      id: dropped.id,
      gridArea: gridInfo.gridArea,
      margin: {
        top: UISizeUtils.convertNumberToUISize({
          valueNumber: gridInfo.marginTop,
          unit: marginTopUnit,
          maxValue: droppedParentRect.width
        }),
        left: UISizeUtils.convertNumberToUISize({
          valueNumber: gridInfo.marginLeft,
          unit: marginLeftUnit,
          maxValue: droppedParentRect.width
        }),
        right: columnAutoNumber
          ? UISizeUtils.convertNumberToUISize({
              valueNumber: 0 - gridInfo.marginLeft - droppedRect.width,
              unit: marginRightUnit,
              maxValue: droppedParentRect.width
            })
          : { value: 0, unit: SizeUnit.Unset },
        bottom: rowAutoNumber
          ? UISizeUtils.convertNumberToUISize({
              valueNumber: 0 - gridInfo.marginTop - droppedRect.height,
              unit: marginBottomUnit,
              maxValue: droppedParentRect.width
            })
          : { value: 0, unit: SizeUnit.Unset }
      },
      placeSelf: {
        justifySelf,
        alignSelf
      },
      size: {
        width: UISizeUtils.convertUISizeWithParentValue({
          sizeInfo: dropped.size.width,
          oldParentValue: droppedOldParentRect?.width ?? 0,
          newParentValue: droppedParentRect.width
        }),
        maxWidth: UISizeUtils.convertUISizeWithParentValue({
          sizeInfo: dropped.size.maxWidth,
          oldParentValue: droppedOldParentRect?.width ?? 0,
          newParentValue: droppedParentRect.width
        }),
        minWidth: UISizeUtils.convertUISizeWithParentValue({
          sizeInfo: dropped.size.minWidth,
          oldParentValue: droppedOldParentRect?.width ?? 0,
          newParentValue: droppedParentRect.width
        }),
        height: UISizeUtils.convertUISizeWithParentValue({
          sizeInfo: dropped.size.height,
          oldParentValue: droppedOldParentRect?.height ?? 0,
          newParentValue: droppedParentRect.height
        }),
        maxHeight: UISizeUtils.convertUISizeWithParentValue({
          sizeInfo: dropped.size.maxHeight,
          oldParentValue: droppedOldParentRect?.height ?? 0,
          newParentValue: droppedParentRect.height
        }),
        minHeight: UISizeUtils.convertUISizeWithParentValue({
          sizeInfo: dropped.size.minHeight,
          oldParentValue: droppedOldParentRect?.height ?? 0,
          newParentValue: droppedParentRect.height
        })
      }
    };
    droppedInfo.rect = gridMapping.getGridChildRect(droppedInfo, gridItemRectList);
    if (childIndex === -1) {
      gridMapping.childInfoList.push(droppedInfo);
    } else {
      gridMapping.childInfoList.splice(childIndex, 1, droppedInfo);
    }
    return {
      info: droppedInfo,
      needUpdateGridChildren: gridMapping.needUpdateGridChildren()
    };
  }
}
