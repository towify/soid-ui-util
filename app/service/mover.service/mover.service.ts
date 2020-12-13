/*
 * @author allen
 * @data 2020/12/9 14:36
 */
import {
  CustomGrid,
  GridGap,
  Mark,
  SizeUnit,
  SpacingPadding
} from 'towify-editor-common-values';
import { MoverServiceInterface } from './mover.service.interface';
import {
  AlignDefaultOffset,
  AlignOffsetInfo,
  SignInfo
} from '../../type/interact.type';
import { GridChildInfo, LineInfo, RectInfo } from '../../type/common.type';
import { GridManager } from '../../manager/gird.manager/grid.manager';
import { ErrorUtils } from '../../utils/error.utils/error.utils';
import { NumberUtils } from '../../utils/number.utils/number.utils';
import { WindowUtils } from '../../utils/window.utils/window.utils';

export class MoverService implements MoverServiceInterface {
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

  setWindowSize(width: number, height: number): MoverServiceInterface {
    WindowUtils.WindowSize = {
      width,
      height
    };
    return this;
  }

  setGridSize(width: number, height: number): MoverServiceInterface {
    this.gridManager.setGridSize(width, height);
    return this;
  }

  setGridInfo(info: CustomGrid): MoverServiceInterface {
    this.gridManager.setGridColumnInfo(info.column);
    this.gridManager.setGridRowInfo(info.row);
    return this;
  }

  setGridCount(params: {
    row: number;
    column: number;
    gap?: GridGap;
  }): MoverServiceInterface {
    this.gridManager.setGridCount(params);
    return this;
  }

  setGridGap(gap: GridGap): MoverServiceInterface {
    this.gridManager.setGap(gap);
    return this;
  }

  setGridPaddingInfo(padding: SpacingPadding): MoverServiceInterface {
    this.gridManager.setPadding(padding);
    return this;
  }

  setGridBorderInfo(border: SpacingPadding): MoverServiceInterface {
    this.gridManager.setBorder(border);
    return this;
  }

  setChildrenGridInfo(childrenInfo: GridChildInfo[]): MoverServiceInterface {
    if (!this.gridManager.gridSize) {
      ErrorUtils.InteractError('GridSize is undefined');
      return this;
    }
    this.gridManager.setChildrenInfo(childrenInfo);
    const gridItemRectList = this.gridManager.getGridItemRectList();
    this.gridManager.childInfoList.forEach(childInfo => {
      this.gridManager.updateChildRect(childInfo, gridItemRectList);
    });
    return this;
  }

  get gridManager(): GridManager {
    this.#gridManager ??= new GridManager();
    return this.#gridManager;
  }

  startMovingChildById(id: string): MoverServiceInterface {
    this.#movingLayerId = id;
    this.#movingOffsetX = 0;
    this.#movingOffsetY = 0;
    return this;
  }

  movingChild(offset: { x: number; y: number }): MoverServiceInterface {
    this.#movingOffsetX = offset.x;
    this.#movingOffsetY = offset.y;
    return this;
  }

  stopMovingChild(): MoverServiceInterface {
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
    const moveChild = this.gridManager.childInfoList.find(child => {
      return child.id === this.#movingLayerId;
    });
    if (!moveChild || !moveChild.rect) {
      ErrorUtils.InteractError('Moving layer is not find');
      return {
        lines: [],
        signs: []
      };
    }
    const movingRect = {
      x: moveChild.rect.x + this.#movingOffsetX,
      y: moveChild.rect.y + this.#movingOffsetY,
      width: moveChild.rect.width,
      height: moveChild.rect.height
    };
    const gridItemRectList = this.gridManager.getGridItemRectList();
    let activeGridItemRect: RectInfo | undefined;
    gridItemRectList.forEach(rowList => {
      rowList.forEach(rect => {
        if (rect.x < movingRect.x && rect.y < movingRect.y) {
          activeGridItemRect = rect;
        }
      });
    });
    if (activeGridItemRect) {
      return this.getAssistLinesAndSignsByActivePoint(movingRect, {
        left: activeGridItemRect.x,
        top: activeGridItemRect.y,
        right: activeGridItemRect.x + activeGridItemRect.width,
        bottom: activeGridItemRect.y + activeGridItemRect.height
      });
    }
    return this.getAssistLinesAndSignsByActivePoint(movingRect, {
      left: 0,
      top: 0,
      right: Mark.Unset,
      bottom: Mark.Unset
    });
  }

  getAlignLinesAndOffset(): {
    lines: LineInfo[];
    offset: AlignOffsetInfo;
  } {
    return {
      lines: [],
      offset: AlignDefaultOffset
    };
  }

  private getAssistLinesAndSignsByActivePoint(
    rect: RectInfo,
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
}
