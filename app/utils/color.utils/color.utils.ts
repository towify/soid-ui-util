/*
 * @author allen
 * @data 2021/3/30 15:48
 */

export class ColorUtils {
  static rgbToHex(red: number, green: number, blue: number): string {
    return `#${[red, green, blue]
      .map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? `0${hex}` : hex;
      })
      .join('')}`;
  }

  static hexToRgba(hex: string, opacity: number): string {
    const red = parseInt(`0x${hex.slice(1, 3)}`, 16);
    const green = parseInt(`0x${hex.slice(3, 5)}`, 16);
    const blue = parseInt(`0x${hex.slice(5, 7)}`, 16);
    const alpha = parseFloat((opacity / 100).toFixed(2));
    return `rgba(${red},${green},${blue},${alpha})`;
  }

  static hexToRgbaArray(hex: string, opacity: number): number[] {
    const red = parseInt(`0x${hex.slice(1, 3)}`, 16);
    const green = parseInt(`0x${hex.slice(3, 5)}`, 16);
    const blue = parseInt(`0x${hex.slice(5, 7)}`, 16);
    const alpha = parseFloat((opacity / 100).toFixed(2));
    return [red, green, blue, alpha];
  }
}
