/**
 *  @Author KaySaith
 *  @Date 10/31/20
 */
import { UISize } from 'towify-editor-common-values';

type Rgba = {
  red: number;
  green: number;
  blue: number;
  alpha: number;
};

type OffSetInfo = {
  left: UISize;
  top: UISize;
  right: UISize;
  bottom: UISize;
};

type MarginInfo = {
  left: UISize;
  right: UISize;
  top: UISize;
  bottom: UISize;
};

type SizeInfo = {
  width: UISize;
  height: UISize;
};

type GridAreaInfo = {
  rowStart: number;
  columnStart: number;
  rowEnd: number;
  columnEnd: number;
};

type GridChildInfo = {
  id: string;
  gridArea: GridAreaInfo;
  margin: MarginInfo;
  size: SizeInfo;
  rect?: RectInfo;
};

type RectInfo = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export { Rgba, OffSetInfo, RectInfo, GridAreaInfo, GridChildInfo, UISize };

export const DefaultRect = {
  x: 0,
  y: 0,
  width: 0,
  height: 0
};

export const DefaultOffset = {
  left: 0,
  top: 0,
  right: 0,
  bottom: 0
};

export const DefaultGridArea = {
  rowStart: 1,
  columnStart: 1,
  rowEnd: 2,
  columnEnd: 2
};
