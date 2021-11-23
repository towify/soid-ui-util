/**
 *  @Author KaySaith
 *  @Date 10/31/20
 */
import { IColorManager } from './color.manager.interface';
import { Rgba } from '../../type/common.type';
import { Solver } from './solver.model';
import { Color } from './color.model';

export class ColorManager implements IColorManager {
  readonly #rgba!: Rgba;
  readonly #hex!: string;
  #alpha!: number;

  /**
   * @description 初始化
   * @param hex 十六进制颜色值
   * @param rgba RGBA格式颜色值
   * @param alpha 颜色透明度
   */
  private constructor(params: { hex?: string; rgba?: Rgba; alpha?: number }) {
    if (params.hex) {
      this.#hex = params.hex;
      this.#rgba = this.hexToRgba()!;
      this.#rgba.alpha = params.alpha ?? 1;
      this.#alpha = params.alpha ?? 1;
    } else if (params.rgba) {
      this.#rgba = params.rgba;
      this.#hex = this.rgbToHex(params.rgba);
      this.#alpha = params.rgba.alpha;
    }
  }

  /**
   * @description 获取 RGBA 格式的颜色值
   */
  get rgba(): string {
    const data = Object.values(this.#rgba);
    return `rgba(${data.join(',')})`;
  }

  /**
   * @description 转换颜色值
   */
  get filter(): string {
    const baseColor = new Color(this.#rgba.red, this.#rgba.green, this.#rgba.blue);
    const solver = new Solver(baseColor);
    const result = solver.solve();
    return result.filter;
  }

  /**
   * @description 通过 RGBA 形式的颜色值构建 ColorManager 实例
   */
  static fromRgba(rgba: Rgba) {
    return new ColorManager({ rgba });
  }

  /**
   * @description 通过十六进制形式的颜色值构建 ColorManager 实例
   */
  static fromHex(hex: string, alpha = 1) {
    let colorHex = hex;
    let colorAlpha = alpha;
    if (hex === 'transparent') {
      colorHex = '#FFFFFF';
      colorAlpha = 0;
    }
    return new ColorManager({ hex: colorHex, alpha: colorAlpha });
  }

  private rgbToHex(rgba: Rgba) {
    const colorNumberToHex = (color: number) => {
      const hex = color.toString(16);
      return hex.length === 1 ? `0${hex}` : hex;
    };
    this.#alpha = rgba.alpha;
    return `#${colorNumberToHex(rgba.red)}${colorNumberToHex(rgba.green)}${colorNumberToHex(
      rgba.blue
    )}`;
  }

  private hexToRgba(): Rgba | undefined {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
      this.#hex === 'transparent' ? '#FFFFFF' : this.#hex
    );
    return result
      ? {
          red: parseInt(result[1], 16),
          green: parseInt(result[2], 16),
          blue: parseInt(result[3], 16),
          alpha: this.#alpha
        }
      : undefined;
  }
}
