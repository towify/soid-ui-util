/**
 *  @Author KaySaith
 *  @Date 10/31/20
 */
import {GridArea, SizeUnit, SpacingMargin, UISize} from 'towify-editor-common-values';

type Rgba = {
  red: number;
  green: number;
  blue: number;
  alpha: number;
};

type SizeInfo = {
  [key: string]: UISize;
  width: UISize;
  minWidth: UISize;
  maxWidth: UISize;
  height: UISize;
  minHeight: UISize;
  maxHeight: UISize;
};

type PlaceSelfInfo = {
  // 水平
  justifySelf: string;
  // 垂直
  alignSelf: string
};

type GridChildInfo = {
  id: string;
  gridArea: GridArea;
  margin: SpacingMargin;
  placeSelf: PlaceSelfInfo;
  size: SizeInfo;
  rect?: RectInfo;
  parentRect?: RectInfo;
};

type RectInfo = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type RegionInfo = {
  from: number;
  to: number;
};

type LineInfo = {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
};

type PaddingInfo = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export {
  Rgba,
  RectInfo,
  GridChildInfo,
  SizeInfo,
  PlaceSelfInfo,
  RegionInfo,
  LineInfo,
  PaddingInfo
};

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

export const DefaultSizeInfo = {
  width: { value: 0, unit: SizeUnit.PX },
  minWidth: { value: 0, unit: SizeUnit.PX },
  maxWidth: { value: 0, unit: SizeUnit.PX },
  height: { value: 0, unit: SizeUnit.PX },
  minHeight: { value: 0, unit: SizeUnit.PX },
  maxHeight: { value: 0, unit: SizeUnit.PX }
};

