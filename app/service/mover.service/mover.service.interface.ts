/*
 * @author allen
 * @data 2020/12/9 14:36
 */
import {
  CustomGrid,
  GridGap,
  SpacingPadding
} from 'towify-editor-common-values';
import { AlignOffsetInfo, SignInfo } from '../../type/interact.type';
import { GridChildInfo, LineInfo } from '../../type/common.type';

export interface MoverServiceInterface {
  /**
   * @param width Window width
   * @param height Window height
   * 设置窗口 高宽
   */
  setWindowSize(width: number, height: number): MoverServiceInterface;

  /**
   * @param width Window width
   * @param height Window height
   * 设置 parent grid size
   */
  setGridSize(width: number, height: number): MoverServiceInterface;

  /**
   * @param info
   */
  setGridInfo(info: CustomGrid): MoverServiceInterface;

  /**
   * @param params: grid row count
   * 设置 parent grid row \ column count
   */
  setGridCount(params: {
    row: number;
    column: number;
    gap?: GridGap;
  }): MoverServiceInterface;

  /**
   * @param info grid padding info， eg: { left: '20px', top: '10%', right: '10vw', bottom: '20vh' };
   * 设置 parent grid padding
   */
  setGridPaddingInfo(info: SpacingPadding): MoverServiceInterface;

  /**
   * @param info grid border info， eg: { left: '20px', top: '10%', right: '10vw', bottom: '20vh' };
   * 设置 parent grid border
   */
  setGridBorderInfo(info: SpacingPadding): MoverServiceInterface;

  /**
   * @param gap
   */
  setGridGap(gap: GridGap): MoverServiceInterface;

  /**
   * @description 设置 grid children rect
   * @param childrenInfo
   * id: child id
   * gridArea: child grid area, eg: [1,1,2,2]
   * marginLeft: child marginLeft
   * marginTop: child marginTop
   * width: child width
   * height: child height
   */
  setChildrenGridInfo(childrenInfo: GridChildInfo[]): MoverServiceInterface;

  /**
   * @param id: 开始移动 Layer 的id
   */
  startMovingChildById(id: string): MoverServiceInterface;

  /**
   * @param offset: 移动 Layer 的偏移量
   */
  movingChild(offset: { x: number; y: number }): MoverServiceInterface;

  /**
   * @description 结束移动 Layer
   */
  stopMovingChild(): MoverServiceInterface;

  /**
   * @description 获取 assist lines 的信息
   */
  getAssistLinesAndSigns(): {
    lines: LineInfo[];
    signs: SignInfo[];
  };

  getAlignLinesAndOffset(): {
    lines: LineInfo[];
    offset: AlignOffsetInfo;
  };
}
