/*
 * @author allen
 * @data 2020/12/6 16:02
 */
import { RectInfo } from '../../type/common.type';

export interface OperatorServiceInterface {
  minDistance: number;

  setParentRect(rect: RectInfo): OperatorServiceInterface;

  setPageContainerRects(rectList: RectInfo[]): OperatorServiceInterface;

  setOperatorSize(width: number, height: number): OperatorServiceInterface;

  getOperatorRect(): RectInfo;
}
