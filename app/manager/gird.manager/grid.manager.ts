/*
 * @author allen
 * @data 2020/11/12 15:56
 */
import {
  GridArea,
  GridGap, Mark,
  SizeUnit,
  SpacingPadding,
  UISize
} from 'towify-editor-common-values';
import {
  DefaultOffset,
  DefaultRect,
  GridChildInfo,
  RectInfo
} from '../../type/common.type';
import { GridUtils } from '../../utils/grid.utils/grid.utils';
import { ErrorUtils } from '../../utils/error.utils/error.utils';
import { UISizeUtils } from '../../utils/ui.size.utils/ui.size.utils';

export class GridManager {
  #gridRect?: RectInfo;
  childInfoList: GridChildInfo[] = [];
  gridColumnInfo: UISize[] = [];
  gridRowInfo: UISize[] = [];
  #rowGap = 0;
  #columnGap = 0;
  gridActiveRect = DefaultRect;
  padding = DefaultOffset;
  border = DefaultOffset;

  setGridRect(rect: RectInfo): GridManager {
    this.#gridRect = rect;
    this.updateGridActiveRect();
    return this;
  }

  get gridRect(): RectInfo {
    return this.#gridRect ?? DefaultRect;
  }

  get activeStatus(): boolean {
    return this.#gridRect !== undefined;
  }

  setGridColumnInfo(info: UISize[]): GridManager {
    this.gridColumnInfo = [];
    info.forEach(unit => {
      this.gridColumnInfo.push(JSON.parse(JSON.stringify(unit)));
    });
    return this;
  }

  setGridRowInfo(info: UISize[]): GridManager {
    this.gridRowInfo = [];
    info.forEach(unit => {
      this.gridRowInfo.push(JSON.parse(JSON.stringify(unit)));
    });
    return this;
  }

  setGridCount(params: {
    row: number;
    column: number;
    gap?: GridGap;
  }): GridManager {
    if (!this.gridActiveRect) {
      ErrorUtils.GridError('GridSize is undefined');
      return this;
    }
    this.gridRowInfo = [];
    this.gridColumnInfo = [];
    if (params.gap?.row) {
      this.#rowGap = this.convertSizeInfoToNumber(
        params.gap.row,
        this.gridActiveRect.height
      );
    }
    if (params.gap?.column) {
      this.#columnGap = this.convertSizeInfoToNumber(
        params.gap.column,
        this.gridActiveRect.width
      );
    }
    let rowIndex = 0;
    for (rowIndex; rowIndex < params.row; rowIndex += 1) {
      this.gridRowInfo.push({
        value:
          (this.gridActiveRect.height - this.#rowGap * (params.row - 1)) /
          params.row,
        unit: SizeUnit.PX
      });
    }
    let columnIndex = 0;
    for (columnIndex; columnIndex < params.column; columnIndex += 1) {
      this.gridColumnInfo.push({
        value:
          (this.gridActiveRect.width - this.#columnGap * (params.column - 1)) /
          params.column,
        unit: SizeUnit.PX
      });
    }
    return this;
  }

  setGap(gap: GridGap): GridManager {
    if (!this.gridActiveRect) {
      ErrorUtils.GridError('GridSize is undefined');
      return this;
    }
    this.#rowGap = this.convertSizeInfoToNumber(
      gap.row,
      this.gridActiveRect?.height
    );
    this.#columnGap = this.convertSizeInfoToNumber(
      gap.column,
      this.gridActiveRect?.width
    );
    return this;
  }

  setPadding(padding: SpacingPadding): GridManager {
    this.padding = this.convertOffsetValue(padding);
    this.updateGridActiveRect();
    return this;
  }

  setBorder(border: SpacingPadding): GridManager {
    this.border = this.convertOffsetValue(border);
    this.updateGridActiveRect();
    return this;
  }

  setChildrenInfo(childrenInfo: GridChildInfo[]): GridManager {
    this.childInfoList.splice(0, this.childInfoList.length);
    childrenInfo.forEach(child => {
      this.childInfoList.push(child);
    });
    return this;
  }

  getGridAreaAutoNumber(params: {
    start: number;
    end: number;
    sizeInfoList: UISize[];
  }): number {
    let startIndex = params.start;
    let autoNumber = 0;
    for (startIndex; startIndex < params.end; startIndex += 1) {
      if (startIndex < params.sizeInfoList.length && startIndex >= 0) {
        if (params.sizeInfoList[startIndex].value === Mark.Auto) {
          autoNumber += 1;
        }
      }
    }
    return autoNumber;
  }

  getGridItemRectList(autoActive: boolean = true): RectInfo[][] {
    if (!this.gridActiveRect) {
      return [];
    }
    const gridColumnInfo = this.gridColumnInfo ?? [];
    const gridRowInfo = this.gridRowInfo ?? [];
    let columnAutoOffsetList;
    let rowAutoOffsetList;
    if (autoActive) {
      columnAutoOffsetList = this.getAutoOffsetList(gridColumnInfo);
      rowAutoOffsetList = this.getAutoOffsetList(gridRowInfo);
    }
    const gridWidth =
      this.gridActiveRect.width - (gridColumnInfo.length - 1) * this.#columnGap;
    const gridHeight =
      this.gridActiveRect.height - (gridRowInfo.length - 1) * this.#rowGap;
    const columnsNumberArray = GridUtils.getGridRowOrColumnItemValues({
      sizeInfoList: gridColumnInfo,
      maxValue: gridWidth,
      autoOffsetList: columnAutoOffsetList
    });
    const rowsNumberArray = GridUtils.getGridRowOrColumnItemValues({
      sizeInfoList: gridRowInfo,
      maxValue: gridHeight,
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
    let rowY = this.gridActiveRect.y;
    let rowHeight = 0;
    let columnX = this.gridActiveRect.x;
    let columnWidth = 0;
    let rowArray: RectInfo[] = [];
    for (rowIndex; rowIndex < rowLength; rowIndex += 1) {
      rowArray = [];
      columnX = this.gridActiveRect.x;
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
        columnX += this.#columnGap;
      }
      rowY += rowHeight;
      rowY += this.#rowGap;
      itemRectList.push(rowArray);
    }
    return itemRectList;
  }

  convertSizeInfoToNumber(sizeInfo: UISize, maxValue?: number): number {
    return UISizeUtils.convertSizeInfoToNumber(sizeInfo, maxValue);
  }

  convertNumberToSizeInfo(params: {
    valueNumber: number;
    unit: SizeUnit;
    maxValue?: number;
  }): UISize {
    return UISizeUtils.convertNumberToSizeInfo({
      valueNumber: params.valueNumber,
      unit: params.unit,
      maxValue: params.maxValue
    });
  }

  convertChildSizeInfoToNumber(params: {
    gridArea: GridArea;
    gridItemRectList: RectInfo[][];
  }): RectInfo {
    return GridUtils.convertChildSizeInfoToNumber({
      gridArea: params.gridArea,
      gridItemRectList: params.gridItemRectList,
      gridRect: this.gridActiveRect
    });
  }

  getChildGridAreaInfoByRect(params: {
    rect: RectInfo;
    gridItemRectList: RectInfo[][];
  }): {
      gridArea: GridArea;
      marginLeft: number;
      marginTop: number;
    } {
    return GridUtils.getChildGridAreaInfoByRect({
      rect: params.rect,
      gridItemRectList: params.gridItemRectList,
      rowGap: this.#rowGap,
      columnGap: this.#columnGap
    });
  }

  getGridMarginInfoByRect(params: {
    rect: RectInfo;
    gridArea: GridArea;
    gridItemRectList: RectInfo[][];
  }): {
      marginLeft: number;
      marginTop: number;
    } {
    return GridUtils.getGridMarginInfoByRect({
      rect: params.rect,
      gridArea: params.gridArea,
      gridItemRectList: params.gridItemRectList,
      rowGap: this.#columnGap,
      columnGap: this.#columnGap
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
      child.size.width,
      childGridRect.width
    );
    const childHeight = this.convertSizeInfoToNumber(
      child.size.height,
      childGridRect.height
    );
    const childX =
      childGridRect.x +
      this.convertSizeInfoToNumber(child.margin.left, childGridRect.width);
    const childY =
      childGridRect.y +
      this.convertSizeInfoToNumber(child.margin.top, childGridRect.height);
    child.rect = {
      x: childX,
      y: childY,
      width: childWidth,
      height: childHeight
    };
    return child;
  }

  needUpdateGridChildren(): boolean {
    let rowAutoNumber = 0;
    this.gridRowInfo.forEach(row => {
      if (row.value === Mark.Auto) {
        rowAutoNumber += 1;
      }
    });
    let columnAutoNumber = 0;
    this.gridColumnInfo.forEach(column => {
      if (column.value === Mark.Auto) {
        columnAutoNumber += 1;
      }
    });
    const isNeedUpdateRow = rowAutoNumber > 1;
    const isNeedUpdateColumn = columnAutoNumber > 1;
    return isNeedUpdateRow || isNeedUpdateColumn;
  }

  private updateGridActiveRect(): void {
    if (this.#gridRect) {
      this.gridActiveRect = GridUtils.getActiveRect({
        rect: this.#gridRect,
        padding: this.padding,
        border: this.border
      });
    }
  }

  private getAutoOffsetList(
    list: UISize[]
  ): {
      minusOffsetId: string;
      minusOffset: number;
      plusOffset: number;
    }[] {
    return list.map((size, index) => {
      if (size.value === Mark.Auto) {
        return this.getGridAutoOffsetValueByIndex({
          index,
          sizeInfoList: list,
          isRow: false
        });
      }
      return {
        minusOffsetId: '-1',
        minusOffset: 0,
        plusOffset: 0
      };
    });
  }

  private getGridAutoOffsetValueByIndex(params: {
    index: number;
    sizeInfoList: UISize[];
    isRow: boolean;
  }): {
      minusOffsetId: string;
      minusOffset: number;
      plusOffset: number;
    } {
    let start = 0;
    let end = 0;
    let minusOffset = 0;
    let plusOffset = 0;
    let offsetValue = 0;
    let minusOffsetId = '';
    let rowDValue = 0;
    let haveSingleChild = false;
    let sizeValue: UISize;
    let marginMax: UISize;
    let marginMin: UISize;
    this.childInfoList.forEach(child => {
      if (params.isRow) {
        start = child.gridArea.rowStart - 1;
        end = child.gridArea.rowEnd - 1;
        sizeValue = child.size.height;
        marginMax = child.margin.top;
        marginMin = child.margin.bottom;
      } else {
        start = child.gridArea.columnStart - 1;
        end = child.gridArea.columnEnd - 1;
        sizeValue = child.size.width;
        marginMax = child.margin.left;
        marginMin = child.margin.right;
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
          minusOffsetId = child.id;
        }
        if (rowDValue === 1) {
          if (!haveSingleChild || offsetValue > plusOffset) {
            plusOffset = offsetValue;
          }
          haveSingleChild = true;
        } else if (!haveSingleChild && offsetValue > plusOffset) {
          plusOffset = offsetValue;
        }
      }
    });
    return {
      minusOffsetId,
      minusOffset,
      plusOffset
    };
  }

  private getChildOffValueInGridAutoItem(params: {
    start: number;
    end: number;
    sizeValue: UISize;
    marginMax: UISize;
    marginMin: UISize;
    sizeInfoList: UISize[];
  }): number {
    let totalValue = 0;
    const autoNumber = this.getGridAreaAutoNumber(params);
    totalValue += this.convertSizeInfoToNumber(params.sizeValue);
    totalValue += this.convertSizeInfoToNumber(params.marginMin);
    totalValue += this.convertSizeInfoToNumber(params.marginMax);
    let startIndex = params.start;
    for (startIndex; startIndex < params.end; startIndex += 1) {
      if (startIndex < params.sizeInfoList.length && startIndex >= 0) {
        if (
          params.sizeInfoList[startIndex].value !== Mark.Auto &&
          params.sizeInfoList[startIndex].value !== Mark.Unset
        ) {
          totalValue -= this.convertSizeInfoToNumber(
            params.sizeInfoList[startIndex]
          );
        }
      }
    }
    if (autoNumber > 0 && totalValue > 0) {
      return parseFloat((totalValue / autoNumber).toFixed(2));
    }
    return 0;
  }

  private convertOffsetValue(
    offset: SpacingPadding
  ): {
      left: number;
      right: number;
      top: number;
      bottom: number;
    } {
    const left = this.convertSizeInfoToNumber(
      offset.left,
      this.#gridRect?.width
    );
    const right = this.convertSizeInfoToNumber(
      offset.right,
      this.#gridRect?.width
    );
    const top = this.convertSizeInfoToNumber(
      offset.top,
      this.#gridRect?.height
    );
    const bottom = this.convertSizeInfoToNumber(
      offset.bottom,
      this.#gridRect?.height
    );
    return {
      left,
      right,
      top,
      bottom
    };
  }
}
