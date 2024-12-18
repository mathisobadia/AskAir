import { pdfToPng } from "pdf-to-png-converter";

import { uploadFileAndGetUrl } from "./aws";
import canvas from "canvas";

export async function pdfToScreenshots(pdfBlob: Blob): Promise<string[]> {
  //@ts-expect-error this is a weird import we have to do to make pdfjs-dist work
  await import("pdfjs-dist/build/pdf.worker.min.mjs");
  canvas.createCanvas(100, 100);
  const pdfBuffer = await pdfBlob.arrayBuffer().then(Buffer.from);
  try {
    const pages = await pdfToPng(pdfBuffer, {
      // The function accepts PDF file path or a Buffer
      disableFontFace: true, // When `false`, fonts will be rendered using a built-in font renderer that constructs the glyphs with primitive path commands. Default value is true.
      useSystemFonts: false, // When `true`, fonts that aren't embedded in the PDF document will fallback to a system font. Default value is false.
      enableXfa: false, // Render Xfa forms if any. Default value is false.
      // Convert only the first 10 pages to keep the cost low
      pagesToProcess: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // Subset of pages to convert (first page = 1), other pages will be skipped if specified.
      strictPagesToProcess: false, // When `true`, will throw an error if specified page number in pagesToProcess is invalid, otherwise will skip invalid page. Default value is false.
      viewportScale: 2.0, // The desired scale of PNG viewport. Default value is 1.0.
    });

    // Save each image to S3
    const random = Math.random().toString(36).substring(2);
    const savedImages = await Promise.all(
      pages.map(async (page: any, index: number) => {
        const buffer = page.content;
        // Generate a unique key for each image
        const key = `pdf-images/${random}-page-${index + 1}.png`;

        // Upload to S3 and get URL
        const imageUrl = await uploadFileAndGetUrl({ buffer, key });

        return imageUrl;
      })
    );

    // Return the array of S3 URLs instead of base64 images
    return savedImages.filter(Boolean);
  } catch (error) {
    console.error("Error converting PDF to base64 images:", error);
    throw error;
  }
}
