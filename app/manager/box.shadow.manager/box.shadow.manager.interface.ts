/**
 *  @Author Zhangqi
 *  @Date 10/29/20
 */

export interface BoxShadowManagerInterface {
  /**
   * @param position
   * 旋转按钮控制点在 Rect 内区域的移动 Position
   */
  spinButtonPosition: { x: number; y: number };

  /**
   * 设置阴影的实际偏移距离值
   */
  distance: number;

  /**
   * @param rect
   * 设置旋钮的旋转区域
   */
  setSpinButtonRect(rect: DOMRect): BoxShadowManagerInterface;

  /**
   * @param rect
   * 设置旋钮的自身大小
   */
  setSpinPointRect(rect: DOMRect): BoxShadowManagerInterface;

  /**
   * @Author
   * 修正的偏移量
   */
  offsetFix: number;

  /**
   * @param hold
   * 获取旋转按钮在当前 Position 下的对应的 ShadowAngle 角度
   */
  getShadowAngle(
    hold: (result: {
      angle: number;
      horizontalOffset: number;
      verticalOffset: number;
    }) => void
  ): BoxShadowManagerInterface;

  /**
   * @param shadowOffset 阴影水平偏移
   * 根据阴影的偏移获取角度和鼠标位置信息
   */
  getAngleAndPositionByHorizontalAndVerticalAndDistance(shadowOffset: {
    horizontal: number;
    vertical: number;
    distance: number;
  }): {
    angle: number;
    positionX: number;
    positionY: number;
  };

  /**
   * @param angle 角度
   * @param distance 偏移量，表示阴影的偏移程度
   * 获取当前阴影的水平和垂直偏移，以及鼠标坐标信息
   */
  getHorizontalAndVerticalAndPositionByAngle(
    angle: number,
    distance: number
  ): {
    horizontal: number;
    vertical: number;
    positionX: number;
    positionY: number;
  };
}
