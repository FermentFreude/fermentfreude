'use client'

import React, { useEffect, useRef } from 'react'

/* ═══════════════════════════════════════════════════════════════
 *  Animated organic blob — adapted from
 *  codepen.io/shubniggurath/pen/EmMzpp
 *
 *  Renders a self-contained <canvas> that fills its parent.
 *  Responds to pointer hover / movement.
 * ═══════════════════════════════════════════════════════════════ */

interface BlobCanvasProps {
  /** Fill colour of the blob, e.g. "#E6BE68" */
  color?: string
  /** Number of control points (more = smoother) */
  numPoints?: number
  /** Base radius in px */
  radius?: number
  className?: string
}

/* ── Point on the blob boundary ──────────────────────────────── */
class BlobPoint {
  azimuth: number
  _components: { x: number; y: number }
  _acceleration = 0
  _speed = 0
  _radialEffect = 0
  _elasticity = 0.001
  _friction = 0.0085
  parentRef: { center: { x: number; y: number }; radius: number }

  constructor(azimuth: number, parentRef: { center: { x: number; y: number }; radius: number }) {
    this.parentRef = parentRef
    this.azimuth = Math.PI - azimuth
    this._components = {
      x: Math.cos(this.azimuth),
      y: Math.sin(this.azimuth),
    }
    this.acceleration = -0.03 + Math.random() * 0.06
  }

  solveWith(left: BlobPoint, right: BlobPoint) {
    this.acceleration =
      (-0.3 * this._radialEffect +
        (left._radialEffect - this._radialEffect) +
        (right._radialEffect - this._radialEffect)) *
        this._elasticity -
      this._speed * this._friction
  }

  set acceleration(v: number) {
    this._acceleration = v
    this.speed += this._acceleration * 2
  }
  get acceleration() {
    return this._acceleration
  }

  set speed(v: number) {
    this._speed = v
    this._radialEffect += this._speed * 2
  }
  get speed() {
    return this._speed
  }

  get radialEffect() {
    return this._radialEffect
  }

  get position() {
    return {
      x:
        this.parentRef.center.x + this._components.x * (this.parentRef.radius + this._radialEffect),
      y:
        this.parentRef.center.y + this._components.y * (this.parentRef.radius + this._radialEffect),
    }
  }
}

export const BlobCanvas: React.FC<BlobCanvasProps> = ({
  color = '#000000',
  numPoints = 32,
  radius = 90,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const blobRef = useRef<{
    points: BlobPoint[]
    center: { x: number; y: number }
    radius: number
    color: string
    mousePos: { x: number; y: number } | null
  }>({
    points: [],
    center: { x: 0, y: 0 },
    radius,
    color,
    mousePos: null,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const blob = blobRef.current
    blob.color = color
    blob.radius = radius

    /* ── Resize canvas to fill parent ─────────────────────── */
    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      if (!rect) return
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      blob.center = { x: rect.width / 2, y: rect.height / 2 }
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement!)
    resize()

    /* ── Create blob points ───────────────────────────────── */
    const divisional = (Math.PI * 2) / numPoints
    blob.points = []
    for (let i = 0; i < numPoints; i++) {
      blob.points.push(new BlobPoint(divisional * (i + 1), blob))
    }

    /* ── Pointer interaction ──────────────────────────────── */
    let oldMouse = { x: 0, y: 0 }
    let hover = false

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      const diff = { x: mx - blob.center.x, y: my - blob.center.y }
      const dist = Math.sqrt(diff.x * diff.x + diff.y * diff.y)

      blob.mousePos = { x: blob.center.x - mx, y: blob.center.y - my }

      let angle: number | null = null
      if (dist < blob.radius && !hover) {
        angle = Math.atan2(diff.y, diff.x)
        hover = true
      } else if (dist > blob.radius && hover) {
        angle = Math.atan2(diff.y, diff.x)
        hover = false
      }

      if (angle !== null) {
        let nearestPoint: BlobPoint | null = null
        let best = 100
        for (const pt of blob.points) {
          const d = Math.abs(angle - pt.azimuth)
          if (d < best) {
            nearestPoint = pt
            best = d
          }
        }
        if (nearestPoint) {
          const sx = oldMouse.x - mx
          const sy = oldMouse.y - my
          let strength = Math.sqrt(sx * sx + sy * sy) * 8
          if (strength > 60) strength = 60
          nearestPoint.acceleration = (strength / 100) * (hover ? -1.2 : 1.2)
        }
      }
      oldMouse = { x: mx, y: my }
    }

    canvas.addEventListener('pointermove', onPointerMove)

    /* ── Animation loop ───────────────────────────────────── */
    const pts = blob.points
    const n = pts.length

    const draw = () => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      if (!rect) {
        rafRef.current = requestAnimationFrame(draw)
        return
      }
      const w = rect.width
      const h = rect.height

      ctx.clearRect(0, 0, w, h)

      pts[0].solveWith(pts[n - 1], pts[1])

      const p0 = pts[n - 1].position
      let p1 = pts[0].position
      const _p2 = { ...p1 }

      ctx.beginPath()
      ctx.moveTo((p0.x + p1.x) / 2, (p0.y + p1.y) / 2)

      for (let i = 1; i < n; i++) {
        pts[i].solveWith(pts[i - 1], pts[(i + 1) % n])
        const p2 = pts[i].position
        const xc = (p1.x + p2.x) / 2
        const yc = (p1.y + p2.y) / 2
        ctx.quadraticCurveTo(p1.x, p1.y, xc, yc)
        p1 = p2
      }

      const xc = (p1.x + _p2.x) / 2
      const yc = (p1.y + _p2.y) / 2
      ctx.quadraticCurveTo(p1.x, p1.y, xc, yc)

      ctx.fillStyle = blob.color
      ctx.fill()

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      canvas.removeEventListener('pointermove', onPointerMove)
      ro.disconnect()
    }
  }, [color, numPoints, radius])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ touchAction: 'none', display: 'block' }}
    />
  )
}
