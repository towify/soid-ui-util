/**
 *  @Author KaySaith
 *  @Date 10/31/20
 */

type Rgba = {
  red: number;
  green: number;
  blue: number;
  alpha: number;
};

type PaddingInfo = {
  left: { value: number; unit: string };
  top: { value: number; unit: string };
  right: { value: number; unit: string };
  bottom: { value: number; unit: string };
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
  marginLeft: { value: number; unit: string };
  marginTop: { value: number; unit: string };
  marginRight: { value: number; unit: string };
  marginBottom: { value: number; unit: string };
  width: { value: number; unit: string };
  height: { value: number; unit: string };
  rect?: RectInfo;
};

type RectInfo = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export { Rgba, PaddingInfo, RectInfo, GridAreaInfo, GridChildInfo };
