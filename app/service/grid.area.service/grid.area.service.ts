/*
 * @author allen
 * @data 2020/11/12 15:56
 */
import { GridAreaServiceInterface } from './grid.area.service.interface';
import { PaddingInfo, RectInfo } from '../../type/common.type';

export class GridAreaService implements GridAreaServiceInterface {
  private static instance?: GridAreaService;
  #windowSize?: { width: number; height: number };
  #gridSize?: { width: number; height: number };
  #gridColumnInfo?: { value: number; unit: string }[];
  #gridRowInfo?: { value: number; unit: string }[];
  #gridPaddingInfo?: PaddingInfo;
  #droppedRect?: RectInfo;
  #childRectInfoList: { id: string; rect: RectInfo }[] = [];

  #checkPointIsInRect = (point: { x: number; y: number }, rect: RectInfo) => {
    const checkXIn = point.x >= rect.x && point.x <= rect.x + rect.width;
    const checkYIn = point.y >= rect.y && point.y <= rect.y + rect.height;
    return checkXIn && checkYIn;
  };

  #changeSizeInfoToNumber = (params: {
    sizeInfo: { value: number; unit: string };
    windowSize?: { width: number; height: number };
    maxValue?: number;
  }) => {
    let valueNumber = params.sizeInfo.value;
    if (valueNumber === -1) {
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
  };

  static getInstance(): GridAreaService {
    GridAreaService.instance ??= new GridAreaService();
    return GridAreaService.instance;
  }

  setWindowSize(size: {
    width: number;
    height: number;
  }): GridAreaServiceInterface {
    this.#windowSize = size;
    return this;
  }

  setParentGridSize(size: {
    width: number;
    height: number;
  }): GridAreaServiceInterface {
    this.#gridSize = size;
    return this;
  }

  setParentGridColumnInfo(
    info: { value: number; unit: string }[]
  ): GridAreaServiceInterface {
    this.#gridColumnInfo = info;
    return this;
  }

  setParentGridRowInfo(
    info: { value: number; unit: string }[]
  ): GridAreaServiceInterface {
    this.#gridRowInfo = info;
    return this;
  }

  setParentGridCount(row: number, column: number): GridAreaServiceInterface {
    this.#gridRowInfo = [];
    this.#gridColumnInfo = [];
    let rowIndex = 0;
    for (rowIndex; rowIndex < row; rowIndex += 1) {
      this.#gridRowInfo.push({
        value: parseFloat((100 / row).toFixed(2)),
        unit: '%'
      });
    }
    let columnIndex = 0;
    for (columnIndex; columnIndex < column; columnIndex += 1) {
      this.#gridColumnInfo.push({
        value: parseFloat((100 / column).toFixed(2)),
        unit: '%'
      });
    }
    return this;
  }

  setParentGridPaddingInfo(padding: PaddingInfo): GridAreaServiceInterface {
    this.#gridPaddingInfo = padding;
    return this;
  }

  setDroppedRect(rect: RectInfo): GridAreaServiceInterface {
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
    if (!this.#gridSize) {
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
        rect: {
          x: childX,
          y: childY,
          width: childInfo.width,
          height: childInfo.height
        }
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
    if (!this.#gridSize) {
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
    if (!this.#gridSize || !this.#droppedRect) {
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
    return this.getGridAreaInfoByRect(this.#droppedRect, gridItemRectList);
  }

  private getGridAreaInfoByRect(
    rect: RectInfo,
    gridItemRectList: RectInfo[][]
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
    let marginLeft = dropLeftTop.x;
    let marginTop = dropLeftTop.y;
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
    if (rowStart === rowEnd) {
      rowEnd += 1;
    }
    if (columnStart === columnEnd) {
      columnEnd += 1;
    }
    return {
      gridArea: [rowStart, columnStart, rowEnd, columnEnd],
      marginLeft,
      marginTop
    };
  }

  private getGridItemRectList(): RectInfo[][] {
    if (!this.#gridSize) {
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
      gridPadding.left = this.#changeSizeInfoToNumber({
        sizeInfo: this.#gridPaddingInfo.left,
        maxValue: this.#gridSize.width,
        windowSize: this.#windowSize
      });
      gridPadding.right = this.#changeSizeInfoToNumber({
        sizeInfo: this.#gridPaddingInfo.right,
        maxValue: this.#gridSize.width,
        windowSize: this.#windowSize
      });
      gridPadding.top = this.#changeSizeInfoToNumber({
        sizeInfo: this.#gridPaddingInfo.top,
        maxValue: this.#gridSize.height,
        windowSize: this.#windowSize
      });
      gridPadding.bottom = this.#changeSizeInfoToNumber({
        sizeInfo: this.#gridPaddingInfo.bottom,
        maxValue: this.#gridSize?.height,
        windowSize: this.#windowSize
      });
    }
    const gridWidth =
      this.#gridSize.width - gridPadding.left - gridPadding.right;
    const gridHeight =
      this.#gridSize.height - gridPadding.top - gridPadding.bottom;
    const columnsNumberArray = this.changeSizeInfoListToNumberList({
      sizeInfoList: this.#gridColumnInfo ?? [],
      maxValue: gridWidth,
      windowSize: this.#windowSize
    });
    const rowsNumberArray = this.changeSizeInfoListToNumberList({
      sizeInfoList: this.#gridRowInfo ?? [],
      maxValue: gridHeight,
      windowSize: this.#windowSize
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
    let rowY = gridPadding.top;
    let rowHeight = 0;
    let columnX = gridPadding.left;
    let columnWidth = 0;
    let rowArray: RectInfo[] = [];
    for (rowIndex; rowIndex < rowLength; rowIndex += 1) {
      rowArray = [];
      columnX = gridPadding.left;
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
      }
      rowY += rowHeight;
      itemRectList.push(rowArray);
    }
    return itemRectList;
  }

  private changeSizeInfoListToNumberList(params: {
    sizeInfoList: { value: number; unit: string }[];
    windowSize?: { width: number; height: number };
    maxValue?: number;
  }): number[] {
    let spareValue = params.maxValue ?? 0;
    let autoNumber = 0;
    let isAuto = false;
    const valueList: number[] = new Array(params.sizeInfoList.length);
    params.sizeInfoList.forEach((value, index) => {
      isAuto = value.value === -1;
      if (isAuto) {
        valueList[index] = 0;
        autoNumber += 1;
      } else {
        valueList[index] = this.#changeSizeInfoToNumber({
          sizeInfo: value,
          maxValue: params.maxValue,
          windowSize: params.windowSize
        });
      }
    });
    valueList.forEach(value => {
      spareValue -= value;
    });
    if (spareValue !== 0 && autoNumber !== 0) {
      const autoValue = spareValue / autoNumber;
      params.sizeInfoList.forEach((value, index) => {
        isAuto = value.value === -1;
        if (isAuto) {
          valueList[index] = autoValue;
        }
      });
    }
    return valueList;
  }
}
