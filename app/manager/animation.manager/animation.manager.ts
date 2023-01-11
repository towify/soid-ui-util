/*
 * @Author: allen
 * @Date: 2022/5/30
 */

import { Performance } from 'soid-data';
import { AnimationContentType, AnimationEnum, AnimationGroupType, DslAnimationType } from '@towify-types/dsl';
import { easingFunction } from '../../type/animation.function';
import { AnimationUtils } from '../../utils/animation.utils/animation.utils';
import { AnimationKeyFrames, AnimationKeyFrameTransform } from '../../type/animation.type';
import { SizeUnit } from '@towify/common-values';

export class AnimationManager {
  readonly #duration: number;
  readonly #delayDuration: number;
  readonly #times: number;
  #hasDelay = false;
  #executedTimes = 0;
  #observeAnimationKeyFrameTransform?: (keyFrame?: AnimationKeyFrameTransform) => void;
  #startTime: number | undefined;
  #percent = 0;
  #animationFrame: number | undefined;
  #isPlaying = false;
  #isPause = false;
  #delayTimes = 0;

  #initialRecords: {
    [index in `start${ number }` | `end${ number }`]: { value: number | string, unit?: SizeUnit.PX | SizeUnit.Percent | 'random' }
  } = {};

  constructor(
    private readonly animation: DslAnimationType,
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

  public execute(complete: () => void) {
    this.#refreshValue();
    const run = () => {
      if (!this.#isPause) {
        this.#executedTimes += 1;
      }
      if (this.#executedTimes > this.#times) {
        return;
      }
      const callBack = () => {
        if (this.#executedTimes === this.#times) {
          complete();
          this.#isPlaying = false;
          this.#isPause = false;
          this.#percent = 0;
        }
        return run();
      };
      this.#run(() => {
        this.#refreshValue();
        callBack();
      }).then();
    };
    if (!this.#isPause) {
      this.#executedTimes = 0;
    }
    if (this.#isPlaying) {
      this.stop();
    }
    if (!this.#isPause) {
      this.#hasDelay = false;
    }
    return run();
  }

  public stop() {
    this.#isPlaying = false;
    this.#isPause = false;
    if (this.#animationFrame) {
      window.cancelAnimationFrame(this.#animationFrame);
      this.#animationFrame = undefined;
    }
    this.#percent = 0;
    this.#observeAnimationKeyFrameTransform && this.#observeAnimationKeyFrameTransform(undefined);
    this.#startTime = undefined;
  }

  public pause() {
    if (!this.#isPlaying) return;
    this.#isPause = true;
    this.#isPlaying = false;
    if (this.#animationFrame) {
      window.cancelAnimationFrame(this.#animationFrame);
      this.#animationFrame = undefined;
    }
  }

  async #run(callback?: () => void) {
    let stop = false;
    const duration = this.#duration;
    this.#isPlaying = true;
    const draw = (now: number) => {
      if (now - this.#startTime! >= duration) {
        stop = true;
        this.#percent = 1;
      } else {
        this.#percent = (now - this.#startTime!) / duration;
      }
      this.#runAnimationKeyFrame();
      if (!this.#isPlaying) return;
      if (stop) {
        if (this.#animationFrame) {
          window.cancelAnimationFrame(this.#animationFrame);
          this.#animationFrame = undefined;
        }
        callback && callback();
      } else {
        this.#animationFrame = window.requestAnimationFrame(draw);
      }
    };
    if (!this.#hasDelay && this.#delayDuration > 0) {
      this.#delayTimes += 1;
      await Performance.delay(this.#delayDuration);
      this.#delayTimes -= 1;
      this.#hasDelay = true;
      if (this.#delayTimes > 0 || !this.#isPlaying) {
        return;
      }
    }
    const startAnimation = (timeStamp: number) => {
      if (!this.#isPause) {
        this.#startTime = timeStamp;
      } else {
        this.#startTime = timeStamp - this.#percent * duration;
      }
      this.#isPause = false;
      draw(timeStamp);
    };
    startAnimation(window.performance.now());
  }

  #refreshValue() {
    if (this.animation.type !== 'custom') return;
    (<{ list: AnimationContentType[], effect: AnimationEnum.Effect }>this.animation.content).list.forEach((item, index) => {
      this.#initialRecords[`start${ index }`] ??= item.value.start;
      this.#initialRecords[`end${ index }`] ??= item.value.end;
      item.value.start = AnimationUtils.getValue(this.#initialRecords[`start${ index }`]);
      item.value.end = AnimationUtils.getValue(this.#initialRecords[`end${ index }`]);
    });
  }

  #runAnimationKeyFrame() {
    let easingPercent: number;
    let transform: AnimationKeyFrameTransform | undefined;
    let animationKeyFrames: AnimationKeyFrames | undefined;
    if (this.animation.type === 'group') {
      easingPercent = easingFunction[(<AnimationGroupType>this.animation.content).function](
        this.isReverseFill ? (0.5 - Math.abs(0.5 - this.#percent)) * 2 : this.#percent
      );
      animationKeyFrames = AnimationUtils.getGroupKeyframes(this.animation);
      if (animationKeyFrames) {
        transform = AnimationUtils.getKeyFrameTransform(animationKeyFrames, easingPercent);
      } else {
        transform = undefined;
      }
      this.#observeAnimationKeyFrameTransform && this.#observeAnimationKeyFrameTransform(transform);
    } else if (this.animation.type === 'custom') {
      (<{ list: AnimationContentType[], effect: AnimationEnum.Effect }>this.animation.content).list.forEach(item => {
        easingPercent = easingFunction[this.animation.content.effect](this.isReverseFill ? (0.5 - Math.abs(0.5 - this.#percent)) * 2 : this.#percent);
        animationKeyFrames = AnimationUtils.getContentKeyFrames(item);
        if (animationKeyFrames) {
          transform = AnimationUtils.getKeyFrameTransform(
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
  }
}
