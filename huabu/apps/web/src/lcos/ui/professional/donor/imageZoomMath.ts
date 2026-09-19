/** Math lifted from GEN1 ImageZoomStage. This is Reader media-local view math, never Canvas geometry. */
export interface ImagePoint { readonly x: number; readonly y: number }
export function zoomImageAtPoint(
  scale: number, pan: ImagePoint, point: ImagePoint, factor: number, minimum: number, maximum: number,
): { readonly scale: number; readonly pan: ImagePoint } {
  const nextScale = Math.min(maximum, Math.max(minimum, scale * factor));
  const worldX = (point.x - pan.x) / scale;
  const worldY = (point.y - pan.y) / scale;
  return { scale: nextScale, pan: { x: point.x - worldX * nextScale, y: point.y - worldY * nextScale } };
}
export function fitImageInStage(cw: number, ch: number, nw: number, nh: number): {
  readonly scale: number; readonly pan: ImagePoint;
} | undefined {
  if (![cw, ch, nw, nh].every(value => Number.isFinite(value) && value > 0)) return undefined;
  const fit = Math.min(cw / nw, ch / nh, 1);
  return { scale: fit, pan: { x: (cw - nw * fit) / 2, y: (ch - nh * fit) / 2 } };
}
