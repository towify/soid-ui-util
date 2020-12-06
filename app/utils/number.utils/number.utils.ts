/*
 * @author allen
 * @data 2020/12/4 16:25
 */
export class NumberUtils {
  static parseViewNumber(value: number): number {
    const intValue = Math.floor(value);
    const floatValue = parseFloat(value.toFixed(1));
    let radix = floatValue - intValue;
    if (radix > 0.7) {
      radix = 1;
    } else if (radix > 0.3) {
      radix = 0.5;
    } else {
      radix = 0;
    }
    return intValue + radix;
  }
}
