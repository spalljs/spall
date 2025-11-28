import { createInflate, constants } from "node:zlib";

export class CompressionHandler {
  private inflator = createInflate();
  private inflate_chunks: Buffer[] = [];
  private zlib_suffix = new Uint8Array([0x00, 0x00, 0xff, 0xff]);

  constructor(
    private onData: (data: string) => void,
    private onError: (error: Error) => void
  ) {
    this.inflator.on("data", (chunk: Buffer) => {
      this.inflate_chunks.push(chunk);
    });

    this.inflator.on("error", (error) => {
      this.onError(error);
    });
  }

  handleCompressedData = (buffer: Buffer): void => {
    this.inflator.write(buffer);

    if (this.endsWithZlibSuffix(buffer)) {
      this.inflator.flush(constants.Z_SYNC_FLUSH, () => {
        const data = Buffer.concat(this.inflate_chunks).toString();
        this.inflate_chunks = [];
        this.onData(data);
      });
    }
  };

  private endsWithZlibSuffix = (data: Uint8Array): boolean => {
    if (data.length < 4) return false;
    const suffix = data.slice(-4);
    return (
      suffix[0] === this.zlib_suffix[0] &&
      suffix[1] === this.zlib_suffix[1] &&
      suffix[2] === this.zlib_suffix[2] &&
      suffix[3] === this.zlib_suffix[3]
    );
  };
}
