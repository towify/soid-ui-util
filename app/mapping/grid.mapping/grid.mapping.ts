/*
 * @author allen
 * @data 2020/11/12 15:56
 */
import {
  CustomGrid,
  GridArea,
  GridGap,
  SizeUnit,
  SpacingPadding,
  UISize
} from '@towify/common-values';
import { GridChildInfo, PaddingInfo, RectInfo, UnsetUnit } from '../../type/common.type';
import { GridUtils } from '../../utils/grid.utils/grid.utils';
import { UISizeUtils } from '../../utils/ui.size.utils/ui.size.utils';

export class GridMapping {
  #gridRect = {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  };

  #parentRect = {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  };

  constructor(
    public gap: GridGap,
    public padding: SpacingPadding,
    public border: SpacingPadding,
    public columnCount: number,
    public rowCount: number,
    public customGrid?: CustomGrid,
    public readonly childInfoList: GridChildInfo[] = []
  ) {}

  set parentRect(value: RectInfo) {
    this.#parentRect = value;
  }

  set gridRect(value: RectInfo) {
    this.#gridRect = value;
    this.childInfoList.forEach(child => {
      child.rect = this.getGridChildRect(child);
      this.childInfoList.push(child);
    });
  }

  get gridRect(): RectInfo {
    return this.#gridRect;
  }

  get gridActiveRect(): RectInfo {
    return GridUtils.getActiveRect({
      rect: this.gridRect,
      padding: this.paddingInfo,
      border: this.borderInfo
    });
  }

  get paddingInfo(): PaddingInfo {
    return GridUtils.convertOffsetValue(this.padding, this.#parentRect.width);
  }

  get borderInfo(): PaddingInfo {
    return GridUtils.convertOffsetValue(this.border);
  }

  get rowGap(): number {
    return UISizeUtils.convertUISizeToNumber(this.gap.row, this.gridActiveRect.height);
  }

  get columnGap(): number {
    return UISizeUtils.convertUISizeToNumber(this.gap.column, this.gridActiveRect.width);
  }

  get gridColumnInfo(): UISize[] {
    if (this.customGrid && this.customGrid.column.length) {
      return this.customGrid.column;
    }
    let columnIndex = 0;
    const gridColumnInfo = [];
    for (columnIndex; columnIndex < this.columnCount; columnIndex += 1) {
      gridColumnInfo.push({
        value:
          (this.gridActiveRect.width - this.columnGap * (this.columnCount - 1)) / this.columnCount,
        unit: SizeUnit.PX
      });
    }
    return gridColumnInfo;
  }

  get gridRowInfo(): UISize[] {
    if (this.customGrid && this.customGrid.row.length) {
      return this.customGrid.row;
    }
    let rowIndex = 0;
    const gridRowInfo = [];
    for (rowIndex; rowIndex < this.rowCount; rowIndex += 1) {
      gridRowInfo.push({
        value: (this.gridActiveRect.height - this.rowGap * (this.rowCount - 1)) / this.rowCount,
        unit: SizeUnit.PX
      });
    }
    return gridRowInfo;
  }

  convertSizeInfoToNumber(params: {
    value: UISize;
    max: UISize;
    min: UISize;
    maxValue?: number;
  }): number {
    const sizeInfo = UISizeUtils.getValidRenderSizeByComparing({
      origin: params.value,
      max: params.max,
      min: params.min,
      parentSizeValue: params.maxValue
    });
    return UISizeUtils.convertUISizeToNumber(sizeInfo, params.maxValue);
  }

  setChildrenInfo(childrenInfo: GridChildInfo[]): GridMapping {
    this.childInfoList.splice(0, this.childInfoList.length);
    childrenInfo.forEach(child => {
      child.rect = this.getGridChildRect(child);
      this.childInfoList.push(child);
    });
    return this;
  }

  // 获取 grid 布局下每个 item 的 rect
  getGridItemRectList(autoActive: boolean = true): RectInfo[][] {
    const gridColumnInfo = this.gridColumnInfo ?? [];
    const gridRowInfo = this.gridRowInfo ?? [];
    let columnAutoOffsetList;
    let rowAutoOffsetList;
    if (autoActive) {
      columnAutoOffsetList = this.getAutoOffsetList(gridColumnInfo, false);
      rowAutoOffsetList = this.getAutoOffsetList(gridRowInfo, true);
    }
    const gridWidth = this.gridActiveRect.width - (gridColumnInfo.length - 1) * this.columnGap;
    const gridHeight = this.gridActiveRect.height - (gridRowInfo.length - 1) * this.rowGap;
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
        columnX += this.columnGap;
      }
      rowY += rowHeight;
      rowY += this.rowGap;
      itemRectList.push(rowArray);
    }
    return itemRectList;
  }

  getChildGridAreaInfoByRect(params: { rect: RectInfo; gridItemRectList: RectInfo[][] }): {
    gridArea: GridArea;
    marginLeft: number;
    marginTop: number;
  } {
    return GridUtils.getChildGridAreaInfoByRect({
      rect: params.rect,
      gridItemRectList: params.gridItemRectList,
      rowGap: this.rowGap,
      columnGap: this.columnGap
    });
  }

  getGridChildRect(child: GridChildInfo, itemRectList?: RectInfo[][]): RectInfo {
    const gridItemRectList = itemRectList ?? this.getGridItemRectList();
    const childGridRect = GridUtils.convertChildSizeInfoToNumber({
      gridArea: child.gridArea,
      gridRect: this.gridActiveRect,
      gridItemRectList
    });
    const childWidth = this.convertSizeInfoToNumber({
      value: child.size.width,
      max: child.size.maxWidth,
      min: child.size.minWidth,
      maxValue: childGridRect.width
    });
    const childHeight = this.convertSizeInfoToNumber({
      value: child.size.height,
      max: child.size.maxHeight,
      min: child.size.minHeight,
      maxValue: childGridRect.height
    });
    const marginLeftValue = UISizeUtils.convertUISizeToNumber(
      child.margin.left,
      childGridRect.width
    );
    const marginTopValue = UISizeUtils.convertUISizeToNumber(child.margin.top, childGridRect.width);
    let childX = childGridRect.x + marginLeftValue;
    let childY = childGridRect.y + marginTopValue;
    if (child.placeSelf.justifySelf) {
      switch (child.placeSelf.justifySelf) {
        case 'center': {
          childX = childGridRect.x + (childGridRect.width - childWidth) / 2 + marginLeftValue / 2;
          break;
        }
        case 'end': {
          childX = childGridRect.x + (childGridRect.width - childWidth);
          break;
        }
        default: {
          childX = childGridRect.x + marginLeftValue;
          break;
        }
      }
    }
    if (child.placeSelf.alignSelf) {
      switch (child.placeSelf.alignSelf) {
        case 'center': {
          childY = childGridRect.y + (childGridRect.height - childHeight) / 2 + marginTopValue / 2;
          break;
        }
        case 'end': {
          childY = childGridRect.y + (childGridRect.height - childHeight);
          break;
        }
        default: {
          childY = childGridRect.y + marginTopValue;
          break;
        }
      }
    }
    child.parentRect = childGridRect;
    return {
      x: childX,
      y: childY,
      width: childWidth,
      height: childHeight
    };
  }

  isMoreAutoSizeInRow(): boolean {
    let rowAutoNumber = 0;
    this.gridRowInfo.forEach(row => {
      if (UISizeUtils.checkSizeInfoIsAuto(row)) {
        rowAutoNumber += 1;
      }
    });
    return rowAutoNumber > 1;
  }

  isMoreAutoSizeInColumn(): boolean {
    let columnAutoNumber = 0;
    this.gridColumnInfo.forEach(column => {
      if (UISizeUtils.checkSizeInfoIsAuto(column)) {
        columnAutoNumber += 1;
      }
    });
    return columnAutoNumber > 1;
  }

  needUpdateGridChildren(): boolean {
    return this.isMoreAutoSizeInColumn() || this.isMoreAutoSizeInRow();
  }

  private getAutoOffsetList(
    list: UISize[],
    isRow: boolean
  ): {
    minusOffsetId: string;
    minusOffset: number;
    plusOffset: number;
  }[] {
    return list.map((size, index) => {
      if (size.unit === SizeUnit.Auto || size.unit === SizeUnit.Fit) {
        return this.getGridAutoOffsetValueByIndex({
          index,
          sizeInfoList: list,
          isRow
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
        if (child.placeSelf.alignSelf) {
          marginMax = UnsetUnit;
          marginMin = UnsetUnit;
        } else {
          marginMax = child.margin.top;
          marginMin = child.margin.bottom;
        }
      } else {
        start = child.gridArea.columnStart - 1;
        end = child.gridArea.columnEnd - 1;
        sizeValue = child.size.width;
        if (child.placeSelf.justifySelf) {
          marginMax = UnsetUnit;
          marginMin = UnsetUnit;
        } else {
          marginMax = child.margin.left;
          marginMin = child.margin.right;
        }
      }
      rowDValue = end - start;
      if (params.index >= start && params.index < end) {
        offsetValue = GridUtils.getChildOffValueInGridAutoItem({
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
}
