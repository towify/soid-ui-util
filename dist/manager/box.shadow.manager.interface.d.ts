/**
 *  @Author KaySaith
 *  @Date 10/29/20
 */
export interface BoxShadowManagerInterface {
    /**
     * @param position
     * 旋转按钮控制点在 Rect 内区域的移动 Position
     */
    spinButtonPosition: {
        x: number;
        y: number;
    };
    /**
     * @param rect
     * 设置旋钮的旋转区域
     */
    setSpinButtonRect(rect: DOMRect): BoxShadowManagerInterface;
    /**
     * @param hold
     * 获取旋转按钮在当前 Position 下的对应的 ShadowAngle 角度
     */
    getShadowAngle(hold: (angle: number) => void): BoxShadowManagerInterface;
}
