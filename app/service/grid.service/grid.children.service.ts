/*
 * @author allen
 * @data 2020/11/23 22:24
 */
import { GridChildrenServiceInterface } from './grid.children.service.interface';
import { GridAreaInfo, OffSetInfo, RectInfo } from '../../type/common.type';
import { GridManager } from '../../manager/gird.manager/grid.manager';

export class GridChildrenService implements GridChildrenServiceInterface {
  private static instance?: GridChildrenServiceInterface;

  #gridManager?: GridManager;

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

  static getInstance(): GridChildrenServiceInterface {
    GridChildrenService.instance ??= new GridChildrenService();
    return GridChildrenService.instance;
  }

  get gridManager(): GridManager {
    this.#gridManager ??= new GridManager();
    return this.#gridManager;
  }

  setWindowSize(width: number, height: number): GridChildrenServiceInterface {
    this.gridManager.setWindowSize(width, height);
    return this;
  }

  setParentGridSize(
    width: number,
    height: number
  ): GridChildrenServiceInterface {
    this.gridManager.setGridSize(width, height);
    return this;
  }

  setParentGridColumnInfo(
    info: { value: number; unit: string }[]
  ): GridChildrenServiceInterface {
    this.gridManager.setGridColumnInfo(info);
    return this;
  }

  setParentGridRowInfo(
    info: { value: number; unit: string }[]
  ): GridChildrenServiceInterface {
    this.gridManager.setGridRowInfo(info);
    return this;
  }

  setParentGridInfo(
    row: { value: number; unit: string }[],
    column: { value: number; unit: string }[]
  ): GridChildrenServiceInterface {
    this.gridManager.setGridColumnInfo(column);
    this.gridManager.setGridRowInfo(row);
    return this;
  }

  setParentGridCount(params: {
    row: number;
    column: number;
    rowGap?: { value: number; unit: string };
    columnGap?: { value: number; unit: string };
  }): GridChildrenServiceInterface {
    this.gridManager.setGridCount(params);
    return this;
  }

  setParentGridGap(
    row: { value: number; unit: string },
    column: { value: number; unit: string }
  ): GridChildrenServiceInterface {
    this.gridManager.setGridGap(row, column);
    return this;
  }

  setParentGridPaddingInfo(padding: OffSetInfo): GridChildrenServiceInterface {
    this.gridManager.setGridPaddingInfo(padding);
    return this;
  }

  setParentGridBorderInfo(border: OffSetInfo): GridChildrenServiceInterface {
    this.gridManager.setGridBorderInfo(border);
    return this;
  }

  setDroppedInfo(dropped: {
    x: number;
    y: number;
    width: { value: number; unit: string };
    height: { value: number; unit: string };
    gridArea?: GridAreaInfo;
  }): GridChildrenServiceInterface {
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
    if (!this.gridManager.gridSize || !this.#droppedInfo) {
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
    const gridItemRectList = this.gridManager.getGridItemRectList();
    const droppedRect = {
      x: this.#droppedInfo.x,
      y: this.#droppedInfo.y,
      width: 0,
      height: 0
    };
    if (this.#droppedInfo.gridArea) {
      const droppedParentRect = this.gridManager.changeChildSizeInfoToNumber({
        gridArea: this.#droppedInfo.gridArea,
        gridItemRectList
      });
      droppedRect.width = this.gridManager.changeSizeInfoToNumber(
        this.#droppedInfo.width,
        droppedParentRect.width
      );
      droppedRect.height = this.gridManager.changeSizeInfoToNumber(
        this.#droppedInfo.height,
        droppedParentRect.height
      );
    } else {
      droppedRect.width = this.gridManager.changeSizeInfoToNumber(
        this.#droppedInfo.width
      );
      droppedRect.height = this.gridManager.changeSizeInfoToNumber(
        this.#droppedInfo.height
      );
    }
    const gridInfo = this.gridManager.getGridAreaInfoByRect({
      rect: droppedRect,
      gridItemRectList
    });
    const finishParentRect = this.gridManager.changeChildSizeInfoToNumber({
      gridArea: gridInfo.gridArea,
      gridItemRectList
    });
    const width = this.gridManager.changeNumberToSizeInfo({
      valueNumber: droppedRect.width,
      unit: this.#droppedInfo.width.unit,
      maxValue: finishParentRect.width
    });
    const height = this.gridManager.changeNumberToSizeInfo({
      valueNumber: droppedRect.height,
      unit: this.#droppedInfo.height.unit,
      maxValue: finishParentRect.height
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
  ): GridChildrenServiceInterface {
    if (!this.gridManager.gridSize) {
      console.error('SOID-UI-UTIL', 'GridAreaService', 'gridRect is undefined');
      return this;
    }
    const gridItemRectList = this.gridManager.getGridItemRectList();
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
      childGridRect = this.gridManager.changeChildSizeInfoToNumber({
        gridArea: childInfo.gridArea,
        gridItemRectList
      });
      childX =
        childGridRect.x +
        this.gridManager.changeSizeInfoToNumber(
          childInfo.marginLeft,
          childGridRect.width
        );
      childY =
        childGridRect.y +
        this.gridManager.changeSizeInfoToNumber(
          childInfo.marginTop,
          childGridRect.height
        );
      childWidth = this.gridManager.changeSizeInfoToNumber(
        childInfo.width,
        childGridRect.width
      );
      childHeight = this.gridManager.changeSizeInfoToNumber(
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
    if (!this.gridManager.gridSize || !this.#childRectInfoList.length) {
      console.error('SOID-UI-UTIL', 'GridAreaService', 'gridRect is undefined');
      return [];
    }
    const gridItemRectList = this.gridManager.getGridItemRectList();
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
      areaInfo = this.gridManager.getGridAreaInfoByRect({
        rect: childInfo.rect,
        gridItemRectList
      });
      childGridRect = this.gridManager.changeChildSizeInfoToNumber({
        gridArea: areaInfo.gridArea,
        gridItemRectList
      });
      marginLeft = this.gridManager.changeNumberToSizeInfo({
        valueNumber: areaInfo.marginLeft,
        unit: childInfo.leftUint,
        maxValue: childGridRect.width
      });
      marginTop = this.gridManager.changeNumberToSizeInfo({
        valueNumber: areaInfo.marginTop,
        unit: childInfo.topUnit,
        maxValue: childGridRect.height
      });
      width = this.gridManager.changeNumberToSizeInfo({
        valueNumber: childInfo.rect.width,
        unit: childInfo.widthUint,
        maxValue: childGridRect.width
      });
      height = this.gridManager.changeNumberToSizeInfo({
        valueNumber: childInfo.rect.height,
        unit: childInfo.heightUint,
        maxValue: childGridRect.height
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
}
