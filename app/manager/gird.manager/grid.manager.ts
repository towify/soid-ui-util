/*
 * @author allen
 * @data 2020/11/12 15:56
 */
import {
  GridAreaInfo,
  GridChildInfo,
  PaddingInfo,
  RectInfo
} from '../../type/common.type';
import { GridUtils } from '../../utils/grid.utils/grid.utils';
import { GridLineUtils } from '../../utils/grid.utils/grid.line.utils';

export class GridManager {
  gridSize?: { width: number; height: number };
  #gridRect = {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  };

  #gridColumnInfo?: { value: number; unit: string }[];
  #gridRowInfo?: { value: number; unit: string }[];
  #windowSize?: { width: number; height: number };
  #gridRowGap = 0;
  #gridColumnGap = 0;
  #gridPadding = {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0
  };

  childInfoList: GridChildInfo[] = [];

  get gridColumnInfo(): { value: number; unit: string }[] {
    if (this.#gridColumnInfo) {
      return this.#gridColumnInfo;
    }
    return [];
  }

  get gridRowInfo(): { value: number; unit: string }[] {
    if (this.#gridRowInfo) {
      return this.#gridRowInfo;
    }
    return [];
  }

  setWindowSize(width: number, height: number): void {
    this.#windowSize = {
      width,
      height
    };
  }

  setGridSize(width: number, height: number): void {
    this.gridSize = {
      width,
      height
    };
    this.setParentGridRect();
  }

  setGridColumnInfo(info: { value: number; unit: string }[]): void {
    this.#gridColumnInfo = info;
  }

  setGridRowInfo(info: { value: number; unit: string }[]): void {
    this.#gridRowInfo = info;
  }

  setGridCount(params: {
    row: number;
    column: number;
    rowGap?: { value: number; unit: string };
    columnGap?: { value: number; unit: string };
  }): void {
    if (!this.#gridRect) {
      console.error(
        'SOID-UI-UTIL',
        'GridAreaService',
        '#gridRect is undefined'
      );
      return;
    }
    this.#gridRowInfo = [];
    this.#gridColumnInfo = [];
    if (params.rowGap) {
      this.#gridRowGap = this.convertSizeInfoToNumber(
        params.rowGap,
        this.#gridRect.height
      );
    }
    if (params.columnGap) {
      this.#gridColumnGap = this.convertSizeInfoToNumber(
        params.columnGap,
        this.#gridRect.width
      );
    }
    let rowIndex = 0;
    for (rowIndex; rowIndex < params.row; rowIndex += 1) {
      this.#gridRowInfo.push({
        value:
          (this.#gridRect.height - this.#gridRowGap * (params.row - 1)) /
          params.row,
        unit: GridUtils.PXUnit
      });
    }
    let columnIndex = 0;
    for (columnIndex; columnIndex < params.column; columnIndex += 1) {
      this.#gridColumnInfo.push({
        value:
          (this.#gridRect.width - this.#gridColumnGap * (params.column - 1)) /
          params.column,
        unit: GridUtils.PXUnit
      });
    }
  }

  setGridGap(
    row: { value: number; unit: string },
    column: { value: number; unit: string }
  ): void {
    if (!this.#gridRect) {
      console.error(
        'SOID-UI-UTIL',
        'GridAreaService',
        '#gridRect is undefined'
      );
      return;
    }
    this.#gridRowGap = this.convertSizeInfoToNumber(row, this.#gridRect?.width);
    this.#gridColumnGap = this.convertSizeInfoToNumber(
      column,
      this.#gridRect?.width
    );
  }

  setGridPaddingInfo(padding: PaddingInfo): void {
    this.#gridPadding.left = this.convertSizeInfoToNumber(
      padding.left,
      this.gridSize?.width
    );
    this.#gridPadding.right = this.convertSizeInfoToNumber(
      padding.right,
      this.gridSize?.width
    );
    this.#gridPadding.top = this.convertSizeInfoToNumber(
      padding.top,
      this.gridSize?.height
    );
    this.#gridPadding.bottom = this.convertSizeInfoToNumber(
      padding.bottom,
      this.gridSize?.height
    );
    this.setParentGridRect();
  }

  getGridAreaAutoNumber(params: {
    start: number;
    end: number;
    sizeInfoList: { value: number; unit: string }[];
  }): number {
    let startIndex = params.start;
    let autoNumber = 0;
    for (startIndex; startIndex < params.end; startIndex += 1) {
      if (startIndex < params.sizeInfoList.length && startIndex >= 0) {
        if (params.sizeInfoList[startIndex].value === GridUtils.AutoNumber) {
          autoNumber += 1;
        }
      }
    }
    return autoNumber;
  }

  getGridItemRectList(autoActive: boolean = true): RectInfo[][] {
    if (!this.#gridRect) {
      return [];
    }
    const gridColumnInfo = this.#gridColumnInfo ?? [];
    const gridRowInfo = this.#gridRowInfo ?? [];
    let columnAutoOffsetList;
    let rowAutoOffsetList;
    if (autoActive) {
      columnAutoOffsetList = gridColumnInfo.map((columnInfo, index) => {
        if (columnInfo.value === GridUtils.AutoNumber) {
          return this.getGridColumnAutoValueByIndex(index, gridColumnInfo);
        }
        return 0;
      });
      rowAutoOffsetList = gridRowInfo.map((rowInfo, index) => {
        if (rowInfo.value === GridUtils.AutoNumber) {
          return this.getGridRowAutoValueByIndex(index, gridRowInfo);
        }
        return 0;
      });
    }
    const gridWidth =
      this.#gridRect.width - (gridColumnInfo.length - 1) * this.#gridColumnGap;
    const gridHeight =
      this.#gridRect.height - (gridRowInfo.length - 1) * this.#gridRowGap;
    const columnsNumberArray = GridUtils.getGridRowOrColumnItemValues({
      sizeInfoList: gridColumnInfo,
      maxValue: gridWidth,
      windowSize: this.#windowSize,
      autoOffsetList: columnAutoOffsetList
    });
    const rowsNumberArray = GridUtils.getGridRowOrColumnItemValues({
      sizeInfoList: gridRowInfo,
      maxValue: gridHeight,
      windowSize: this.#windowSize,
      autoOffsetList: rowAutoOffsetList
    });
    let rowIndex = 0;
    let rowLength = rowsNumberArray.length;
    if (rowLength === 0) {
      rowLength = 1;
      rowsNumberArray.push(gridHeight);
    }
    let columnIndex = 0;
    const itemRectList: RectInfo[][] = [];
    let columnLength = columnsNumberArray.length;
    if (columnLength === 0) {
      columnLength = 1;
      columnsNumberArray.push(gridWidth);
    }
    let rowY = this.#gridPadding.top;
    let rowHeight = 0;
    let columnX = this.#gridPadding.left;
    let columnWidth = 0;
    let rowArray: RectInfo[] = [];
    for (rowIndex; rowIndex < rowLength; rowIndex += 1) {
      rowArray = [];
      columnX = this.#gridPadding.left;
      rowHeight = rowsNumberArray[rowIndex];
      for (columnIndex = 0; columnIndex < columnLength; columnIndex += 1) {
        columnWidth = columnsNumberArray[columnIndex];
        rowArray.push({
          x: columnX,
          y: rowY,
          width: columnWidth,
          height: rowHeight
        });
        columnX += columnWidth;
        columnX += this.#gridColumnGap;
      }
      rowY += rowHeight;
      rowY += this.#gridRowGap;
      itemRectList.push(rowArray);
    }
    return itemRectList;
  }

  convertSizeInfoToNumber(
    sizeInfo: { value: number; unit: string },
    maxValue?: number
  ): number {
    return GridUtils.convertSizeInfoToNumber({
      sizeInfo,
      maxValue,
      windowSize: this.#windowSize
    });
  }

  convertNumberToSizeInfo(params: {
    valueNumber: number;
    unit: string;
    maxValue?: number;
  }): { value: number; unit: string } {
    return GridUtils.convertNumberToSizeInfo({
      valueNumber: params.valueNumber,
      unit: params.unit,
      maxValue: params.maxValue,
      windowSize: this.#windowSize
    });
  }

  convertChildSizeInfoToNumber(params: {
    gridArea: GridAreaInfo;
    gridItemRectList: RectInfo[][];
  }): RectInfo {
    return GridUtils.convertChildSizeInfoToNumber({
      gridArea: params.gridArea,
      gridItemRectList: params.gridItemRectList,
      gridRect: this.#gridRect
    });
  }

  getGridAreaInfoByRect(params: {
    rect: RectInfo;
    gridItemRectList: RectInfo[][];
  }): {
    gridArea: GridAreaInfo;
    marginLeft: number;
    marginTop: number;
  } {
    return GridUtils.getGridAreaInfoByRect({
      rect: params.rect,
      gridItemRectList: params.gridItemRectList,
      rowGap: this.#gridRowGap,
      columnGap: this.#gridColumnGap
    });
  }

  getGridMarginInfoByRect(params: {
    rect: RectInfo;
    gridArea: GridAreaInfo;
    gridItemRectList: RectInfo[][];
  }) {
    return GridUtils.getGridMarginInfoByRect({
      rect: params.rect,
      gridArea: params.gridArea,
      gridItemRectList: params.gridItemRectList,
      rowGap: this.#gridColumnGap,
      columnGap: this.#gridColumnGap
    });
  }

  getGridPaddingAreaAndLine(
    lineSpace: number
  ): {
    area: RectInfo[];
    lines: { fromX: number; fromY: number; toX: number; toY: number }[];
  } {
    return GridLineUtils.getGridPaddingAreaAndLine({
      gridPadding: this.#gridPadding,
      gridSize: this.gridSize!,
      lineSpace
    });
  }

  private setParentGridRect(): void {
    if (this.gridSize) {
      this.#gridRect = {
        x: this.#gridPadding.left,
        y: this.#gridPadding.top,
        width:
          this.gridSize.width -
          this.#gridPadding.left -
          this.#gridPadding.right,
        height:
          this.gridSize.height -
          this.#gridPadding.top -
          this.#gridPadding.bottom
      };
    }
  }

  private getGridRowAutoValueByIndex(
    index: number,
    rowInfoList: { value: number; unit: string }[]
  ): number {
    let maxValue = 0;
    let newValue = 0;
    this.childInfoList.forEach(child => {
      if (
        index >= child.gridArea.rowStart - 1 &&
        index < child.gridArea.rowEnd - 1
      ) {
        newValue = this.getChildOffValueInGridAutoItem({
          start: child.gridArea.rowStart - 1,
          end: child.gridArea.rowEnd - 1,
          sizeValue: child.height,
          marginMax: child.marginTop,
          marginMin: child.marginBottom,
          sizeInfoList: rowInfoList
        });
        if (newValue > maxValue) {
          maxValue = newValue;
        }
      }
    });
    return maxValue;
  }

  private getGridColumnAutoValueByIndex(
    index: number,
    columnInfoList: { value: number; unit: string }[]
  ): number {
    let maxValue = 0;
    let newValue = 0;
    this.childInfoList.forEach(child => {
      if (
        index >= child.gridArea.columnStart - 1 &&
        index < child.gridArea.columnEnd - 1
      ) {
        newValue = this.getChildOffValueInGridAutoItem({
          start: child.gridArea.columnStart - 1,
          end: child.gridArea.columnEnd - 1,
          sizeValue: child.width,
          marginMax: child.marginLeft,
          marginMin: child.marginRight,
          sizeInfoList: columnInfoList
        });
        if (newValue > maxValue) {
          maxValue = newValue;
        }
      }
    });
    return maxValue;
  }

  private getChildOffValueInGridAutoItem(params: {
    start: number;
    end: number;
    sizeValue: { value: number; unit: string };
    marginMax: { value: number; unit: string };
    marginMin: { value: number; unit: string };
    sizeInfoList: { value: number; unit: string }[];
  }): number {
    let totalValue = 0;
    const autoNumber = this.getGridAreaAutoNumber(params);
    totalValue += this.convertSizeInfoToNumber(params.sizeValue);
    totalValue += this.convertSizeInfoToNumber(params.marginMin);
    totalValue += this.convertSizeInfoToNumber(params.marginMax);
    if (autoNumber !== 0) {
      return parseFloat((totalValue / autoNumber).toFixed(2));
    }
    return 0;
  }
}
