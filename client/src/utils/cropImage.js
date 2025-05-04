export default function getCroppedImg(imageSrc, pixelCrop, filters = {}) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imageSrc;

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      // Apply filters
      const {
        brightness = 1,
        contrast = 1,
        saturation = 1,
        blur = 0,
      } = filters;

      ctx.filter = `
        brightness(${brightness})
        contrast(${contrast})
        saturate(${saturation})
        blur(${blur}px)
      `;

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        resolve(new File([blob], "cropped.jpeg", { type: blob.type }));
      }, "image/jpeg");
    };

    image.onerror = (err) => reject(err);
  });
}
