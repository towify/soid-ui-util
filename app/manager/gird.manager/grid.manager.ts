/*
 * @author allen
 * @data 2020/11/12 15:56
 */
import {
  DefaultOffset,
  DefaultRect,
  GridAreaInfo,
  GridChildInfo,
  OffSetInfo,
  RectInfo
} from '../../type/common.type';
import { GridUtils } from '../../utils/grid.utils/grid.utils';
import { ErrorUtils } from '../../utils/error.utils/error.utils';

export class GridManager {
  gridSize?: { width: number; height: number };
  childInfoList: GridChildInfo[] = [];
  #gridColumnInfo?: { value: number; unit: string }[];
  #gridRowInfo?: { value: number; unit: string }[];
  #windowSize?: { width: number; height: number };
  #gridRowGap = 0;
  #gridColumnGap = 0;
  #gridRect = DefaultRect;
  gridPadding = DefaultOffset;
  gridBorder = DefaultOffset;

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
    this.updateGridRect();
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
      ErrorUtils.GridError('GridSize is undefined');
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
      ErrorUtils.GridError('GridSize is undefined');
      return;
    }
    this.#gridRowGap = this.convertSizeInfoToNumber(row, this.#gridRect?.width);
    this.#gridColumnGap = this.convertSizeInfoToNumber(
      column,
      this.#gridRect?.width
    );
  }

  setGridPaddingInfo(padding: OffSetInfo): void {
    this.gridPadding = this.convertOffsetValue(padding);
    this.updateGridRect();
  }

  setGridBorderInfo(border: OffSetInfo): void {
    this.gridBorder = this.convertOffsetValue(border);
    this.updateGridRect();
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
          return this.getGridAutoOffsetValueByIndex({
            index,
            sizeInfoList: gridColumnInfo,
            isRow: false
          });
        }
        return {
          minusOffset: 0,
          plusOffset: 0,
          minusOffSetId: '-1'
        };
      });
      rowAutoOffsetList = gridRowInfo.map((rowInfo, index) => {
        if (rowInfo.value === GridUtils.AutoNumber) {
          return this.getGridAutoOffsetValueByIndex({
            index,
            sizeInfoList: gridRowInfo,
            isRow: true
          });
        }
        return {
          minusOffset: 0,
          plusOffset: 0,
          minusOffSetId: '-1'
        };
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
    let rowY = this.gridPadding.top;
    let rowHeight = 0;
    let columnX = this.gridPadding.left;
    let columnWidth = 0;
    let rowArray: RectInfo[] = [];
    for (rowIndex; rowIndex < rowLength; rowIndex += 1) {
      rowArray = [];
      columnX = this.gridPadding.left;
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

  getChildGridAreaInfoByRect(params: {
    rect: RectInfo;
    gridItemRectList: RectInfo[][];
  }): {
    gridArea: GridAreaInfo;
    marginLeft: number;
    marginTop: number;
  } {
    return GridUtils.getChildGridAreaInfoByRect({
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
  }): {
    marginLeft: number;
    marginTop: number;
  } {
    return GridUtils.getGridMarginInfoByRect({
      rect: params.rect,
      gridArea: params.gridArea,
      gridItemRectList: params.gridItemRectList,
      rowGap: this.#gridColumnGap,
      columnGap: this.#gridColumnGap
    });
  }

  updateChildRect(
    child: GridChildInfo,
    gridItemRectList: RectInfo[][]
  ): GridChildInfo {
    const childGridRect = this.convertChildSizeInfoToNumber({
      gridArea: child.gridArea,
      gridItemRectList
    });
    const childWidth = this.convertSizeInfoToNumber(
      child.width,
      childGridRect.width
    );
    const childHeight = this.convertSizeInfoToNumber(
      child.height,
      childGridRect.height
    );
    const childX =
      childGridRect.x +
      this.convertSizeInfoToNumber(child.marginLeft, childGridRect.width);
    const childY =
      childGridRect.y +
      this.convertSizeInfoToNumber(child.marginTop, childGridRect.height);
    child.rect = {
      x: childX,
      y: childY,
      width: childWidth,
      height: childHeight
    };
    return child;
  }

  private updateGridRect(): void {
    if (this.gridSize) {
      this.#gridRect = {
        x: this.gridPadding.left + this.gridBorder.left,
        y: this.gridPadding.top + this.gridBorder.top,
        width:
          this.gridSize.width -
          this.gridPadding.left -
          this.gridPadding.right -
          this.gridBorder.left -
          this.gridBorder.right,
        height:
          this.gridSize.height -
          this.gridPadding.top -
          this.gridPadding.bottom -
          this.gridBorder.top -
          this.gridBorder.bottom
      };
    }
  }

  private getGridAutoOffsetValueByIndex(params: {
    index: number;
    sizeInfoList: { value: number; unit: string }[];
    isRow: boolean;
  }): {
    minusOffset: number;
    plusOffset: number;
    minusOffSetId: string;
  } {
    let start = 0;
    let end = 0;
    let minusOffset = 0;
    let plusOffset = 0;
    let offsetValue = 0;
    let minusOffSetId = '';
    let rowDValue = 0;
    let haveSingleChild = false;
    let sizeValue: { value: number; unit: string };
    let marginMax: { value: number; unit: string };
    let marginMin: { value: number; unit: string };
    this.childInfoList.forEach(child => {
      if (params.isRow) {
        start = child.gridArea.rowStart - 1;
        end = child.gridArea.rowEnd - 1;
        sizeValue = child.height;
        marginMax = child.marginTop;
        marginMin = child.marginBottom;
      } else {
        start = child.gridArea.columnStart - 1;
        end = child.gridArea.columnEnd - 1;
        sizeValue = child.width;
        marginMax = child.marginLeft;
        marginMin = child.marginRight;
      }
      rowDValue = end - start;
      if (params.index >= start && params.index < end) {
        offsetValue = this.getChildOffValueInGridAutoItem({
          start,
          end,
          sizeValue,
          marginMax,
          marginMin,
          sizeInfoList: params.sizeInfoList
        });
        if (offsetValue > minusOffset) {
          minusOffset = offsetValue;
          minusOffSetId = child.id;
        }
        if (rowDValue === 1) {
          if (!haveSingleChild || offsetValue > plusOffset) {
            plusOffset = offsetValue;
          }
          haveSingleChild = true;
        } else if (!haveSingleChild && offsetValue > plusOffset) {
          plusOffset = offsetValue;
        }
        if (offsetValue === 0) {
          plusOffset = offsetValue;
        }
      }
    });
    return {
      minusOffset,
      plusOffset,
      minusOffSetId
    };
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
    if (autoNumber > 0 && totalValue > 0) {
      return parseFloat((totalValue / autoNumber).toFixed(2));
    }
    return 0;
  }

  private convertOffsetValue(
    offset: OffSetInfo
  ): {
    left: number;
    right: number;
    top: number;
    bottom: number;
  } {
    const left = this.convertSizeInfoToNumber(
      offset.left,
      this.gridSize?.width
    );
    const right = this.convertSizeInfoToNumber(
      offset.right,
      this.gridSize?.width
    );
    const top = this.convertSizeInfoToNumber(offset.top, this.gridSize?.height);
    const bottom = this.convertSizeInfoToNumber(
      offset.bottom,
      this.gridSize?.height
    );
    return {
      left,
      right,
      top,
      bottom
    };
  }
}
