/**
 *  @Author KaySaith
 *  @Date 10/31/20
 */
import { GridArea, SpacingMargin, UISize } from 'towify-editor-common-values';

type Rgba = {
  red: number;
  green: number;
  blue: number;
  alpha: number;
};

type SizeInfo = {
  width: UISize;
  height: UISize;
};

type GridChildInfo = {
  id: string;
  gridArea: GridArea;
  margin: SpacingMargin;
  size: SizeInfo;
  rect?: RectInfo;
};

type RectInfo = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type RangeInfo = {
  from: number;
  to: number
};

export { Rgba, RectInfo, GridChildInfo, SizeInfo, RangeInfo };

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
