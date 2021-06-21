/*
 * @author allen
 * @data 2020/12/2 23:07
 */
export class ErrorUtils {
  static GridError(message: string) {
    console.error('SOID-UI-UTIL', 'GridAreaService', message);
  }

  static InteractError(message: string) {
    console.error('SOID-UI-UTIL', 'InteractService', message);
  }
}
