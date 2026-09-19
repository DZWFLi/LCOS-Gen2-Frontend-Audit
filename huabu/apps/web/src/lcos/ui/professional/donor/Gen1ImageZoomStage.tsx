// GEN1 artifactViewerRegistry.tsx ImageZoomStage. Read-only local media view, NOT Canvas camera.
// Original wheel/pointer/zoom/centering logic retained; adaptation details in donor adoption ledger.
/* eslint-disable jsx-a11y/no-static-element-interactions -- composite image stage owns pointer and keyboard gestures. */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- the composite image stage exposes keyboard zoom/reset focus. */
import { useCallback, useEffect, useRef, useState } from 'react';

import { fitImageInStage, zoomImageAtPoint } from './imageZoomMath';
import { LcosButton } from '../../primitives/LcosButton';
import './gen1-reader.css';

const ZOOM_MIN = 0.2
const ZOOM_MAX = 8

/** 图片预览自由缩放：滚轮以鼠标位置为锚点缩放，拖拽平移，双击/按钮复位。 */
export function Gen1ImageZoomStage({ src, alt }: { src: string; alt: string }) {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const scaleRef = useRef(1)
  const panRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const dragRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null)
  const interactedRef = useRef(false)
  const fitAttemptRef = useRef(0)
  const fitTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const fitMinimumRef = useRef(ZOOM_MIN)
  const [imageError, setImageError] = useState(false)
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)

  const commit = useCallback((nextScale: number, nextPan: { x: number; y: number }) => {
    scaleRef.current = nextScale
    panRef.current = nextPan
    setScale(nextScale)
    setPan(nextPan)
  }, [])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      event.stopPropagation()
      if (imageError) return
      interactedRef.current = true
      const rect = stage.getBoundingClientRect()
      const px = event.clientX - rect.left
      const py = event.clientY - rect.top
      const factor = event.deltaY < 0 ? 1.15 : 1 / 1.15
      const next = zoomImageAtPoint(scaleRef.current, panRef.current, { x: px, y: py }, factor, fitMinimumRef.current, ZOOM_MAX)
      commit(next.scale, next.pan)
    }
    stage.addEventListener('wheel', onWheel, { passive: false })
    return () => stage.removeEventListener('wheel', onWheel)
  }, [commit, imageError])

  const scheduleFit = useCallback(() => {
    const stage = stageRef.current
    const img = imgRef.current
    if (!stage || !img || interactedRef.current) return
    // 布局未就绪（clientWidth=0）时若直接 fit 会算出 scale(0)，图片不可见；
    // 延迟到尺寸可用再适配，最多重试 5 次。
    if (stage.clientWidth <= 0 || stage.clientHeight <= 0 || img.naturalWidth <= 0 || img.naturalHeight <= 0) {
      if (fitAttemptRef.current >= 5) return
      fitAttemptRef.current += 1
      fitTimerRef.current = setTimeout(scheduleFit, 80)
      return
    }
    fitAttemptRef.current = 0
    const cw = stage.clientWidth
    const ch = stage.clientHeight
    const nw = img.naturalWidth || 1
    const nh = img.naturalHeight || 1
    const fitted = fitImageInStage(cw, ch, nw, nh)
    if (fitted === undefined) return
    fitMinimumRef.current = Math.min(ZOOM_MIN, fitted.scale)
    commit(fitted.scale, fitted.pan)
  }, [commit])

  useEffect(() => {
    setImageError(false)
    interactedRef.current = false
    fitAttemptRef.current = 0
    scheduleFit()
    return () => { if (fitTimerRef.current !== undefined) clearTimeout(fitTimerRef.current) }
  }, [src, scheduleFit])
  useEffect(() => {
    if (stageRef.current === null || typeof ResizeObserver !== 'function') return
    const observer = new ResizeObserver(scheduleFit)
    observer.observe(stageRef.current)
    return () => observer.disconnect()
  }, [scheduleFit])
  const handleImgLoad = useCallback(() => scheduleFit(), [scheduleFit])

  const zoomBy = useCallback((factor: number) => {
    interactedRef.current = true
    const stage = stageRef.current
    if (!stage) return
    const rect = stage.getBoundingClientRect()
    const px = rect.width / 2
    const py = rect.height / 2
    const next = zoomImageAtPoint(scaleRef.current, panRef.current, { x: px, y: py }, factor, fitMinimumRef.current, ZOOM_MAX)
    commit(next.scale, next.pan)
  }, [commit])

  const reset = useCallback(() => {
    interactedRef.current = true
    const stage = stageRef.current
    const img = imgRef.current
    if (!stage || !img) { commit(1, { x: 0, y: 0 }); return }
    const nw = img.naturalWidth || 1
    const nh = img.naturalHeight || 1
    commit(1, { x: (stage.clientWidth - nw) / 2, y: (stage.clientHeight - nh) / 2 })
  }, [commit])

  return (
    <div
      ref={stageRef}
      className={`lcos-image-zoom-stage ${dragging ? 'is-dragging' : ''}`}
      data-donor-image-zoom
      tabIndex={0}
      aria-label={`${alt}，图片预览；加减键缩放，0 复位`}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget || imageError) return
        if (event.key === '+' || event.key === '=') { event.preventDefault(); event.stopPropagation(); zoomBy(1.25) }
        else if (event.key === '-') { event.preventDefault(); event.stopPropagation(); zoomBy(1 / 1.25) }
        else if (event.key === '0') { event.preventDefault(); event.stopPropagation(); reset() }
      }}
      onPointerDown={(event) => {
        if (event.button !== 0 || imageError) return
        event.stopPropagation()
        interactedRef.current = true
        dragRef.current = { startX: event.clientX, startY: event.clientY, baseX: panRef.current.x, baseY: panRef.current.y }
        setDragging(true)
        event.currentTarget.setPointerCapture(event.pointerId)
      }}
      onPointerMove={(event) => {
        const drag = dragRef.current
        if (!drag) return
        commit(scaleRef.current, { x: drag.baseX + event.clientX - drag.startX, y: drag.baseY + event.clientY - drag.startY })
      }}
      onPointerUp={(event) => {
        dragRef.current = null
        setDragging(false)
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
      }}
      onPointerCancel={() => { dragRef.current = null; setDragging(false) }}
      onLostPointerCapture={() => { dragRef.current = null; setDragging(false) }}
      onDoubleClick={(event) => { event.stopPropagation(); reset() }}
      title="滚轮缩放 · 拖拽平移 · 双击复位"
    >
      <div className="lcos-image-zoom-pan" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` }}>
        <img ref={imgRef} src={src} alt={alt} draggable={false} onLoad={handleImgLoad} onError={() => setImageError(true)} onDragStart={(event) => event.preventDefault()} />
      </div>
      {imageError && <span role="status" className="lcos-image-zoom-error">图像无法显示；材料身份仍保留。</span>}
      <div className="lcos-image-zoom-toolbar" onPointerDown={(event) => event.stopPropagation()} onDoubleClick={(event) => event.stopPropagation()}>
        <LcosButton disabled={imageError} type="button" aria-label="缩小" onClick={() => zoomBy(1 / 1.25)}>−</LcosButton>
        <span>{Math.round(scale * 100)}%</span>
        <LcosButton disabled={imageError} type="button" aria-label="放大" onClick={() => zoomBy(1.25)}>＋</LcosButton>
        <LcosButton disabled={imageError} type="button" className="reset" onClick={reset}>复位</LcosButton>
      </div>
    </div>
  )
}
