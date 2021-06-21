/*
 * @author allen
 * @data 2020/11/23 23:02
 */
import {SizeUnit} from 'towify-editor-common-values';
import {LineInfo, RectInfo} from '../../type/common.type';
import {AlignOffsetInfo, SignInfo} from '../../type/interact.type';
import {GridMapping} from '../../mapping/grid.mapping/grid.mapping';
import {UISizeUtils} from "../ui.size.utils/ui.size.utils";

enum GridLineType {
  Horizontal = 'horizontal',
  Vertical = 'vertical'
}

export class GridLineUtils {
  static getGridLineInfos(
    gridMapping: GridMapping
  ): {
      canDrag: boolean,
      direction: 'top' | 'bottom' | 'left' | 'right',
      position: { fromRow: number, toRow: number, fromColumn: number, toColumn: number },
      line: LineInfo
    }[] {
    const result: {
      canDrag: boolean,
      direction: 'top' | 'bottom' | 'left' | 'right',
      position: { fromRow: number, toRow: number, fromColumn: number, toColumn: number },
      line: LineInfo
    }[] = [];
    const gridItemRectList = gridMapping.getGridItemRectList();
    gridItemRectList.forEach((rowItem, row) => {
      const position = { fromRow: row, toRow: row, fromColumn: 0, toColumn: rowItem.length - 1 };
      result.push({
        canDrag: !(gridMapping.isMoreAutoSizeInRow() &&
          (UISizeUtils.checkSizeInfoIsAuto(gridMapping.gridRowInfo[row]) ||
            UISizeUtils.checkSizeInfoIsAuto(gridMapping.gridRowInfo[row-1]))),
        direction: 'top',
        position,
        line: {
          fromX: rowItem[0].x,
          toX: rowItem[rowItem.length - 1].x + rowItem[rowItem.length - 1].width,
          fromY: rowItem[0].y,
          toY: rowItem[0].y
        }
      });
      result.push({
        canDrag: !(gridMapping.isMoreAutoSizeInRow() &&
          (UISizeUtils.checkSizeInfoIsAuto(gridMapping.gridRowInfo[row]) ||
            UISizeUtils.checkSizeInfoIsAuto(gridMapping.gridRowInfo[row+1]))),
        direction: 'bottom',
        position,
        line: {
          fromX: rowItem[0].x,
          toX: rowItem[rowItem.length - 1].x + rowItem[rowItem.length - 1].width,
          fromY: rowItem[0].y + rowItem[0].height,
          toY: rowItem[0].y + rowItem[0].height
        }
      });
    });
    const toY = gridItemRectList[gridItemRectList.length - 1][0].y + gridItemRectList[gridItemRectList.length - 1][0].height;
    gridItemRectList[0].forEach((columnRect, column) => {
      const position = { fromRow: 0, toRow: gridItemRectList.length - 1, fromColumn: column, toColumn: column };
      result.push({
        canDrag: !(gridMapping.isMoreAutoSizeInColumn() &&
          (UISizeUtils.checkSizeInfoIsAuto(gridMapping.gridColumnInfo[column]) ||
            UISizeUtils.checkSizeInfoIsAuto(gridMapping.gridColumnInfo[column-1]))),
        direction: 'left',
        position,
        line: {
          fromX: columnRect.x,
          toX: columnRect.x,
          fromY: columnRect.y,
          toY
        }
      });
      result.push({
        canDrag: !(gridMapping.isMoreAutoSizeInColumn() &&
          (UISizeUtils.checkSizeInfoIsAuto(gridMapping.gridColumnInfo[column]) ||
            UISizeUtils.checkSizeInfoIsAuto(gridMapping.gridColumnInfo[column+1]))),
        direction: 'right',
        position,
        line: {
          fromX: columnRect.x + columnRect.width,
          toX: columnRect.x + columnRect.width,
          fromY: columnRect.y,
          toY
        }
      });
    });
    result.sort((a, b) => {
      const aType =
        a.line.fromY === a.line.toY ? GridLineType.Horizontal : GridLineType.Vertical;
      const bType =
        b.line.fromY === b.line.toY ? GridLineType.Horizontal : GridLineType.Vertical;
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
          if (a.line.fromY < b.line.fromY) {
            return -1;
          }
          if (a.line.fromY > b.line.fromY) {
            return 1;
          }
          if (a.line.fromY === b.line.fromY) {
            return a.line.fromX < b.line.fromX ? -1 : 1;
          }
        }
        if (aType === GridLineType.Vertical) {
          if (a.line.fromX < b.line.fromX) {
            return -1;
          }
          if (a.line.fromX > b.line.fromX) {
            return 1;
          }
          if (a.line.fromX === b.line.fromX) {
            return a.line.fromY < b.line.fromY ? -1 : 1;
          }
        }
      }
      return 1;
    });
    let previousItem: {
      direction: 'top' | 'bottom' | 'left' | 'right',
      position: { fromRow: number, toRow: number, fromColumn: number, toColumn: number },
      line: LineInfo
    };
    return result.filter(item => {
      if (!previousItem) {
        previousItem = item;
        return true;
      }
      if (
        previousItem.line.fromX === item.line.fromX &&
        previousItem.line.fromY === item.line.fromY &&
        previousItem.line.toX === item.line.toX &&
        previousItem.line.toY === item.line.toY &&
          ((previousItem.direction === 'bottom' && item.direction === 'top') ||
              (previousItem.direction === 'right' && item.direction === 'left'))
      ) {
        return false;
      }
      previousItem = item;
      return true;
    });
  }

  static getGridGapRectAndSlashLinesList(params: {
    gridItemRectList: RectInfo[][];
    lineSpace: number;
  }): {
      rect: RectInfo,
      slashLines: LineInfo[]
    }[] {
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
    const columnResult = columnGapArea.map<{
      rect: RectInfo,
      slashLines: LineInfo[]
    }>(rect => ({
      rect,
      slashLines: GridLineUtils.getRectSlashLines({
        rect,
        lineSpace: params.lineSpace,
        rectType: GridLineType.Vertical
      })
    }));
    const rowResult = rowGapArea.map<{
      rect: RectInfo,
      slashLines: LineInfo[]
    }>(rect => ({
      rect,
      slashLines: GridLineUtils.getRectSlashLines({
        rect,
        lineSpace: params.lineSpace,
        rectType: GridLineType.Horizontal
      })
    }));
    return columnResult.concat(rowResult);
  }

  static getGridPaddingRectAndSlashLinesList(params: {
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
      rect: RectInfo,
      slashLines: LineInfo[]
    }[] {
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
    const columnResult = columnPaddingArea.map<{
      rect: RectInfo,
      slashLines: LineInfo[]
    }>(rect => ({
      rect,
      slashLines: GridLineUtils.getRectSlashLines({
        rect,
        lineSpace: params.lineSpace,
        rectType: GridLineType.Vertical
      })
    }));
    const rowResult = rowPaddingArea.map<{
      rect: RectInfo,
      slashLines: LineInfo[]
    }>(rect => ({
      rect,
      slashLines: GridLineUtils.getRectSlashLines({
        rect,
        lineSpace: params.lineSpace,
        rectType: GridLineType.Horizontal
      })
    }));
    return columnResult.concat(rowResult);
  }

  static getRectSlashLines(params: {
    rect: RectInfo;
    rectType: GridLineType;
    lineSpace: number;
    appendRect?: boolean
  }): LineInfo[] {
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
      if (params.appendRect) {
        position.fromX += params.rect.x;
        position.toX += params.rect.x;
        position.fromY += params.rect.y;
        position.toY += params.rect.y;
      }
      lineArray.push(position);
    }
    return lineArray;
  }

  static convertAlignAndAssistLineInfo(params: {
    alignLineInfo: {
      lines: LineInfo[];
      offset: AlignOffsetInfo;
    };
    assistLineInfo: {
      lines: LineInfo[];
      signs: SignInfo[];
    };
    gridMapping: GridMapping;
  }): {
      assistLines: LineInfo[];
      assistSigns: SignInfo[];
      alignLines: LineInfo[];
      offset: AlignOffsetInfo;
    } {
    const rect = params.gridMapping.gridRect;
    return {
      assistLines: params.assistLineInfo.lines.map(line => ({
        fromX: line.fromX + rect.x,
        fromY: line.fromY + rect.y,
        toX: line.toX + rect.x,
        toY: line.toY + rect.y
      })),
      alignLines: params.alignLineInfo.lines.map(line => ({
        fromX: line.fromX + rect.x,
        fromY: line.fromY + rect.y,
        toX: line.toX + rect.x,
        toY: line.toY + rect.y
      })),
      assistSigns: params.assistLineInfo.signs.map(sign => ({
        x: sign.x + rect.x,
        y: sign.y + rect.y,
        sign: sign.sign
      })),
      offset: params.alignLineInfo.offset
    };
  }
}
