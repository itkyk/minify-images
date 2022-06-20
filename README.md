# @itkyk/minify-images

## install
```bash
$ npm i -D @itkyk/minify-images
```

## CLI
```bash
minify -i ./inputDir/to/path -o outputDir/to/path
```

### Options
| key | description |
|------|----------------|
| -i, --input | The path of the directory containing the images you want to compress. |
| -o, --output | Directory path to export the compressed image |
| -m, --mozjpeg |compression settings for mozjpeg |
| -ox, --oxipng | compression settings for oxipng |
| -q, --quant | compression settings for quant |

## API
```typescript
import Minify, {ImageMinOptionInterface} from "@itkyk/minify-images";

const options: ImageMinOptionInterface = {
  inputPath: "inputDir/to/path",
  outputPath: "outputDir/to/Path",
  encodeOptions: {
    mozjpeg: {},
    oxipng: {},
    quant: {}
  }
}

new Minify(options);
```

### Options
| key | description |
|------|----------------|
| inputPath | The path of the directory containing the images you want to compress. |
| outputPath | Directory path to export the compressed image |
| mozjpeg |compression settings for mozjpeg |
| oxipng | compression settings for oxipng |
| quant | compression settings for quant |


## DefaultOption
### moxjpeg
```typescript
const defaultMozJpegOpts = {
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
  chroma_quality: 75,
};
```

### oxipng
```typescript
export const defaultOxipngOpts = {
  level: 3,
  interlace: false,
};
```

### quant
```typescript
const defaultQuantOpts = {
  enabled: true,
  zx: 0,
  maxNumColors: 256,
  dither: 1,
};
```

### svgo
```typescript
const defaultSVGOOpts = [
  {
    name: "removeAttrs",
    params: {
      attrs: "data-name",
    },
  },
];
```

## Attention
The moxjpeg and oxipng options merge with the default options, but svgo drowns out the default options and overwrites them.

```typescript
const options = {
  encodeOptions: {
    mozjpeg: {}, // The default options apply.
    oxipng: {}, // The default options apply.
    svgo: [] // The default options are overwritten on the empty array.
  }
}
```