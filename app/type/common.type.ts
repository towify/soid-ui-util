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
  left: { value: number, unit: string };
  top: { value: number, unit: string };
  right: { value: number, unit: string };
  bottom: { value: number, unit: string };
};

export { Rgba, PaddingInfo };
