/*
 * @author allen
 * @data 2020/11/23 22:24
 */
import {
  CustomGrid,
  GridArea,
  GridGap,
  SizeUnit,
  SpacingPadding,
  UISize
} from '@towify/common-values';
import { GridChildInfo, LineInfo, RectInfo, SizeInfo } from '../../type/common.type';
import { GridMapping } from '../../mapping/grid.mapping/grid.mapping';
import { GridLineUtils } from '../../utils/grid.utils/grid.line.utils';
import { ErrorUtils } from '../../utils/error.utils/error.utils';
import { GridChildUtils } from '../../utils/grid.utils/grid.child.utils';
import { AlignDefaultOffset, AlignOffsetInfo, SignInfo } from '../../type/interact.type';
import { GridAssistLineUtils } from '../../utils/grid.utils/grid.assist.line.utils';
import { GridAlignLineUtils } from '../../utils/grid.utils/grid.align.line.utils';
import { GridUtils } from '../../utils/grid.utils/grid.utils';

export class ComponentGridManager {
  #movingLayerId = '';

  #movingOffsetX = 0;

  #movingOffsetY = 0;

  #layerXList: number[] = [];

  #layerYList: number[] = [];

  #layerCenterList: number[] = [];

  #layerMiddleList: number[] = [];

  readonly #gridMapping: GridMapping;

  constructor(
    public readonly gap: GridGap,
    public readonly padding: SpacingPadding,
    public readonly border: SpacingPadding
  ) {
    this.#gridMapping = new GridMapping(gap, padding, border, 1, 1);
  }

  get gridRect(): RectInfo {
    return this.#gridMapping.gridRect;
  }

  get gridActiveRect(): RectInfo {
    return this.#gridMapping.gridActiveRect;
  }

  get gridItemRectList(): RectInfo[][] {
    return this.#gridMapping.getGridItemRectList();
  }

  setGridCount(params: { row: number; column: number }): ComponentGridManager {
    this.#gridMapping.rowCount = params.row;
    this.#gridMapping.columnCount = params.column;
    return this;
  }

  setGridInfo(value: CustomGrid | undefined): ComponentGridManager {
    this.#gridMapping.customGrid = value;
    return this;
  }

  setGridParentRect(rect?: RectInfo): ComponentGridManager {
    if (rect) {
      this.#gridMapping.parentRect = rect;
    }
    return this;
  }

  setGridRect(rect: RectInfo): ComponentGridManager {
    this.#gridMapping.gridRect = rect;
    return this;
  }

  setChildrenGridInfo(childrenInfo: GridChildInfo[]): ComponentGridManager {
    this.#gridMapping.setChildrenInfo(childrenInfo);
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
    return GridChildUtils.setDroppedInfo(dropped, this.#gridMapping);
  }

  deleteChildByIdAndGetParentGridChildrenUpdateStatus(childId: string): boolean {
    const childIndex = this.#gridMapping.childInfoList.findIndex(
      childInfo => childInfo.id === childId
    );
    if (childIndex !== -1) {
      this.#gridMapping.childInfoList.splice(childIndex, 1);
    }
    return this.#gridMapping.needUpdateGridChildren();
  }

  updateChildInfoAndGetParentGridChildrenUpdateStatus(child: GridChildInfo): boolean {
    const updateChildInfo = this.#gridMapping.childInfoList.find(
      childInfo => childInfo.id === child.id
    );
    if (updateChildInfo) {
      updateChildInfo.isFullParent = child.isFullParent;
      updateChildInfo.gridArea = child.gridArea;
      updateChildInfo.margin = child.margin;
      updateChildInfo.size = child.size;
      updateChildInfo.placeSelf = child.placeSelf;
      updateChildInfo.rect = this.#gridMapping.getGridChildRect(updateChildInfo);
    }
    return this.#gridMapping.needUpdateGridChildren();
  }

  adjustChildrenAndResetAutoGridInfo(ignoreGridArea = false): GridChildInfo[] {
    if (!this.#gridMapping.childInfoList.length) {
      return [];
    }
    const gridChildList = GridChildUtils.adjustChildrenAndResetAutoGridInfo(this.#gridMapping);
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
    if (!this.#gridMapping.childInfoList.length) {
      return [];
    }
    const gridChildList = GridChildUtils.getModifiedChildrenGirdInfo(this.#gridMapping);
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

  getChildGridRect(gridArea: GridArea) {
    const childRectRect = GridUtils.convertChildSizeInfoToNumber({
      gridArea,
      gridRect: this.#gridMapping.gridActiveRect,
      gridItemRectList: this.#gridMapping.getGridItemRectList()
    });
    childRectRect.x += this.gridRect.x;
    childRectRect.y += this.gridRect.y;
    return childRectRect;
  }

  convertChildPxValueToPercentSizeInfo(params: {
    gridArea: GridArea;
    pxValue: number;
    compareType: 'width' | 'height';
  }): UISize {
    const childGridRect = this.getChildGridRect(params.gridArea);
    let value = 0;
    if (params.compareType === 'width') {
      value = (params.pxValue / childGridRect.width) * 100;
    } else if (params.compareType === 'height') {
      value = (params.pxValue / childGridRect.height) * 100;
    }
    return {
      value: parseFloat(value.toFixed(2)),
      unit: SizeUnit.Percent
    };
  }

  convertChildPercentValueToNumberSizeInfo(params: {
    gridArea: GridArea;
    percentValue: number;
    compareType: 'width' | 'height';
  }): UISize {
    const childGridRect = this.getChildGridRect(params.gridArea);
    let value = 0;
    if (params.compareType === 'width') {
      value = (params.percentValue * childGridRect.width) / 100;
    } else if (params.compareType === 'height') {
      value = (params.percentValue * childGridRect.height) / 100;
    }
    return {
      value: parseFloat(value.toFixed(1)),
      unit: SizeUnit.PX
    };
  }

  getGridLineInfos(needBorder = false): {
    canDrag: boolean;
    direction: 'top' | 'bottom' | 'left' | 'right';
    position: {
      fromRow: number;
      toRow: number;
      fromColumn: number;
      toColumn: number;
    };
    line: LineInfo;
  }[] {
    return GridLineUtils.getGridLineInfos(this.#gridMapping).map(info => {
      if (!needBorder) {
        info.line.fromY -= this.#gridMapping.borderInfo.top;
        info.line.fromX -= this.#gridMapping.borderInfo.left;
        info.line.toY -= this.#gridMapping.borderInfo.top;
        info.line.toX -= this.#gridMapping.borderInfo.left;
      }
      return info;
    });
  }

  getGridGapRectAndSlashLinesList(
    lineSpace: number,
    needBorder = false
  ): {
    rect: RectInfo;
    slashLines: LineInfo[];
  }[] {
    return GridLineUtils.getGridGapRectAndSlashLinesList({
      gridItemRectList: this.#gridMapping.getGridItemRectList(),
      lineSpace
    }).map(info => {
      if (!needBorder) {
        info.rect.x -= this.#gridMapping.borderInfo.left;
        info.rect.y -= this.#gridMapping.borderInfo.top;
        info.slashLines = this.getNoCountBorderLine(info.slashLines);
      }
      return info;
    });
  }

  getGridPaddingRectAndSlashLinesList(
    lineSpace: number,
    needBorder = false
  ): {
    rect: RectInfo;
    slashLines: LineInfo[];
  }[] {
    return GridLineUtils.getGridPaddingRectAndSlashLinesList({
      gridPadding: this.#gridMapping.paddingInfo,
      border: this.#gridMapping.borderInfo,
      gridSize: this.#gridMapping.gridRect,
      lineSpace
    }).map(info => {
      if (!needBorder) {
        info.rect.x -= this.#gridMapping.borderInfo.left;
        info.rect.y -= this.#gridMapping.borderInfo.top;
        info.slashLines = this.getNoCountBorderLine(info.slashLines);
      }
      return info;
    });
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

  getAlignAndAssistLineInfo(maxActiveLength: number = 4): {
    assistLines: LineInfo[];
    assistSigns: SignInfo[];
    alignLines: LineInfo[];
    offset: AlignOffsetInfo;
  } {
    const moveChild = this.#gridMapping.childInfoList.find(
      child => child.id === this.#movingLayerId
    );
    if (!moveChild) {
      ErrorUtils.InteractError('Moving layer is not find');
      return {
        assistLines: [],
        alignLines: [],
        assistSigns: [],
        offset: AlignDefaultOffset
      };
    }
    const childRect = this.#gridMapping.getGridChildRect(moveChild);
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
      gridActiveRect: this.#gridMapping.gridActiveRect
    });
    movingRect.x += alignLineInfo.offset.x;
    movingRect.y += alignLineInfo.offset.y;
    const assistLineInfo = GridAssistLineUtils.getAssistLinesAndSigns(
      movingRect,
      this.#gridMapping,
      {
        top: moveChild.margin.top.unit === SizeUnit.Percent ? SizeUnit.Percent : SizeUnit.PX,
        bottom: moveChild.margin.bottom.unit === SizeUnit.Percent ? SizeUnit.Percent : SizeUnit.PX,
        left: moveChild.margin.left.unit === SizeUnit.Percent ? SizeUnit.Percent : SizeUnit.PX,
        right: moveChild.margin.right.unit === SizeUnit.Percent ? SizeUnit.Percent : SizeUnit.PX
      }
    );
    return GridLineUtils.convertAlignAndAssistLineInfo({
      alignLineInfo,
      assistLineInfo,
      gridMapping: this.#gridMapping
    });
  }

  private prepareAlignLine(isNeedMiddle = true): void {
    if (!this.#movingLayerId) return;
    this.resetAlignLine();
    const layerLinesInfo = GridAlignLineUtils.prepareAlignLine({
      isNeedMiddle,
      gridMapping: this.#gridMapping,
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

  private getNoCountBorderLine(lines: LineInfo[]): LineInfo[] {
    return lines.map(line => {
      line.fromY -= this.#gridMapping.borderInfo.top;
      line.fromX -= this.#gridMapping.borderInfo.left;
      line.toY -= this.#gridMapping.borderInfo.top;
      line.toX -= this.#gridMapping.borderInfo.left;
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
      gridMapping: this.#gridMapping
    });
    const alignLineInfo = GridAlignLineUtils.getAlignLineByMoveRect({
      rect: droppedRect,
      middleList: layerLinesInfo.layerMiddleList,
      centerList: layerLinesInfo.layerCenterList,
      xList: layerLinesInfo.layerXList,
      yList: layerLinesInfo.layerYList,
      offset: maxActiveLength,
      gridActiveRect: this.#gridMapping.gridActiveRect
    });
    const assistLineInfo = GridAssistLineUtils.getAssistLinesAndSigns(
      {
        x: droppedRect.x + alignLineInfo.offset.x,
        y: droppedRect.y + alignLineInfo.offset.y,
        width: droppedRect.width,
        height: droppedRect.height
      },
      this.#gridMapping
    );
    return GridLineUtils.convertAlignAndAssistLineInfo({
      alignLineInfo,
      assistLineInfo,
      gridMapping: this.#gridMapping
    });
  }
}
