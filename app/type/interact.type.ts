/*
 * @author allen
 * @data 2020/12/9 15:27
 */
type SignInfo = {
  x: number;
  y: number;
  sign: string;
};

type AlignOffsetInfo = {
  x: number;
  y: number;
};

export { SignInfo, AlignOffsetInfo };

const AlignDefaultOffset = {
  x: 0,
  y: 0
};

export { AlignDefaultOffset };
