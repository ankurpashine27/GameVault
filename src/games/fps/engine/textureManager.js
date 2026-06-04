/**
 * Grimhold — procedural wall textures. Each is a 64×64 offscreen canvas built
 * once and cached. No external images. Floor/ceiling are colour pairs per
 * episode (rendered as gradients in the renderer for performance).
 */
import { TEX, TEX_SIZE } from '../constants.js'
import { makeCanvas, makePRNG } from '../utils.js'

const cache = {}
const S = TEX_SIZE

function tex(id, drawFn) {
  const c = makeCanvas(S, S)
  const ctx = c.getContext('2d')
  drawFn(ctx, makePRNG(id * 9173 + 7))
  cache[id] = c
  return c
}

const fill = (ctx, x, y, w, h, col) => { ctx.fillStyle = col; ctx.fillRect(x, y, w, h) }
function noise(ctx, rng, amt) {
  const img = ctx.getImageData(0, 0, S, S)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const n = (rng() - 0.5) * 2 * amt
    d[i] = clampB(d[i] + n); d[i + 1] = clampB(d[i + 1] + n); d[i + 2] = clampB(d[i + 2] + n)
  }
  ctx.putImageData(img, 0, 0)
}
const clampB = (v) => v < 0 ? 0 : v > 255 ? 255 : v

function bricks(ctx, rng, base, mortar, rowH = 16, colW = 32) {
  fill(ctx, 0, 0, S, S, mortar)
  for (let y = 0; y < S; y += rowH) {
    const off = ((y / rowH) % 2) * (colW / 2)
    for (let x = -colW; x < S; x += colW) {
      const bx = x + off + 1, by = y + 1, bw = colW - 2, bh = rowH - 2
      const shade = 1 + (rng() - 0.5) * 0.18
      fill(ctx, bx, by, bw, bh, mix(base, shade))
      // bevel
      ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(bx, by, bw, 2)
      ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(bx, by + bh - 2, bw, 2)
    }
  }
}

function mix(hex, f) {
  const n = parseInt(hex.slice(1), 16)
  const r = clampB(((n >> 16) & 255) * f), g = clampB(((n >> 8) & 255) * f), b = clampB((n & 255) * f)
  return `rgb(${r | 0},${g | 0},${b | 0})`
}

function build() {
  tex(TEX.STONE_BRICK, (ctx, rng) => { bricks(ctx, rng, '#7d7d86', '#3a3a42'); noise(ctx, rng, 16) })

  tex(TEX.CARVED_STONE, (ctx, rng) => {
    fill(ctx, 0, 0, S, S, '#8a8780')
    // Gothic arch engraving
    ctx.strokeStyle = '#5c5a54'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(12, 60); ctx.lineTo(12, 26)
    ctx.quadraticCurveTo(32, 6, 52, 26); ctx.lineTo(52, 60); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(32, 14); ctx.lineTo(32, 58); ctx.stroke()
    noise(ctx, rng, 12)
  })

  tex(TEX.DUNGEON_BRICK, (ctx, rng) => {
    bricks(ctx, rng, '#494137', '#241f1a')
    // mossy cracks / stains
    ctx.fillStyle = 'rgba(40,70,40,0.25)'
    for (let i = 0; i < 22; i++) ctx.fillRect((rng() * S) | 0, (rng() * S) | 0, 2 + (rng() * 4 | 0), 2)
    ctx.fillStyle = 'rgba(20,30,40,0.3)'
    for (let i = 0; i < 8; i++) ctx.fillRect((rng() * S) | 0, (rng() * S) | 0, 1, 4 + (rng() * 10 | 0))
    noise(ctx, rng, 14)
  })

  tex(TEX.WOOD_PANEL, (ctx, rng) => {
    for (let y = 0; y < S; y += 16) {
      fill(ctx, 0, y, S, 15, mix('#5a3d24', 1 + (rng() - 0.5) * 0.2))
      ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, y + 15, S, 1)
      // grain
      ctx.strokeStyle = 'rgba(0,0,0,0.12)'
      for (let g = 0; g < 3; g++) { ctx.beginPath(); ctx.moveTo(0, y + 3 + g * 4); ctx.bezierCurveTo(20, y + 2 + g * 4, 44, y + 5 + g * 4, S, y + 3 + g * 4); ctx.stroke() }
    }
    // iron bolts
    ctx.fillStyle = '#2b2b30'
    for (const [bx, by] of [[8, 8], [56, 8], [8, 56], [56, 56], [32, 32]]) { ctx.beginPath(); ctx.arc(bx, by, 3, 0, 7); ctx.fill() }
    noise(ctx, rng, 8)
  })

  tex(TEX.CATHEDRAL, (ctx, rng) => {
    fill(ctx, 0, 0, S, S, '#b9b3a4')
    // tall narrow window
    fill(ctx, 26, 8, 12, 40, '#1a2236')
    ctx.fillStyle = '#33406a'; ctx.fillRect(28, 10, 8, 18)
    ctx.fillStyle = '#5a2a3a'; ctx.fillRect(28, 30, 8, 16)
    ctx.strokeStyle = '#6a6456'; ctx.lineWidth = 2; ctx.strokeRect(26, 8, 12, 40)
    noise(ctx, rng, 10)
  })

  tex(TEX.BOOKCASE, (ctx, rng) => {
    fill(ctx, 0, 0, S, S, '#2e2017')
    const cols = ['#6b2b2b', '#2b4d6b', '#3a6b2b', '#6b5a2b', '#4d2b6b', '#6b3a2b']
    for (let shelf = 0; shelf < 4; shelf++) {
      let x = 2
      while (x < S - 3) {
        const w = 3 + (rng() * 4 | 0), h = 13 + (rng() * 2 | 0)
        fill(ctx, x, shelf * 16 + (16 - h) + 1, w, h - 1, cols[(rng() * cols.length) | 0])
        x += w + 1
      }
      ctx.fillStyle = '#1a120c'; ctx.fillRect(0, shelf * 16 + 15, S, 1)
    }
    noise(ctx, rng, 8)
  })

  tex(TEX.TORTURE, (ctx, rng) => {
    bricks(ctx, rng, '#4a4248', '#211e22')
    ctx.fillStyle = 'rgba(90,10,10,0.55)'
    for (let i = 0; i < 6; i++) {
      const x = (rng() * S) | 0
      ctx.fillRect(x, 0, 1 + (rng() * 2 | 0), 10 + (rng() * 40 | 0))
      ctx.beginPath(); ctx.arc(x, 10 + (rng() * 40 | 0), 2 + rng() * 2, 0, 7); ctx.fill()
    }
    noise(ctx, rng, 12)
  })

  tex(TEX.DOOR, (ctx, rng) => {
    fill(ctx, 0, 0, S, S, '#4a3320')
    for (let y = 4; y < S; y += 14) { ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(4, y, S - 8, 2) }
    ctx.fillStyle = '#2b2b30'; ctx.fillRect(2, 2, S - 4, 4); ctx.fillRect(2, S - 6, S - 4, 4)
    ctx.fillStyle = '#1c1c20'; ctx.fillRect(0, 0, 3, S); ctx.fillRect(S - 3, 0, 3, S)
    // handle ring
    ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(48, 32, 5, 0, 7); ctx.stroke()
    noise(ctx, rng, 8)
  })

  tex(TEX.LOCKED_DOOR, (ctx, rng) => {
    cache[TEX.DOOR] ? ctx.drawImage(cache[TEX.DOOR], 0, 0) : fill(ctx, 0, 0, S, S, '#4a3320')
    // badge plate (colour overlaid by renderer per lock)
    ctx.fillStyle = '#15151a'; ctx.fillRect(24, 22, 16, 20)
    ctx.strokeStyle = '#555'; ctx.lineWidth = 1; ctx.strokeRect(24, 22, 16, 20)
    noise(ctx, rng, 4)
  })

  tex(TEX.BOSS_GATE, (ctx, rng) => {
    fill(ctx, 0, 0, S, S, '#0c0c10')
    ctx.strokeStyle = '#26262e'; ctx.lineWidth = 3
    for (let x = 8; x < S; x += 12) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, S); ctx.stroke() }
    // glowing runes
    ctx.fillStyle = '#c2410c'; ctx.shadowColor = '#ff6a3d'; ctx.shadowBlur = 6
    for (const [rx, ry] of [[16, 18], [40, 30], [28, 46], [48, 14]]) { ctx.beginPath(); ctx.arc(rx, ry, 3, 0, 7); ctx.fill() }
    ctx.shadowBlur = 0
    noise(ctx, rng, 6)
  })
}

let built = false
export function initTextures() { if (!built) { build(); built = true } }
export function getWallTexture(id) {
  if (!built) build(), (built = true)
  return cache[id] || cache[TEX.STONE_BRICK]
}

/** Episode floor/ceiling palette. */
export const EPISODE_PALETTE = {
  1: { ceil: ['#20232b', '#0d0e13'], floor: ['#3a3a40', '#17171b'], fog: '#0a0a10' },
  2: { ceil: ['#0c0a08', '#040302'], floor: ['#241d16', '#0a0806'], fog: '#050403' },
  3: { ceil: ['#1a0a22', '#05010a'], floor: ['#2a0e1e', '#0a0308'], fog: '#0a0210' },
}
export const paletteFor = (ep) => EPISODE_PALETTE[ep] || EPISODE_PALETTE[1]
