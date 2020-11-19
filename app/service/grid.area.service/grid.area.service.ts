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
    gridArea?: GridAreaInfo
  };

  #childRectInfoList: { id: string; rect: RectInfo; leftUint: string; topUnit: string, widthUint: string, heightUint: string }[] = [];

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

  setDroppedInfo(dropped: {
    x: number;
    y: number;
    width: { value: number; unit: string };
    height: { value: number; unit: string };
    gridArea?: GridAreaInfo
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
    if (!this.#gridSize || !this.#droppedInfo) {
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
        marginTop: 0,
        width: { value: 0, unit: 'px'},
        height: { value: 0, unit: 'px'}
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
        gridItemRectList
      });
      droppedRect.width = GridAreaUtils.changeSizeInfoToNumber({
        sizeInfo: this.#droppedInfo.width,
        maxValue: droppedParentRect.width,
        windowSize: this.#windowSize
      });
      droppedRect.height = GridAreaUtils.changeSizeInfoToNumber({
        sizeInfo: this.#droppedInfo.height,
        maxValue: droppedParentRect.height,
        windowSize: this.#windowSize
      });
    } else {
      droppedRect.width = GridAreaUtils.changeSizeInfoToNumber({
        sizeInfo: this.#droppedInfo.width
      });
      droppedRect.height = GridAreaUtils.changeSizeInfoToNumber({
        sizeInfo: this.#droppedInfo.height
      });
    }
    const gridInfo = GridAreaUtils.getGridAreaInfoByRect({
      rect: droppedRect,
      rowGap: this.#gridRowGap,
      columnGap: this.#gridColumnGap,
      gridItemRectList
    });
    const finishParentRect = GridAreaUtils.changeChildSizeInfoToNumber({
      gridArea: gridInfo.gridArea,
      gridItemRectList
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
      height: { value: number; unit: string }
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
    let childWidth = 0;
    let childHeight = 0;
    let childGridRect: {
      x: number,
      y: number,
      width: number,
      height: number
    };
    this.#childRectInfoList = childrenInfo.map((childInfo) => {
      childGridRect = GridAreaUtils.changeChildSizeInfoToNumber({
        gridArea: childInfo.gridArea,
        gridItemRectList
      });
      childX = childGridRect.x + GridAreaUtils.changeSizeInfoToNumber({
        sizeInfo: childInfo.marginLeft,
        maxValue: childGridRect.width,
        windowSize: this.#windowSize
      });
      childY = childGridRect.y + GridAreaUtils.changeSizeInfoToNumber({
        sizeInfo: childInfo.marginTop,
        maxValue: childGridRect.height,
        windowSize: this.#windowSize
      });
      childWidth = GridAreaUtils.changeSizeInfoToNumber({
        sizeInfo: childInfo.width,
        maxValue: childGridRect.width,
        windowSize: this.#windowSize
      });
      childHeight = GridAreaUtils.changeSizeInfoToNumber({
        sizeInfo: childInfo.height,
        maxValue: childGridRect.height,
        windowSize: this.#windowSize
      });
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
    width: { value: number; unit: string },
    height: { value: number; unit: string }
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
    let areaInfo: {
      gridArea: GridAreaInfo;
      marginLeft: number;
      marginTop: number;
    };
    let childGridRect: {
      x: number,
      y: number,
      width: number,
      height: number
    };
    let marginLeft: { value: number, unit: string};
    let marginTop: { value: number, unit: string};
    let width: { value: number, unit: string};
    let height: { value: number, unit: string};
    return this.#childRectInfoList.map((childInfo) => {
      areaInfo = GridAreaUtils.getGridAreaInfoByRect({
        rect: childInfo.rect,
        rowGap: this.#gridRowGap,
        columnGap: this.#gridColumnGap,
        gridItemRectList
      });
      childGridRect = GridAreaUtils.changeChildSizeInfoToNumber({
        gridArea: areaInfo.gridArea,
        gridItemRectList
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
