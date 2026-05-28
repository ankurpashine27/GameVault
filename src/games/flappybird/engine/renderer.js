import {
  CANVAS_W, CANVAS_H, GROUND_H, GROUND_Y,
  PIPE_WIDTH, PIPE_CAP_H, PIPE_CORNER_R,
  BIRD_VISUAL_R,
  BIRD_SKINS, BACKGROUNDS,
} from '../constants.js'
import { degToRad, roundRect, drawStar, seededRandom, clamp } from '../utils.js'

// ─── Background ───────────────────────────────────────────────────────────────
export function drawBackground(ctx, bgId, layers, time, pipeSpeed) {
  const bg = BACKGROUNDS.find(b => b.id === bgId) || BACKGROUNDS[0]

  // Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y)
  if (bgId === 'day') {
    skyGrad.addColorStop(0, '#5BB8F5')
    skyGrad.addColorStop(1, '#ADE8FF')
  } else if (bgId === 'sunset') {
    skyGrad.addColorStop(0, '#c0392b')
    skyGrad.addColorStop(0.5, '#e67e22')
    skyGrad.addColorStop(1, '#f39c12')
  } else if (bgId === 'night') {
    skyGrad.addColorStop(0, '#0d1b2a')
    skyGrad.addColorStop(1, '#1a2d3d')
  } else if (bgId === 'space') {
    skyGrad.addColorStop(0, '#020617')
    skyGrad.addColorStop(1, '#0c0a2e')
  } else if (bgId === 'ocean') {
    skyGrad.addColorStop(0, '#0369a1')
    skyGrad.addColorStop(1, '#0ea5e9')
  } else if (bgId === 'jungle') {
    skyGrad.addColorStop(0, '#14532d')
    skyGrad.addColorStop(1, '#166534')
  } else if (bgId === 'desert') {
    skyGrad.addColorStop(0, '#92400e')
    skyGrad.addColorStop(1, '#d97706')
  } else if (bgId === 'neon') {
    skyGrad.addColorStop(0, '#0f0f23')
    skyGrad.addColorStop(1, '#1a0a2e')
  }
  ctx.fillStyle = skyGrad
  ctx.fillRect(0, 0, CANVAS_W, GROUND_Y)

  // Parallax layers
  drawBgLayer(ctx, bgId, layers, time, pipeSpeed)

  // Ground
  drawGround(ctx, bg, layers, pipeSpeed, time)
}

function drawBgLayer(ctx, bgId, layers, time, pipeSpeed) {
  const { clouds, stars, mountains, buildings } = layers

  if (bgId === 'day' || bgId === 'sunset') {
    drawClouds(ctx, clouds, time, pipeSpeed, bgId === 'sunset' ? 'rgba(255,200,160,0.6)' : 'rgba(255,255,255,0.7)')
    drawMountains(ctx, mountains, time, pipeSpeed, bgId === 'sunset' ? '#c0392b' : '#8ec7e8')
  } else if (bgId === 'night') {
    drawStarsField(ctx, stars)
    drawClouds(ctx, clouds, time, pipeSpeed, 'rgba(180,200,220,0.25)')
  } else if (bgId === 'space') {
    drawStarsField(ctx, stars)
    drawNebula(ctx, time)
  } else if (bgId === 'ocean') {
    drawClouds(ctx, clouds, time, pipeSpeed, 'rgba(255,255,255,0.5)')
    drawWaves(ctx, time)
  } else if (bgId === 'jungle') {
    drawJungleFoliage(ctx, mountains, time, pipeSpeed)
  } else if (bgId === 'desert') {
    drawDunes(ctx, mountains, time, pipeSpeed)
    drawClouds(ctx, clouds, time, pipeSpeed, 'rgba(255,220,180,0.3)')
  } else if (bgId === 'neon') {
    drawBuildings(ctx, buildings, time, pipeSpeed)
    drawNeonGrid(ctx, time)
  }
}

function drawClouds(ctx, clouds, time, pipeSpeed, color) {
  ctx.save()
  ctx.fillStyle = color
  for (const c of clouds) {
    const x = ((c.x - time * pipeSpeed * 0.18) % (CANVAS_W + 200)) - 100
    const y = c.y
    const r = c.r
    ctx.beginPath()
    ctx.arc(x,       y,     r * 0.8, 0, Math.PI * 2)
    ctx.arc(x + r,   y,     r,       0, Math.PI * 2)
    ctx.arc(x + r*2, y,     r * 0.8, 0, Math.PI * 2)
    ctx.arc(x + r*0.8, y - r*0.6, r * 0.7, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

function drawMountains(ctx, mountains, time, pipeSpeed, color) {
  ctx.save()
  ctx.fillStyle = color
  for (const m of mountains) {
    const x = ((m.x - time * pipeSpeed * 0.08) % (CANVAS_W + 200)) - 100
    ctx.beginPath()
    ctx.moveTo(x, GROUND_Y)
    ctx.lineTo(x + m.w / 2, GROUND_Y - m.h)
    ctx.lineTo(x + m.w, GROUND_Y)
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()
}

function drawStarsField(ctx, stars) {
  ctx.save()
  for (const s of stars) {
    ctx.globalAlpha = s.brightness
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
  ctx.restore()
}

function drawNebula(ctx, time) {
  ctx.save()
  const g1 = ctx.createRadialGradient(100, 200, 0, 100, 200, 150)
  g1.addColorStop(0, `rgba(139,92,246,${0.08 + 0.02 * Math.sin(time * 0.3)})`)
  g1.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g1
  ctx.fillRect(0, 0, CANVAS_W, GROUND_Y)

  const g2 = ctx.createRadialGradient(380, 350, 0, 380, 350, 120)
  g2.addColorStop(0, `rgba(236,72,153,${0.06 + 0.02 * Math.sin(time * 0.5)})`)
  g2.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g2
  ctx.fillRect(0, 0, CANVAS_W, GROUND_Y)
  ctx.restore()
}

function drawWaves(ctx, time) {
  ctx.save()
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'
  ctx.lineWidth = 2
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    const yBase = GROUND_Y - 140 + i * 40
    for (let x = 0; x < CANVAS_W; x += 4) {
      const y = yBase + 8 * Math.sin((x + time * 60 + i * 80) * 0.025)
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
  ctx.restore()
}

function drawJungleFoliage(ctx, mountains, time, pipeSpeed) {
  ctx.save()
  // Back trees
  ctx.fillStyle = '#166534'
  for (const m of mountains) {
    const x = ((m.x - time * pipeSpeed * 0.07) % (CANVAS_W + 200)) - 100
    ctx.beginPath()
    ctx.arc(x, GROUND_Y - m.h * 0.7, m.w * 0.4, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillRect(x - 8, GROUND_Y - m.h * 0.7, 16, m.h * 0.7)
  }
  // Front canopy
  ctx.fillStyle = '#15803d'
  for (const m of mountains) {
    const x = ((m.x + 100 - time * pipeSpeed * 0.13) % (CANVAS_W + 200)) - 100
    ctx.beginPath()
    ctx.arc(x, GROUND_Y - m.h * 0.6, m.w * 0.35, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

function drawDunes(ctx, mountains, time, pipeSpeed) {
  ctx.save()
  ctx.fillStyle = '#b45309'
  for (const m of mountains) {
    const x = ((m.x - time * pipeSpeed * 0.06) % (CANVAS_W + 300)) - 150
    ctx.beginPath()
    ctx.ellipse(x + m.w / 2, GROUND_Y, m.w, m.h * 0.5, 0, Math.PI, 0)
    ctx.fill()
  }
  ctx.restore()
}

function drawBuildings(ctx, buildings, time, pipeSpeed) {
  ctx.save()
  // Far buildings
  ctx.fillStyle = '#1a0a2e'
  ctx.strokeStyle = '#6d28d9'
  ctx.lineWidth = 1
  for (const b of buildings) {
    const x = ((b.x - time * pipeSpeed * 0.09) % (CANVAS_W + 200)) - 100
    ctx.fillRect(x, GROUND_Y - b.h, b.w, b.h)
    ctx.strokeRect(x, GROUND_Y - b.h, b.w, b.h)
    // Window grid
    ctx.fillStyle = `rgba(232,121,249,${0.3 + 0.1 * Math.sin(time + b.x)})`;
    for (let wy = GROUND_Y - b.h + 10; wy < GROUND_Y - 10; wy += 18) {
      for (let wx = x + 6; wx < x + b.w - 6; wx += 14) {
        if (Math.random() < 0.7) ctx.fillRect(wx, wy, 8, 10)
      }
    }
    ctx.fillStyle = '#1a0a2e'
  }
  ctx.restore()
}

function drawNeonGrid(ctx, time) {
  ctx.save()
  ctx.strokeStyle = `rgba(139,92,246,0.15)`
  ctx.lineWidth = 1
  const spacing = 40
  const offset  = (time * 30) % spacing
  for (let x = -offset; x < CANVAS_W; x += spacing) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, GROUND_Y)
    ctx.stroke()
  }
  ctx.restore()
}

function drawGround(ctx, bg, layers, pipeSpeed, time) {
  // Ground base
  ctx.fillStyle = '#5D4037'
  if (bg.id === 'night') ctx.fillStyle = '#1a237e'
  else if (bg.id === 'space') ctx.fillStyle = '#1e1b4b'
  else if (bg.id === 'ocean') ctx.fillStyle = '#164e63'
  else if (bg.id === 'jungle') ctx.fillStyle = '#14532d'
  else if (bg.id === 'desert') ctx.fillStyle = '#78350f'
  else if (bg.id === 'neon') ctx.fillStyle = '#1a0a2e'
  else if (bg.id === 'sunset') ctx.fillStyle = '#4E342E'
  ctx.fillRect(0, GROUND_Y, CANVAS_W, GROUND_H)

  // Grass / detail strip
  ctx.fillStyle = bg.id === 'desert' ? '#92400e' : bg.id === 'neon' ? '#4c1d95' : '#4caf50'
  if (bg.id === 'ocean')  ctx.fillStyle = '#0c4a6e'
  if (bg.id === 'space')  ctx.fillStyle = '#312e81'
  if (bg.id === 'night')  ctx.fillStyle = '#283593'
  if (bg.id === 'jungle') ctx.fillStyle = '#166534'
  ctx.fillRect(0, GROUND_Y, CANVAS_W, 14)

  // Scrolling ground tiles
  ctx.fillStyle = 'rgba(0,0,0,0.15)'
  const tileW = 48
  const off   = (time * pipeSpeed * 0.3) % tileW
  for (let x = -off; x < CANVAS_W; x += tileW) {
    ctx.fillRect(x, GROUND_Y + 2, 1, 10)
  }
}

// ─── Pipes ────────────────────────────────────────────────────────────────────
export function drawPipes(ctx, pipes, bgId) {
  const isNeon   = bgId === 'neon'
  const isSpace  = bgId === 'space'
  const isSunset = bgId === 'sunset'

  for (const pipe of pipes) {
    const px     = pipe.x - PIPE_WIDTH / 2
    const gapTop = pipe.gapCenterY - pipe.gap / 2
    const gapBot = pipe.gapCenterY + pipe.gap / 2

    // Colors
    let fillColor   = '#5a9e48'
    let strokeColor = '#2e7d32'
    let capFill     = '#4caf50'
    if (isNeon)   { fillColor = '#4c1d95'; strokeColor = '#7c3aed'; capFill = '#6d28d9' }
    if (isSpace)  { fillColor = '#1e3a5f'; strokeColor = '#3b82f6'; capFill = '#2563eb' }
    if (isSunset) { fillColor = '#7c2d12'; strokeColor = '#c2410c'; capFill = '#ea580c' }

    // Top pipe body
    if (gapTop > 0) {
      ctx.fillStyle = fillColor
      roundRect(ctx, px, 0, PIPE_WIDTH, gapTop - PIPE_CAP_H, 0)
      ctx.fill()
      if (isNeon || isSpace) {
        ctx.strokeStyle = strokeColor
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // Top pipe cap
      ctx.fillStyle = capFill
      roundRect(ctx, px - 4, gapTop - PIPE_CAP_H, PIPE_WIDTH + 8, PIPE_CAP_H, PIPE_CORNER_R)
      ctx.fill()

      // Pipe shine
      ctx.fillStyle = 'rgba(255,255,255,0.12)'
      ctx.fillRect(px + 6, 0, 8, gapTop - PIPE_CAP_H)
    }

    // Bottom pipe body
    if (gapBot < GROUND_Y) {
      ctx.fillStyle = fillColor
      roundRect(ctx, px, gapBot + PIPE_CAP_H, PIPE_WIDTH, GROUND_Y - gapBot - PIPE_CAP_H, 0)
      ctx.fill()
      if (isNeon || isSpace) {
        ctx.strokeStyle = strokeColor
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // Bottom pipe cap
      ctx.fillStyle = capFill
      roundRect(ctx, px - 4, gapBot, PIPE_WIDTH + 8, PIPE_CAP_H, PIPE_CORNER_R)
      ctx.fill()

      // Pipe shine
      ctx.fillStyle = 'rgba(255,255,255,0.12)'
      ctx.fillRect(px + 6, gapBot + PIPE_CAP_H, 8, GROUND_Y - gapBot - PIPE_CAP_H)
    }
  }
}

// ─── Bird ─────────────────────────────────────────────────────────────────────
export function drawBird(ctx, bird, skinId, time, shieldActive, shrinkActive, ghostActive) {
  const skin = BIRD_SKINS.find(s => s.id === skinId) || BIRD_SKINS[0]
  const r    = shrinkActive ? 12 : BIRD_VISUAL_R
  const { x, y, angle, flapTimer } = bird

  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(degToRad(angle))

  if (ghostActive) ctx.globalAlpha = 0.55

  // Glow for special skins
  if (skin.glow) {
    ctx.shadowColor = skin.glow
    ctx.shadowBlur  = 14
  }

  // Body
  if (skin.fill === 'rainbow') {
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r)
    const colors = ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6']
    colors.forEach((c, i) => grad.addColorStop(i / (colors.length - 1), c))
    ctx.fillStyle = grad
  } else if (skin.fill === 'galaxy') {
    const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r)
    grad.addColorStop(0, '#e879f9')
    grad.addColorStop(0.5, '#6366f1')
    grad.addColorStop(1, '#020617')
    ctx.fillStyle = grad
  } else {
    ctx.fillStyle = skin.fill
  }

  ctx.beginPath()
  ctx.ellipse(0, 0, r, r * 0.9, 0, 0, Math.PI * 2)
  ctx.fill()

  // Wing
  const wFlapY = -r * 0.3 + Math.sin(flapTimer * 8) * r * 0.5
  ctx.fillStyle = (skin.wing === 'rainbow' || skin.wing === 'galaxy') ? skin.fill : skin.wing
  if (skin.wings === 'flame') {
    ctx.fillStyle = '#f97316'
    ctx.beginPath()
    ctx.ellipse(-r * 0.2, wFlapY, r * 0.55, r * 0.28, degToRad(-30), 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fbbf24'
    ctx.beginPath()
    ctx.ellipse(-r * 0.2, wFlapY, r * 0.35, r * 0.15, degToRad(-30), 0, Math.PI * 2)
    ctx.fill()
  } else {
    ctx.beginPath()
    ctx.ellipse(-r * 0.2, wFlapY, r * 0.55, r * 0.28, degToRad(-20), 0, Math.PI * 2)
    ctx.fill()
  }

  // Eye
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(r * 0.28, -r * 0.12, r * 0.32, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = skin.eye
  ctx.beginPath()
  ctx.arc(r * 0.35, -r * 0.1, r * 0.18, 0, Math.PI * 2)
  ctx.fill()

  // Beak
  ctx.fillStyle = '#f59e0b'
  ctx.beginPath()
  ctx.moveTo(r * 0.75, 0)
  ctx.lineTo(r * 1.15, r * 0.15)
  ctx.lineTo(r * 0.75, r * 0.25)
  ctx.closePath()
  ctx.fill()

  ctx.shadowBlur = 0
  ctx.restore()

  // Shield ring
  if (shieldActive) {
    ctx.save()
    ctx.strokeStyle = `rgba(56,189,248,${0.5 + 0.3 * Math.sin(time * 6)})`
    ctx.lineWidth   = 3
    ctx.beginPath()
    ctx.arc(x, y, r + 8, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }
}

// ─── Collectibles ─────────────────────────────────────────────────────────────
export function drawCollectibles(ctx, items, time) {
  for (const item of items) {
    if (item.collected) continue
    const { x, y, radius, color, type } = item
    const bob = Math.sin(time * 3 + x * 0.05) * 3

    ctx.save()
    ctx.translate(x, y + bob)

    if (type === 'coin') {
      // Spinning coin effect
      const scaleX = Math.abs(Math.cos(time * 4 + x * 0.1))
      ctx.scale(scaleX, 1)
      ctx.fillStyle = '#fbbf24'
      ctx.strokeStyle = '#d97706'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(0, 0, radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      ctx.fillStyle = '#fde68a'
      ctx.font = `bold ${radius}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('¢', 0, 1)
    } else if (type === 'gem') {
      ctx.fillStyle = color
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(0, -radius)
      ctx.lineTo(radius * 0.7, -radius * 0.3)
      ctx.lineTo(radius * 0.7, radius * 0.4)
      ctx.lineTo(0, radius)
      ctx.lineTo(-radius * 0.7, radius * 0.4)
      ctx.lineTo(-radius * 0.7, -radius * 0.3)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      ctx.fillStyle = 'rgba(255,255,255,0.4)'
      ctx.beginPath()
      ctx.moveTo(-radius * 0.2, -radius * 0.8)
      ctx.lineTo(radius * 0.3, -radius * 0.1)
      ctx.lineTo(-radius * 0.3, -radius * 0.1)
      ctx.closePath()
      ctx.fill()
    } else if (type === 'star') {
      ctx.fillStyle = color
      ctx.strokeStyle = '#fbbf24'
      ctx.lineWidth = 1.5
      drawStar(ctx, 0, 0, radius, radius * 0.45)
      ctx.fill()
      ctx.stroke()
      ctx.shadowColor = color
      ctx.shadowBlur  = 8
      ctx.fill()
    } else if (type === 'collection') {
      // Distinct diamond shape with item color
      ctx.fillStyle = color
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.shadowColor = color
      ctx.shadowBlur  = 10
      ctx.beginPath()
      ctx.moveTo(0, -radius * 1.2)
      ctx.lineTo(radius * 0.9, 0)
      ctx.lineTo(0, radius * 1.2)
      ctx.lineTo(-radius * 0.9, 0)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    }
    ctx.restore()
  }
}

// ─── Power-ups ────────────────────────────────────────────────────────────────
export function drawPowerups(ctx, powerups, time) {
  for (const pu of powerups) {
    if (pu.collected) continue
    const { x, y, radius, type } = pu
    const pulse = 1 + 0.12 * Math.sin(pu.pulseTimer * 4)

    ctx.save()
    ctx.translate(x, y)
    ctx.scale(pulse, pulse)

    const colors = {
      shield:   '#38bdf8', slow_mo: '#a78bfa', magnet:  '#f59e0b',
      shrink:   '#34d399', score_x2:'#f97316', ghost:   '#e879f9',
    }
    const icons = {
      shield: '🛡', slow_mo: '⏳', magnet: '🧲',
      shrink: '⬇', score_x2: '×2', ghost: '👻',
    }
    const col = colors[type] || '#ffffff'

    ctx.fillStyle = `rgba(${hexToRgbStr(col)},0.2)`
    ctx.strokeStyle = col
    ctx.lineWidth = 2.5
    ctx.shadowColor = col
    ctx.shadowBlur  = 12

    ctx.beginPath()
    ctx.arc(0, 0, radius + 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    ctx.shadowBlur = 0
    ctx.font = `${radius * 1.1}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(icons[type] || '?', 0, 1)

    ctx.restore()
  }
}

// ─── Particles ────────────────────────────────────────────────────────────────
export function updateParticles(particles, dt) {
  return particles
    .map(p => ({
      ...p,
      x:    p.x + p.vx * dt,
      y:    p.y + p.vy * dt,
      vy:   p.vy + 300 * dt,
      life: p.life - dt,
    }))
    .filter(p => p.life > 0)
}

export function drawParticles(ctx, particles) {
  for (const p of particles) {
    const alpha = clamp(p.life / p.maxLife, 0, 1)
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.fillStyle   = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

export function createDeathParticles(x, y) {
  const parts = []
  for (let i = 0; i < 18; i++) {
    const angle = (i / 18) * Math.PI * 2
    const speed = 80 + Math.random() * 160
    parts.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 80,
      r:    2 + Math.random() * 4,
      life: 0.5 + Math.random() * 0.7,
      maxLife: 1.2,
      color: ['#fbbf24','#f97316','#ef4444','#ffffff'][Math.floor(Math.random() * 4)],
    })
  }
  return parts
}

export function createCoinParticles(x, y, color) {
  const parts = []
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2
    parts.push({
      x, y,
      vx: Math.cos(angle) * (40 + Math.random() * 80),
      vy: Math.sin(angle) * (40 + Math.random() * 80) - 60,
      r:    2 + Math.random() * 2,
      life: 0.3 + Math.random() * 0.4,
      maxLife: 0.7,
      color: color || '#fbbf24',
    })
  }
  return parts
}

// ─── Score popup ──────────────────────────────────────────────────────────────
export function drawScorePopups(ctx, popups) {
  for (const p of popups) {
    const alpha = clamp(p.life / 0.8, 0, 1)
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.fillStyle   = p.color || '#ffffff'
    ctx.font        = `bold ${p.size || 20}px system-ui`
    ctx.textAlign   = 'center'
    ctx.shadowColor = 'rgba(0,0,0,0.6)'
    ctx.shadowBlur  = 4
    ctx.fillText(p.text, p.x, p.y)
    ctx.restore()
  }
}

// ─── HUD elements drawn on canvas ─────────────────────────────────────────────
export function drawHitboxDebug(ctx, bird, shrinkActive) {
  const r = shrinkActive ? 9 : 14
  ctx.save()
  ctx.strokeStyle = 'rgba(255,0,0,0.7)'
  ctx.lineWidth   = 1.5
  ctx.beginPath()
  ctx.arc(bird.x, bird.y, r, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}

// ─── Pre-generate stable background layer data ────────────────────────────────
export function generateBgLayers(bgId) {
  const rng = seededRandom(bgId.split('').reduce((a, c) => a * 31 + c.charCodeAt(0), 0))

  const clouds    = Array.from({ length: 8  }, () => ({ x: rng() * CANVAS_W * 2, y: rng() * (GROUND_Y * 0.55) + 30, r: 22 + rng() * 28 }))
  const stars     = Array.from({ length: 80 }, () => ({ x: rng() * CANVAS_W, y: rng() * (GROUND_Y * 0.9), r: rng() < 0.15 ? 1.5 : 0.8, brightness: 0.4 + rng() * 0.6 }))
  const mountains = Array.from({ length: 10 }, () => ({ x: rng() * CANVAS_W * 2, h: 60 + rng() * 120, w: 80 + rng() * 140 }))
  const buildings = Array.from({ length: 12 }, () => ({ x: rng() * CANVAS_W * 2, h: 80 + rng() * 200, w: 30 + rng() * 50 }))

  return { clouds, stars, mountains, buildings }
}

// ─── Utility ──────────────────────────────────────────────────────────────────
function hexToRgbStr(hex) {
  const m = hex.match(/[0-9a-f]{2}/gi)
  if (!m) return '255,255,255'
  return m.map(v => parseInt(v, 16)).join(',')
}
