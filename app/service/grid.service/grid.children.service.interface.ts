/*
 * @author allen
 * @data 2020/11/23 22:15
 */
import { GridAreaInfo, OffSetInfo } from '../../type/common.type';

export interface GridChildrenServiceInterface {
  /**
   * @param width Window width
   * @param height Window height
   * 设置窗口 高宽
   */
  setWindowSize(width: number, height: number): GridChildrenServiceInterface;

  /**
   * @param width Window width
   * @param height Window height
   * 设置 parent grid size
   */
  setParentGridSize(
    width: number,
    height: number
  ): GridChildrenServiceInterface;

  /**
   * @param info:  grid row info， eg: [{ value: 20, uint: 'px'}, { value: 10, uint: 'vw'}]
   * 设置 parent grid row info
   */
  setParentGridRowInfo(
    info: { value: number; unit: string }[]
  ): GridChildrenServiceInterface;

  /**
   * @param info:  grid column info eg: [{ value: 20, uint: 'px'}, { value: 10, uint: 'vw'}]
   * 设置 parent grid column info
   */
  setParentGridColumnInfo(
    info: { value: number; unit: string }[]
  ): GridChildrenServiceInterface;

  /**
   * @param row: grid row info eg: [{ value: 20, uint: 'px'}, { value: 10, uint: 'vw'}]
   * @param column: grid column info eg: [{ value: 20, uint: 'px'}, { value: 10, uint: 'vw'}]
   * 设置 parent grid column info
   */
  setParentGridInfo(
    row: { value: number; unit: string }[],
    column: { value: number; unit: string }[]
  ): GridChildrenServiceInterface;

  /**
   * @param params: grid row count
   * 设置 parent grid row \ column count
   */
  setParentGridCount(params: {
    row: number;
    column: number;
    rowGap?: { value: number; unit: string };
    columnGap?: { value: number; unit: string };
  }): GridChildrenServiceInterface;

  /**
   * @param info grid padding info， eg: { left: '20px', top: '10%', right: '10vw', bottom: '20vh' };
   * 设置 parent grid padding
   */
  setParentGridPaddingInfo(info: OffSetInfo): GridChildrenServiceInterface;

  /**
   * @param info grid border info， eg: { left: '20px', top: '10%', right: '10vw', bottom: '20vh' };
   * 设置 parent grid border
   */
  setParentGridBorderInfo(info: OffSetInfo): GridChildrenServiceInterface;
  /**
   * @param row: grid row gap
   * @param column: grid column gap
   * 设置 parent grid row \ column gap
   */
  setParentGridGap(
    row: { value: number; unit: string },
    column: { value: number; unit: string }
  ): GridChildrenServiceInterface;

  /**
   * @param dropped dropped rect
   * 设置 parent dropped rect
   */
  setDroppedInfo(dropped: {
    x: number;
    y: number;
    width: { value: number; unit: string };
    height: { value: number; unit: string };
    gridArea?: GridAreaInfo;
  }): GridChildrenServiceInterface;

  /**
   * @description 根据 dropped rect 返回 drop 在 grid 中的 info
   * @return
   * gridArea: grid area info, eg: [1, 1, 2, 2]
   * marginLeft: dropped marginLeft
   * marginTop: dropped marginTop
   */
  getDroppedGridInfo(): {
    gridArea: GridAreaInfo;
    marginLeft: number;
    marginTop: number;
    width: { value: number; unit: string };
    height: { value: number; unit: string };
  };

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
  setChildrenGridInfo(
    childrenInfo: {
      id: string;
      gridArea: GridAreaInfo;
      marginLeft: { value: number; unit: string };
      marginTop: { value: number; unit: string };
      width: { value: number; unit: string };
      height: { value: number; unit: string };
    }[]
  ): GridChildrenServiceInterface;

  /**
   * @description 更新 grid rect / row info / column info / padding 后重新校准 children 的 grid info
   */
  adjustChildrenGridInfo(): {
    id: string;
    gridArea: GridAreaInfo;
    marginLeft: { value: number; unit: string };
    marginTop: { value: number; unit: string };
    width: { value: number; unit: string };
    height: { value: number; unit: string };
  }[];
}
