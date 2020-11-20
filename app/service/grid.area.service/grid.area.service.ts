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
  #gridRowGap = 0;
  #gridColumnGap = 0;
  #gridRect?: RectInfo;
  #gridPadding = {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0
  };

  #droppedInfo?: {
    x: number;
    y: number;
    width: { value: number; unit: string };
    height: { value: number; unit: string };
    gridArea?: GridAreaInfo;
  };

  #childRectInfoList: {
    id: string;
    rect: RectInfo;
    leftUint: string;
    topUnit: string;
    widthUint: string;
    heightUint: string;
  }[] = [];

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
    this.setParentGridRect();
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

  setParentGridCount(params: {
    row: number;
    column: number;
    rowGap?: { value: number; unit: string };
    columnGap?: { value: number; unit: string };
  }): GridAreaServiceInterface {
    if (!this.#gridRect) {
      console.error('SOID-UI-UTIL', 'GridAreaService', 'gridRect is undefined');
      return this;
    }
    this.#gridRowInfo = [];
    this.#gridColumnInfo = [];
    if (params.rowGap) {
      this.#gridRowGap = this.changeSizeInfoToNumber(
        params.rowGap,
        this.#gridRect.width
      );
    }
    if (params.columnGap) {
      this.#gridColumnGap = this.changeSizeInfoToNumber(
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
        unit: 'px'
      });
    }
    let columnIndex = 0;
    for (columnIndex; columnIndex < params.column; columnIndex += 1) {
      this.#gridColumnInfo.push({
        value:
          (this.#gridRect.width - this.#gridColumnGap * (params.column - 1)) /
          params.column,
        unit: 'px'
      });
    }
    return this;
  }

  setParentGridGap(
    row: { value: number; unit: string },
    column: { value: number; unit: string }
  ): GridAreaServiceInterface {
    if (!this.#gridRect) {
      console.error('SOID-UI-UTIL', 'GridAreaService', 'gridRect is undefined');
      return this;
    }
    this.#gridRowGap = this.changeSizeInfoToNumber(row, this.#gridRect?.width);
    this.#gridColumnGap = this.changeSizeInfoToNumber(
      column,
      this.#gridRect?.width
    );
    return this;
  }

  setParentGridPaddingInfo(padding: PaddingInfo): GridAreaServiceInterface {
    this.#gridPadding.left = this.changeSizeInfoToNumber(
      padding.left,
      this.#gridSize?.width
    );
    this.#gridPadding.right = this.changeSizeInfoToNumber(
      padding.right,
      this.#gridSize?.width
    );
    this.#gridPadding.top = this.changeSizeInfoToNumber(
      padding.top,
      this.#gridSize?.height
    );
    this.#gridPadding.bottom = this.changeSizeInfoToNumber(
      padding.bottom,
      this.#gridSize?.height
    );
    this.setParentGridRect();
    return this;
  }

  setDroppedInfo(dropped: {
    x: number;
    y: number;
    width: { value: number; unit: string };
    height: { value: number; unit: string };
    gridArea?: GridAreaInfo;
  }): GridAreaServiceInterface {
    this.#droppedInfo = dropped;
    return this;
  }

  getDroppedGridInfo(): {
    gridArea: GridAreaInfo;
    marginLeft: number;
    marginTop: number;
    width: { value: number; unit: string };
    height: { value: number; unit: string };
  } {
    if (!this.#gridRect || !this.#droppedInfo) {
      console.error('SOID-UI-UTIL', 'GridAreaService', 'gridRect is undefined');
      return {
        gridArea: {
          rowStart: 1,
          columnStart: 1,
          rowEnd: 2,
          columnEnd: 2
        },
        marginLeft: 0,
        marginTop: 0,
        width: { value: 0, unit: 'px' },
        height: { value: 0, unit: 'px' }
      };
    }
    const gridItemRectList = this.getGridItemRectList(
      this.#gridRowGap,
      this.#gridColumnGap
    );
    const droppedRect = {
      x: this.#droppedInfo.x,
      y: this.#droppedInfo.y,
      width: 0,
      height: 0
    };
    if (this.#droppedInfo.gridArea) {
      const droppedParentRect = GridAreaUtils.changeChildSizeInfoToNumber({
        gridArea: this.#droppedInfo.gridArea,
        gridItemRectList,
        gridRect: this.#gridRect
      });
      droppedRect.width = this.changeSizeInfoToNumber(
        this.#droppedInfo.width,
        droppedParentRect.width
      );
      droppedRect.height = this.changeSizeInfoToNumber(
        this.#droppedInfo.height,
        droppedParentRect.height
      );
    } else {
      droppedRect.width = this.changeSizeInfoToNumber(this.#droppedInfo.width);
      droppedRect.height = this.changeSizeInfoToNumber(
        this.#droppedInfo.height
      );
    }
    const gridInfo = GridAreaUtils.getGridAreaInfoByRect({
      rect: droppedRect,
      rowGap: this.#gridRowGap,
      columnGap: this.#gridColumnGap,
      gridItemRectList
    });
    const finishParentRect = GridAreaUtils.changeChildSizeInfoToNumber({
      gridArea: gridInfo.gridArea,
      gridItemRectList,
      gridRect: this.#gridRect
    });
    const width = GridAreaUtils.changeNumberToSizeInfo({
      valueNumber: droppedRect.width,
      unit: this.#droppedInfo.width.unit,
      maxValue: finishParentRect.width,
      windowSize: this.#windowSize
    });
    const height = GridAreaUtils.changeNumberToSizeInfo({
      valueNumber: droppedRect.height,
      unit: this.#droppedInfo.height.unit,
      maxValue: finishParentRect.height,
      windowSize: this.#windowSize
    });
    return {
      gridArea: gridInfo.gridArea,
      marginTop: gridInfo.marginTop,
      marginLeft: gridInfo.marginLeft,
      width,
      height
    };
  }

  setChildrenGridInfo(
    childrenInfo: {
      id: string;
      gridArea: GridAreaInfo;
      marginLeft: { value: number; unit: string };
      marginTop: { value: number; unit: string };
      width: { value: number; unit: string };
      height: { value: number; unit: string };
    }[]
  ): GridAreaServiceInterface {
    if (!this.#gridRect) {
      console.error('SOID-UI-UTIL', 'GridAreaService', 'gridRect is undefined');
      return this;
    }
    const gridItemRectList = this.getGridItemRectList(
      this.#gridRowGap,
      this.#gridColumnGap
    );
    let childX = 0;
    let childY = 0;
    let childWidth = 0;
    let childHeight = 0;
    let childGridRect: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    this.#childRectInfoList = childrenInfo.map(childInfo => {
      childGridRect = GridAreaUtils.changeChildSizeInfoToNumber({
        gridArea: childInfo.gridArea,
        gridItemRectList,
        gridRect: this.#gridRect!
      });
      childX =
        childGridRect.x +
        this.changeSizeInfoToNumber(childInfo.marginLeft, childGridRect.width);
      childY =
        childGridRect.y +
        this.changeSizeInfoToNumber(childInfo.marginTop, childGridRect.height);
      childWidth = this.changeSizeInfoToNumber(
        childInfo.width,
        childGridRect.width
      );
      childHeight = this.changeSizeInfoToNumber(
        childInfo.height,
        childGridRect.height
      );
      return {
        id: childInfo.id,
        rect: {
          x: childX,
          y: childY,
          width: childWidth,
          height: childHeight
        },
        leftUint: childInfo.marginLeft.unit,
        topUnit: childInfo.marginTop.unit,
        widthUint: childInfo.width.unit,
        heightUint: childInfo.height.unit
      };
    });
    return this;
  }

  adjustChildrenGridInfo(): {
    id: string;
    gridArea: GridAreaInfo;
    marginLeft: { value: number; unit: string };
    marginTop: { value: number; unit: string };
    width: { value: number; unit: string };
    height: { value: number; unit: string };
  }[] {
    if (!this.#gridRect || !this.#childRectInfoList.length) {
      console.error('SOID-UI-UTIL', 'GridAreaService', 'gridRect is undefined');
      return [];
    }
    const gridItemRectList = this.getGridItemRectList(
      this.#gridRowGap,
      this.#gridColumnGap
    );
    let areaInfo: {
      gridArea: GridAreaInfo;
      marginLeft: number;
      marginTop: number;
    };
    let childGridRect: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    let marginLeft: { value: number; unit: string };
    let marginTop: { value: number; unit: string };
    let width: { value: number; unit: string };
    let height: { value: number; unit: string };
    return this.#childRectInfoList.map(childInfo => {
      areaInfo = GridAreaUtils.getGridAreaInfoByRect({
        rect: childInfo.rect,
        rowGap: this.#gridRowGap,
        columnGap: this.#gridColumnGap,
        gridItemRectList
      });
      childGridRect = GridAreaUtils.changeChildSizeInfoToNumber({
        gridArea: areaInfo.gridArea,
        gridItemRectList,
        gridRect: this.#gridRect!
      });
      marginLeft = GridAreaUtils.changeNumberToSizeInfo({
        valueNumber: areaInfo.marginLeft,
        unit: childInfo.leftUint,
        maxValue: childGridRect.width,
        windowSize: this.#windowSize
      });
      marginTop = GridAreaUtils.changeNumberToSizeInfo({
        valueNumber: areaInfo.marginTop,
        unit: childInfo.topUnit,
        maxValue: childGridRect.height,
        windowSize: this.#windowSize
      });
      width = GridAreaUtils.changeNumberToSizeInfo({
        valueNumber: childInfo.rect.width,
        unit: childInfo.widthUint,
        maxValue: childGridRect.width,
        windowSize: this.#windowSize
      });
      height = GridAreaUtils.changeNumberToSizeInfo({
        valueNumber: childInfo.rect.height,
        unit: childInfo.heightUint,
        maxValue: childGridRect.height,
        windowSize: this.#windowSize
      });
      return {
        id: childInfo.id,
        gridArea: areaInfo.gridArea,
        marginLeft,
        marginTop,
        width,
        height
      };
    });
  }

  getGridLineList(
    isShowBorder: boolean
  ): {
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
    return GridAreaUtils.getGridLineList({
      gridItemRectList,
      gridSize: this.#gridSize,
      isShowBorder
    });
  }

  private getGridItemRectList(rowGap: number, columnGap: number): RectInfo[][] {
    if (!this.#gridRect) {
      return [];
    }
    const gridWidth = this.#gridRect.width;
    const gridHeight = this.#gridRect.height;
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

  private setParentGridRect(): void {
    if (this.#gridSize) {
      this.#gridRect = {
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
      };
    }
  }

  private changeSizeInfoToNumber(
    sizeInfo: { value: number; unit: string },
    maxValue?: number
  ): number {
    return GridAreaUtils.changeSizeInfoToNumber({
      sizeInfo,
      maxValue,
      windowSize: this.#windowSize
    });
  }
}
