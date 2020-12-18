/*
 * @author allen
 * @data 2020/11/23 22:24
 */
import {
  CustomGrid,
  GridArea,
  GridGap,
  SpacingPadding,
  UISize
} from 'towify-editor-common-values';
import { GridServiceInterface } from './grid.service.interface';
import {
  GridChildInfo,
  LineInfo,
  RectInfo,
  SizeInfo
} from '../../type/common.type';
import { GridManager } from '../../manager/gird.manager/grid.manager';
import { GridLineUtils } from '../../utils/grid.utils/grid.line.utils';
import { ErrorUtils } from '../../utils/error.utils/error.utils';
import { WindowUtils } from '../../utils/window.utils/window.utils';
import { GridChildUtils } from '../../utils/grid.utils/grid.child.utils';
import {
  AlignDefaultOffset,
  AlignOffsetInfo,
  SignInfo
} from '../../type/interact.type';
import { GridAssistLineUtils } from '../../utils/grid.utils/grid.assist.line.utils';
import { GridAlignLineUtils } from '../../utils/grid.utils/grid.align.line.utils';

export class GridService implements GridServiceInterface {
  #movingLayerId = '';

  #movingOffsetX = 0;

  #movingOffsetY = 0;

  #layerXList: number[] = [];

  #layerYList: number[] = [];

  #layerCenterList: number[] = [];

  #layerMiddleList: number[] = [];

  private static instance?: GridServiceInterface;

  #gridManager?: GridManager;

  static getInstance(): GridServiceInterface {
    GridService.instance ??= new GridService();
    return GridService.instance;
  }

  get gridManager(): GridManager {
    this.#gridManager ??= new GridManager();
    return this.#gridManager;
  }

  setWindowSize(width: number, height: number): GridServiceInterface {
    WindowUtils.WindowSize = {
      width,
      height
    };
    return this;
  }

  setGridSize(width: number, height: number): GridServiceInterface {
    this.gridManager.setGridSize(width, height);
    return this;
  }

  setGridColumnInfo(info: UISize[]): GridServiceInterface {
    this.gridManager.setGridColumnInfo(info);
    return this;
  }

  setGridRowInfo(info: UISize[]): GridServiceInterface {
    this.gridManager.setGridRowInfo(info);
    return this;
  }

  setGridInfo(info: CustomGrid): GridServiceInterface {
    this.gridManager.setGridColumnInfo(info.column);
    this.gridManager.setGridRowInfo(info.row);
    return this;
  }

  setGridCount(params: {
    row: number;
    column: number;
    gap?: GridGap;
  }): GridServiceInterface {
    this.gridManager.setGridCount(params);
    return this;
  }

  setGridGap(gap: GridGap): GridServiceInterface {
    this.gridManager.setGap(gap);
    return this;
  }

  setGridPaddingInfo(padding: SpacingPadding): GridServiceInterface {
    this.gridManager.setPadding(padding);
    return this;
  }

  setGridBorderInfo(border: SpacingPadding): GridServiceInterface {
    this.gridManager.setBorder(border);
    return this;
  }

  setChildrenGridInfo(childrenInfo: GridChildInfo[]): GridServiceInterface {
    if (!this.gridManager.gridSize) {
      ErrorUtils.GridError('GridSize is undefined');
      return this;
    }
    this.gridManager.setChildrenInfo(childrenInfo);
    const gridItemRectList = this.gridManager.getGridItemRectList();
    this.gridManager.childInfoList.forEach(childInfo => {
      this.gridManager.updateChildRect(childInfo, gridItemRectList);
    });
    return this;
  }

  setDroppedInfo(dropped: {
    id: string;
    x: number;
    y: number;
    size: SizeInfo;
    gridArea?: GridArea;
  }): {
    info: GridChildInfo;
    needUpdateGridChildren: boolean;
  } {
    return GridChildUtils.setDroppedInfo(dropped, this.gridManager);
  }

  deleteChildByIdAndGetParentGridChildrenUpdateStatus(
    childId: string
  ): boolean {
    const childIndex = this.gridManager.childInfoList.findIndex(
      childInfo => childInfo.id === childId
    );
    if (childIndex !== -1) {
      this.gridManager.childInfoList.splice(childIndex, 1);
    }
    return this.gridManager.needUpdateGridChildren();
  }

  updateChildInfoAndGetParentGridChildrenUpdateStatus(
    child: GridChildInfo
  ): boolean {
    const updateChildInfo = this.gridManager.childInfoList.find(
      childInfo => childInfo.id === child.id
    );
    if (updateChildInfo) {
      updateChildInfo.gridArea = child.gridArea;
      updateChildInfo.margin = child.margin;
      updateChildInfo.size = child.size;
      const gridItemRectList = this.gridManager.getGridItemRectList();
      this.gridManager.updateChildRect(updateChildInfo, gridItemRectList);
    }
    return this.gridManager.needUpdateGridChildren();
  }

  adjustChildrenAndResetAutoGridInfo(): GridChildInfo[] {
    if (!this.gridManager.gridSize) {
      ErrorUtils.GridError('GridSize is undefined');
      return [];
    }
    if (!this.gridManager.childInfoList.length) return [];
    return GridChildUtils.adjustChildrenAndResetAutoGridInfo(this.gridManager);
  }

  getModifiedChildrenGirdInfo(): GridChildInfo[] {
    if (!this.gridManager.gridSize || !this.gridManager.childInfoList.length) {
      ErrorUtils.GridError('GridSize is undefined');
      return [];
    }
    return GridChildUtils.getModifiedChildrenGirdInfo(this.gridManager);
  }

  getGridLines(): { fromX: number; fromY: number; toX: number; toY: number }[] {
    return GridLineUtils.getGridLineList(
      this.gridManager.getGridItemRectList()
    );
  }

  getGridGapAreaAndLines(
    lineSpace: number
  ): {
    area: RectInfo[];
    lines: { fromX: number; fromY: number; toX: number; toY: number }[];
  } {
    return GridLineUtils.getGridGapAreaAndLine({
      gridItemRectList: this.gridManager.getGridItemRectList(),
      lineSpace
    });
  }

  getGridPaddingAreaAndLines(
    lineSpace: number
  ): {
    area: RectInfo[];
    lines: { fromX: number; fromY: number; toX: number; toY: number }[];
  } {
    if (!this.gridManager.gridSize) {
      ErrorUtils.GridError('GridSize is undefined');
      return {
        area: [],
        lines: []
      };
    }
    return GridLineUtils.getGridPaddingAreaAndLine({
      gridPadding: this.gridManager.padding,
      border: this.gridManager.border,
      gridSize: this.gridManager.gridSize,
      lineSpace
    });
  }

  startMovingChildById(id: string): GridServiceInterface {
    this.#movingLayerId = id;
    this.#movingOffsetX = 0;
    this.#movingOffsetY = 0;
    this.prepareAlignLine();
    return this;
  }

  movingChild(offset: { x: number; y: number }): GridServiceInterface {
    this.#movingOffsetX = offset.x;
    this.#movingOffsetY = offset.y;
    return this;
  }

  stopMovingChild(): GridServiceInterface {
    this.#movingLayerId = '';
    this.#movingOffsetX = 0;
    this.#movingOffsetY = 0;
    return this;
  }

  getAssistLinesAndSigns(offset?: {
    x: number;
    y: number;
  }): {
    lines: LineInfo[];
    signs: SignInfo[];
  } {
    if (!this.#movingLayerId) {
      ErrorUtils.InteractError('Moving layer is not set');
      return {
        lines: [],
        signs: []
      };
    }
    return GridAssistLineUtils.getAssistLinesAndSigns(
      {
        movingId: this.#movingLayerId,
        movingOffsetX: offset ? offset.x : this.#movingOffsetX,
        movingOffsetY: offset ? offset.y : this.#movingOffsetY
      },
      this.gridManager
    );
  }

  getAlignLinesAndOffset(
    offset: number = 4
  ): {
    lines: LineInfo[];
    offset: AlignOffsetInfo;
  } {
    const moveChild = this.gridManager.childInfoList.find(child => {
      return child.id === this.#movingLayerId;
    });
    if (!moveChild || !moveChild.rect) {
      ErrorUtils.InteractError('Moving layer is not find');
      return {
        lines: [],
        offset: AlignDefaultOffset
      };
    }
    const movingRect = {
      x: moveChild.rect.x + this.#movingOffsetX,
      y: moveChild.rect.y + this.#movingOffsetY,
      width: moveChild.rect.width,
      height: moveChild.rect.height
    };
    return GridAlignLineUtils.getAlignLineByMoveRect({
      rect: movingRect,
      middleList: this.#layerMiddleList,
      centerList: this.#layerCenterList,
      xList: this.#layerXList,
      yList: this.#layerYList,
      offset,
      gridManager: this.gridManager
    });
  }

  private prepareAlignLine(isNeedMiddle = true): void {
    if (!this.gridManager.gridSize) {
      ErrorUtils.InteractError('GridSize is undefined');
      return;
    }
    this.resetAlignLine();
    const canvasMinLeft = 0;
    const canvasMaxRight = this.gridManager.gridSize.width;
    const canvasMinTop = 0;
    const canvasMaxBottom = this.gridManager.gridSize.height;
    const canvasCenterX = this.gridManager.gridSize.width / 2;
    const canvasCenterY = this.gridManager.gridSize.height / 2;
    if (isNeedMiddle) {
      this.#layerCenterList.push(canvasCenterX);
      this.#layerMiddleList.push(canvasCenterY);
    }
    this.#layerXList.push(canvasMinLeft);
    this.#layerXList.push(canvasMaxRight);
    this.#layerYList.push(canvasMinTop);
    this.#layerYList.push(canvasMaxBottom);
    if (!this.#movingLayerId) return;
    this.gridManager.childInfoList.forEach(child => {
      if (child.rect && child.id !== this.#movingLayerId) {
        const minLeft = child.rect.x;
        const maxRight = child.rect.y + child.rect.width;
        const minTop = child.rect.y;
        const maxBottom = child.rect.y + child.rect.height;
        if (this.#layerXList.indexOf(maxRight) === -1) {
          this.#layerXList.push(maxRight);
        }
        if (this.#layerXList.indexOf(minLeft) === -1) {
          this.#layerXList.push(minLeft);
        }
        if (this.#layerYList.indexOf(minTop) === -1) {
          this.#layerYList.push(minTop);
        }
        if (this.#layerYList.indexOf(maxBottom) === -1) {
          this.#layerYList.push(maxBottom);
        }
        if (isNeedMiddle) {
          const centerX = child.rect.x + child.rect.width / 2;
          const centerY = child.rect.y + child.rect.height / 2;
          if (this.#layerCenterList.indexOf(centerX) === -1) {
            this.#layerCenterList.push(centerX);
          }
          if (this.#layerMiddleList.indexOf(centerY) === -1) {
            this.#layerMiddleList.push(centerY);
          }
        }
      }
    });
    const itemRectList = this.gridManager.getGridItemRectList();
    itemRectList.forEach(rowItem => {
      rowItem.forEach(rect => {
        if (isNeedMiddle) {
          const centerX = rect.x + rect.width / 2;
          const centerY = rect.y + rect.height / 2;
          if (this.#layerCenterList.indexOf(centerX) === -1) {
            this.#layerCenterList.push(centerX);
          }
          if (this.#layerMiddleList.indexOf(centerY) === -1) {
            this.#layerMiddleList.push(centerY);
          }
        }
      });
    });
  }

  private resetAlignLine(): void {
    this.#layerXList = [];
    this.#layerYList = [];
    this.#layerCenterList = [];
    this.#layerMiddleList = [];
  }
}
