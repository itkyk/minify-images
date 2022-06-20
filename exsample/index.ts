const ImageMin = require("../bin/minify").default;

const options = {
  inputPath: "./exsample/images",
  outputPath: "./exsample/output",
  encodeOptions: {},
};

new ImageMin(options);
