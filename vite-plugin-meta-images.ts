import type { Plugin } from "vite";
import fs from "fs";
import path from "path";

/**
 * Vite plugin that updates og:image and twitter:image meta tags
 * to point to the app's OpenGraph image using APP_ORIGIN.
 */
export function metaImagesPlugin(): Plugin {
  return {
    name: "vite-plugin-meta-images",
    transformIndexHtml(html) {
      const appOrigin = process.env.APP_ORIGIN;
      if (!appOrigin) {
        log("[meta-images] APP_ORIGIN not set, skipping meta tag updates");
        return html;
      }

      const publicDir = path.resolve(process.cwd(), "client", "public");
      const opengraphPngPath = path.join(publicDir, "opengraph.png");
      const opengraphJpgPath = path.join(publicDir, "opengraph.jpg");
      const opengraphJpegPath = path.join(publicDir, "opengraph.jpeg");

      let imageExt: string | null = null;
      if (fs.existsSync(opengraphPngPath)) {
        imageExt = "png";
      } else if (fs.existsSync(opengraphJpgPath)) {
        imageExt = "jpg";
      } else if (fs.existsSync(opengraphJpegPath)) {
        imageExt = "jpeg";
      }

      if (!imageExt) {
        log("[meta-images] OpenGraph image not found, skipping meta tag updates");
        return html;
      }

      const imageUrl = `${appOrigin}/opengraph.${imageExt}`;

      log("[meta-images] updating meta image tags to:", imageUrl);

      html = html.replace(
        /<meta\s+property="og:image"\s+content="[^"]*"\s*\/>/g,
        `<meta property="og:image" content="${imageUrl}" />`,
      );

      html = html.replace(
        /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/>/g,
        `<meta name="twitter:image" content="${imageUrl}" />`,
      );

      return html;
    },
  };
}

function log(...args: any[]): void {
  if (process.env.NODE_ENV === "production") {
    console.log(...args);
  }
}
