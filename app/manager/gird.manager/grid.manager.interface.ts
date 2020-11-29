/*
 * @author allen
 * @data 2020/11/12 15:42
 */
import { OffSetInfo } from '../../type/common.type';

export interface GridManagerInterface {
  /**
   * @param width Window width
   * @param height Window height
   * 设置窗口 高宽
   */
  setWindowSize(width: number, height: number): GridManagerInterface;

  /**
   * @param width Window width
   * @param height Window height
   * 设置 grid size
   */
  setGridSize(width: number, height: number): GridManagerInterface;

  /**
   * @param info:  grid row info， eg: [{ value: 20, uint: 'px'}, { value: 10, uint: 'vw'}]
   * 设置 grid row info
   */
  setGridRowInfo(info: { value: number; unit: string }[]): GridManagerInterface;

  /**
   * @param info:  grid column info eg: [{ value: 20, uint: 'px'}, { value: 10, uint: 'vw'}]
   * 设置 grid column info
   */
  setGridColumnInfo(
    info: { value: number; unit: string }[]
  ): GridManagerInterface;

  /**
   * @param params: grid row count
   * 设置 grid row \ column count
   */
  setGridCount(params: {
    row: number;
    column: number;
    rowGap?: { value: number; unit: string };
    columnGap?: { value: number; unit: string };
  }): GridManagerInterface;

  /**
   * @param info grid padding info， eg: { left: '20px', top: '10%', right: '10vw', bottom: '20vh' };
   * 设置 grid padding
   */
  setGridPaddingInfo(info: OffSetInfo): GridManagerInterface;

  /**
   * @param row: grid row gap
   * @param column: grid column gap
   * 设置 grid row \ column gap
   */
  setGridGap(
    row: { value: number; unit: string },
    column: { value: number; unit: string }
  ): GridManagerInterface;
}
