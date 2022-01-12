export function xmur3(str) {
  for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

export const randomChoice = (arr) => {
  const k = Math.round(Math.random() * (arr.length - 1));
  return arr[k];
};

export function color(red, green, blue) {
  let rgb = red;
  rgb = (rgb << 8) + green;
  rgb = (rgb << 8) + blue;
  return rgb;
}
