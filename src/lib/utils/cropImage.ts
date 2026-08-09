export interface CropPixels {
  x: number
  y: number
  width: number
  height: number
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// Cap the crop output so a huge source photo doesnt produce an oversized
// upload; Cloudinary re-optimizes/re caps on top of this at upload time.
const MAX_OUTPUT_DIMENSION = 1920

/** Draw the selected crop region onto a canvas and return it as a File. */
export async function cropImageToFile(imageSrc: string, crop: CropPixels, fileName: string): Promise<File> {
  const img = await loadImage(imageSrc)
  const scale = Math.min(1, MAX_OUTPUT_DIMENSION / Math.max(crop.width, crop.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(crop.width * scale))
  canvas.height = Math.max(1, Math.round(crop.height * scale))
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not supported')
  ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, canvas.width, canvas.height)

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92))
  if (!blob) throw new Error('Failed to crop image')
  return new File([blob], fileName, { type: 'image/jpeg' })
}
