// src/minify.ts
import { ImagePool } from "@squoosh/lib";
import { cpus } from "os";
import { optimize } from "svgo";
import * as path from "path";
import * as fs from "fs";
import glob from "glob";
import DeepMerge from "deepmerge";
import { isPlainObject } from "is-plain-object";

// src/utils.ts
var color = class {
};
color.green = (log) => {
  return `\x1B[32m${log}\x1B[0m`;
};
color.blue = (log) => {
  return `\x1B[34m${log}\x1B[0m`;
};
color.red = (log) => {
  return `\x1B[31m${log}\x1B[0m`;
};
var sleep = (delay) => {
  return new Promise((resolve2) => {
    setTimeout(() => {
      resolve2(null);
    }, delay);
  });
};
var customTable = (log) => {
  const topLeft = "\u250C";
  const topRight = "\u2510";
  const bottomLeft = "\u2514";
  const bottomRight = "\u2518";
  const verticalLine = "\u2502";
  const getMaxLength = () => {
    let maxLen = 0;
    Object.keys(log).forEach((key) => {
      const outPutStr = `${key}: ${log[key]}`;
      if (maxLen <= outPutStr.length) {
        maxLen = outPutStr.length;
      }
    });
    return maxLen;
  };
  const injectSpace = (num) => {
    let spaces = "";
    for (let i = 0; i < num; i++) {
      spaces = spaces + " ";
    }
    return spaces;
  };
  const maxLength = getMaxLength() + 2;
  let line = [...Array(maxLength)].map((_, i) => "\u2500");
  console.log(topLeft + line.join("") + topRight);
  Object.keys(log).forEach((key) => {
    console.log(
      verticalLine + color.green(
        " " + key + ": " + log[key] + " " + injectSpace(
          maxLength + 2 - `${verticalLine} ${key}: ${log[key]} ${verticalLine}`.length
        )
      ) + verticalLine
    );
  });
  console.log(bottomLeft + line.join("") + bottomRight);
};

// src/defaultOptions.ts
var defaultMozJpegOpts = {
  quality: 75,
  baseline: false,
  arithmetic: false,
  progressive: true,
  optimize_coding: true,
  smoothing: 0,
  color_space: 3,
  quant_table: 3,
  trellis_multipass: false,
  trellis_opt_zero: false,
  trellis_opt_table: false,
  trellis_loops: 1,
  auto_subsample: true,
  chroma_subsample: 2,
  separate_chroma_quality: false,
  chroma_quality: 75
};
var defaultOxipngOpts = {
  level: 3,
  interlace: false
};
var defaultQuantOpts = {
  enabled: true,
  zx: 0,
  maxNumColors: 256,
  dither: 1
};
var defaultSVGOOpts = [
  {
    name: "removeAttrs",
    params: {
      attrs: "data-name"
    }
  }
];

// src/minify.ts
var imagePoolList;
var ImageMin = class {
  constructor(options) {
    this.encodeJPG_and_PNG = async () => {
      const imageFiles = glob.sync(`${this.inputPath}/**/*.{jpg,jpeg,png}`);
      imagePoolList = imageFiles.map((fileName) => {
        const imageFile = fs.readFileSync(`${fileName}`);
        let image = this.imagePool.ingestImage(imageFile);
        return { name: fileName, image };
      });
      await this.attachmentQuant();
      await this.minifyImage();
      await this.outputImages();
      this.imagePool.close();
    };
    this.encodeSvg = async () => {
      const svgFiles = glob.sync(`${this.inputPath}/**/*.svg`);
      for (const file of svgFiles) {
        await this.minifySvg(file);
      }
    };
    this.attachmentQuant = async () => {
      await Promise.all(
        imagePoolList.map(async (item) => {
          const { image } = item;
          if (/\.(png)$/i.test(item.name)) {
            await image.decode;
            return await image.preprocess({
              quant: this.quantOpts
            });
          }
        })
      ).catch(() => {
        console.log("error1");
      });
    };
    this.minifyImage = async () => {
      await Promise.all(
        imagePoolList.map(async (item) => {
          const { image } = item;
          if (/\.(jpe?g)$/i.test(item.name)) {
            await image.encode({
              mozjpeg: this.mozjpegOpts
            });
          }
          if (/\.(png)$/i.test(item.name)) {
            await image.encode({
              oxipng: this.oxipngOpts
            });
          }
        })
      ).catch(() => {
        console.log("error2");
      });
    };
    this.outputImages = async () => {
      for (const item of imagePoolList) {
        const {
          name,
          image: { encodedWith }
        } = item;
        let data;
        if (encodedWith.mozjpeg) {
          data = await encodedWith.mozjpeg;
        }
        if (encodedWith.oxipng) {
          data = await encodedWith.oxipng;
        }
        const outputPath = name.replace(this.inputPath, this.outputPath);
        this.diggerDirectory(outputPath);
        sleep(1e3).then(async () => {
          if (data) {
            const inputSize = fs.statSync(item.name).size;
            const outputSize = data.size;
            if (inputSize > outputSize) {
              await fs.writeFileSync(`${outputPath}`, data.binary);
              customTable({
                Encoded: outputPath,
                minify: `${100 - outputSize / inputSize * 100}%`
              });
            } else {
              await fs.copyFileSync(item.name, outputPath);
              customTable({
                Encoded: outputPath,
                minify: `0%`
              });
            }
          } else {
            fs.copyFileSync(item.name, outputPath);
            customTable({
              Encoded: outputPath,
              minify: `0%`
            });
          }
        });
      }
    };
    this.minifySvg = async (svgPath) => {
      const svgString = fs.readFileSync(svgPath);
      const svgResult = optimize(svgString, {
        path: svgPath,
        multipass: true,
        plugins: this.svgoOpts
      });
      if ("data" in svgResult) {
        const optimizedSvgString = svgResult.data;
        const outPutInnerDir = svgPath.replace(this.inputPath, this.outputPath);
        this.diggerDirectory(outPutInnerDir);
        fs.writeFileSync(outPutInnerDir, optimizedSvgString);
        const outputSize = fs.statSync(outPutInnerDir).size;
        const inputSize = fs.statSync(svgPath).size;
        customTable({
          Encoded: outPutInnerDir,
          minify: `${100 - outputSize / inputSize * 100}%`
        });
      }
    };
    this.diggerDirectory = (pathName) => {
      const ex = path.extname(pathName);
      const fileDir = pathName.split("/").filter((val) => {
        if (val !== "" && !val.includes(ex))
          return val;
      });
      let outPutDir = "/";
      for (const innerDir of fileDir) {
        outPutDir = path.join(outPutDir, innerDir);
        if (!fs.existsSync(outPutDir)) {
          fs.mkdirSync(outPutDir);
        }
      }
    };
    this.mergeObject = (base, add) => {
      return DeepMerge(base, add, {
        isMergeableObject: isPlainObject
      });
    };
    var _a, _b, _c, _d;
    this.mozjpegOpts = this.mergeObject(
      ((_a = options.encodeOptions) == null ? void 0 : _a.mozjpeg) || {},
      defaultMozJpegOpts || {}
    );
    this.oxipngOpts = this.mergeObject(
      ((_b = options.encodeOptions) == null ? void 0 : _b.oxipng) || {},
      defaultOxipngOpts || {}
    );
    this.quantOpts = this.mergeObject(
      ((_c = options.encodeOptions) == null ? void 0 : _c.quant) || {},
      defaultQuantOpts || {}
    );
    this.svgoOpts = ((_d = options.encodeOptions) == null ? void 0 : _d.svgo) || defaultSVGOOpts;
    this.inputPath = path.resolve(options.inputPath);
    this.outputPath = path.resolve(options.outputPath);
    this.imagePool = new ImagePool(cpus().length);
    this.encodeJPG_and_PNG().then();
    this.encodeSvg().then();
  }
};
var minify_default = ImageMin;
export {
  minify_default as default
};
