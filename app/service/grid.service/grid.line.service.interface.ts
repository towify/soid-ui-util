/*
 * @author allen
 * @data 2020/11/23 22:17
 */
import { OffSetInfo, RectInfo } from '../../type/common.type';

export interface GridLineServiceInterface {
  /**
   * @param width Window width
   * @param height Window height
   * 设置窗口 高宽
   */
  setWindowSize(width: number, height: number): GridLineServiceInterface;

  /**
   * @param width Window width
   * @param height Window height
   * 设置 grid size
   */
  setGridSize(width: number, height: number): GridLineServiceInterface;

  /**
   * @param info:  grid row info， eg: [{ value: 20, uint: 'px'}, { value: 10, uint: 'vw'}]
   * 设置 grid row info
   */
  setGridRowInfo(
    info: { value: number; unit: string }[]
  ): GridLineServiceInterface;

  /**
   * @param info:  grid column info eg: [{ value: 20, uint: 'px'}, { value: 10, uint: 'vw'}]
   * 设置 grid column info
   */
  setGridColumnInfo(
    info: { value: number; unit: string }[]
  ): GridLineServiceInterface;

  /**
   * @param row: grid row info eg: [{ value: 20, uint: 'px'}, { value: 10, uint: 'vw'}]
   * @param column: grid column info eg: [{ value: 20, uint: 'px'}, { value: 10, uint: 'vw'}]
   * 设置 grid column info
   */
  setGridInfo(
    row: { value: number; unit: string }[],
    column: { value: number; unit: string }[]
  ): GridLineServiceInterface;

  /**
   * @param params: grid row count
   * 设置 grid row \ column count
   */
  setGridCount(params: {
    row: number;
    column: number;
    rowGap?: { value: number; unit: string };
    columnGap?: { value: number; unit: string };
  }): GridLineServiceInterface;

  /**
   * @param info grid padding info， eg: { left: '20px', top: '10%', right: '10vw', bottom: '20vh' };
   * 设置 grid padding
   */
  setGridPaddingInfo(info: OffSetInfo): GridLineServiceInterface;

  /**
   * @param row: grid row gap
   * @param column: grid column gap
   * 设置 grid row \ column gap
   */
  setGridGap(
    row: { value: number; unit: string },
    column: { value: number; unit: string }
  ): GridLineServiceInterface;

  /**
   * @description 返回 grid item line info
   */
  getGridLines(): { fromX: number; fromY: number; toX: number; toY: number }[];

  /**
   * @description 返回 grid gap area and line info
   */
  getGridGapAreaAndLines(
    lineSpace: number
  ): {
    area: RectInfo[];
    lines: { fromX: number; fromY: number; toX: number; toY: number }[];
  };

  /**
   * @description 返回 grid padding area and line info
   */
  getGridPaddingAreaAndLines(
    lineSpace: number
  ): {
    area: RectInfo[];
    lines: { fromX: number; fromY: number; toX: number; toY: number }[];
  };
}
