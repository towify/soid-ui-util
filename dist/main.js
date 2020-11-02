/*
 * @author kaysaith
 * @date 2020/4/4 01:43
 */
import { BoxShadowManager } from './manager/box.shadow.manager/box.shadow.manager.js';
// export * from './util/color.util';
// export * from './manager/box.shadow.manager/box.shadow.manager';
// export * from './manager/box.shadow.manager/box.shadow.manager.interface';
// export * from './manager/color.manager/color.manager.interface';
// export * from './manager/color.manager/color.manager';
// export * from './manager/color.manager/color.model';
// export * from './manager/color.manager/solver.model';
const manager = new BoxShadowManager();
manager.distance = 30;
manager.spinButtonPosition = { x: 10, y: 10 };
manager.setSpinButtonRect(new DOMRect(10, 10, 20, 20));
manager.getShadowAngle((result) => {
    const lable = document.createElement('span');
    lable.textContent = '刚刚应该有个弹框出现';
    document.body.appendChild(lable);
    const log = `回调的结果：角度 ${result.angle}, 水平偏移 ${result.horizontalOffset}, 垂直偏移 ${result.horizontalOffset}`;
    window.alert(log);
});
