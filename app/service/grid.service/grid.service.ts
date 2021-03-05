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

  #scale = 1;

  static getInstance(): GridServiceInterface {
    GridService.instance ??= new GridService();
    return GridService.instance;
  }

  get gridManager(): GridManager {
    this.#gridManager ??= new GridManager();
    return this.#gridManager;
  }

  setGridRect(rect: RectInfo, scale: number = 1): GridServiceInterface {
    this.#scale = scale;
    this.gridManager.setGridRect({
      x: rect.x,
      y: rect.y,
      width: parseFloat((rect.width / scale).toFixed(1)),
      height: parseFloat((rect.height / scale).toFixed(1))
    });
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
      updateChildInfo.placeSelf = child.placeSelf;
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

  getGridLines(needBorder = false, needScale = false): LineInfo[] {
    let lines = GridLineUtils.getGridLineList(
      this.gridManager.getGridItemRectList()
    );
    if (!needBorder) {
      lines = this.getNoCountBorderLine(lines);
    }
    if (needScale) {
      return this.getScaleLine(lines);
    }
    return lines;
  }

  getGridGapAreaAndLines(
    lineSpace: number,
    needBorder = false,
    needScale = false
  ): {
    area: RectInfo[];
    lines: LineInfo[];
  } {
    let areaAndLines = GridLineUtils.getGridGapAreaAndLine({
      gridItemRectList: this.gridManager.getGridItemRectList(),
      lineSpace
    });
    if (!needBorder) {
      areaAndLines = this.getNoCountBorderAreaAndLine(areaAndLines);
    }
    if (needScale) {
      return this.getScaleAreaAndLine(areaAndLines);
    }
    return areaAndLines;
  }

  getGridPaddingAreaAndLines(
    lineSpace: number,
    needBorder = false,
    needScale = false
  ): {
    area: RectInfo[];
    lines: LineInfo[];
  } {
    if (!this.gridManager.activeStatus) {
      ErrorUtils.GridError('GridSize is undefined');
      return {
        area: [],
        lines: []
      };
    }
    let areaAndLines = GridLineUtils.getGridPaddingAreaAndLine({
      gridPadding: this.gridManager.padding,
      border: this.gridManager.border,
      gridSize: this.gridManager.gridRect,
      lineSpace
    });
    if (!needBorder) {
      areaAndLines = this.getNoCountBorderAreaAndLine(areaAndLines);
    }
    if (needScale) {
      return this.getScaleAreaAndLine(areaAndLines);
    }
    return areaAndLines;
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
    needScale = false,
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
    if (needScale) {
      assistLineInfo.lines = this.getScaleLine(assistLineInfo.lines);
      alignLineInfo.lines = this.getScaleLine(alignLineInfo.lines);
      assistLineInfo.signs = assistLineInfo.signs.map(sign => {
        return {
          x: sign.x * this.#scale,
          y: sign.y * this.#scale,
          sign: sign.sign
        };
      });
    }
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
    if (!this.#movingLayerId) return;
    this.resetAlignLine();
    const layerLinesInfo = GridAlignLineUtils.prepareAlignLine({
      isNeedMiddle,
      gridManager: this.gridManager,
      movingLayerId: this.#movingLayerId
    });
    this.#layerCenterList = layerLinesInfo.layerCenterList;
    this.#layerMiddleList = layerLinesInfo.layerMiddleList;
    this.#layerXList = layerLinesInfo.layerXList;
    this.#layerYList = layerLinesInfo.layerYList;
  }

  private resetAlignLine(): void {
    this.#layerXList = [];
    this.#layerYList = [];
    this.#layerCenterList = [];
    this.#layerMiddleList = [];
  }

  private getScaleAreaAndLine(areaAndLines: {
    area: RectInfo[];
    lines: LineInfo[];
  }): {
    area: RectInfo[];
    lines: LineInfo[];
  } {
    return {
      area: areaAndLines.area.map(rect => {
        return {
          x: parseFloat((rect.x * this.#scale).toFixed(1)),
          y: parseFloat((rect.y * this.#scale).toFixed(1)),
          width: parseFloat((rect.width * this.#scale).toFixed(1)),
          height: parseFloat((rect.height * this.#scale).toFixed(1))
        };
      }),
      lines: this.getScaleLine(areaAndLines.lines)
    };
  }

  private getScaleLine(lines: LineInfo[]): LineInfo[] {
    return lines.map(line => {
      return {
        fromX: parseFloat((line.fromX * this.#scale).toFixed(1)),
        toX: parseFloat((line.toX * this.#scale).toFixed(1)),
        fromY: parseFloat((line.fromY * this.#scale).toFixed(1)),
        toY: parseFloat((line.toY * this.#scale).toFixed(1))
      };
    });
  }

  private getNoCountBorderAreaAndLine(areaAndLines: {
    area: RectInfo[];
    lines: LineInfo[];
  }): {
    area: RectInfo[];
    lines: LineInfo[];
  } {
    return {
      area: areaAndLines.area.map(rect => {
        rect.x -= this.gridManager.border.left;
        rect.y -= this.gridManager.border.top;
        return rect;
      }),
      lines: this.getNoCountBorderLine(areaAndLines.lines)
    };
  }

  private getNoCountBorderLine(lines: LineInfo[]): LineInfo[] {
    return lines.map(line => {
      line.fromY -= this.gridManager.border.top;
      line.fromX -= this.gridManager.border.left;
      line.toY -= this.gridManager.border.top;
      line.toX -= this.gridManager.border.left;
      return line;
    });
  }
}
