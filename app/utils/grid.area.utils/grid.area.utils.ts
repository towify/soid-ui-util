/*
 * @author allen
 * @data 2020/11/18 12:12
 */

import { GridAreaInfo, RectInfo } from '../../type/common.type';

enum GridAreaLineType {
  Hor = 'hor',
  Ver = 'ver'
}

export class GridAreaUtils {
  static autoNumber = -10000;

  static checkPointIsInRect(
    point: { x: number; y: number },
    rect: RectInfo
  ): boolean {
    const checkXIn = point.x >= rect.x && point.x <= rect.x + rect.width;
    const checkYIn = point.y >= rect.y && point.y <= rect.y + rect.height;
    return checkXIn && checkYIn;
  }

  static changeNumberToSizeInfo(params: {
    valueNumber: number;
    unit: string;
    windowSize?: { width: number; height: number };
    maxValue?: number;
  }): { value: number; unit: string } {
    let value = params.valueNumber;
    if (params.unit === 'vw') {
      value = (params.valueNumber / (params.windowSize?.width ?? 1)) * 100;
      // todo: window width 为空和等于 0 分开处理
      if (!params.windowSize?.width || params.windowSize?.width === 0) {
        console.error('SOID-UI-UTIL', 'GridAreaService', 'windowWidth is zero');
      }
    }
    if (params.unit === 'vh') {
      value = (params.valueNumber / (params.windowSize?.height ?? 1)) * 100;
      // todo: window width 为空和等于 0 分开处理
      if (!params.windowSize?.height || params.windowSize?.height === 0) {
        console.error(
          'SOID-UI-UTIL',
          'GridAreaService',
          'windowHeight is zero'
        );
      }
    }
    if (params.unit === '%') {
      value = (params.valueNumber / (params.maxValue ?? 1)) * 100;
    }
    return {
      value: parseFloat(value.toFixed(1)),
      unit: params.unit
    };
  }

  static convertSizeInfoToNumber(params: {
    sizeInfo: { value: number; unit: string };
    windowSize?: { width: number; height: number };
    maxValue?: number;
  }): number {
    let valueNumber = params.sizeInfo.value;
    if (valueNumber === GridAreaUtils.autoNumber) {
      return 0;
    }
    if (params.sizeInfo.unit === 'vw') {
      valueNumber = ((params.windowSize?.width ?? 0) * valueNumber) / 100;
      // todo: window width 为空和等于 0 分开处理
      if (!params.windowSize?.width || params.windowSize?.width === 0) {
        console.error('SOID-UI-UTIL', 'GridAreaService', 'windowWidth is zero');
      }
    }
    if (params.sizeInfo.unit === 'vh') {
      valueNumber = ((params.windowSize?.height ?? 0) * valueNumber) / 100;
      // todo: window width 为空和等于 0 分开处理
      if (!params.windowSize?.height || params.windowSize?.height === 0) {
        console.error(
          'SOID-UI-UTIL',
          'GridAreaService',
          'windowHeight is zero'
        );
      }
    }
    if (params.sizeInfo.unit === '%') {
      valueNumber = ((params.maxValue ?? 0) * valueNumber) / 100;
    }
    return valueNumber;
  }

  static changeChildSizeInfoToNumber(params: {
    gridArea: GridAreaInfo;
    gridItemRectList: RectInfo[][];
    gridRect: RectInfo;
  }): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
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
    if (rowStart < 0) {
      childGridRect.y = params.gridItemRectList[0][0].y;
    } else if (rowStart >= params.gridItemRectList.length) {
      const maxRowItem =
        params.gridItemRectList[params.gridItemRectList.length - 1];
      childGridRect.y = maxRowItem[0].y + maxRowItem[0].height;
    } else {
      childGridRect.y = params.gridItemRectList[rowStart][0].y;
    }
    if (columnStart < 0) {
      childGridRect.x = params.gridItemRectList[0][0].x;
    } else if (columnStart >= params.gridItemRectList[0].length) {
      const maxColumnItem =
        params.gridItemRectList[0][params.gridItemRectList[0].length - 1];
      childGridRect.x = maxColumnItem.x + maxColumnItem.width;
    } else {
      childGridRect.x = params.gridItemRectList[0][columnStart].x;
    }
    if (rowEnd === params.gridItemRectList.length) {
      const maxRowItem =
        params.gridItemRectList[params.gridItemRectList.length - 1];
      childGridRect.height =
        maxRowItem[0].y + maxRowItem[0].height - childGridRect.y;
    } else if (rowEnd < params.gridItemRectList.length) {
      childGridRect.height =
        params.gridItemRectList[rowEnd][0].y - childGridRect.y;
    } else {
      childGridRect.height =
        params.gridRect.y + params.gridRect.height - childGridRect.y;
    }
    if (columnEnd === params.gridItemRectList[0].length) {
      const maxColumnItem =
        params.gridItemRectList[0][params.gridItemRectList[0].length - 1];
      childGridRect.width =
        maxColumnItem.x + maxColumnItem.width - childGridRect.x;
    } else if (columnEnd < params.gridItemRectList[0].length) {
      childGridRect.width =
        params.gridItemRectList[0][columnEnd].x - childGridRect.x;
    } else {
      childGridRect.width =
        params.gridRect.x + params.gridRect.width - childGridRect.x;
    }
    if (childGridRect.height < 0) {
      childGridRect.height = 0;
    }
    if (childGridRect.width < 0) {
      childGridRect.width = 0;
    }
    return childGridRect;
  }

  static getGridLineList(params: {
    gridItemRectList: RectInfo[][];
    gridSize: { width: number; height: number };
    isShowBorder: boolean;
  }): { fromX: number; fromY: number; toX: number; toY: number }[] {
    const result: {
      fromX: number;
      fromY: number;
      toX: number;
      toY: number;
    }[] = [];
    params.gridItemRectList.forEach(rowItem => {
      rowItem.forEach(rect => {
        result.push({
          fromX: rect.x,
          toX: rect.x + rect.width,
          fromY: rect.y,
          toY: rect.y
        });
        result.push({
          fromX: rect.x + rect.width,
          toX: rect.x + rect.width,
          fromY: rect.y,
          toY: rect.y + rect.height
        });
        result.push({
          fromX: rect.x,
          toX: rect.x + rect.width,
          fromY: rect.y + rect.height,
          toY: rect.y + rect.height
        });
        result.push({
          fromX: rect.x,
          toX: rect.x,
          fromY: rect.y,
          toY: rect.y + rect.height
        });
      });
    });
    result.sort((a, b) => {
      const aType =
        a.fromY === a.toY ? GridAreaLineType.Hor : GridAreaLineType.Ver;
      const bType =
        b.fromY === b.toY ? GridAreaLineType.Hor : GridAreaLineType.Ver;
      if (aType === GridAreaLineType.Hor && bType === GridAreaLineType.Ver) {
        return -1;
      }
      if (aType === GridAreaLineType.Ver && bType === GridAreaLineType.Hor) {
        return 1;
      }
      if (aType === bType) {
        if (aType === GridAreaLineType.Hor) {
          if (a.fromY < b.fromY) {
            return -1;
          }
          if (a.fromY > b.fromY) {
            return 1;
          }
          if (a.fromY === b.fromY) {
            return a.fromX < b.fromX ? -1 : 1;
          }
        }
        if (aType === GridAreaLineType.Ver) {
          if (a.fromX < b.fromX) {
            return -1;
          }
          if (a.fromX > b.fromX) {
            return 1;
          }
          if (a.fromX === b.fromX) {
            return a.fromY < b.fromY ? -1 : 1;
          }
        }
      }
      return 1;
    });
    let previousItem: {
      fromX: number;
      fromY: number;
      toX: number;
      toY: number;
    };
    return result.filter(item => {
      if (
        !params.isShowBorder &&
        item.fromX === item.toX &&
        (item.fromX === 0 || item.fromX === params.gridSize.width)
      ) {
        return false;
      }
      if (
        !params.isShowBorder &&
        item.fromY === item.toY &&
        (item.fromY === 0 || item.fromY === params.gridSize.height)
      ) {
        return false;
      }
      if (!previousItem) {
        previousItem = item;
        return true;
      }
      if (
        previousItem.fromX === item.fromX &&
        previousItem.fromY === item.fromY &&
        previousItem.toX === item.toX &&
        previousItem.toY === item.toY
      ) {
        return false;
      }
      if (
        previousItem.fromY === item.fromY &&
        previousItem.toY === item.toY &&
        (previousItem.toX === item.fromX || previousItem.toX === item.toX)
      ) {
        previousItem.toX = item.toX;
        return false;
      }
      if (
        previousItem.fromX === item.fromX &&
        previousItem.toX === item.toX &&
        (previousItem.toY === item.fromY || previousItem.toY === item.toY)
      ) {
        previousItem.toY = item.toY;
        return false;
      }
      previousItem = item;
      return true;
    });
  }

  static changeSizeInfoListToNumberList(params: {git
    sizeInfoList: { value: number; unit: string }[];
    gap: number;
    windowSize?: { width: number; height: number };
    maxValue?: number;
  }): number[] {
    let spareValue = params.maxValue ?? 0;
    let autoNumber = 0;
    let isAuto = false;
    const valueList: number[] = new Array(params.sizeInfoList.length);
    params.sizeInfoList.forEach((value, index) => {
      isAuto = value.value === GridAreaUtils.autoNumber;
      if (isAuto) {
        valueList[index] = 0;
        autoNumber += 1;
      } else {
        valueList[index] = GridAreaUtils.convertSizeInfoToNumber({
          sizeInfo: value,
          maxValue: params.maxValue,
          windowSize: params.windowSize
        });
      }
    });
    if (valueList.length > 0) {
      spareValue += params.gap;
    }
    valueList.forEach(value => {
      spareValue -= value;
      spareValue -= params.gap;
    });
    if (spareValue < 0) {
      spareValue = 0;
    }
    if (spareValue !== 0 && autoNumber !== 0) {
      const autoValue = spareValue / autoNumber;
      params.sizeInfoList.forEach((value, index) => {
        isAuto = value.value === GridAreaUtils.autoNumber;
        if (isAuto) {
          valueList[index] = autoValue;
        }
      });
    }
    return valueList;
  }

  static getGridAreaInfoByRect(params: {
    rect: RectInfo;
    gridItemRectList: RectInfo[][];
    rowGap: number;
    columnGap: number;
  }): {
    gridArea: GridAreaInfo;
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
        params.gridItemRectList[0][columnLength - 1].x +
        params.gridItemRectList[0][columnLength - 1].width,
      height:
        params.gridItemRectList[rowLength - 1][0].y +
        params.gridItemRectList[rowLength - 1][0].height
    };
    if (
      !GridAreaUtils.checkPointIsInRect(
        { x: params.rect.x, y: gridAreaRect.y },
        gridAreaRect
      )
    ) {
      if (params.rect.x < gridAreaRect.x) {
        columnStart = 1;
        marginLeft = params.rect.x - gridAreaRect.x;
      }
      if (params.rect.x > gridAreaRect.x + gridAreaRect.width) {
        columnStart = columnLength;
        marginLeft =
          params.rect.x - params.gridItemRectList[0][columnLength - 1].x;
      }
    }
    if (
      !GridAreaUtils.checkPointIsInRect(
        { x: maxWidth, y: gridAreaRect.y },
        gridAreaRect
      )
    ) {
      if (maxWidth < gridAreaRect.x) {
        columnEnd = 2;
      }
      if (maxWidth > gridAreaRect.x + gridAreaRect.width) {
        columnEnd = columnLength + 1;
      }
    }
    if (
      !GridAreaUtils.checkPointIsInRect(
        { x: gridAreaRect.x, y: params.rect.y },
        gridAreaRect
      )
    ) {
      if (params.rect.y < gridAreaRect.y) {
        rowStart = 1;
        marginTop = params.rect.y - gridAreaRect.y;
      }
      if (params.rect.y > gridAreaRect.y + gridAreaRect.height) {
        rowStart = rowLength;
        marginTop = params.rect.y - params.gridItemRectList[rowLength - 1][0].y;
      }
    }
    if (
      !GridAreaUtils.checkPointIsInRect(
        { x: gridAreaRect.x, y: maxHeight },
        gridAreaRect
      )
    ) {
      if (maxHeight < gridAreaRect.y) {
        rowEnd = 2;
      }
      if (maxHeight > gridAreaRect.y + gridAreaRect.height) {
        rowEnd = rowLength + 1;
      }
    }
    params.gridItemRectList.forEach((rowItem, rowIndex) => {
      rowItem.forEach((gridItemRect, columnIndex) => {
        const activeRect = {
          x: gridItemRect.x,
          y: gridItemRect.y,
          width: gridItemRect.width,
          height: gridItemRect.height
        };
        if (columnIndex < columnLength - 1) {
          activeRect.width += params.columnGap;
        }
        if (rowIndex < rowLength - 1) {
          activeRect.height += params.rowGap;
        }
        if (
          GridAreaUtils.checkPointIsInRect(
            { x: params.rect.x, y: activeRect.y },
            activeRect
          )
        ) {
          columnStart = columnIndex + 1;
          marginLeft = params.rect.x - activeRect.x;
        }
        if (
          GridAreaUtils.checkPointIsInRect(
            { x: activeRect.x, y: params.rect.y },
            activeRect
          )
        ) {
          rowStart = rowIndex + 1;
          marginTop = params.rect.y - activeRect.y;
        }
        if (
          GridAreaUtils.checkPointIsInRect(
            { x: activeRect.x, y: maxHeight },
            activeRect
          )
        ) {
          rowEnd = rowIndex + 2;
        }
        if (
          GridAreaUtils.checkPointIsInRect(
            { x: maxWidth, y: activeRect.y },
            activeRect
          )
        ) {
          columnEnd = columnIndex + 2;
        }
      });
    });
    return {
      gridArea: { rowStart, columnStart, rowEnd, columnEnd },
      marginLeft: parseFloat(marginLeft.toFixed(1)),
      marginTop: parseFloat(marginTop.toFixed(1))
    };
  }
}
