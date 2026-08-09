export function cloudinaryTransform(url: string, transformation: string): string {
  const marker = '/upload/'
  const idx = url.indexOf(marker)
  if (!url.includes('res.cloudinary.com') || idx === -1) return url
  const insertAt = idx + marker.length
  return `${url.slice(0, insertAt)}${transformation}/${url.slice(insertAt)}`
}
