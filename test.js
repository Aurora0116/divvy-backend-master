function scaleBetween(unscaledNum, minAllowed, maxAllowed, min, max) {
  return Math.ceil((maxAllowed - minAllowed) * (unscaledNum - min) / (max - min) + minAllowed);
}
function getVal(x) {
    x = Math.log(x)*60+5;
    return scaleBetween(x, 5, 60, 5.5, 1060);
}


console.log(getVal(1.01), getVal(42949672.95), getVal(10000), getVal(25));