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
declare class ImageMin {
    private readonly mozjpegOpts;
    private readonly oxipngOpts;
    private readonly quantOpts;
    private readonly inputPath;
    private readonly outputPath;
    private readonly imagePool;
    private readonly svgoOpts;
    constructor(options: ImageMinOptionInterface);
    private encodeJPG_and_PNG;
    private encodeSvg;
    private attachmentQuant;
    private minifyImage;
    private outputImages;
    private minifySvg;
    private diggerDirectory;
    private mergeObject;
}
export default ImageMin;
