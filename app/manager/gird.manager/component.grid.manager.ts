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

  #gridRect?: RectInfo;

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

  setGridRect(rect: RectInfo): ComponentGridManager {
    this.#gridRect = rect;
    this.gridMapping.gridRect = rect;
    return this;
  }

  getGridRect(): RectInfo {
    return (
      this.#gridRect ?? {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      }
    );
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

  getGridLines(needBorder = false): LineInfo[] {
    let lines = GridLineUtils.getGridLineList(
      this.gridMapping.getGridItemRectList()
    );
    if (!needBorder) {
      lines = this.getNoCountBorderLine(lines);
    }
    return lines;
  }

  getGridGapAreaAndLines(
    lineSpace: number,
    needBorder = false
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
    return areaAndLines;
  }

  getGridPaddingAreaAndLines(
    lineSpace: number,
    needBorder = false
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
    movingRect.x += alignLineInfo.offset.x;
    movingRect.y += alignLineInfo.offset.y;
    const assistLineInfo = GridAssistLineUtils.getAssistLinesAndSigns(
      movingRect,
      this.gridMapping
    );
    return GridLineUtils.convertAlignAndAssistLineInfo({
      alignLineInfo,
      assistLineInfo,
      gridMapping: this.gridMapping
    });
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

  getDropOverAlignAndAssistLineInfo(
    droppedRect: {
      x: number;
      y: number;
      width: number;
      height: number;
    },
    maxActiveLength = 4
  ): {
    assistLines: LineInfo[];
    assistSigns: SignInfo[];
    alignLines: LineInfo[];
    offset: AlignOffsetInfo;
  } {
    const layerLinesInfo = GridAlignLineUtils.prepareAlignLine({
      isNeedMiddle: true,
      gridMapping: this.gridMapping
    });
    const alignLineInfo = GridAlignLineUtils.getAlignLineByMoveRect({
      rect: droppedRect,
      middleList: layerLinesInfo.layerMiddleList,
      centerList: layerLinesInfo.layerCenterList,
      xList: layerLinesInfo.layerXList,
      yList: layerLinesInfo.layerYList,
      offset: maxActiveLength,
      gridActiveRect: this.gridMapping.gridActiveRect
    });
    const assistLineInfo = GridAssistLineUtils.getAssistLinesAndSigns(
      {
        x: droppedRect.x + alignLineInfo.offset.x,
        y: droppedRect.y + alignLineInfo.offset.y,
        width: droppedRect.width,
        height: droppedRect.height
      },
      this.gridMapping
    );
    return GridLineUtils.convertAlignAndAssistLineInfo({
      alignLineInfo,
      assistLineInfo,
      gridMapping: this.gridMapping
    });
  }
}
