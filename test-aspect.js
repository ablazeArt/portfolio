const dims = [
  { width: 1200, height: 630 },
  { width: 2400, height: 1260 },
  { width: 2083, height: 1042 },
  { width: 1920, height: 1280 },
  { width: 1600, height: 915 },
  { width: 1600, height: 890 },
  { width: 1920, height: 1080 },
  { width: 1600, height: 923 },
];

let sum = 0;
for (let d of dims) {
  sum += d.width / d.height;
}
console.log("Average aspect ratio:", sum / dims.length);
console.log("16/9 is:", 16/9);
