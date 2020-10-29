/**
 *  @Author KaySaith
 *  @Date 10/29/20
 */
import { BoxShadowManagerInterface } from "./box.shadow.manager.interface";
export declare class BoxShadowManager implements BoxShadowManagerInterface {
    #private;
    set spinButtonPosition(position: {
        x: number;
        y: number;
    });
    getShadowAngle(hold: (angle: number) => void): BoxShadowManager;
    setSpinButtonRect(rect: DOMRect): BoxShadowManager;
}
