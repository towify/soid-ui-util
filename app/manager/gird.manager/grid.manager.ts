/*
 * @author allen
 * @data 2020/11/12 15:56
 */
import { GridAreaInfo, OffSetInfo, RectInfo } from '../../type/common.type';
import { GridUtils } from '../../utils/grid.utils/grid.utils';
import { GridManagerInterface } from './grid.manager.interface';
import { GridLineUtils } from '../../utils/grid.utils/grid.line.utils';

export class GridManager implements GridManagerInterface {
  gridSize?: { width: number; height: number };
  #gridRect = {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  };

  #windowSize?: { width: number; height: number };
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

  #gridBorder = {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0
  };

  setWindowSize(width: number, height: number): GridManagerInterface {
    this.#windowSize = {
      width,
      height
    };
    return this;
  }

  setGridSize(width: number, height: number): GridManagerInterface {
    this.gridSize = {
      width,
      height
    };
    this.setParentGridRect();
    return this;
  }

  setGridColumnInfo(
    info: { value: number; unit: string }[]
  ): GridManagerInterface {
    this.#gridColumnInfo = info;
    return this;
  }

  setGridRowInfo(
    info: { value: number; unit: string }[]
  ): GridManagerInterface {
    this.#gridRowInfo = info;
    return this;
  }

  setGridCount(params: {
    row: number;
    column: number;
    rowGap?: { value: number; unit: string };
    columnGap?: { value: number; unit: string };
  }): GridManagerInterface {
    if (!this.#gridRect) {
      console.error(
        'SOID-UI-UTIL',
        'GridAreaService',
        '#gridRect is undefined'
      );
      return this;
    }
    this.#gridRowInfo = [];
    this.#gridColumnInfo = [];
    if (params.rowGap) {
      this.#gridRowGap = this.changeSizeInfoToNumber(
        params.rowGap,
        this.#gridRect.height
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

  setGridGap(
    row: { value: number; unit: string },
    column: { value: number; unit: string }
  ): GridManagerInterface {
    if (!this.#gridRect) {
      console.error(
        'SOID-UI-UTIL',
        'GridAreaService',
        '#gridRect is undefined'
      );
      return this;
    }
    this.#gridRowGap = this.changeSizeInfoToNumber(row, this.#gridRect?.width);
    this.#gridColumnGap = this.changeSizeInfoToNumber(
      column,
      this.#gridRect?.width
    );
    return this;
  }

  setGridPaddingInfo(padding: OffSetInfo): GridManagerInterface {
    this.#gridPadding.left = this.changeSizeInfoToNumber(
      padding.left,
      this.gridSize?.width
    );
    this.#gridPadding.right = this.changeSizeInfoToNumber(
      padding.right,
      this.gridSize?.width
    );
    this.#gridPadding.top = this.changeSizeInfoToNumber(
      padding.top,
      this.gridSize?.height
    );
    this.#gridPadding.bottom = this.changeSizeInfoToNumber(
      padding.bottom,
      this.gridSize?.height
    );
    this.setParentGridRect();
    return this;
  }

  setGridBorderInfo(border: OffSetInfo): GridManagerInterface {
    this.#gridBorder.left = this.changeSizeInfoToNumber(
      border.left,
      this.gridSize?.width
    );
    this.#gridBorder.right = this.changeSizeInfoToNumber(
      border.right,
      this.gridSize?.width
    );
    this.#gridBorder.top = this.changeSizeInfoToNumber(
      border.top,
      this.gridSize?.height
    );
    this.#gridBorder.bottom = this.changeSizeInfoToNumber(
      border.bottom,
      this.gridSize?.height
    );
    this.setParentGridRect();
    return this;
  }

  getGridItemRectList(): RectInfo[][] {
    if (!this.#gridRect) {
      return [];
    }
    const gridColumnInfo = this.#gridColumnInfo ?? [];
    const gridRowInfo = this.#gridRowInfo ?? [];
    const gridWidth =
      this.#gridRect.width - (gridColumnInfo.length - 1) * this.#gridColumnGap;
    const gridHeight =
      this.#gridRect.height - (gridRowInfo.length - 1) * this.#gridRowGap;
    const columnsNumberArray = GridUtils.changeSizeInfoListToNumberList({
      sizeInfoList: gridColumnInfo,
      maxValue: gridWidth,
      windowSize: this.#windowSize,
      gap: this.#gridColumnGap
    });
    const rowsNumberArray = GridUtils.changeSizeInfoListToNumberList({
      sizeInfoList: gridRowInfo,
      maxValue: gridHeight,
      windowSize: this.#windowSize,
      gap: this.#gridRowGap
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

  changeSizeInfoToNumber(
    sizeInfo: { value: number; unit: string },
    maxValue?: number
  ): number {
    return GridUtils.convertSizeInfoToNumber({
      sizeInfo,
      maxValue,
      windowSize: this.#windowSize
    });
  }

  changeNumberToSizeInfo(params: {
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

  changeChildSizeInfoToNumber(params: {
    gridArea: GridAreaInfo;
    gridItemRectList: RectInfo[][];
  }): RectInfo {
    return GridUtils.changeChildSizeInfoToNumber({
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

  getGridPaddingAreaAndLine(
    lineSpace: number
  ): {
    area: RectInfo[];
    lines: { fromX: number; fromY: number; toX: number; toY: number }[];
  } {
    return GridLineUtils.getGridPaddingAreaAndLine({
      gridPadding: this.#gridPadding,
      border: this.#gridBorder,
      gridSize: this.gridSize!,
      lineSpace
    });
  }

  private setParentGridRect(): void {
    if (this.gridSize) {
      this.#gridRect = {
        x: this.#gridPadding.left + this.#gridBorder.left,
        y: this.#gridPadding.top + this.#gridBorder.top,
        width:
          this.gridSize.width -
          this.#gridPadding.left -
          this.#gridPadding.right -
          this.#gridBorder.left -
          this.#gridBorder.right,
        height:
          this.gridSize.height -
          this.#gridPadding.top -
          this.#gridPadding.bottom -
          this.#gridBorder.top -
          this.#gridBorder.bottom
      };
    }
  }
}
