/*
 * @author allen
 * @data 2020/11/12 15:56
 */
import { GridAreaServiceInterface } from './grid.area.service.interface';
import { PaddingInfo } from '../../type/common.type';

export class GridAreaService implements GridAreaServiceInterface {
  private static instance?: GridAreaService;
  #windowWidth = 0;
  #windowHeight = 0;
  #gridRect?: DOMRect;
  #gridColumnInfo?: { value: number; unit: string }[];
  #gridRowInfo?: { value: number; unit: string }[];
  #gridPaddingInfo?: PaddingInfo;
  #droppedRect?: DOMRect;
  #childRectInfoList: { id: string; rect: DOMRect }[] = [];

  #checkPointIsInRect = (point: { x: number; y: number }, rect: DOMRect) => {
    const checkXIn = point.x >= rect.x && point.x <= rect.x + rect.width;
    const checkYIn = point.y >= rect.y && point.y <= rect.y + rect.height;
    return checkXIn && checkYIn;
  };

  #changeUnitObjectToNumber = (params: {
    unitObject: { value: number; unit: string };
    maxValue?: number;
    windowWidth?: number;
    windowHeight?: number;
  }) => {
    let valueNumber = params.unitObject.value;
    if (valueNumber === -1) {
      return 0;
    }
    if (params.unitObject.unit === 'vw') {
      valueNumber = ((params.windowWidth ?? 0) * valueNumber) / 100;
      if (!params.windowWidth || params.windowWidth === 0) {
        console.error('SOID-UI-UTIL', 'GridAreaService', 'windowWidth is zero');
      }
    }
    if (params.unitObject.unit === 'vh') {
      valueNumber = ((params.windowHeight ?? 0) * valueNumber) / 100;
      if (!params.windowHeight || params.windowHeight === 0) {
        console.error(
          'SOID-UI-UTIL',
          'GridAreaService',
          'windowHeight is zero'
        );
      }
    }
    if (params.unitObject.unit === '%') {
      valueNumber = ((params.maxValue ?? 0) * valueNumber) / 100;
    }
    return valueNumber;
  };

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

  setGridColumnInfo(
    info: { value: number; unit: string }[]
  ): GridAreaServiceInterface {
    this.#gridColumnInfo = info;
    return this;
  }

  setGridRowInfo(
    info: { value: number; unit: string }[]
  ): GridAreaServiceInterface {
    this.#gridRowInfo = info;
    return this;
  }

  setGridCount(row: number, column: number): GridAreaServiceInterface {
    if (this.#gridRowInfo) {
      this.#gridRowInfo.splice(0, this.#gridRowInfo.length);
    } else {
      this.#gridRowInfo = [];
    }
    if (this.#gridColumnInfo) {
      this.#gridColumnInfo.splice(0, this.#gridColumnInfo.length);
    } else {
      this.#gridColumnInfo = [];
    }
    let rowIndex = 0;
    for (rowIndex; rowIndex < row; rowIndex += 1) {
      this.#gridRowInfo!.push({
        value: parseFloat((100 / row).toFixed(2)),
        unit: '%'
      });
    }
    let columnIndex = 0;
    for (columnIndex; columnIndex < column; columnIndex += 1) {
      this.#gridRowInfo!.push({
        value: parseFloat((100 / column).toFixed(2)),
        unit: '%'
      });
    }
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

  setChildrenRectInfo(
    childrenInfo: {
      id: string;
      gridArea: number[];
      marginLeft: number;
      marginTop: number;
      width: number;
      height: number;
    }[]
  ): GridAreaServiceInterface {
    if (!this.#gridRect) {
      console.error('SOID-UI-UTIL', 'GridAreaService', 'gridRect is undefined');
      return this;
    }
    const gridItemRectList = this.getGridItemRectList();
    let childX = 0;
    let childY = 0;
    let columnIndex = 0;
    let rowIndex = 0;
    this.#childRectInfoList = childrenInfo.map(childInfo => {
      if (childInfo.gridArea.length === 4) {
        columnIndex = childInfo.gridArea[2] - 1;
        if (columnIndex >= gridItemRectList[0].length) {
          columnIndex = gridItemRectList[0].length - 1;
        }
        if (columnIndex < 0) {
          columnIndex = 0;
        }
        rowIndex = childInfo.gridArea[0] - 1;
        if (rowIndex >= gridItemRectList.length) {
          rowIndex = gridItemRectList.length - 1;
        }
        if (rowIndex < 0) {
          rowIndex = 0;
        }
        childX = gridItemRectList[0][columnIndex].x + childInfo.marginLeft;
        childY = gridItemRectList[rowIndex][0].y + +childInfo.marginTop;
      }
      return {
        id: childInfo.id,
        rect: new DOMRect(childX, childY, childInfo.width, childInfo.height)
      };
    });
    return this;
  }

  adjustChildrenGridInfo(): {
    id: string;
    gridArea: number[];
    marginLeft: number;
    marginTop: number;
  }[] {
    if (!this.#gridRect) {
      return [];
    }
    const gridItemRectList = this.getGridItemRectList();
    return this.#childRectInfoList.map(childInfo => {
      const areaInfo = this.getGridAreaInfoByRect(
        childInfo.rect,
        gridItemRectList
      );
      return {
        id: childInfo.id,
        gridArea: areaInfo.gridArea,
        marginLeft: areaInfo.marginLeft,
        marginTop: areaInfo.marginTop
      };
    });
  }

  getDroppedGridInfo(): {
    gridArea: number[];
    marginLeft: number;
    marginTop: number;
  } {
    if (!this.#gridRect || !this.#droppedRect) {
      console.error(
        'SOID-UI-UTIL',
        'GridAreaService',
        'gridRect / droppedRect is undefined'
      );
      return {
        gridArea: [],
        marginLeft: 0,
        marginTop: 0
      };
    }
    const gridItemRectList = this.getGridItemRectList();
    return this.getGridAreaInfoByRect(
      new DOMRect(
        this.#droppedRect.x - this.#gridRect.x,
        this.#droppedRect.y - this.#gridRect.y,
        this.#droppedRect.width,
        this.#droppedRect.height
      ),
      gridItemRectList
    );
  }

  private getGridAreaInfoByRect(
    rect: DOMRect,
    gridItemRectList: DOMRect[][]
  ): {
    gridArea: number[];
    marginLeft: number;
    marginTop: number;
  } {
    const dropLeftTop = {
      x: rect.x,
      y: rect.y
    };
    const dropLeftBottom = {
      x: dropLeftTop.x,
      y: dropLeftTop.y + rect.height
    };
    const dropRightTop = {
      x: dropLeftTop.x + rect.width,
      y: dropLeftTop.y
    };
    let marginLeft = 0;
    let marginTop = 0;
    let rowStart = 1;
    let rowEnd = gridItemRectList.length;
    let columnStart = 1;
    let columnEnd = gridItemRectList[0]?.length || rowEnd;
    gridItemRectList.forEach((rowItem, rowIndex) => [
      rowItem.forEach((gridItemRect, columnIndex) => {
        if (this.#checkPointIsInRect(dropLeftTop, gridItemRect)) {
          rowStart = rowIndex + 1;
          columnStart = columnIndex + 1;
          marginLeft = dropLeftTop.x - gridItemRect.x;
          marginTop = dropLeftTop.y - gridItemRect.y;
        }
        if (this.#checkPointIsInRect(dropRightTop, gridItemRect)) {
          columnEnd = columnIndex + 1;
        }
        if (this.#checkPointIsInRect(dropLeftBottom, gridItemRect)) {
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

  private getGridItemRectList(): DOMRect[][] {
    if (!this.#gridRect) {
      return [];
    }
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
      gridPadding.left = this.#changeUnitObjectToNumber({
        unitObject: this.#gridPaddingInfo.left,
        maxValue: this.#gridRect.width,
        windowWidth: this.#windowWidth,
        windowHeight: this.#windowHeight
      });
      gridPadding.right = this.#changeUnitObjectToNumber({
        unitObject: this.#gridPaddingInfo.right,
        maxValue: this.#gridRect.width,
        windowWidth: this.#windowWidth,
        windowHeight: this.#windowHeight
      });
      gridPadding.top = this.#changeUnitObjectToNumber({
        unitObject: this.#gridPaddingInfo.top,
        maxValue: this.#gridRect.height,
        windowWidth: this.#windowWidth,
        windowHeight: this.#windowHeight
      });
      gridPadding.bottom = this.#changeUnitObjectToNumber({
        unitObject: this.#gridPaddingInfo.bottom,
        maxValue: this.#gridRect.height,
        windowWidth: this.#windowWidth,
        windowHeight: this.#windowHeight
      });
    }
    const gridWidth =
      this.#gridRect.width - gridPadding.left - gridPadding.right;
    const gridHeight =
      this.#gridRect.height - gridPadding.top - gridPadding.bottom;
    const columnsNumberArray = this.changeUnitObjectListToNumberList({
      unitList: this.#gridColumnInfo ?? [],
      maxValue: gridWidth,
      windowWidth: this.#windowWidth,
      windowHeight: this.#windowHeight
    });
    const rowsNumberArray = this.changeUnitObjectListToNumberList({
      unitList: this.#gridRowInfo ?? [],
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
    let rowY = gridPadding.top;
    let rowHeight = 0;
    let columnX = gridPadding.left;
    let columnWidth = 0;
    let rowArray: DOMRect[] = [];
    for (rowIndex; rowIndex < rowLength; rowIndex += 1) {
      rowArray = [];
      columnX = gridPadding.left;
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

  private changeUnitObjectListToNumberList(params: {
    unitList: { value: number; unit: string }[];
    maxValue: number;
    windowWidth: number;
    windowHeight: number;
  }): number[] {
    let spareValue = params.maxValue;
    let autoNumber = 0;
    let isAuto = false;
    const valueList: number[] = new Array(params.unitList.length);
    params.unitList.forEach((value, index) => {
      isAuto = value.value === -1;
      if (!isAuto) {
        valueList[index] = this.#changeUnitObjectToNumber({
          unitObject: value,
          maxValue: params.maxValue,
          windowWidth: params.windowWidth,
          windowHeight: params.windowHeight
        });
      } else {
        valueList[index] = 0;
        autoNumber += 1;
      }
    });
    valueList.forEach(value => {
      spareValue -= value;
    });
    if (spareValue !== 0 && autoNumber !== 0) {
      const autoValue = spareValue / autoNumber;
      params.unitList.forEach((value, index) => {
        valueList[index] = autoValue;
      });
    }
    return valueList;
  }
}
