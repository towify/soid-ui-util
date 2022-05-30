/*
 * @Author: allen
 * @Date: 2022/5/30
 */

import { Performance } from 'soid-data';
import { AnimationEnum, AnimationGroupType, DslAnimationType } from '@towify-types/dsl';
import { easingFunction } from '../../type/animation.function';
import { AnimationUtils } from '../../utils/animation.utils/animation.utils';
import { AnimationKeyFrameTransform, AnimationKeyFrames } from '../../type/animation.type';

export class AnimationManager {
  readonly #duration: number;
  readonly #delayDuration: number;
  readonly #times: number;
  #hasDelay = false;
  #executedTimes = 0;
  #observeAnimationKeyFrameTransform?: (keyFrame?: AnimationKeyFrameTransform) => void;

  constructor(
    private readonly animation: DslAnimationType,
    private readonly isBothFill: boolean,
    private readonly isReverseFill: boolean
  ) {
    this.#duration = this.animation.duration * 1000;
    this.#delayDuration = this.animation.delay * 1000;
    // 如果 animation 的 times 设定为 0 的话那么意味着是无限次执行 infinity
    const timeValue = this.animation.times.value ? this.animation.times.value : Number.MAX_VALUE;
    this.#times =
      this.animation.times.type === AnimationEnum.Execution.Custom
        ? this.animation.times.value ?? 1
        : timeValue;
  }

  public observeAnimationKeyFrameTransform(hold: (keyFrame?: AnimationKeyFrameTransform) => void) {
    this.#observeAnimationKeyFrameTransform = hold;
  }

  public execute(callback: () => void) {
    const run = () => {
      this.#executedTimes += 1;
      if (this.#executedTimes > this.#times) {
        return;
      }
      const callBack = () => {
        if (this.#executedTimes === this.#times) {
          callback();
        }
        return run();
      };
      this.run(() => {
        callBack();
      });
    };
    return run();
  }

  private async run(callback?: () => void) {
    let stop = false;
    let isExecutingReverse = false;
    let start: number | undefined;
    let animationFrame: number;
    let percent: number;
    let easingPercent: number;
    let transform: AnimationKeyFrameTransform | undefined;
    let animationKeyFrames: AnimationKeyFrames | undefined;
    const duration = this.#duration / (this.isReverseFill ? 2 : 1);
    const draw = (now: number) => {
      if (now - start! >= duration) {
        stop = true;
        percent = 1;
      } else {
        percent = (now - start!) / duration;
      }
      if (this.animation.type === 'group') {
        easingPercent = easingFunction[(this.animation.content as AnimationGroupType).function](
          isExecutingReverse ? 1 - percent : percent
        );
        animationKeyFrames = AnimationUtils.getAnimationGroupKeyframes(this.animation);
        if (animationKeyFrames) {
          transform = AnimationUtils.getAnimationKeyFrameTransform(
            animationKeyFrames,
            easingPercent
          );
        } else {
          transform = undefined;
        }
        this.#observeAnimationKeyFrameTransform &&
          this.#observeAnimationKeyFrameTransform(transform);
      } else if (Array.isArray(this.animation.content)) {
        this.animation.content.forEach(item => {
          easingPercent = easingFunction[item.effect](isExecutingReverse ? 1 - percent : percent);
          animationKeyFrames = AnimationUtils.getAnimationContentKeyFrames(item);
          if (animationKeyFrames) {
            transform = AnimationUtils.getAnimationKeyFrameTransform(
              animationKeyFrames,
              easingPercent
            );
          } else {
            transform = undefined;
          }
          this.#observeAnimationKeyFrameTransform &&
            this.#observeAnimationKeyFrameTransform(transform);
        });
      }
      if (stop) {
        if (isExecutingReverse || this.isBothFill) {
          window.cancelAnimationFrame(animationFrame);
          callback && callback();
        } else {
          stop = false;
          isExecutingReverse = true;
          animationFrame = window.requestAnimationFrame(time => {
            start = time;
            draw(time);
          });
        }
      } else {
        animationFrame = window.requestAnimationFrame(draw);
      }
    };
    if (!this.#hasDelay && this.#delayDuration > 0) {
      await Performance.delay(this.#delayDuration);
      this.#hasDelay = true;
    }
    const startAnimation = (timeStamp: number) => {
      start = timeStamp;
      draw(timeStamp);
    };
    startAnimation(window.performance.now());
  }
}
