/*
 * @author allen
 * @data 2020/11/18 12:12
 */
import { GridArea, SizeUnit, SpacingPadding, UISize } from '@towify/common-values';
import { PaddingInfo, RectInfo } from '../../type/common.type';
import { ErrorUtils } from '../error.utils/error.utils';
import { NumberUtils } from '../number.utils/number.utils';
import { UISizeUtils } from '../ui.size.utils/ui.size.utils';

export class GridUtils {
  static getGridAreaAutoNumber(params: {
    start: number;
    end: number;
    sizeInfoList: UISize[];
  }): number {
    let startIndex = params.start;
    let autoNumber = 0;
    for (startIndex; startIndex < params.end; startIndex += 1) {
      if (startIndex < params.sizeInfoList.length && startIndex >= 0) {
        if (
          params.sizeInfoList[startIndex].unit === SizeUnit.Auto ||
          params.sizeInfoList[startIndex].unit === SizeUnit.Fit
        ) {
          autoNumber += 1;
        }
      }
    }
    return autoNumber;
  }

  static getChildOffValueInGridAutoItem(params: {
    start: number;
    end: number;
    sizeValue: UISize;
    marginMax: UISize;
    marginMin: UISize;
    sizeInfoList: UISize[];
  }): number {
    let totalValue = 0;
    const autoNumber = GridUtils.getGridAreaAutoNumber(params);
    totalValue += params.sizeValue.unit === SizeUnit.PX ? params.sizeValue.value : 0;
    totalValue += params.marginMin.unit === SizeUnit.PX ? params.marginMin.value : 0;
    totalValue += params.marginMax.unit === SizeUnit.PX ? params.marginMax.value : 0;
    let startIndex = params.start;
    for (startIndex; startIndex < params.end; startIndex += 1) {
      if (startIndex < params.sizeInfoList.length && startIndex >= 0) {
        if (params.sizeInfoList[startIndex].unit === SizeUnit.PX) {
          totalValue -= params.sizeInfoList[startIndex].value;
        }
      }
    }
    if (autoNumber > 0 && totalValue > 0) {
      return parseFloat((totalValue / autoNumber).toFixed(2));
    }
    return 0;
  }

  static checkPointIsInRect(point: { x: number; y: number }, rect: RectInfo): boolean {
    const checkXIn = point.x >= rect.x && point.x <= rect.x + rect.width;
    const checkYIn = point.y >= rect.y && point.y <= rect.y + rect.height;
    return checkXIn && checkYIn;
  }

  static getGridRowOrColumnItemValues(params: {
    sizeInfoList: UISize[];
    maxValue?: number;
    autoOffsetList?: {
      minusOffsetId: string;
      minusOffset: number;
      plusOffset: number;
    }[];
  }): number[] {
    let spareValue = params.maxValue ?? 0;
    let autoNumber = 0;
    let isAuto = false;
    const valueList: number[] = new Array(params.sizeInfoList.length);
    params.sizeInfoList.forEach((value, index) => {
      isAuto = value.unit === SizeUnit.Auto || value.unit === SizeUnit.Fit;
      if (isAuto) {
        valueList[index] = 0;
        autoNumber += 1;
      } else {
        valueList[index] = UISizeUtils.convertUISizeToNumber(value, params.maxValue);
      }
    });
    valueList.forEach(value => {
      spareValue -= value;
    });
    if (autoNumber !== 0) {
      if (!params.autoOffsetList) {
        if (spareValue < 0) {
          spareValue = 0;
        }
        const autoValue = spareValue / autoNumber;
        params.sizeInfoList.forEach((value, index) => {
          isAuto = value.unit === SizeUnit.Auto || value.unit === SizeUnit.Fit;
          if (isAuto) {
            valueList[index] = autoValue;
          }
        });
      } else if (params.autoOffsetList.length === params.sizeInfoList.length) {
        params.autoOffsetList.forEach(offSet => {
          spareValue -= offSet.minusOffset;
        });
        if (spareValue < 0) {
          spareValue = 0;
        }
        const autoValue = spareValue / autoNumber;
        let autoOffsetIndexList;
        let autoItemNumber = 0;
        let leftAutoNumber = 0;
        let leftAutoItemId = '';
        let mapKey = '';
        let mapValue = 0;
        const autoMap = new Map<string, number>();
        params.autoOffsetList.forEach((autoOffset, index) => {
          if (autoOffset.minusOffsetId !== '-1') {
            valueList[index] += autoValue;
            valueList[index] += autoOffset.plusOffset;
          }
          if (autoOffset.plusOffset !== autoOffset.minusOffset) {
            leftAutoItemId = autoOffset.minusOffsetId;
            mapKey = autoOffset.minusOffsetId;
            mapValue = autoMap.get(mapKey) ?? 0;
            mapValue += autoOffset.minusOffset - autoOffset.plusOffset;
            autoMap.set(mapKey, mapValue);
          }
        });
        autoMap.forEach((value, key) => {
          if (value > 0) {
            autoOffsetIndexList = params.autoOffsetList!.reduce<number[]>(
              (preview, current, index) => {
                if (current.plusOffset === current.minusOffset && current.minusOffsetId === key) {
                  return preview.concat(index);
                }
                return preview;
              },
              []
            );
            if (autoOffsetIndexList.length) {
              autoItemNumber = value / autoOffsetIndexList.length;
              autoOffsetIndexList.forEach(index => {
                valueList[index] += autoItemNumber;
              });
            } else {
              leftAutoNumber += value;
            }
          }
        });
        if (leftAutoNumber !== 0) {
          autoOffsetIndexList = params.autoOffsetList.reduce<number[]>(
            (preview, current, index) => {
              if (
                current.minusOffsetId === leftAutoItemId &&
                current.plusOffset !== current.minusOffset
              ) {
                return preview.concat(index);
              }
              return preview;
            },
            []
          );
          if (autoOffsetIndexList.length) {
            autoItemNumber = leftAutoNumber / autoOffsetIndexList.length;
            autoOffsetIndexList.forEach(index => {
              valueList[index] += autoItemNumber;
            });
          } else {
            valueList[0] += leftAutoNumber;
            ErrorUtils.GridError('Calculation auto error');
          }
        }
      }
    }
    return valueList;
  }

  static convertChildSizeInfoToNumber(params: {
    gridArea: GridArea;
    gridItemRectList: RectInfo[][];
  }): RectInfo {
    const rowStart = params.gridArea.rowStart - 1;
    const columnStart = params.gridArea.columnStart - 1;
    const rowEnd = params.gridArea.rowEnd - 1;
    const columnEnd = params.gridArea.columnEnd - 1;
    const childGridRect = {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    };
    if (params.gridItemRectList.length === 0 || params.gridItemRectList[0].length === 0) {
      return childGridRect;
    }
    if (rowStart < 0) {
      childGridRect.y = params.gridItemRectList[0][0].y;
    } else if (rowStart >= params.gridItemRectList.length) {
      const maxRowItem = params.gridItemRectList[params.gridItemRectList.length - 1];
      childGridRect.y = maxRowItem[0].y + maxRowItem[0].height;
    } else {
      childGridRect.y = params.gridItemRectList[rowStart][0].y;
    }
    if (columnStart < 0) {
      childGridRect.x = params.gridItemRectList[0][0].x;
    } else if (columnStart >= params.gridItemRectList[0].length) {
      const maxColumnItem = params.gridItemRectList[0][params.gridItemRectList[0].length - 1];
      childGridRect.x = maxColumnItem.x + maxColumnItem.width;
    } else {
      childGridRect.x = params.gridItemRectList[0][columnStart].x;
    }
    if (rowEnd < params.gridItemRectList.length) {
      let rowIndex = rowEnd - 1;
      if (rowIndex < 0) {
        rowIndex = 0;
      }
      childGridRect.height =
        params.gridItemRectList[rowIndex][0].y +
        params.gridItemRectList[rowIndex][0].height -
        childGridRect.y;
    } else {
      const maxRowItem = params.gridItemRectList[params.gridItemRectList.length - 1];
      childGridRect.height = maxRowItem[0].y + maxRowItem[0].height - childGridRect.y;
    }
    if (columnEnd < params.gridItemRectList[0].length) {
      let columnIndex = columnEnd - 1;
      if (columnEnd <= 0) {
        columnIndex = 0;
      }
      childGridRect.width =
        params.gridItemRectList[0][columnIndex].x +
        params.gridItemRectList[0][columnIndex].width -
        childGridRect.x;
    } else {
      const maxColumnItem = params.gridItemRectList[0][params.gridItemRectList[0].length - 1];
      childGridRect.width = maxColumnItem.x + maxColumnItem.width - childGridRect.x;
    }
    if (childGridRect.height < 0) {
      childGridRect.height = 0;
    }
    if (childGridRect.width < 0) {
      childGridRect.width = 0;
    }
    return childGridRect;
  }

  static getChildGridAreaInfoByRect(params: {
    rect: RectInfo;
    gridItemRectList: RectInfo[][];
    rowGap: number;
    columnGap: number;
  }): {
    gridArea: GridArea;
    marginLeft: number;
    marginTop: number;
  } {
    const maxWidth = params.rect.x + params.rect.width;
    const maxHeight = params.rect.y + params.rect.height;
    const rowLength = params.gridItemRectList.length;
    const columnLength = params.gridItemRectList[0].length;
    let marginLeft = params.rect.x;
    let marginTop = params.rect.y;
    let rowStart = 1;
    let rowEnd = rowLength + 1;
    let columnStart = 1;
    let columnEnd = columnLength + 1;
    const gridAreaRect = {
      x: params.gridItemRectList[0][0].x,
      y: params.gridItemRectList[0][0].y,
      width:
        params.gridItemRectList[0][columnLength - 1].x -
        params.gridItemRectList[0][0].x +
        params.gridItemRectList[0][columnLength - 1].width,
      height:
        params.gridItemRectList[rowLength - 1][0].y -
        params.gridItemRectList[0][0].y +
        params.gridItemRectList[rowLength - 1][0].height
    };
    if (!GridUtils.checkPointIsInRect({ x: params.rect.x, y: gridAreaRect.y }, gridAreaRect)) {
      if (params.rect.x < gridAreaRect.x) {
        columnStart = 1;
        marginLeft = params.rect.x - gridAreaRect.x;
      }
      if (params.rect.x > gridAreaRect.x + gridAreaRect.width) {
        columnStart = columnLength;
        marginLeft = params.rect.x - params.gridItemRectList[0][columnLength - 1].x;
      }
    }
    if (!GridUtils.checkPointIsInRect({ x: maxWidth, y: gridAreaRect.y }, gridAreaRect)) {
      if (maxWidth < gridAreaRect.x) {
        columnEnd = 2;
      }
      if (maxWidth > gridAreaRect.x + gridAreaRect.width) {
        columnEnd = columnLength + 1;
      }
    }
    if (!GridUtils.checkPointIsInRect({ x: gridAreaRect.x, y: params.rect.y }, gridAreaRect)) {
      if (params.rect.y < gridAreaRect.y) {
        rowStart = 1;
        marginTop = params.rect.y - gridAreaRect.y;
      }
      if (params.rect.y > gridAreaRect.y + gridAreaRect.height) {
        rowStart = rowLength;
        marginTop = params.rect.y - params.gridItemRectList[rowLength - 1][0].y;
      }
    }
    if (!GridUtils.checkPointIsInRect({ x: gridAreaRect.x, y: maxHeight }, gridAreaRect)) {
      if (maxHeight < gridAreaRect.y) {
        rowEnd = 2;
      }
      if (maxHeight > gridAreaRect.y + gridAreaRect.height) {
        rowEnd = rowLength + 1;
      }
    }
    params.gridItemRectList.forEach((rowItem, rowIndex) => {
      rowItem.forEach((gridItemRect, columnIndex) => {
        const activeRect = { ...gridItemRect };
        if (columnIndex < columnLength - 1) {
          activeRect.width += params.columnGap;
        }
        if (rowIndex < rowLength - 1) {
          activeRect.height += params.rowGap;
        }
        if (GridUtils.checkPointIsInRect({ x: params.rect.x, y: activeRect.y }, activeRect)) {
          columnStart = columnIndex + 1;
          marginLeft = params.rect.x - activeRect.x;
        }
        if (GridUtils.checkPointIsInRect({ x: activeRect.x, y: params.rect.y }, activeRect)) {
          rowStart = rowIndex + 1;
          marginTop = params.rect.y - activeRect.y;
        }
        if (
          GridUtils.checkPointIsInRect({ x: activeRect.x, y: maxHeight }, activeRect) &&
          maxHeight !== activeRect.y
        ) {
          rowEnd = rowIndex + 2;
        }
        if (
          GridUtils.checkPointIsInRect({ x: maxWidth, y: activeRect.y }, activeRect) &&
          maxWidth !== activeRect.x
        ) {
          columnEnd = columnIndex + 2;
        }
      });
    });
    console.log('haha = ', { rowStart, columnStart, rowEnd, columnEnd });
    return {
      gridArea: { rowStart, columnStart, rowEnd, columnEnd },
      marginLeft: NumberUtils.parseViewNumber(marginLeft),
      marginTop: NumberUtils.parseViewNumber(marginTop)
    };
  }

  static getChildGridMarginInfoByRect(params: {
    rect: RectInfo;
    gridArea: GridArea;
    gridItemRectList: RectInfo[][];
  }): {
    marginLeft: number;
    marginTop: number;
  } {
    const childRectRect = GridUtils.convertChildSizeInfoToNumber({
      gridArea: params.gridArea,
      gridItemRectList: params.gridItemRectList
    });
    return {
      marginLeft: NumberUtils.parseViewNumber(params.rect.x - childRectRect.x),
      marginTop: NumberUtils.parseViewNumber(params.rect.y - childRectRect.y)
    };
  }

  static getActiveRect(params: {
    rect: RectInfo;
    padding: PaddingInfo;
    border: PaddingInfo;
  }): RectInfo {
    return {
      x: params.padding.left + params.border.left,
      y: params.padding.top + params.border.top,
      width:
        params.rect.width -
        params.padding.left -
        params.padding.right -
        params.border.left -
        params.border.right,
      height:
        params.rect.height -
        params.padding.top -
        params.padding.bottom -
        params.border.top -
        params.border.bottom
    };
  }

  static convertOffsetValue(
    offset: SpacingPadding,
    parentValue = 0
  ): {
    left: number;
    right: number;
    top: number;
    bottom: number;
  } {
    if (parentValue === 0) {
      return {
        left: offset.left.unit === SizeUnit.PX ? offset.left.value : 0,
        right: offset.right.unit === SizeUnit.PX ? offset.right.value : 0,
        top: offset.top.unit === SizeUnit.PX ? offset.top.value : 0,
        bottom: offset.bottom.unit === SizeUnit.PX ? offset.bottom.value : 0
      };
    }
    return {
      left: UISizeUtils.convertUISizeToNumber(offset.left, parentValue),
      right: UISizeUtils.convertUISizeToNumber(offset.right, parentValue),
      top: UISizeUtils.convertUISizeToNumber(offset.top, parentValue),
      bottom: UISizeUtils.convertUISizeToNumber(offset.bottom, parentValue)
    };
  }
}
