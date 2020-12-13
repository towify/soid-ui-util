/*
 * @author allen
 * @data 2020/12/9 14:36
 */
import { Mark, SizeUnit } from 'towify-editor-common-values';
import { MoverServiceInterface } from './mover.service.interface';
import {
  DefaultGrid,
  DefaultGridGap,
  DefaultSpacingPadding,
  LayerInfo,
  RangeInfo,
  SignInfo
} from '../../type/interact.type';
import { LineInfo, RectInfo } from '../../type/common.type';
import { RectModel } from '../../model/rect.model';
import { GridManager } from '../../manager/gird.manager/grid.manager';
import { ErrorUtils } from '../../utils/error.utils/error.utils';
import { GridUtils } from '../../utils/grid.utils/grid.utils';
import { NumberUtils } from '../../utils/number.utils/number.utils';

export class MoverService implements MoverServiceInterface {
  #ranges: RangeInfo[] = [];

  #movingLayerId = '';

  #movingOffsetX = 0;

  #movingOffsetY = 0;

  #gap = 22;

  #gridManager?: GridManager;

  private static instance?: MoverServiceInterface;

  static getInstance(): MoverServiceInterface {
    MoverService.instance ??= new MoverService();
    return MoverService.instance;
  }

  get gridManager(): GridManager {
    this.#gridManager ??= new GridManager();
    return this.#gridManager;
  }

  injectStructuredLayers(info: LayerInfo[]): MoverServiceInterface {
    this.#ranges = [];
    const firstLayerInfo = info.filter(layer => !layer.parentId);
    this.initRangeModelByLayers({
      childrenLayInfos: firstLayerInfo,
      totalLayerInfos: info,
      ancestorIds: [],
      addRanges: this.#ranges
    });
    return this;
  }

  startMovingLayerById(id: string): MoverServiceInterface {
    this.#movingLayerId = id;
    this.#movingOffsetX = 0;
    this.#movingOffsetY = 0;
    return this;
  }

  movingLayer(offset: { x: number; y: number }): MoverServiceInterface {
    this.#movingOffsetX = offset.x;
    this.#movingOffsetY = offset.y;
    return this;
  }

  stopMovingLayer(): MoverServiceInterface {
    this.#movingLayerId = '';
    this.#movingOffsetX = 0;
    this.#movingOffsetY = 0;
    return this;
  }

  getAssistLinesAndSigns(): {
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
    const movingRange = this.#ranges.find(
      item => item.id === this.#movingLayerId
    );
    if (!movingRange) {
      ErrorUtils.InteractError('Moving layer is not find');
      return {
        lines: [],
        signs: []
      };
    }
    const movingRect = movingRange.rect.adjustRect(
      this.#movingOffsetX,
      this.#movingOffsetY
    );
    const activeRange = this.getActiveRangeByRect(
      movingRect,
      this.#movingLayerId
    );
    if (!activeRange) {
      return this.getAssistLinesAndSignsByActivePoint(movingRect, {
        left: 0,
        top: 0,
        right: Mark.Unset,
        bottom: Mark.Unset
      });
    }
    if (!activeRange.grid) {
      return this.getAssistLinesAndSignsByActivePoint(movingRect, {
        left: activeRange.rect.x,
        top: activeRange.rect.y,
        right: activeRange.rect.x + activeRange.rect.width,
        bottom: activeRange.rect.y + activeRange.rect.height
      });
    }
    const activeChildrenInfo = this.#ranges
      .reduce<RangeInfo[]>((previous, current) => {
        if (current.parentId === activeRange.id && current.gridArea) {
          return previous.concat(current);
        }
        return previous;
      }, [])
      .map(range => {
        return {
          id: range.id,
          gridArea: range.gridArea!,
          margin: range.margin,
          size: range.size
        };
      });
    const gridItemRectList = this.gridManager
      .setGridSize(activeRange.rect.width, activeRange.rect.height)
      .setGridColumnInfo(activeRange.grid.column)
      .setGridRowInfo(activeRange.grid.row)
      .setGap(activeRange.gap)
      .setPadding(activeRange.padding)
      .setBorder(activeRange.border)
      .setChildrenInfo(activeChildrenInfo)
      .getGridItemRectList();
    let activeGridItemRect: RectInfo | undefined;
    gridItemRectList.forEach(rowList => {
      rowList.forEach(rect => {
        if (
          rect.x + activeRange.rect.x < movingRect.x &&
          rect.y + activeRange.rect.y < movingRect.y
        ) {
          activeGridItemRect = rect;
        }
      });
    });
    if (activeGridItemRect) {
      return this.getAssistLinesAndSignsByActivePoint(movingRect, {
        left: activeGridItemRect.x + activeRange.rect.x,
        top: activeGridItemRect.y + activeRange.rect.y,
        right:
          activeGridItemRect.x + activeGridItemRect.width + activeRange.rect.x,
        bottom:
          activeGridItemRect.y + activeGridItemRect.height + activeRange.rect.y
      });
    }
    return this.getAssistLinesAndSignsByActivePoint(movingRect, {
      left: activeRange.rect.x,
      top: activeRange.rect.y,
      right: activeRange.rect.x + activeRange.rect.width,
      bottom: activeRange.rect.y + activeRange.rect.height
    });
  }

  private getAssistLinesAndSignsByActivePoint(
    rect: RectModel,
    activeBorder: {
      left: number;
      top: number;
      right: number;
      bottom: number;
    }
  ): {
    lines: LineInfo[];
    signs: SignInfo[];
  } {
    const lines: LineInfo[] = [];
    const signs: SignInfo[] = [];
    if (activeBorder.left !== Mark.Unset) {
      const offLeft = NumberUtils.parseViewNumber(rect.x - activeBorder.left);
      if (offLeft >= 0) {
        lines.push({
          fromX: rect.x,
          toX: activeBorder.left,
          fromY: rect.y + rect.height / 2,
          toY: rect.y + rect.height / 2
        });
        signs.push({
          x: activeBorder.left + offLeft / 2,
          y: rect.y + rect.height / 2 - this.#gap,
          sign: offLeft + SizeUnit.PX
        });
      }
    }
    if (activeBorder.right !== Mark.Unset) {
      const offRight = NumberUtils.parseViewNumber(
        activeBorder.right - (rect.x + rect.width)
      );
      if (offRight >= 0) {
        lines.push({
          fromX: rect.x + rect.width,
          toX: activeBorder.right,
          fromY: rect.y + rect.height / 2,
          toY: rect.y + rect.height / 2
        });
        signs.push({
          x: activeBorder.right - offRight / 2,
          y: rect.y + rect.height / 2 - this.#gap,
          sign: offRight + SizeUnit.PX
        });
      }
    }
    if (activeBorder.top !== Mark.Unset) {
      const offTop = NumberUtils.parseViewNumber(rect.y - activeBorder.top);
      if (offTop >= 0) {
        lines.push({
          fromX: rect.x + rect.width / 2,
          toX: rect.x + rect.width / 2,
          fromY: rect.y,
          toY: activeBorder.top
        });
        signs.push({
          x: rect.x + rect.width / 2 + 35,
          y: activeBorder.top + offTop / 2 + 5,
          sign: offTop + SizeUnit.PX
        });
      }
    }
    if (activeBorder.bottom !== Mark.Unset) {
      const offBottom = NumberUtils.parseViewNumber(
        activeBorder.bottom - (rect.y + rect.height)
      );
      if (offBottom >= 0) {
        lines.push({
          fromX: rect.x + rect.width / 2,
          toX: rect.x + rect.width / 2,
          fromY: rect.y + rect.height,
          toY: activeBorder.bottom
        });
        signs.push({
          x: rect.x + rect.width / 2 + 35,
          y: activeBorder.bottom - offBottom / 2 + 5,
          sign: offBottom + SizeUnit.PX
        });
      }
    }
    return {
      lines,
      signs
    };
  }

  private initRangeModelByLayers(params: {
    childrenLayInfos: LayerInfo[];
    totalLayerInfos: LayerInfo[];
    ancestorIds: string[];
    addRanges: RangeInfo[];
    parentRange?: RangeInfo;
  }) {
    const sortLayInfos = params.childrenLayInfos.sort((a, b) => {
      return a.order - b.order;
    });
    let newChildrenLayerInfos;
    let childRect: RectModel;
    let gridItemRectList: RectInfo[][] | undefined;
    if (params.parentRange) {
      const parentRange = params.parentRange;
      const activeChildrenInfo = sortLayInfos.map(range => {
        return {
          id: range.id,
          gridArea: range.gridArea,
          margin: range.margin,
          size: range.size
        };
      });
      gridItemRectList = this.gridManager
        .setGridSize(parentRange.rect.width, parentRange.rect.height)
        .setGridColumnInfo(parentRange.grid.column)
        .setGridRowInfo(parentRange.grid.row)
        .setGap(parentRange.gap)
        .setPadding(parentRange.padding)
        .setBorder(parentRange.border)
        .setChildrenInfo(activeChildrenInfo)
        .getGridItemRectList();
    }
    sortLayInfos.forEach(layer => {
      newChildrenLayerInfos = params.totalLayerInfos.filter(
        item => item.parentId === layer.id
      );
      if (params.parentRange && gridItemRectList) {
        const gridAreaItemRect = this.gridManager.convertChildSizeInfoToNumber({
          gridArea: layer.gridArea,
          gridItemRectList
        });
        childRect = new RectModel(
          params.parentRange.rect.x +
            gridAreaItemRect.x +
            GridUtils.convertSizeInfoToNumber({
              sizeInfo: layer.margin.left,
              maxValue: gridAreaItemRect.width
            }),
          params.parentRange.rect.y +
            gridAreaItemRect.y +
            GridUtils.convertSizeInfoToNumber({
              sizeInfo: layer.margin.top,
              maxValue: gridAreaItemRect.height
            }),
          GridUtils.convertSizeInfoToNumber({
            sizeInfo: layer.size.width,
            maxValue: gridAreaItemRect.width
          }),
          GridUtils.convertSizeInfoToNumber({
            sizeInfo: layer.size.height,
            maxValue: gridAreaItemRect.height
          })
        );
      } else {
        childRect = new RectModel(
          GridUtils.convertSizeInfoToNumber({
            sizeInfo: layer.margin.left
          }),
          GridUtils.convertSizeInfoToNumber({
            sizeInfo: layer.margin.top
          }),
          GridUtils.convertSizeInfoToNumber({
            sizeInfo: layer.size.width
          }),
          GridUtils.convertSizeInfoToNumber({
            sizeInfo: layer.size.height
          })
        );
      }
      const rangeInfo: RangeInfo = {
        id: layer.id,
        parentId: layer.parentId,
        childIds: newChildrenLayerInfos.map(item => item.id),
        ancestorIds: params.ancestorIds,
        order: layer.order,
        rect: childRect,
        gridArea: layer.gridArea,
        size: layer.size,
        margin: layer.margin,
        grid: layer.grid ?? DefaultGrid,
        gap: layer.gap ?? DefaultGridGap,
        padding: layer.padding ?? DefaultSpacingPadding,
        border: layer.border ?? DefaultSpacingPadding
      };
      params.addRanges.push(rangeInfo);
      this.initRangeModelByLayers({
        childrenLayInfos: newChildrenLayerInfos,
        totalLayerInfos: params.totalLayerInfos,
        ancestorIds: params.ancestorIds.concat(layer.id),
        addRanges: params.addRanges,
        parentRange: rangeInfo
      });
    });
  }

  private getActiveRangeByRect(
    activeRect: RectModel,
    activeId: string
  ): RangeInfo | undefined {
    const rangLength = this.#ranges.length;
    let item: RangeInfo;
    for (let index = rangLength - 1; index >= 0; index -= 1) {
      item = this.#ranges[index];
      if (
        item &&
        item.rect &&
        item.rect.containerRect(activeRect) &&
        item.id !== activeId
      ) {
        return item;
      }
    }
    return undefined;
  }
}
