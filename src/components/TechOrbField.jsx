import { useEffect, useRef } from 'react'

function createRandom(seed) {
  let value = seed

  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296
    return value / 4294967296
  }
}

function drawPolygon(context, radius, sides) {
  context.beginPath()

  for (let i = 0; i < sides; i += 1) {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius

    if (i === 0) {
      context.moveTo(x, y)
    } else {
      context.lineTo(x, y)
    }
  }

  context.closePath()
  context.fill()
}

export default function TechOrbField({ className = 'tech-orb-field', shape = 'circle' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const hero = canvas?.parentElement

    if (!canvas || !hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined
    }

    const context = canvas.getContext('2d')
    const random = createRandom(20260622)
    const pointer = { x: -9999, y: -9999, active: false }
    const clickImpulse = { x: 0, y: 0, strength: 0 }
    let width = 0
    let height = 0
    let frameId = 0
    let balls = []

    const cubePalette = ['#8ad8f7', '#5fc4ea', '#2f9ac8', '#1f6f99', '#124a6d', '#0a2f4d']
    const bluePalette = ['#d4f3ff', '#9de5ff', '#63c9f2', '#2fa9da', '#167fb2', '#0b527c']
    const hexBluePalette = ['#c9f6ff', '#82ddf4', '#42b8df', '#1f8ebd', '#146796', '#0c3f66']
    const defaultPalette = ['#f0b64a', '#238ca3', '#8f11a8', '#ffffff', '#c94f3d']
    const isSmallCircle = shape === 'small-circle'
    const isCircle = shape === 'circle'
    const palette = shape === 'cube' || isSmallCircle
      ? cubePalette
      : shape === 'hexagon'
        ? hexBluePalette
        : isCircle
          ? bluePalette
          : defaultPalette

    const buildBalls = () => {
      const nextBalls = []
      const spacing = isSmallCircle ? 145 : shape === 'hexagon' ? 150 : 135
      const minColumns = isSmallCircle ? 5 : shape === 'hexagon' ? 5 : 6
      const minRows = isSmallCircle ? 4 : shape === 'hexagon' ? 4 : 4
      const columns = Math.max(minColumns, Math.floor(width / spacing))
      const rows = Math.max(minRows, Math.floor(height / spacing))
      const cellWidth = width / columns
      const cellHeight = height / rows

      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < columns; x += 1) {
          const radius = isSmallCircle ? 5 + random() * 10 : isCircle ? 5 + random() * 14 : 9 + random() * 22
          const homeX = x * cellWidth + cellWidth * (0.22 + random() * 0.62)
          const homeY = y * cellHeight + cellHeight * (0.2 + random() * 0.64)

          nextBalls.push({
            x: homeX,
            y: homeY,
            homeX,
            homeY,
            vx: 0,
            vy: 0,
            radius,
            color: palette[Math.floor(random() * palette.length)],
            alpha: isSmallCircle ? 0.12 + random() * 0.18 : 0.16 + random() * 0.24,
            mass: radius * 0.45,
          })
        }
      }

      balls = nextBalls
    }

    const resize = () => {
      const rect = hero.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      width = Math.max(1, rect.width)
      height = Math.max(1, rect.height)
      canvas.width = Math.floor(width * ratio)
      canvas.height = Math.floor(height * ratio)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      buildBalls()
    }

    const updatePointer = (event) => {
      const rect = hero.getBoundingClientRect()
      pointer.x = event.clientX - rect.left
      pointer.y = event.clientY - rect.top
      pointer.active = true
    }

    const clearPointer = () => {
      pointer.active = false
      pointer.x = -9999
      pointer.y = -9999
    }

    const pushFromClick = (event) => {
      updatePointer(event)
      clickImpulse.x = pointer.x
      clickImpulse.y = pointer.y
      clickImpulse.strength = 1
    }

    const animate = () => {
      context.clearRect(0, 0, width, height)

      const gradient = context.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, 'rgba(8, 22, 30, 0.88)')
      gradient.addColorStop(0.58, 'rgba(16, 73, 84, 0.62)')
      gradient.addColorStop(1, 'rgba(35, 140, 163, 0.4)')
      context.fillStyle = gradient
      context.fillRect(0, 0, width, height)

      balls.forEach((ball) => {
        const homeDx = ball.homeX - ball.x
        const homeDy = ball.homeY - ball.y
        ball.vx += homeDx * 0.006
        ball.vy += homeDy * 0.006

        const pointerDx = ball.x - pointer.x
        const pointerDy = ball.y - pointer.y
        const pointerDistance = Math.hypot(pointerDx, pointerDy)

        if (pointer.active && pointerDistance < 180) {
          const force = (1 - pointerDistance / 180) * 3.8
          ball.vx += (pointerDx / Math.max(pointerDistance, 1)) * force
          ball.vy += (pointerDy / Math.max(pointerDistance, 1)) * force
        }

        if (clickImpulse.strength > 0.01) {
          const clickDx = ball.x - clickImpulse.x
          const clickDy = ball.y - clickImpulse.y
          const clickDistance = Math.hypot(clickDx, clickDy)

          if (clickDistance < 340) {
            const force = (1 - clickDistance / 340) * 12 * clickImpulse.strength
            ball.vx += (clickDx / Math.max(clickDistance, 1)) * force
            ball.vy += (clickDy / Math.max(clickDistance, 1)) * force
          }
        }

        ball.vx *= 0.9
        ball.vy *= 0.9
        ball.x += ball.vx / Math.max(ball.mass, 1)
        ball.y += ball.vy / Math.max(ball.mass, 1)
      })

      for (let i = 0; i < balls.length; i += 1) {
        for (let j = i + 1; j < balls.length; j += 1) {
          const a = balls[i]
          const b = balls[j]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const distance = Math.hypot(dx, dy)
          const minDistance = a.radius + b.radius + 2

          if (distance > 0 && distance < minDistance) {
            const overlap = (minDistance - distance) * 0.18
            const nx = dx / distance
            const ny = dy / distance
            a.vx -= nx * overlap
            a.vy -= ny * overlap
            b.vx += nx * overlap
            b.vy += ny * overlap
          }
        }
      }

      balls.forEach((ball) => {
        const speed = Math.min(Math.hypot(ball.vx, ball.vy) * 0.08, 0.24)
        const glow = ball.alpha + speed
        const size = ball.radius * 2
        const glowSize = ball.radius * 4.8

        context.fillStyle = ball.color

        if (shape === 'cube') {
          context.save()
          context.translate(ball.x, ball.y)
          context.rotate((ball.vx + ball.vy) * 0.012)
          context.globalAlpha = glow
          context.fillRect(-size / 2, -size / 2, size, size)
          context.globalAlpha = glow * 0.22
          context.fillRect(-glowSize / 2, -glowSize / 2, glowSize, glowSize)
          context.restore()
        } else if (shape === 'hexagon') {
          context.save()
          context.translate(ball.x, ball.y)
          context.rotate((ball.vx + ball.vy) * 0.008)
          context.globalAlpha = glow
          drawPolygon(context, ball.radius, 6)
          context.globalAlpha = glow * 0.22
          drawPolygon(context, ball.radius * 2.4, 6)
          context.restore()
        } else {
          context.beginPath()
          context.globalAlpha = glow
          context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
          context.fill()

          context.beginPath()
          context.globalAlpha = glow * 0.22
          context.arc(ball.x, ball.y, ball.radius * 2.6, 0, Math.PI * 2)
          context.fill()
        }
      })

      context.globalAlpha = 1
      clickImpulse.strength *= 0.92
      frameId = window.requestAnimationFrame(animate)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(hero)
    resize()
    animate()

    hero.addEventListener('pointermove', updatePointer)
    hero.addEventListener('pointerleave', clearPointer)
    hero.addEventListener('pointerdown', pushFromClick)

    return () => {
      window.cancelAnimationFrame(frameId)
      observer.disconnect()
      hero.removeEventListener('pointermove', updatePointer)
      hero.removeEventListener('pointerleave', clearPointer)
      hero.removeEventListener('pointerdown', pushFromClick)
    }
  }, [shape])

  return <canvas className={className} ref={canvasRef} aria-hidden="true" />
}
