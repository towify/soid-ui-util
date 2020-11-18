/*
 * @author allen
 * @data 2020/11/12 15:56
 */
import { GridAreaServiceInterface } from './grid.area.service.interface';
import { GridAreaInfo, PaddingInfo, RectInfo } from '../../type/common.type';
import { GridAreaUtils } from '../../utils/grid.area.utils/grid.area.utils';

export class GridAreaService implements GridAreaServiceInterface {
  private static instance?: GridAreaService;
  #windowSize?: { width: number; height: number };
  #gridSize?: { width: number; height: number };
  #gridColumnInfo?: { value: number; unit: string }[];
  #gridRowInfo?: { value: number; unit: string }[];
  #droppedRect?: RectInfo;
  #childRectInfoList: { id: string; rect: RectInfo }[] = [];
  #gridRowGap = 0;
  #gridColumnGap = 0;
  #gridPadding = {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0
  };

  static getInstance(): GridAreaService {
    GridAreaService.instance ??= new GridAreaService();
    return GridAreaService.instance;
  }

  setWindowSize(width: number, height: number): GridAreaServiceInterface {
    this.#windowSize = {
      width,
      height
    };
    return this;
  }

  setParentGridSize(width: number, height: number): GridAreaServiceInterface {
    this.#gridSize = {
      width,
      height
    };
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

  setParentGridInfo(
    row: { value: number; unit: string }[],
    column: { value: number; unit: string }[]
  ): GridAreaServiceInterface {
    this.#gridRowInfo = row;
    this.#gridColumnInfo = column;
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

  setParentGridGap(
    row: { value: number; unit: string },
    column: { value: number; unit: string }
  ): GridAreaServiceInterface {
    this.#gridRowGap = GridAreaUtils.changeSizeInfoToNumber({
      sizeInfo: row,
      maxValue: this.#gridSize?.width,
      windowSize: this.#windowSize
    });
    this.#gridColumnGap = GridAreaUtils.changeSizeInfoToNumber({
      sizeInfo: column,
      maxValue: this.#gridSize?.width,
      windowSize: this.#windowSize
    });
    return this;
  }

  setParentGridPaddingInfo(padding: PaddingInfo): GridAreaServiceInterface {
    this.#gridPadding.left = GridAreaUtils.changeSizeInfoToNumber({
      sizeInfo: padding.left,
      maxValue: this.#gridSize?.width,
      windowSize: this.#windowSize
    });
    this.#gridPadding.right = GridAreaUtils.changeSizeInfoToNumber({
      sizeInfo: padding.right,
      maxValue: this.#gridSize?.width,
      windowSize: this.#windowSize
    });
    this.#gridPadding.top = GridAreaUtils.changeSizeInfoToNumber({
      sizeInfo: padding.top,
      maxValue: this.#gridSize?.height,
      windowSize: this.#windowSize
    });
    this.#gridPadding.bottom = GridAreaUtils.changeSizeInfoToNumber({
      sizeInfo: padding.bottom,
      maxValue: this.#gridSize?.height,
      windowSize: this.#windowSize
    });
    return this;
  }

  setDroppedRect(rect: RectInfo): GridAreaServiceInterface {
    this.#droppedRect = rect;
    return this;
  }

  setChildrenGridInfo(
    childrenInfo: {
      id: string;
      gridArea: GridAreaInfo;
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
    const gridItemRectList = this.getGridItemRectList(
      this.#gridRowGap,
      this.#gridColumnGap
    );
    let childX = 0;
    let childY = 0;
    let columnIndex = 0;
    let rowIndex = 0;
    this.#childRectInfoList = childrenInfo.map(childInfo => {
      columnIndex = childInfo.gridArea.columnStart - 1;
      if (columnIndex >= gridItemRectList[0].length) {
        columnIndex = gridItemRectList[0].length - 1;
      }
      if (columnIndex < 0) {
        columnIndex = 0;
      }
      rowIndex = childInfo.gridArea.rowStart - 1;
      if (rowIndex >= gridItemRectList.length) {
        rowIndex = gridItemRectList.length - 1;
      }
      if (rowIndex < 0) {
        rowIndex = 0;
      }
      childX = gridItemRectList[0][columnIndex].x + childInfo.marginLeft;
      childY = gridItemRectList[rowIndex][0].y + +childInfo.marginTop;
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
    gridArea: GridAreaInfo;
    marginLeft: number;
    marginTop: number;
  }[] {
    if (!this.#gridSize || !this.#childRectInfoList.length) {
      console.error(
        'SOID-UI-UTIL',
        'GridAreaService',
        'gridRect / childrenGrid is undefined'
      );
      return [];
    }
    const gridItemRectList = this.getGridItemRectList(
      this.#gridRowGap,
      this.#gridColumnGap
    );
    const gridRect = {
      x: this.#gridPadding.left,
      y: this.#gridPadding.top,
      width:
        this.#gridSize!.width -
        this.#gridPadding.left -
        this.#gridPadding.right,
      height:
        this.#gridSize!.height -
        this.#gridPadding.top -
        this.#gridPadding.bottom
    };
    return this.#childRectInfoList.map(childInfo => {
      const areaInfo = GridAreaUtils.getGridAreaInfoByRect({
        rect: childInfo.rect,
        rowGap: this.#gridRowGap,
        columnGap: this.#gridColumnGap,
        gridRect,
        gridItemRectList
      });
      return {
        id: childInfo.id,
        gridArea: areaInfo.gridArea,
        marginLeft: areaInfo.marginLeft,
        marginTop: areaInfo.marginTop
      };
    });
  }

  getDroppedGridInfo(): {
    gridArea: GridAreaInfo;
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
        gridArea: {
          rowStart: 1,
          columnStart: 1,
          rowEnd: 2,
          columnEnd: 2
        },
        marginLeft: 0,
        marginTop: 0
      };
    }
    const gridItemRectList = this.getGridItemRectList(
      this.#gridRowGap,
      this.#gridColumnGap
    );
    return GridAreaUtils.getGridAreaInfoByRect({
      rect: this.#droppedRect,
      rowGap: this.#gridRowGap,
      columnGap: this.#gridColumnGap,
      gridRect: {
        x: this.#gridPadding.left,
        y: this.#gridPadding.top,
        width:
          this.#gridSize.width -
          this.#gridPadding.left -
          this.#gridPadding.right,
        height:
          this.#gridSize.height -
          this.#gridPadding.top -
          this.#gridPadding.bottom
      },
      gridItemRectList
    });
  }

  getGridLineList(): {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  }[] {
    if (!this.#gridSize) {
      console.error('SOID-UI-UTIL', 'GridAreaService', 'gridRect is undefined');
      return [];
    }
    const gridItemRectList = this.getGridItemRectList(
      this.#gridRowGap,
      this.#gridColumnGap
    );
    return GridAreaUtils.getGridLineList(gridItemRectList, this.#gridSize);
  }

  private getGridItemRectList(rowGap: number, columnGap: number): RectInfo[][] {
    if (!this.#gridSize) {
      return [];
    }
    const gridWidth =
      this.#gridSize.width - this.#gridPadding.left - this.#gridPadding.right;
    const gridHeight =
      this.#gridSize.height - this.#gridPadding.top - this.#gridPadding.bottom;
    const columnsNumberArray = GridAreaUtils.changeSizeInfoListToNumberList({
      sizeInfoList: this.#gridColumnInfo ?? [],
      maxValue: gridWidth,
      windowSize: this.#windowSize,
      gap: columnGap
    });
    const rowsNumberArray = GridAreaUtils.changeSizeInfoListToNumberList({
      sizeInfoList: this.#gridRowInfo ?? [],
      maxValue: gridHeight,
      windowSize: this.#windowSize,
      gap: rowGap
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
        columnX += columnGap;
      }
      rowY += rowHeight;
      rowY += rowGap;
      itemRectList.push(rowArray);
    }
    return itemRectList;
  }
}
