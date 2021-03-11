/*
 * @author allen
 * @data 2020/11/23 22:24
 */
import {
  CustomGrid,
  GridArea,
  GridGap,
  SpacingPadding
} from 'towify-editor-common-values';
import {
  GridChildInfo,
  LineInfo,
  RectInfo,
  SizeInfo
} from '../../type/common.type';
import { GridMapping } from '../../mapping/grid.mapping/grid.mapping';
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

export class ComponentGridManager {
  #movingLayerId = '';

  #movingOffsetX = 0;

  #movingOffsetY = 0;

  #layerXList: number[] = [];

  #layerYList: number[] = [];

  #layerCenterList: number[] = [];

  #layerMiddleList: number[] = [];

  #scale = 1;

  gridMapping: GridMapping;

  constructor(
    public readonly gap: GridGap,
    public readonly padding: SpacingPadding,
    public readonly border: SpacingPadding
  ) {
    this.gridMapping = new GridMapping(gap, padding, border, 1, 1);
  }

  setGridCount(params: { row: number; column: number }): ComponentGridManager {
    this.gridMapping.rowCount = params.row;
    this.gridMapping.columnCount = params.column;
    return this;
  }

  setGridInfo(value: CustomGrid | undefined): ComponentGridManager {
    this.gridMapping.customGrid = value;
    return this;
  }

  setGridRect(rect: RectInfo, scale: number = 1): ComponentGridManager {
    this.#scale = scale;
    this.gridMapping.gridRect = {
      x: rect.x,
      y: rect.y,
      width: parseFloat((rect.width / scale).toFixed(1)),
      height: parseFloat((rect.height / scale).toFixed(1))
    };
    return this;
  }

  setChildrenGridInfo(childrenInfo: GridChildInfo[]): ComponentGridManager {
    this.gridMapping.setChildrenInfo(childrenInfo);
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
    return GridChildUtils.setDroppedInfo(dropped, this.gridMapping);
  }

  deleteChildByIdAndGetParentGridChildrenUpdateStatus(
    childId: string
  ): boolean {
    const childIndex = this.gridMapping.childInfoList.findIndex(
      childInfo => childInfo.id === childId
    );
    if (childIndex !== -1) {
      this.gridMapping.childInfoList.splice(childIndex, 1);
    }
    return this.gridMapping.needUpdateGridChildren();
  }

  updateChildInfoAndGetParentGridChildrenUpdateStatus(
    child: GridChildInfo
  ): boolean {
    const updateChildInfo = this.gridMapping.childInfoList.find(
      childInfo => childInfo.id === child.id
    );
    if (updateChildInfo) {
      updateChildInfo.gridArea = child.gridArea;
      updateChildInfo.margin = child.margin;
      updateChildInfo.size = child.size;
      updateChildInfo.placeSelf = child.placeSelf;
      updateChildInfo.rect = this.gridMapping.getGridChildRect(updateChildInfo);
    }
    return this.gridMapping.needUpdateGridChildren();
  }

  adjustChildrenAndResetAutoGridInfo(ignoreGridArea = false): GridChildInfo[] {
    if (!this.gridMapping.childInfoList.length) {
      return [];
    }
    const gridChildList = GridChildUtils.adjustChildrenAndResetAutoGridInfo(
      this.gridMapping
    );
    if (ignoreGridArea) {
      gridChildList.forEach(gridChild => {
        gridChild.gridArea.rowStart = 0;
        gridChild.gridArea.rowEnd = 0;
        gridChild.gridArea.columnStart = 0;
        gridChild.gridArea.columnEnd = 0;
      });
    }
    return gridChildList;
  }

  getModifiedChildrenGirdInfo(ignoreGridArea = false): GridChildInfo[] {
    if (!this.gridMapping.childInfoList.length) {
      return [];
    }
    const gridChildList = GridChildUtils.getModifiedChildrenGirdInfo(
      this.gridMapping
    );
    if (ignoreGridArea) {
      gridChildList.forEach(gridChild => {
        gridChild.gridArea.rowStart = 0;
        gridChild.gridArea.rowEnd = 0;
        gridChild.gridArea.columnStart = 0;
        gridChild.gridArea.columnEnd = 0;
      });
    }
    return gridChildList;
  }

  getGridLines(needBorder = false, needScale = false): LineInfo[] {
    let lines = GridLineUtils.getGridLineList(
      this.gridMapping.getGridItemRectList()
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
      gridItemRectList: this.gridMapping.getGridItemRectList(),
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
    let areaAndLines = GridLineUtils.getGridPaddingAreaAndLine({
      gridPadding: this.gridMapping.paddingInfo,
      border: this.gridMapping.borderInfo,
      gridSize: this.gridMapping.gridRect,
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

  startMovingChildById(id: string): ComponentGridManager {
    this.#movingLayerId = id;
    this.#movingOffsetX = 0;
    this.#movingOffsetY = 0;
    this.prepareAlignLine();
    return this;
  }

  movingChild(offset: { x: number; y: number }): ComponentGridManager {
    this.#movingOffsetX = offset.x;
    this.#movingOffsetY = offset.y;
    return this;
  }

  stopMovingChild(): ComponentGridManager {
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
    const moveChild = this.gridMapping.childInfoList.find(child => {
      return child.id === this.#movingLayerId;
    });
    if (!moveChild) {
      ErrorUtils.InteractError('Moving layer is not find');
      return {
        assistLines: [],
        alignLines: [],
        assistSigns: [],
        offset: AlignDefaultOffset
      };
    }
    const childRect = this.gridMapping.getGridChildRect(moveChild);
    const movingRect = {
      x: childRect.x + this.#movingOffsetX,
      y: childRect.y + this.#movingOffsetY,
      width: childRect.width,
      height: childRect.height
    };
    const alignLineInfo = GridAlignLineUtils.getAlignLineByMoveRect({
      rect: movingRect,
      middleList: this.#layerMiddleList,
      centerList: this.#layerCenterList,
      xList: this.#layerXList,
      yList: this.#layerYList,
      offset: maxActiveLength,
      gridActiveRect: this.gridMapping.gridActiveRect
    });
    const assistLineInfo = GridAssistLineUtils.getAssistLinesAndSigns(
      {
        movingId: this.#movingLayerId,
        movingOffsetX: this.#movingOffsetX + alignLineInfo.offset.x,
        movingOffsetY: this.#movingOffsetY + +alignLineInfo.offset.y
      },
      this.gridMapping
    );
    const rect = this.gridMapping.gridRect;
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
    if (!this.#movingLayerId) return;
    this.resetAlignLine();
    const layerLinesInfo = GridAlignLineUtils.prepareAlignLine({
      isNeedMiddle,
      gridMapping: this.gridMapping,
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
        rect.x -= this.gridMapping.borderInfo.left;
        rect.y -= this.gridMapping.borderInfo.top;
        return rect;
      }),
      lines: this.getNoCountBorderLine(areaAndLines.lines)
    };
  }

  private getNoCountBorderLine(lines: LineInfo[]): LineInfo[] {
    return lines.map(line => {
      line.fromY -= this.gridMapping.borderInfo.top;
      line.fromX -= this.gridMapping.borderInfo.left;
      line.toY -= this.gridMapping.borderInfo.top;
      line.toX -= this.gridMapping.borderInfo.left;
      return line;
    });
  }
}
