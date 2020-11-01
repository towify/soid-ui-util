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

  private constructor(params: { hex?: string, rgba?: Rgba, alpha?: number }) {
    if (params.hex) {
      this.#hex = params.hex;
      this.#rgba = this.hexToRgba()!;
      this.#rgba.alpha = params.alpha || 1;
      this.#alpha = params.alpha ?? 1;
    } else if (params.rgba) {
      this.#rgba = params.rgba;
      this.#hex = this.rgbToHex(params.rgba);
      this.#alpha = params.rgba.alpha;
    }
  }

  get rgba(): string {
    const data = Object.values(this.#rgba);
    return `rgba(${data.join(',')})`;
  }

  get filter(): string {
    const baseColor = new Color(this.#rgba.red, this.#rgba.green, this.#rgba.blue);
    const solver = new Solver(baseColor);
    const result = solver.solve();
    return result.filter;
  }

  static fromRgba(rgba: Rgba) {
    return new ColorManager({ rgba });
  }

  static fromHex(hex: string, alpha = 1) {
    return new ColorManager({ hex, alpha });
  }

  private rgbToHex(rgba: Rgba) {
    const colorNumberToHex = (color: number) => {
      const hex = color.toString(16);
      return hex.length === 1 ? `0${hex}` : hex;
    };
    this.#alpha = rgba.alpha;
    return `#${colorNumberToHex(rgba.red)}${colorNumberToHex(rgba.green)}${colorNumberToHex(rgba.blue)}`;
  }

  private hexToRgba(): Rgba | undefined {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(this.#hex);
    return result ? {
      red: parseInt(result[1], 16),
      green: parseInt(result[2], 16),
      blue: parseInt(result[3], 16),
      alpha: this.#alpha
    } : undefined;
  }
}