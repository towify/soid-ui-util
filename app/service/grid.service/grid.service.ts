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

  setGridRect(rect: RectInfo): GridServiceInterface {
    this.gridManager.setGridRect(rect);
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
    if (!this.gridManager.activeStatus) {
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
    if (!this.gridManager.activeStatus) {
      ErrorUtils.GridError('GridSize is undefined');
      return [];
    }
    if (!this.gridManager.childInfoList.length) return [];
    return GridChildUtils.adjustChildrenAndResetAutoGridInfo(this.gridManager);
  }

  getModifiedChildrenGirdInfo(): GridChildInfo[] {
    if (
      !this.gridManager.activeStatus ||
      !this.gridManager.childInfoList.length
    ) {
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
    if (!this.gridManager.activeStatus) {
      ErrorUtils.GridError('GridSize is undefined');
      return {
        area: [],
        lines: []
      };
    }
    return GridLineUtils.getGridPaddingAreaAndLine({
      gridPadding: this.gridManager.padding,
      border: this.gridManager.border,
      gridSize: this.gridManager.gridRect,
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

  getAlignAndAssistLineInfo(
    maxActiveLength: number = 4
  ): {
    assistLines: LineInfo[];
    assistSigns: SignInfo[];
    alignLines: LineInfo[];
    offset: AlignOffsetInfo;
  } {
    const moveChild = this.gridManager.childInfoList.find(child => {
      return child.id === this.#movingLayerId;
    });
    if (!moveChild || !moveChild.rect) {
      ErrorUtils.InteractError('Moving layer is not find');
      return {
        assistLines: [],
        alignLines: [],
        assistSigns: [],
        offset: AlignDefaultOffset
      };
    }
    if (!this.gridManager.activeStatus) {
      ErrorUtils.GridError('GridSize is undefined');
      return {
        assistLines: [],
        alignLines: [],
        assistSigns: [],
        offset: AlignDefaultOffset
      };
    }
    const movingRect = {
      x: moveChild.rect.x + this.#movingOffsetX,
      y: moveChild.rect.y + this.#movingOffsetY,
      width: moveChild.rect.width,
      height: moveChild.rect.height
    };
    const alignLineInfo = GridAlignLineUtils.getAlignLineByMoveRect({
      rect: movingRect,
      middleList: this.#layerMiddleList,
      centerList: this.#layerCenterList,
      xList: this.#layerXList,
      yList: this.#layerYList,
      offset: maxActiveLength,
      gridActiveRect: this.gridManager.gridActiveRect
    });
    const assistLineInfo = GridAssistLineUtils.getAssistLinesAndSigns(
      {
        movingId: this.#movingLayerId,
        movingOffsetX: this.#movingOffsetX + alignLineInfo.offset.x,
        movingOffsetY: this.#movingOffsetY + +alignLineInfo.offset.y
      },
      this.gridManager
    );
    const rect = this.gridManager.gridRect;
    return {
      assistLines: assistLineInfo.lines.map(line => {
        return {
          fromX: line.fromX + rect.x,
          fromY: line.fromY + rect.y,
          toX: line.toX + rect.x,
          toY: line.toY + rect.y
        };
      }),
      alignLines: alignLineInfo.lines.map(line => {
        return {
          fromX: line.fromX + rect.x,
          fromY: line.fromY + rect.y,
          toX: line.toX + rect.x,
          toY: line.toY + rect.y
        };
      }),
      assistSigns: assistLineInfo.signs.map(sign => {
        return {
          x: sign.x + rect.x,
          y: sign.y + rect.y,
          sign: sign.sign
        };
      }),
      offset: alignLineInfo.offset
    };
  }

  private prepareAlignLine(isNeedMiddle = true): void {
    if (!this.gridManager.activeStatus) {
      ErrorUtils.InteractError('GridSize is undefined');
      return;
    }
    this.resetAlignLine();
    const canvasMinLeft = 0;
    const canvasMaxRight = this.gridManager.gridRect.width;
    const canvasMinTop = 0;
    const canvasMaxBottom = this.gridManager.gridRect.height;
    const canvasCenterX = this.gridManager.gridRect.width / 2;
    const canvasCenterY = this.gridManager.gridRect.height / 2;
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
        const maxRight = child.rect.x + child.rect.width;
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
