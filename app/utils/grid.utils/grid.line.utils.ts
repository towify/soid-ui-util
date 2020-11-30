/*
 * @author allen
 * @data 2020/11/23 23:02
 */
import { RectInfo } from '../../type/common.type';

enum GridLineType {
  Horizontal = 'horizontal',
  Vertical = 'vertical'
}

export class GridLineUtils {
  static getGridLineList(
    gridItemRectList: RectInfo[][]
  ): { fromX: number; fromY: number; toX: number; toY: number }[] {
    const result: {
      fromX: number;
      fromY: number;
      toX: number;
      toY: number;
    }[] = [];
    gridItemRectList.forEach(rowItem => {
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
        a.fromY === a.toY ? GridLineType.Horizontal : GridLineType.Vertical;
      const bType =
        b.fromY === b.toY ? GridLineType.Horizontal : GridLineType.Vertical;
      if (
        aType === GridLineType.Horizontal &&
        bType === GridLineType.Vertical
      ) {
        return -1;
      }
      if (
        aType === GridLineType.Vertical &&
        bType === GridLineType.Horizontal
      ) {
        return 1;
      }
      if (aType === bType) {
        if (aType === GridLineType.Horizontal) {
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
        if (aType === GridLineType.Vertical) {
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

  static getGridGapAreaAndLine(params: {
    gridItemRectList: RectInfo[][];
    lineSpace: number;
  }): {
    area: RectInfo[];
    lines: { fromX: number; fromY: number; toX: number; toY: number }[];
  } {
    let columnGapArea: RectInfo[] = [];
    let rowGapArea: RectInfo[] = [];
    let columnIndex = 1;
    let rowIndex = 1;
    const columnLength = params.gridItemRectList[0].length;
    const rowLength = params.gridItemRectList.length;
    const firstRect = params.gridItemRectList[0][0];
    const lastRect = params.gridItemRectList[rowLength - 1][columnLength - 1];
    const gridRect = {
      x: firstRect.x,
      y: firstRect.y,
      width: lastRect.x + lastRect.width - firstRect.x,
      height: lastRect.y + lastRect.height - firstRect.y
    };
    let preRect: RectInfo;
    let currentRect: RectInfo;
    for (columnIndex; columnIndex < columnLength; columnIndex += 1) {
      preRect = params.gridItemRectList[0][columnIndex - 1];
      currentRect = params.gridItemRectList[0][columnIndex];
      columnGapArea.push({
        x: preRect.x + preRect.width,
        y: preRect.y,
        width: currentRect.x - preRect.x - preRect.width,
        height: gridRect.height
      });
    }
    for (rowIndex; rowIndex < rowLength; rowIndex += 1) {
      preRect = params.gridItemRectList[rowIndex - 1][0];
      currentRect = params.gridItemRectList[rowIndex][0];
      rowGapArea.push({
        x: preRect.x,
        y: preRect.y + preRect.height,
        width: gridRect.width,
        height: currentRect.y - preRect.y - preRect.height
      });
    }
    columnGapArea = columnGapArea.filter(rect => {
      return !(rect.width <= 0 || rect.height <= 0);
    });
    rowGapArea = rowGapArea.filter(rect => {
      return !(rect.width <= 0 || rect.height <= 0);
    });
    let lines: {
      fromX: number;
      fromY: number;
      toX: number;
      toY: number;
    }[] = [];
    columnGapArea.forEach(rect => {
      lines = lines.concat(
        GridLineUtils.getRectSlantLines({
          rect,
          lineSpace: params.lineSpace,
          rectType: GridLineType.Vertical
        })
      );
    });
    rowGapArea.forEach(rect => {
      lines = lines.concat(
        GridLineUtils.getRectSlantLines({
          rect,
          lineSpace: params.lineSpace,
          rectType: GridLineType.Horizontal
        })
      );
    });
    const area = columnGapArea.concat(rowGapArea);
    return {
      area,
      lines
    };
  }

  static getGridPaddingAreaAndLine(params: {
    gridPadding: {
      left: number;
      top: number;
      right: number;
      bottom: number;
    };
    border: {
      left: number;
      top: number;
      right: number;
      bottom: number;
    };
    gridSize: {
      width: number;
      height: number;
    };
    lineSpace: number;
  }): {
    area: RectInfo[];
    lines: { fromX: number; fromY: number; toX: number; toY: number }[];
  } {
    let columnPaddingArea: RectInfo[] = [];
    let rowPaddingArea: RectInfo[] = [];
    if (params.gridPadding.left > 0) {
      columnPaddingArea.push({
        x: params.border.left,
        y: params.border.top,
        width: params.gridPadding.left,
        height:
          params.gridSize.height - params.border.top - params.border.bottom
      });
    }
    if (params.gridPadding.right > 0) {
      columnPaddingArea.push({
        x:
          params.gridSize.width -
          params.gridPadding.right -
          params.border.right,
        y: params.border.top,
        width: params.gridPadding.right,
        height:
          params.gridSize.height - params.border.top - params.border.bottom
      });
    }
    if (params.gridPadding.top) {
      rowPaddingArea.push({
        x: params.border.left,
        y: params.border.top,
        width: params.gridSize.width - params.border.left - params.border.right,
        height: params.gridPadding.top
      });
    }
    if (params.gridPadding.bottom) {
      rowPaddingArea.push({
        x: params.border.left,
        y:
          params.gridSize.height -
          params.gridPadding.bottom -
          params.border.bottom,
        width: params.gridSize.width - params.border.left - params.border.right,
        height: params.gridPadding.bottom
      });
    }
    rowPaddingArea = rowPaddingArea.filter(rect => {
      return !(rect.width <= 0 || rect.height <= 0);
    });
    columnPaddingArea = columnPaddingArea.filter(rect => {
      return !(rect.width <= 0 || rect.height <= 0);
    });
    let lines: {
      fromX: number;
      fromY: number;
      toX: number;
      toY: number;
    }[] = [];
    columnPaddingArea.forEach(rect => {
      lines = lines.concat(
        GridLineUtils.getRectSlantLines({
          rect,
          lineSpace: params.lineSpace,
          rectType: GridLineType.Vertical
        })
      );
    });
    rowPaddingArea.forEach(rect => {
      lines = lines.concat(
        GridLineUtils.getRectSlantLines({
          rect,
          lineSpace: params.lineSpace,
          rectType: GridLineType.Horizontal
        })
      );
    });
    const area = rowPaddingArea.concat(columnPaddingArea);
    return {
      area,
      lines
    };
  }

  static getRectSlantLines(params: {
    rect: RectInfo;
    rectType: GridLineType;
    lineSpace: number;
  }): { fromX: number; fromY: number; toX: number; toY: number }[] {
    const distance = Math.sqrt(2) * params.lineSpace;
    const maxValue = params.rect.width + params.rect.height;
    let linePosition = 0;
    let rate = 1;
    if (params.rectType === GridLineType.Horizontal) {
      linePosition = distance;
      rate = -1;
    } else if (params.rectType === GridLineType.Vertical) {
      linePosition = distance - params.rect.height;
      rate = 1;
    }
    let topX = 0;
    let bottomX = 0;
    let leftY = 0;
    let rightY = 0;
    let position;
    const lineArray: {
      fromX: number;
      fromY: number;
      toX: number;
      toY: number;
    }[] = [];
    for (linePosition; linePosition < maxValue; linePosition += distance) {
      topX = (0 - linePosition) / rate;
      bottomX = (params.rect.height - linePosition) / rate;
      leftY = linePosition;
      rightY = params.rect.width * rate + linePosition;
      position = {
        fromX: 0,
        fromY: 0,
        toX: 0,
        toY: 0
      };
      if (topX >= 0 && topX <= params.rect.width) {
        position.fromX = topX;
        position.fromY = 0;
        if (leftY >= 0 && leftY <= params.rect.height) {
          position.toX = 0;
          position.toY = leftY;
        }
        if (bottomX >= 0 && bottomX <= params.rect.width) {
          position.toX = bottomX;
          position.toY = params.rect.height;
        }
        if (rightY >= 0 && rightY <= params.rect.height) {
          position.toX = params.rect.width;
          position.toY = rightY;
        }
      } else if (leftY >= 0 && leftY <= params.rect.height) {
        position.fromX = 0;
        position.fromY = leftY;
        if (rightY >= 0 && rightY <= params.rect.height) {
          position.toX = params.rect.width;
          position.toY = rightY;
        }
        if (bottomX >= 0 && bottomX <= params.rect.width) {
          position.toX = bottomX;
          position.toY = params.rect.height;
        }
      } else if (rightY >= 0 && rightY <= params.rect.height) {
        position.fromX = params.rect.width;
        position.fromY = rightY;
        if (bottomX >= 0 && bottomX <= params.rect.width) {
          position.toX = bottomX;
          position.toY = params.rect.height;
        }
      }
      position.fromX += params.rect.x;
      position.toX += params.rect.x;
      position.fromY += params.rect.y;
      position.toY += params.rect.y;
      lineArray.push(position);
    }
    return lineArray;
  }
}
