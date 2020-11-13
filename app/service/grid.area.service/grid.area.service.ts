/*
 * @author allen
 * @data 2020/11/12 15:56
 */
import { CommonUtil } from 'soid-data';
import { GridAreaServiceInterface } from './grid.area.service.interface';
import { PaddingInfo } from '../../type/common.type';

export class GridAreaService implements GridAreaServiceInterface {
  private static instance?: GridAreaService;

  #windowWidth = 0;

  #windowHeight = 0;

  #gridRect?: DOMRect;

  #gridColumnInfo?: string[];

  #gridRowInfo?: string[];

  #gridPaddingInfo?: PaddingInfo;

  #droppedRect?: DOMRect;

  static getInstance(): GridAreaService {
    GridAreaService.instance ??= new GridAreaService();
    return GridAreaService.instance;
  }

  setWindowSize(width: number, height: number): GridAreaServiceInterface {
    this.#windowWidth = width;
    this.#windowHeight = height;
    return this;
  }

  setGridRect(rect: DOMRect): GridAreaServiceInterface {
    this.#gridRect = rect;
    return this;
  }

  setGridColumnInfo(info: string[]): GridAreaServiceInterface {
    this.#gridColumnInfo = info;
    return this;
  }

  setGridRowInfo(info: string[]): GridAreaServiceInterface {
    this.#gridRowInfo = info;
    return this;
  }

  setGridPaddingInfo(padding: PaddingInfo): GridAreaServiceInterface {
    this.#gridPaddingInfo = padding;
    return this;
  }

  setDroppedRect(rect: DOMRect): GridAreaServiceInterface {
    this.#droppedRect = rect;
    return this;
  }

  getDroppedGridInfo(): {
    gridArea: number[];
    marginLeft: number;
    marginTop: number;
  } {
    if (this.#gridRect && this.#droppedRect) {
      const gridPadding: {
        left: number;
        top: number;
        right: number;
        bottom: number;
      } = {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      };
      if (this.#gridPaddingInfo) {
        gridPadding.left = this.changeStringValueToNumber({
          value: this.#gridPaddingInfo.left,
          maxValue: this.#gridRect.width
        });
        gridPadding.left = this.changeStringValueToNumber({
          value: this.#gridPaddingInfo.right,
          maxValue: this.#gridRect.width
        });
        gridPadding.left = this.changeStringValueToNumber({
          value: this.#gridPaddingInfo.top,
          maxValue: this.#gridRect.height
        });
        gridPadding.left = this.changeStringValueToNumber({
          value: this.#gridPaddingInfo.bottom,
          maxValue: this.#gridRect.height
        });
      }
      const gridItemRectList = this.getGridItemRectList({
        rect: this.#gridRect,
        gridTemplateColumns: this.#gridColumnInfo ?? [],
        gridTemplateRows: this.#gridRowInfo ?? [],
        gridPadding
      });
      const dropLeftTop = {
        x: this.#droppedRect.x - this.#gridRect.x,
        y: this.#droppedRect.y - this.#gridRect.y
      };
      const dropLeftBottom = {
        x: dropLeftTop.x,
        y: dropLeftTop.y + this.#droppedRect.height
      };
      const dropRightTop = {
        x: dropLeftTop.x + this.#droppedRect.width,
        y: dropLeftTop.y
      };
      let marginLeft = 0;
      let marginTop = 0;
      let rowStart = 1;
      let rowEnd = gridItemRectList.length;
      let columnStart = 1;
      let columnEnd = gridItemRectList[0]?.length || rowEnd;
      gridItemRectList.forEach((rowItem, rowIndex) => [
        rowItem.forEach((rect, columnIndex) => {
          if (this.checkPointIsInRect(dropLeftTop, rect)) {
            rowStart = rowIndex + 1;
            columnStart = columnIndex + 1;
            marginLeft = dropLeftTop.x - rect.x;
            marginTop = dropLeftTop.y - rect.y;
          }
          if (this.checkPointIsInRect(dropRightTop, rect)) {
            columnEnd = columnIndex + 1;
          }
          if (this.checkPointIsInRect(dropLeftBottom, rect)) {
            rowEnd = rowIndex + 1;
          }
        })
      ]);
      return {
        gridArea: [rowStart, columnStart, rowEnd, columnEnd],
        marginLeft,
        marginTop
      };
    }
    return {
      gridArea: [],
      marginLeft: 0,
      marginTop: 0
    };
  }

  private getGridItemRectList(params: {
    rect: DOMRect;
    gridTemplateColumns: string[];
    gridTemplateRows: string[];
    gridPadding: { left: number; top: number; right: number; bottom: number };
  }): DOMRect[][] {
    const gridWidth =
      params.rect.width - params.gridPadding.left - params.gridPadding.right;
    const gridHeight =
      params.rect.height - params.gridPadding.top - params.gridPadding.bottom;
    const columnsNumberArray = this.changeStringValueListToNumberList({
      list: params.gridTemplateColumns,
      maxValue: gridWidth,
      windowWidth: this.#windowWidth,
      windowHeight: this.#windowHeight
    });
    const rowsNumberArray = this.changeStringValueListToNumberList({
      list: params.gridTemplateRows,
      maxValue: gridHeight,
      windowWidth: this.#windowWidth,
      windowHeight: this.#windowHeight
    });
    let rowIndex = 0;
    let rowLength = rowsNumberArray.length;
    if (rowLength === 0) {
      rowLength = 1;
      rowsNumberArray.push(gridHeight);
    }
    let columnIndex = 0;
    const itemRectList: DOMRect[][] = [];
    let columnLength = columnsNumberArray.length;
    if (columnLength === 0) {
      columnLength = 1;
      columnsNumberArray.push(gridWidth);
    }
    let rowY = params.gridPadding.top;
    let rowHeight = 0;
    let columnX = params.gridPadding.left;
    let columnWidth = 0;
    let rowArray: DOMRect[] = [];
    for (rowIndex; rowIndex < rowLength; rowIndex += 1) {
      rowArray = [];
      columnX = params.gridPadding.left;
      rowHeight = rowsNumberArray[rowIndex];
      for (columnIndex = 0; columnIndex < columnLength; columnIndex += 1) {
        columnWidth = columnsNumberArray[columnIndex];
        rowArray.push(new DOMRect(columnX, rowY, columnWidth, rowHeight));
        columnX += columnWidth;
      }
      rowY += rowHeight;
      itemRectList.push(rowArray);
    }
    return itemRectList;
  }

  private changeStringValueListToNumberList(params: {
    list: string[];
    maxValue: number;
    windowWidth: number;
    windowHeight: number;
  }): number[] {
    let spareValue = params.maxValue;
    let frNumber = 0;
    let autoNumber = 0;
    let isFr = false;
    let isAuto = false;
    const valueList: number[] = new Array(params.list.length);
    params.list.forEach((value, index) => {
      isFr = value.indexOf('fr') !== -1;
      isAuto = value.indexOf('auto') !== -1;
      if (!isFr && !isAuto) {
        valueList[index] = this.changeStringValueToNumber({
          value,
          maxValue: params.maxValue,
          windowWidth: params.windowWidth,
          windowHeight: params.windowHeight
        });
      }
      if (isFr) {
        const realValue = value.slice(0, value.length - 2);
        frNumber += parseFloat(realValue);
      }
      if (isAuto) {
        valueList[index] = 0;
        autoNumber += 1;
      }
    });
    valueList.forEach(value => {
      spareValue -= value;
    });
    const singleFrValue = spareValue / frNumber;
    params.list.forEach((value, index) => {
      isFr = value.indexOf('fr') !== -1;
      if (isFr) {
        const realValue = value.slice(0, value.length - 2);
        valueList[index] = parseFloat(realValue) * singleFrValue;
        spareValue -= valueList[index];
      }
    });
    if (spareValue === params.maxValue && autoNumber !== 0) {
      const autoValue = spareValue / autoNumber;
      params.list.forEach((value, index) => {
        valueList[index] = autoValue;
      });
    }
    return valueList;
  }

  private checkPointIsInRect(
    point: { x: number; y: number },
    rect: DOMRect
  ): boolean {
    const checkXIn = point.x >= rect.x && point.x <= rect.x + rect.width;
    const checkYIn = point.y >= rect.y && point.y <= rect.y + rect.height;
    return checkXIn && checkYIn;
  }

  private changeStringValueToNumber(params: {
    value: string;
    maxValue?: number;
    windowWidth?: number;
    windowHeight?: number;
  }): number {
    let valueNumber = CommonUtil.pickNumber(params.value) ?? 0;
    if (params.value.indexOf('vw') !== -1) {
      valueNumber = ((params.windowWidth ?? 0) * valueNumber) / 100;
    }
    if (params.value.indexOf('vh') !== -1) {
      valueNumber = ((params.windowHeight ?? 0) * valueNumber) / 100;
    }
    if (params.value.indexOf('%') !== -1) {
      valueNumber = ((params.maxValue ?? 0) * valueNumber) / 100;
    }
    return valueNumber;
  }
}
