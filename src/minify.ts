//@ts-ignore
import { ImagePool } from "@squoosh/lib";
import { cpus } from "os";
import { optimize } from "svgo";
import path from "path";
import fs from "fs-extra";
import glob from "glob";
import DeepMerge from "deepmerge";
import { isPlainObject } from "is-plain-object";
import { PickType, color, customTable } from "./utils";
import {
  defaultMozJpegOpts,
  defaultOxipngOpts,
  defaultQuantOpts,
  defaultSVGOOpts,
  encodeOptionsTypes,
} from "./defaultOptions";
import { statSync } from "fs";

export interface ImageMinOptionInterface {
  inputPath: string;
  outputPath: string;
  encodeOptions?: {
    mozjpeg?: Record<string, any>;
    oxipng?: Record<string, any>;
    quant?: Record<string, any>;
    svgo?: Array<string>;
  };
}

let imagePoolList: Array<{ name: string; image: any }>;

class ImageMin {
  private readonly mozjpegOpts: Record<string, any>;
  private readonly oxipngOpts: Record<string, any>;
  private readonly quantOpts: Record<string, any>;
  private readonly inputPath: string;
  private readonly outputPath: string;
  private readonly imagePool: typeof ImagePool;
  private readonly svgoOpts: Array<any>;
  constructor(options: ImageMinOptionInterface) {
    this.mozjpegOpts = this.mergeObject(
      options.encodeOptions?.mozjpeg || {},
      defaultMozJpegOpts || {}
    );
    this.oxipngOpts = this.mergeObject(
      options.encodeOptions?.oxipng || {},
      defaultOxipngOpts || {}
    );
    this.quantOpts = this.mergeObject(
      options.encodeOptions?.quant || {},
      defaultQuantOpts || {}
    );
    this.svgoOpts = options.encodeOptions?.svgo || defaultSVGOOpts;
    this.inputPath = path.resolve(options.inputPath);
    this.outputPath = path.resolve(options.outputPath);
    this.imagePool = new ImagePool(cpus().length);
    this.encodeJPG_and_PNG().then();
    this.encodeSvg();
  }

  private encodeJPG_and_PNG = async () => {
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

  private encodeSvg = () => {
    const svgFiles = glob.sync(`${this.inputPath}/**/*.svg`);
    for (const file of svgFiles) {
      this.minifySvg(file);
    }
  };

  private attachmentQuant = async () => {
    await Promise.all(
      imagePoolList.map(async (item) => {
        const { image } = item;
        if (/\.(png)$/i.test(item.name)) {
          await image.decode;
          return await image.preprocess({
            quant: this.quantOpts,
          });
        }
      })
    ).catch(() => {
      console.log("error1");
    });
  };

  private minifyImage = async () => {
    await Promise.all(
      imagePoolList.map(async (item) => {
        const { image } = item;
        if (/\.(jpe?g)$/i.test(item.name)) {
          await image.encode({
            mozjpeg: this.mozjpegOpts,
          });
        }
        if (/\.(png)$/i.test(item.name)) {
          await image.encode({
            oxipng: this.oxipngOpts,
          });
        }
      })
    ).catch(() => {
      console.log("error2");
    });
  };

  private outputImages = async () => {
    for (const item of imagePoolList) {
      const {
        name,
        image: { encodedWith },
      } = item;

      // ??????????????????????????????????????????
      let data;

      // JPG??????MozJPEG?????????????????????????????????
      if (encodedWith.mozjpeg) {
        data = await encodedWith.mozjpeg;
      }
      // PNG??????OxiPNG?????????????????????????????????
      if (encodedWith.oxipng) {
        data = await encodedWith.oxipng;
      }
      // ???????????????????????????
      const outputPath = name.replace(this.inputPath, this.outputPath);
      this.diggerDirectory(outputPath);
      const inputSize = fs.statSync(item.name).size;
      const outputSize = data.size;
      if (inputSize > outputSize) {
        await fs.writeFile(`${outputPath}`, data.binary);
        customTable({
          Encoded: outputPath,
          minify: `${100 - (outputSize / inputSize) * 100}%`,
        });
      } else {
        await fs.copySync(item.name, outputPath);
        customTable({
          Encoded: outputPath,
          minify: `0%`,
        });
      }
    }
  };

  private minifySvg = (svgPath: string) => {
    const svgString = fs.readFileSync(svgPath);
    const svgResult = optimize(svgString, {
      path: svgPath,
      multipass: true,
      plugins: this.svgoOpts,
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
        minify: `${100 - (outputSize / inputSize) * 100}%`,
      });
    }
  };

  private diggerDirectory = (pathName: string) => {
    const ex = path.extname(pathName);
    const fileDir = pathName.split("/").filter((val) => {
      if (val !== "" && !val.includes(ex)) return val;
    });
    let outPutDir = "/";
    for (const innerDir of fileDir) {
      outPutDir = path.join(outPutDir, innerDir);
      if (!fs.existsSync(outPutDir)) {
        fs.mkdirSync(outPutDir);
      }
    }
  };

  private mergeObject = (base: Record<any, any>, add: Record<any, any>) => {
    return DeepMerge(base, add, {
      isMergeableObject: isPlainObject,
    });
  };
}

export default ImageMin;
