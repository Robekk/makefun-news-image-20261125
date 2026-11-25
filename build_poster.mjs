// Hybrid renderer for make.fun image entries — v10 proof.
// Architecture: Skia Canvas (vector scenes, native gradients/shadows, real font
// shaping) at 2048x2048 -> Sharp (libvips) lanczos3 downscale to 1024 final.
// No per-pixel JS loops anywhere. Layout/data mirror build_poster9.py (v9).
import { Canvas, FontLibrary } from 'skia-canvas';
import sharp from 'sharp';
import { readFileSync } from 'fs';

const FD = '/usr/share/fonts/truetype/noto/';
FontLibrary.use('SerifXB', FD + 'NotoSerif-ExtraBold.ttf');
FontLibrary.use('SerifB', FD + 'NotoSerif-Bold.ttf');
FontLibrary.use('SansB', FD + 'NotoSans-Bold.ttf');
FontLibrary.use('SansSB', FD + 'NotoSans-SemiBold.ttf');
FontLibrary.use('Sans', FD + 'NotoSans-Regular.ttf');

const S = 2, W = 1024, H = 1024;
const canvas = new Canvas(W * S, H * S);
const ctx = canvas.getContext('2d');
ctx.scale(S, S);

const BG = '#f6f1e3', INK = '#14304f', RED = '#c52d28', NAVY = '#102a46', GREY = '#777777';
const GOLD = '#b77a12', GOLDL = '#d9a83f';
const ZA = '#174b80', ZB = '#c52d28', ZC = '#b77a12';
const LAND = '#f3ecd7', SEA = '#c7d8ea';

const F = (fam, px) => `${px}px "${fam}"`;
function text(str, x, y, font, fill, align = 'left') {
  ctx.font = font; ctx.fillStyle = fill; ctx.textAlign = align; ctx.textBaseline = 'top';
  ctx.fillText(str, x, y);
}
function tw(str, font) { ctx.font = font; return ctx.measureText(str).width; }
function wrap(str, font, width) {
  const words = str.split(' '); const lines = []; let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (tw(t, font) <= width) cur = t; else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines;
}
function wrap2(str, font, wFirst, wRest) {
  const words = str.split(' '); const lines = []; let cur = ''; let width = wFirst;
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (tw(t, font) <= width) cur = t; else { lines.push(cur); cur = w; width = wRest; }
  }
  if (cur) lines.push(cur);
  return lines;
}
function block(str, x, y, font, width, leading, fill) {
  for (const ln of wrap(str, font, width)) { text(ln, x, y, font, fill); y += leading; }
  return y;
}
function rect(x, y, w, h, fill) { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); }
function srect(x, y, w, h, fill, lw = 1) { ctx.strokeStyle = fill; ctx.lineWidth = lw; ctx.strokeRect(x, y, w, h); }
function ell(cx, cy, rx, ry, fill) { ctx.fillStyle = fill; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); }
function line(pts, stroke, lw = 1) {
  ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.beginPath();
  pts.forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)); ctx.stroke();
}
function poly(pts, fill) {
  ctx.fillStyle = fill; ctx.beginPath();
  pts.forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)); ctx.closePath(); ctx.fill();
}
function vgrad(x, y, w, h, top, bot) { ctx.fillStyle = top; ctx.fillRect(x, y, w, h); } // FLAT: solid fill only
function rrs(x, y, w, h, r, fill, lw = 1) { ctx.strokeStyle = fill; ctx.lineWidth = lw; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.stroke(); }
function rr(x, y, w, h, r, fill) {
  ctx.fillStyle = fill; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill();
}

// ---------------- illustration scenes (native vector, gradient + shadow) ----------------
function illo(kind, x, y, w, h, zone, zlabel) {
  rect(x, y, w, h, '#e9e3d3'); // FLAT: no shadow
  ctx.save();
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 5); ctx.clip();
  const cx = x + w / 2, cy = y + h / 2;
  if (kind === 'chart') {
    vgrad(x, y, w, h, '#d8eed6', '#f0f8ec');
    for (let i = 0; i < 3; i++) line([[x + 8, y + h - 10 - i * (h - 18) / 2], [x + w - 8, y + h - 10 - i * (h - 18) / 2]], '#c4d8c2', 1);
    ell(x + w - 22, y + 14, 8, 8, '#fad66e');
    const pts = [[x + 8, y + h - 12], [x + w * 0.35, y + h * 0.6], [x + w * 0.55, y + h * 0.68], [x + w * 0.82, y + h * 0.2]];
    poly([...pts, [x + w * 0.82, y + h], [x + 8, y + h]], '#bae4ba');
    line(pts, '#1a7832', 3);
    poly([[x + w * 0.82, y + h * 0.2], [x + w * 0.82 - 13, y + h * 0.2 + 2], [x + w * 0.82 - 2, y + h * 0.2 + 13]], '#1a7832');
    [[0.1, 1], [0.24, 0], [0.38, 1], [0.52, 1], [0.66, 0], [0.8, 1]].forEach(([fx, up], i) => {
      const bx = x + w * fx, col = up ? '#1e8c3c' : '#c43c32', bh = h * (0.2 + 0.05 * (i % 3));
      line([[bx + 4, y + h - 11 - bh], [bx + 4, y + h - 2]], col, 1);
      rect(bx, y + h - 6 - bh, 8, bh, col);
    });
  } else if (kind === 'pharma') {
    vgrad(x, y, w, h, '#d6eaf4', '#eef6fa');
    rect(x + w * 0.08, y + h * 0.24, w * 0.26, h * 0.76, '#6082a0');
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++)
      rect(x + w * (0.11 + c * 0.075), y + h * (0.32 + r * 0.2), w * 0.045, h * 0.12, '#e2f0f8');
    rect(x + w * 0.17, y + h * 0.08, w * 0.08, h * 0.16, '#6082a0');
    const fx = x + w * 0.6, fy = y + h * 0.12;
    poly([[fx - 7, fy], [fx + 7, fy], [fx + 3, fy + h * 0.24], [fx + 14, fy + h * 0.66], [fx - 14, fy + h * 0.66], [fx - 3, fy + h * 0.24]], 'rgba(0,0,0,0)');
    ctx.strokeStyle = '#465a6e'; ctx.lineWidth = 2;
    ctx.beginPath();
    [[fx - 7, fy], [fx + 7, fy], [fx + 3, fy + h * 0.24], [fx + 14, fy + h * 0.66], [fx - 14, fy + h * 0.66], [fx - 3, fy + h * 0.24]].forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py));
    ctx.closePath(); ctx.stroke();
    rect(fx - 11, fy + h * 0.44, 22, h * 0.2, '#5aa0c8');
    ell(fx - 5, fy + h * 0.5, 2, 2, '#d2ecf8'); ell(fx + 3, fy + h * 0.56, 3, 3, '#d2ecf8'); ell(fx + 6, fy + h * 0.48, 2, 2, '#d2ecf8');
    ell(x + w * 0.875, y + h * 0.3, 13, 13, '#fafaf8');
    ctx.strokeStyle = '#c43c3c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x + w * 0.875, y + h * 0.3, 13, 13, 0, 0, Math.PI * 2); ctx.stroke();
    rect(x + w * 0.875 - 2.5, y + h * 0.3 - 7, 5, 14, '#c83232');
    rect(x + w * 0.875 - 7, y + h * 0.3 - 2.5, 14, 5, '#c83232');
  } else if (kind === 'tanker') {
    vgrad(x, y, w, h * 0.58, '#b2d4ea', '#deF0f8'.toLowerCase());
    vgrad(x, y + h * 0.58, w, h * 0.42, '#6092b8', '#3a6a9c');
    ell(x + w * 0.06 + 8, y + h * 0.1 + 8, 8, 8, '#fad66e');
    ell(x + w * 0.3 + 17, y + h * 0.12, 17, 5, '#fafafa'); ell(x + w * 0.3 + 22, y + h * 0.09, 10, 5, '#fafafa');
    rect(x + w * 0.12, y + h * 0.5, w * 0.56, h * 0.14, '#30363e');
    poly([[x + w * 0.68, y + h * 0.5], [x + w * 0.8, y + h * 0.64], [x + w * 0.68, y + h * 0.64]], '#30363e');
    ['#b23c28', '#246ea0', '#346e46'].forEach((c, i) => rect(x + w * (0.17 + i * 0.14), y + h * 0.36, w * 0.12, h * 0.14, c));
    rect(x + w * 0.6, y + h * 0.22, w * 0.08, h * 0.28, '#e8e6de');
    const ex = x + w * 0.52, ey = y + h * 0.36, epts = [];
    for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, r = i % 2 === 0 ? 10.5 : 5; epts.push([ex + r * Math.cos(a), ey + r * Math.sin(a) * 0.85]); }
    poly(epts, '#f08228');
    ell(ex, ey, 4.5, 3.5, '#fcd460');
    ell(x + w * 0.57, y + h * 0.15, 8, 4, '#8a8d90'); ell(x + w * 0.61, y + h * 0.09, 11, 5, '#a8abae');
    const mx2 = x + w * 0.88, my2 = y + h * 0.34;
    line([[mx2, my2 - 10], [x + w * 0.72, y + h * 0.56]], '#3c3c40', 1);
    ell(mx2, my2, 7, 7, '#26262a');
    for (let a = 0; a < 360; a += 45) line([[mx2, my2], [mx2 + 11 * Math.cos(a * Math.PI / 180), my2 + 11 * Math.sin(a * Math.PI / 180)]], '#26262a', 2);
    ctx.strokeStyle = '#dcf0fa'; ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(x + 4 + i * w * 0.19 + w * 0.066, y + h * 0.83, w * 0.066, Math.PI, 2 * Math.PI); ctx.stroke(); }
  } else if (kind === 'gaza') {
    vgrad(x, y, w, h, '#e8dec6', '#f4eedc');
    ell(x + w * 0.84, y + h * 0.14, 7, 7, '#f6ce82');
    [[0.06, 0.17, 0.6], [0.27, 0.14, 0.44], [0.46, 0.19, 0.66], [0.7, 0.15, 0.5]].forEach(([bx, bw, bh]) => {
      rect(x + w * bx, y + h - h * bh, w * bw, h * bh, '#7a7262');
      for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++)
        rect(x + w * (bx + 0.03 + c * 0.07), y + h - h * bh + 4 + r * (h * bh / 3.4), w * 0.025, 4, '#4a443a');
    });
    poly([[x + w * 0.27, y + h - h * 0.44], [x + w * 0.34, y + h - h * 0.3], [x + w * 0.41, y + h - h * 0.44]], '#686052');
    [[0.52, 0.3, 10], [0.58, 0.18, 13], [0.12, 0.24, 9], [0.17, 0.12, 12]].forEach(([sx, sy, sr]) => ell(x + w * sx, y + h * sy, sr, sr * 0.6, '#9e9a92'));
    poly([[x + 2, y + h], [x + w * 0.2, y + h - 6], [x + w * 0.4, y + h]], '#968c78');
    poly([[x + w * 0.55, y + h], [x + w * 0.75, y + h - 7], [x + w * 0.95, y + h]], '#968c78');
  } else if (kind === 'rocket') {
    vgrad(x, y, w, h, '#f6c45c', '#f9df9e');
    ell(x + w * 0.86, y + h * 0.18, 10, 10, '#f08c28');
    rect(x, y + h * 0.92, w, h * 0.08, INK);
    rect(x + w * 0.3, y + h * 0.34, w * 0.03, h * 0.58, INK);
    line([[x + w * 0.3, y + h * 0.48], [x + w * 0.44, y + h * 0.48]], INK, 2.5);
    line([[x + w * 0.3, y + h * 0.64], [x + w * 0.44, y + h * 0.64]], INK, 2.5);
    poly([[cx - w * 0.05, y + h * 0.46], [cx, y + h * 0.02], [cx + w * 0.05, y + h * 0.46]], INK);
    rect(cx - w * 0.05, y + h * 0.46, w * 0.1, h * 0.3, INK);
    rect(cx - w * 0.05, y + h * 0.24, w * 0.1, h * 0.06, '#c52d28');
    ell(cx, y + h * 0.4, 3.2, 3.2, '#f2e3ba');
    poly([[cx - w * 0.05, y + h * 0.76], [cx - w * 0.11, y + h * 0.92], [cx - w * 0.05, y + h * 0.9]], INK);
    poly([[cx + w * 0.05, y + h * 0.76], [cx + w * 0.11, y + h * 0.92], [cx + w * 0.05, y + h * 0.9]], INK);
    poly([[cx - 5, y + h * 0.76], [cx, y + h * 1.02], [cx + 5, y + h * 0.76]], '#ec7e26');
    poly([[cx - 2.5, y + h * 0.76], [cx, y + h * 0.93], [cx + 2.5, y + h * 0.76]], '#fcd460');
    [[-0.16, 13], [-0.07, 16], [0.07, 15], [0.16, 12]].forEach(([ex, er]) => ell(cx + w * ex, y + h * 0.93, er / 2, er * 0.3, '#fdf6e0'));
  } else if (kind === 'drone') {
    vgrad(x, y, w, h, '#c4d4e8', '#e8ecf0');
    [[0.02, 0.14, 0.3], [0.18, 0.11, 0.42], [0.31, 0.15, 0.26], [0.48, 0.12, 0.38], [0.62, 0.16, 0.3], [0.8, 0.12, 0.44], [0.93, 0.09, 0.28]].forEach(([bx, bw, bh]) => {
      rect(x + w * bx, y + h - h * bh, w * bw, h * bh, '#586070');
      for (let wy = 0; wy < 2; wy++) for (let wx = 0; wx < 2; wx++)
        rect(x + w * (bx + 0.025 + wx * 0.05), y + h - h * bh + 4 + wy * 8, w * 0.02, 3, '#fade82');
    });
    [[-44, -16], [44, -16], [-44, 17], [44, 17]].forEach(([dx, dy]) => {
      line([[cx, cy - 4], [cx + dx, cy - 4 + dy]], '#2c3038', 2);
      ctx.strokeStyle = '#2c3038'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(cx + dx, cy - 4 + dy, 15, 3.5, 0, 0, Math.PI * 2); ctx.stroke();
    });
    rect(cx - 16, cy - 12, 32, 15, '#2c3038');
    ell(cx, cy + 5, 3.5, 2.5, '#c52d28');
  } else if (kind === 'oil') {
    vgrad(x, y, w, h, '#f0e6cc', '#faf4e2');
    ell(x + w * 0.82 + 7, y + h * 0.08 + 7, 7, 7, '#f6c45c');
    rect(x, y + h - 5, w, 5, '#968058');
    [[0.16, 0.85], [0.4, 1.05], [0.64, 0.7]].forEach(([fx, s]) => {
      const bx = x + w * fx, by = y + h - 4;
      line([[bx - 12 * s, by], [bx, by - h * 0.66 * s]], '#423e36', 2);
      line([[bx + 12 * s, by], [bx, by - h * 0.66 * s]], '#423e36', 2);
      line([[bx - 12 * s, by], [bx + 12 * s, by - h * 0.32 * s]], '#423e36', 1);
      line([[bx + 12 * s, by], [bx - 12 * s, by - h * 0.32 * s]], '#423e36', 1);
      line([[bx, by - h * 0.66 * s], [bx + 17 * s, by - h * 0.66 * s]], '#423e36', 2);
    });
    const px = x + w * 0.79, py = y + h - 4;
    poly([[px - 15, py], [px + 3, py - h * 0.62], [px + 18, py]], '#423e36');
    line([[px + 3, py - h * 0.62], [px - 22, py - h * 0.78]], '#423e36', 4);
    line([[px + 3, py - h * 0.62], [px + 20, py - h * 0.48]], '#423e36', 2);
    rect(px - 25, py - h * 0.84, 7, h * 0.14, '#423e36');
    [0.9, 0.95].forEach(bx => { rect(x + w * bx, y + h - 11, 7, 7, '#964628'); line([[x + w * bx, y + h - 8], [x + w * bx + 7, y + h - 8]], '#6e321c', 1); });
  } else if (kind === 'ship') {
    vgrad(x, y, w, h * 0.6, '#badc ee'.replace(' ', ''), '#e2f2fa');
    vgrad(x, y + h * 0.6, w, h * 0.4, '#6496ba', '#40709e');
    ell(x + w * 0.08 + 15, y + h * 0.13, 15, 4.5, '#fafafa'); ell(x + w * 0.08 + 20, y + h * 0.1, 10, 4.5, '#fafafa');
    poly([[x + w * 0.08, y + h * 0.56], [x + w * 0.88, y + h * 0.56], [x + w * 0.8, y + h * 0.76], [x + w * 0.18, y + h * 0.76]], '#2a3c52');
    ['#b23c28', '#346e46', '#246ea0'].forEach((c, i) => rect(x + w * (0.18 + i * 0.16), y + h * 0.4, w * 0.14, h * 0.16, c));
    rect(x + w * 0.72, y + h * 0.28, w * 0.08, h * 0.28, '#e8e6de');
    line([[x + w * 0.62, y + h * 0.4], [x + w * 0.62, y + h * 0.16]], '#3c3c3c', 1);
    poly([[x + w * 0.62, y + h * 0.16], [x + w * 0.7, y + h * 0.2], [x + w * 0.62, y + h * 0.24]], '#c83232');
    [0.24, 0.36, 0.48, 0.56].forEach((fx, i) => {
      const hx = x + w * fx, hy = y + h * 0.31;
      ell(hx, hy, 3, 3, '#463428');
      rect(hx - 4, hy + 3, 8, 6, i % 2 ? '#345478' : '#965a32');
    });
    ctx.strokeStyle = '#e0f0fa'; ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(x + 6 + i * w * 0.24 + w * 0.084, y + h * 0.88, w * 0.084, Math.PI, 2 * Math.PI); ctx.stroke(); }
  } else if (kind === 'radar') {
    vgrad(x, y, w, h, '#cfe0ee', '#e8f0f8');
    ell(x + w * 0.1, y + h * 0.2, 13, 4, '#ffffff'); ell(x + w * 0.86, y + h * 0.78, 15, 4, '#ffffff');
    ctx.save(); ctx.strokeStyle = '#c52d28'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(x + 2, y + h - 3); ctx.lineTo(x + w - 2, y + 3); ctx.stroke(); ctx.restore();
    const jet = (jx, jy, sc, col) => {
      const P = [[99, 18], [72, 11], [60, 6], [52, 10], [24, 10], [15, 1], [9, 11], [7, 17], [15, 19], [22, 26], [30, 20], [42, 20], [47, 33], [60, 20], [82, 21]];
      poly(P.map(([px, py]) => [jx + px * sc, jy + py * sc]), col);
    };
    jet(x + w * 0.06, y + h * 0.1, w * 0.0062, '#22364e');
    jet(x + w * 0.60, y + h * 0.02, w * 0.0028, '#5a7a9c');
  } else if (kind === 'candle') {
    vgrad(x, y, w, h, '#2c2632', '#423846');
    ctx.strokeStyle = '#786e80'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(x + w * 0.1, y + h * 0.08, w * 0.8, h * 0.92, 10); ctx.stroke();
    [[0.24, 0.5], [0.38, 0.66], [0.52, 0.44], [0.66, 0.6], [0.79, 0.48]].forEach(([fx, fh]) => {
      const bx = x + w * fx, top = y + h - 4 - h * fh;
      ell(bx, top - 3, 13, 12, 'rgba(150,110,80,0.35)');
      ell(bx, top - 2, 8, 8, 'rgba(190,140,90,0.4)');
      rect(bx - 5, top, 10, h * fh, '#eae6dc');
      rect(bx - 5, top, 3, 6, '#d6d0c6');
      poly([[bx, top - 13], [bx + 4.5, top - 3], [bx, top + 2], [bx - 4.5, top - 3]], '#f8b63e');
      ell(bx, top - 4, 1.8, 3, '#fceab0');
    });
  } else if (kind === 'factory') {
    vgrad(x, y, w, h, '#d8e2ea', '#eef2f6');
    ell(x + w * 0.72, y + h * 0.12, 16, 8, '#c4c6c8'); ell(x + w * 0.79, y + h * 0.07, 18, 7, '#d0d2d4');
    rect(x + w * 0.1, y + h * 0.48, w * 0.54, h * 0.52, '#6c747e');
    poly([[x + w * 0.1, y + h * 0.48], [x + w * 0.24, y + h * 0.3], [x + w * 0.38, y + h * 0.48], [x + w * 0.5, y + h * 0.3], [x + w * 0.64, y + h * 0.48]], '#606873');
    for (let i = 0; i < 4; i++) rect(x + w * (0.15 + i * 0.12), y + h * 0.58, w * 0.05, h * 0.14, '#e2ecf4');
    rect(x + w * 0.68, y + h * 0.18, w * 0.1, h * 0.82, '#5e666f');
    rect(x + w * 0.68, y + h * 0.18, w * 0.1, h * 0.08, '#964632');
    [[0.3, 0.2], [0.42, 0.3], [0.54, 0.16]].forEach(([fx, fh]) => {
      const bx = x + w * fx;
      poly([[bx, y + h * 0.44], [bx + 6, y + h * 0.44 - h * fh], [bx + 12, y + h * 0.44]], '#ea7a28');
      poly([[bx + 3, y + h * 0.44], [bx + 6, y + h * 0.44 - h * fh * 0.55], [bx + 9, y + h * 0.44]], '#fac850');
    });
  } else if (kind === 'gavel') {
    vgrad(x, y, w, h, '#f0e8d4', '#f8f2e2');
    line([[cx - w * 0.34, cy + h * 0.3], [cx + w * 0.1, cy - h * 0.12]], '#765228', 9);
    rect(cx + w * 0.02, cy - h * 0.34, w * 0.34, h * 0.3, '#926834');
    rect(cx + w * 0.02, cy - h * 0.34, w * 0.07, h * 0.3, '#6e4c22');
    rect(cx + w * 0.29, cy - h * 0.34, w * 0.07, h * 0.3, '#6e4c22');
    ctx.strokeStyle = '#b29669'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(cx + w * 0.1, cy - h * 0.2, 24, -0.9, 1.1); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx + w * 0.1, cy - h * 0.2, 31, -0.9, 1.1); ctx.stroke();
    rect(x + w * 0.12, y + h - 12, w * 0.76, 6, '#765228');
    rect(x + w * 0.24, y + h - 17, w * 0.52, 5, '#926834');
  } else if (kind === 'bomb') {
    vgrad(x, y, w, h, '#e4decf', '#f2eee2');
    rect(x, y + h * 0.86, w, h * 0.14, '#6e6250');
    poly([[x + w * 0.04, y + h * 0.86], [x + w * 0.04, y + h * 0.34], [x + w * 0.3, y + h * 0.34], [x + w * 0.3, y + h * 0.86]], INK);
    poly([[x + w * 0.72, y + h * 0.86], [x + w * 0.72, y + h * 0.46], [x + w * 0.96, y + h * 0.46], [x + w * 0.96, y + h * 0.86]], INK);
    const bx = x + w * 0.52, by = y + h * 0.36, pts = [];
    for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, r = i % 2 === 0 ? w * 0.21 : w * 0.1; pts.push([bx + r * Math.cos(a), by + r * Math.sin(a) * 0.85]); }
    poly(pts, '#ec7e26');
    ell(bx, by, 10, 8, '#fcd460');
    ell(x + w * 0.6, y + h * 0.1, 22, 10, '#9a968c'); ell(x + w * 0.7, y + h * 0.05, 26, 9, '#aeaaa0');
  } else if (kind === 'govt') {
    vgrad(x, y, w, h, '#dfe8f2', '#eef3f8');
    rect(x, y + h * 0.92, w, h * 0.08, INK);
    poly([[x + w * 0.15, y + h * 0.24], [x + w * 0.5, y + h * 0.02], [x + w * 0.85, y + h * 0.24]], INK);
    rect(x + w * 0.15, y + h * 0.24, w * 0.7, h * 0.06, INK);
    [0.21, 0.35, 0.49, 0.63, 0.77].forEach(fx => rect(x + w * fx, y + h * 0.3, w * 0.04, h * 0.52, INK));
    rect(x + w * 0.13, y + h * 0.82, w * 0.74, h * 0.1, INK);
    rect(x + w * 0.49, y + h * 0.0, w * 0.02, h * 0.05, INK);
    poly([[x + w * 0.51, y + h * 0.0], [x + w * 0.6, y + h * 0.025], [x + w * 0.51, y + h * 0.05]], '#c52d28');
  } else if (kind === 'tower') {
    vgrad(x, y, w, h, '#f2dfba', '#f8ecd2');
    ell(x + w * 0.1, y + h * 0.14, 9, 9, '#f6c45c');
    rect(x + w * 0.02, y + h * 0.5, w * 0.2, h * 0.5, '#6a7484');
    rect(x + w * 0.8, y + h * 0.58, w * 0.18, h * 0.42, '#6a7484');
    poly([[x + w * 0.36, y + h], [x + w * 0.42, y + h * 0.06], [x + w * 0.58, y + h * 0.06], [x + w * 0.64, y + h]], INK);
    for (let r = 0; r < 6; r++) for (let c = 0; c < 2; c++) rect(x + w * (0.455 + c * 0.055), y + h * (0.16 + r * 0.13), w * 0.035, h * 0.07, '#fade82');
    const bx = x + w * 0.56, by = y + h * 0.26, pts2 = [];
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6, r = i % 2 === 0 ? w * 0.09 : w * 0.045; pts2.push([bx + r * Math.cos(a), by + r * Math.sin(a)]); }
    poly(pts2, '#ec7e26'); ell(bx, by, 5, 5, '#fcd460');
    ell(x + w * 0.68, y + h * 0.12, 13, 6, '#9a968c'); ell(x + w * 0.75, y + h * 0.06, 16, 7, '#aeaaa0');
  } else if (kind === 'shield') {
    vgrad(x, y, w, h, '#20344d', '#2a4258');
    const sx = cx, sy = y + h * 0.05;
    poly([[sx - w * 0.17, sy], [sx + w * 0.17, sy], [sx + w * 0.17, sy + h * 0.48], [sx, sy + h * 0.88], [sx - w * 0.17, sy + h * 0.48]], '#d9a83f');
    poly([[sx - w * 0.125, sy + 6], [sx + w * 0.125, sy + 6], [sx + w * 0.125, sy + h * 0.45], [sx, sy + h * 0.74], [sx - w * 0.125, sy + h * 0.45]], '#f2e3ba');
    rect(sx - 3.5, sy + h * 0.18, 7, h * 0.32, INK);
    ell(sx, sy + h * 0.6, 4, 4, INK);
    [[0.1, 0.16], [0.9, 0.2], [0.14, 0.76], [0.86, 0.74]].forEach(([fx, fy]) => ell(x + w * fx, y + h * fy, 1.8, 1.8, '#f0f0e6'));
  } else if (kind === 'store') {
    vgrad(x, y, w, h, '#f4e8ce', '#faf2de');
    rect(x + w * 0.05, y + h * 0.3, w * 0.9, h * 0.7, INK);
    for (let i = 0; i < 7; i++) poly([[x + w * (0.03 + i * 0.135), y + h * 0.3], [x + w * (0.105 + i * 0.135), y + h * 0.3], [x + w * (0.095 + i * 0.135), y + h * 0.46], [x + w * (0.045 + i * 0.135), y + h * 0.46]], i % 2 ? '#f2ead8' : '#c52d28');
    rect(x + w * 0.12, y + h * 0.56, w * 0.26, h * 0.3, '#bcd2e4'); rect(x + w * 0.62, y + h * 0.56, w * 0.26, h * 0.3, '#bcd2e4');
    rect(x + w * 0.44, y + h * 0.56, w * 0.12, h * 0.44, '#d9a83f');
    rect(x + w * 0.05, y + h * 0.14, w * 0.9, h * 0.13, '#c52d28');
  } else if (kind === 'scales') {
    vgrad(x, y, w, h, '#f0e8d4', '#f8f2e2');
    rect(cx - 3, y + h * 0.1, 6, h * 0.68, '#765228');
    line([[cx - w * 0.38, y + h * 0.18], [cx + w * 0.38, y + h * 0.18]], '#765228', 5);
    ell(cx, y + h * 0.1, 6, 6, '#926834');
    [-1, 1].forEach(sd => {
      const px2 = cx + sd * w * 0.38;
      line([[px2, y + h * 0.18], [px2 - 15, y + h * 0.54]], '#926834', 1.6);
      line([[px2, y + h * 0.18], [px2 + 15, y + h * 0.54]], '#926834', 1.6);
      ctx.beginPath(); ctx.arc(px2, y + h * 0.54, 16, 0, Math.PI); ctx.fillStyle = '#926834'; ctx.fill();
    });
    rect(cx - w * 0.18, y + h * 0.8, w * 0.36, 6, '#765228');
    rect(cx - w * 0.1, y + h * 0.87, w * 0.2, 5, '#926834');
  } else if (kind === 'quake') {
    vgrad(x, y, w, h, '#e8e0cc', '#f4eedd');
    rect(x, y + h * 0.7, w, h * 0.3, '#a08a64');
    [[0.06, 0.42], [0.62, 0.36]].forEach(([fx, fh]) => {
      rect(x + w * fx, y + h * 0.7 - h * fh, w * 0.3, h * fh, INK);
      poly([[x + w * (fx - 0.03), y + h * 0.7 - h * fh], [x + w * (fx + 0.15), y + h * 0.7 - h * fh - h * 0.18], [x + w * (fx + 0.33), y + h * 0.7 - h * fh]], '#6e4630');
      rect(x + w * (fx + 0.06), y + h * 0.7 - h * fh * 0.62, w * 0.07, h * 0.12, '#fade82');
      rect(x + w * (fx + 0.18), y + h * 0.7 - h * fh * 0.62, w * 0.07, h * 0.12, '#fade82');
    });
    line([[x, y + h * 0.7], [x + w * 0.34, y + h * 0.7], [x + w * 0.42, y + h * 0.84], [x + w * 0.5, y + h * 0.7], [x + w, y + h * 0.7]], '#4a3a22', 4);
    line([[x + w * 0.42, y + h * 0.84], [x + w * 0.46, y + h * 0.97]], '#4a3a22', 3);
    ell(x + w * 0.52, y + h * 0.24, 15, 7, '#c8c2b2'); ell(x + w * 0.6, y + h * 0.16, 18, 8, '#d4cec0');
  } else if (kind === 'trade') {
    vgrad(x, y, w, h, '#e9eef2', '#f4f7f9');
    [[0.06, 0.5, 0.4, 0.4], [0.5, 0.5, 0.4, 0.4], [0.28, 0.14, 0.4, 0.34]].forEach(([fx, fy, fw, fh]) => {
      rect(x + w * fx, y + h * fy, w * fw, h * fh, '#8a6534');
      line([[x + w * (fx + fw / 2), y + h * fy], [x + w * (fx + fw / 2), y + h * (fy + fh)]], '#5e4423', 3);
      line([[x + w * fx, y + h * (fy + fh / 2)], [x + w * (fx + fw), y + h * (fy + fh / 2)]], '#5e4423', 2);
    });
    ell(x + w * 0.85, y + h * 0.22, 19, 19, '#b77a12');
    text('%', x + w * 0.85 - tw('%', F('SansB', 24)) / 2, y + h * 0.22 - 12, F('SansB', 24), '#ffffff');
  } else if (kind === 'ball') {
    vgrad(x, y, w, h, '#dceef4', '#eef6f9');
    rect(x, y + h * 0.6, w, h * 0.4, '#3e7d46');
    line([[x, y + h * 0.6], [x + w, y + h * 0.6]], '#f2f2ea', 2.5);
    line([[x + w * 0.05, y + h * 0.22], [x + w * 0.05, y + h * 0.88]], '#42525c', 3.5);
    line([[x + w * 0.05, y + h * 0.22], [x + w * 0.34, y + h * 0.22]], '#42525c', 3.5);
    line([[x + w * 0.34, y + h * 0.22], [x + w * 0.34, y + h * 0.88]], '#42525c', 3.5);
    ell(x + w * 0.68, y + h * 0.5, 24, 24, '#fcfcfa');
    ctx.strokeStyle = '#2c2c2c'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(x + w * 0.68, y + h * 0.5, 24, 24, 0, 0, Math.PI * 2); ctx.stroke();
    ell(x + w * 0.68, y + h * 0.5, 7, 7, '#2c2c2c');
    [[0.58, 0.36], [0.78, 0.36], [0.58, 0.64], [0.78, 0.64], [0.68, 0.28]].forEach(([fx, fy]) => ell(x + w * fx, y + h * fy, 3.6, 3.6, '#2c2c2c'));
  } else if (kind === 'crown') {
    vgrad(x, y, w, h, '#2c2440', '#3a2f52');
    [[0.08, 0.12], [0.9, 0.08], [0.8, 0.28], [0.14, 0.34], [0.94, 0.42]].forEach(([fx, fy]) => ell(x + w * fx, y + h * fy, 2, 2, '#f2e3ba'));
    poly([[cx - w * 0.26, y + h * 0.74], [cx - w * 0.29, y + h * 0.26], [cx - w * 0.14, y + h * 0.5], [cx, y + h * 0.18], [cx + w * 0.14, y + h * 0.5], [cx + w * 0.29, y + h * 0.26], [cx + w * 0.26, y + h * 0.74]], '#d9a83f');
    rect(cx - w * 0.26, y + h * 0.74, w * 0.52, h * 0.12, '#b77a12');
    [-0.17, 0, 0.17].forEach(fx => ell(cx + w * fx, y + h * 0.8, 4, 4, '#c52d28'));
    ell(cx, y + h * 0.22, 4.4, 4.4, '#f2e3ba'); ell(cx - w * 0.27, y + h * 0.3, 3.4, 3.4, '#f2e3ba'); ell(cx + w * 0.27, y + h * 0.3, 3.4, 3.4, '#f2e3ba');
  }

  ctx.restore();
  if (zone && zlabel) {
    const pf = F('SansB', 7), pw = tw(zlabel, pf) + 13;
    rr(x + 6, y + 6, pw, 13, 6.5, zone);
    text(zlabel, x + 6 + (pw - tw(zlabel, pf)) / 2, y + 9, pf, '#ffffff');
  }
  rrs(x, y, w, h, 5, '#968e7e', 1);
}

// ---------------- page ----------------
rect(0, 0, W, H, BG);
const MX = 24, CW = W - 2 * MX;

// masthead
rect(0, 0, W, 106, NAVY);
rect(0, 106, W, 3, GOLD);
{
  const gx = 60, gy = 30, gr = 22;
  ctx.strokeStyle = '#c7d8ea'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.ellipse(gx, gy, gr, gr, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(gx, gy, gr * 0.45, gr, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(gx, gy, gr, gr * 0.38, 0, 0, Math.PI * 2); ctx.stroke();
  line([[gx - gr, gy], [gx + gr, gy]], '#c7d8ea', 1);
  line([[gx - gr * 0.87, gy - gr * 0.5], [gx + gr * 0.87, gy - gr * 0.5]], '#c7d8ea', 0.75);
  line([[gx - gr * 0.87, gy + gr * 0.5], [gx + gr * 0.87, gy + gr * 0.5]], '#c7d8ea', 0.75);
  const coastM = JSON.parse(readFileSync(new URL('./mapdata2.json', import.meta.url)));
  const MX0 = 726, MY0 = 4, MW0 = 282, MH0 = 56;
  ctx.save(); ctx.beginPath(); ctx.rect(MX0, MY0, MW0, MH0); ctx.clip();
  for (const ring of coastM.rings) {
    const clat = ring.reduce((a, p) => a + p[1], 0) / ring.length;
    if (clat < -56) continue;
    poly(ring.map(([lon, lat]) => [MX0 + (lon + 180) / 360 * MW0, MY0 + (80 - lat) / 140 * MH0]), '#2c4a6b');
  }
  ctx.restore();
}
const mt = 'THE WORLD IN ONE DAY';
text(mt, (W - tw(mt, F('SerifXB', 40))) / 2, 13, F('SerifXB', 40), '#f5eedd');
line([[MX, 60], [W - MX, 60]], GOLD, 0.75);
const sub = 'WEDNESDAY 25 NOVEMBER 2026 · 38 STORIES · 3 COLOUR ZONES · EVERY ONE FROM THIS ONE DAY';
text(sub, (W - tw(sub, F('SansB', 11))) / 2, 72, F('SansB', 11), GOLDL);
const sub2 = 'EVERY STORY TAGGED FOR HOW SURE WE ARE — AND SOURCED';
text(sub2, (W - tw(sub2, F('Sans', 9.5))) / 2, 88, F('Sans', 9.5), '#b9c4d0');

// zone bar
const zones = [['ASIA-PACIFIC 6', ZA, 6], ['EUROPE · AFRICA · MIDDLE EAST 17', ZB, 17], ['AMERICAS 15', ZC, 15]];
let zx = MX;
for (const [lab, col, n] of zones) {
  const zw = CW * n / 38;
  rr(zx, 118, zw - 3, 20, 3, col);
  text(lab, zx + (zw - 3 - tw(lab, F('SansB', 11.5))) / 2, 122, F('SansB', 11.5), '#fcfaf4');
  zx += zw;
}

// UTC timeline
let tx = MX;
text('WEDNESDAY IN UTC', tx, 146, F('SansB', 10.5), RED);
tx += tw('WEDNESDAY IN UTC', F('SansB', 10.5)) + 12;
[['00:18', 'Shenzhou-24 lifts off'], ['MORNING', 'Shanghai loyalty pledge'], ['MIDDAY', 'Sarkozy trial ordered'], ['US DAY', 'Tariff plan reported'], ['TONIGHT', 'Miss Universe final']].forEach(([tm, lab], i, arr) => {
  text(tm, tx, 146, F('SansB', 10.5), INK); tx += tw(tm, F('SansB', 10.5)) + 4;
  text(lab, tx, 146, F('Sans', 10.5), '#34302a'); tx += tw(lab, F('Sans', 10.5)) + (i < arr.length - 1 ? 10 : 0);
  if (i < arr.length - 1) { text('·', tx, 146, F('Sans', 10.5), GREY); tx += 8; }
});

// numbers band
rr(MX, 164, CW, 50, 5, NAVY);
const stats = [['1ST', 'FOREIGNER ON TIANGONG'], ['4TH', 'POLITBURO PROBE SINCE 2025'], ['-6%', 'NVIDIA SHARES SLIDE'], ['11', 'HURT IN RIYADH STRIKE'], ['5-1', 'REAL MADRID ROUT PSV'], ['116', 'VIE FOR MISS UNIVERSE']];
stats.forEach(([num, lab], i) => {
  const sx = MX + i * CW / 6, sw = CW / 6;
  if (i > 0) line([[sx, 172], [sx, 206]], '#33506f', 1);
  text(num, sx + (sw - tw(num, F('SerifXB', 25))) / 2, 167, F('SerifXB', 25), '#f5eedd');
  text(lab, sx + (sw - tw(lab, F('SansB', 8))) / 2, 197, F('SansB', 8), GOLDL);
});

// cards
function illoSide(kind, x, y, w, h) {
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  const cx = x + w / 2, cy = y + h / 2;
  if (kind === 'rocket') {
    ell(x + w * 0.88, y + h * 0.16, 8, 8, '#f08c28');
    poly([[cx - w * 0.16, y + h * 0.42], [cx, y + h * 0.02], [cx + w * 0.16, y + h * 0.42]], INK);
    rect(cx - w * 0.16, y + h * 0.42, w * 0.32, h * 0.34, INK);
    rect(cx - w * 0.16, y + h * 0.2, w * 0.32, h * 0.07, '#c52d28');
    ell(cx, y + h * 0.36, 3.4, 3.4, '#f2e3ba');
    poly([[cx - w * 0.16, y + h * 0.76], [cx - w * 0.3, y + h * 0.96], [cx - w * 0.16, y + h * 0.94]], INK);
    poly([[cx + w * 0.16, y + h * 0.76], [cx + w * 0.3, y + h * 0.96], [cx + w * 0.16, y + h * 0.94]], INK);
    poly([[cx - 4.5, y + h * 0.76], [cx, y + h * 1.0], [cx + 4.5, y + h * 0.76]], '#ec7e26');
    poly([[cx - 2.2, y + h * 0.76], [cx, y + h * 0.92], [cx + 2.2, y + h * 0.76]], '#fcd460');
  } else if (kind === 'govt') {
    poly([[x + w * 0.04, y + h * 0.22], [x + w * 0.5, y + h * 0.02], [x + w * 0.96, y + h * 0.22]], INK);
    rect(x + w * 0.04, y + h * 0.22, w * 0.92, h * 0.07, INK);
    [0.1, 0.28, 0.46, 0.64, 0.82].forEach(fx => rect(x + w * fx, y + h * 0.29, w * 0.07, h * 0.56, INK));
    rect(x + w * 0.02, y + h * 0.85, w * 0.96, h * 0.1, INK);
    poly([[x + w * 0.52, y + h * 0.0], [x + w * 0.66, y + h * 0.03], [x + w * 0.52, y + h * 0.07]], '#c52d28');
  } else if (kind === 'gavel') {
    line([[x + w * 0.08, y + h * 0.86], [cx + w * 0.06, y + h * 0.4]], '#765228', 8);
    rect(cx - w * 0.04, y + h * 0.06, w * 0.52, h * 0.34, '#926834');
    rect(cx - w * 0.04, y + h * 0.06, w * 0.1, h * 0.34, '#6e4c22');
    rect(cx + w * 0.38, y + h * 0.06, w * 0.1, h * 0.34, '#6e4c22');
    ctx.strokeStyle = '#b29669'; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.arc(cx + w * 0.1, y + h * 0.22, 20, -0.9, 1.1); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx + w * 0.1, y + h * 0.22, 26, -0.9, 1.1); ctx.stroke();
    rect(x + w * 0.06, y + h - 8, w * 0.88, 5, '#765228');
  } else if (kind === 'tower') {
    rect(x + w * 0.02, y + h * 0.52, w * 0.18, h * 0.48, '#6a7484');
    rect(x + w * 0.82, y + h * 0.6, w * 0.16, h * 0.4, '#6a7484');
    poly([[x + w * 0.34, y + h], [x + w * 0.41, y + h * 0.05], [x + w * 0.59, y + h * 0.05], [x + w * 0.66, y + h]], INK);
    for (let r = 0; r < 5; r++) for (let c = 0; c < 2; c++) rect(x + w * (0.445 + c * 0.06), y + h * (0.16 + r * 0.15), w * 0.04, h * 0.08, '#e8a33d');
    const bx = x + w * 0.58, by = y + h * 0.24, pts2 = [];
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6, r = i % 2 === 0 ? w * 0.11 : w * 0.05; pts2.push([bx + r * Math.cos(a), by + r * Math.sin(a)]); }
    poly(pts2, '#ec7e26'); ell(bx, by, 4.5, 4.5, '#fcd460');
    ell(x + w * 0.72, y + h * 0.08, 11, 5, '#aeaaa0');
  } else if (kind === 'chart') {
    line([[x + 2, y + h - 4], [x + w - 2, y + h - 4]], '#c9c2ae', 1.5);
    const pts = [[0.02, 0.3], [0.2, 0.18], [0.38, 0.34], [0.55, 0.3], [0.72, 0.55], [0.88, 0.78], [0.98, 0.88]].map(([fx, fy]) => [x + w * fx, y + h * fy]);
    line(pts, '#c52d28', 3.5);
    poly([[x + w * 0.98, y + h * 0.88], [x + w * 0.86, y + h * 0.86], [x + w * 0.95, y + h * 0.72]], '#c52d28');
    ell(x + w * 0.2, y + h * 0.18, 3, 3, '#3e7d46');
  } else if (kind === 'shield') {
    const sx = cx, sy = y + h * 0.03;
    poly([[sx - w * 0.3, sy], [sx + w * 0.3, sy], [sx + w * 0.3, sy + h * 0.5], [sx, sy + h * 0.94], [sx - w * 0.3, sy + h * 0.5]], '#d9a83f');
    poly([[sx - w * 0.22, sy + 5], [sx + w * 0.22, sy + 5], [sx + w * 0.22, sy + h * 0.47], [sx, sy + h * 0.79], [sx - w * 0.22, sy + h * 0.47]], '#f2e3ba');
    rect(sx - 3, sy + h * 0.18, 6, h * 0.34, INK);
    ell(sx, sy + h * 0.62, 3.6, 3.6, INK);
  } else if (kind === 'bomb') {
    poly([[x + w * 0.02, y + h], [x + w * 0.02, y + h * 0.44], [x + w * 0.26, y + h * 0.44], [x + w * 0.26, y + h]], INK);
    poly([[x + w * 0.76, y + h], [x + w * 0.76, y + h * 0.56], [x + w * 0.98, y + h * 0.56], [x + w * 0.98, y + h]], INK);
    const bx = x + w * 0.52, by = y + h * 0.34, pts = [];
    for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, r = i % 2 === 0 ? w * 0.24 : w * 0.11; pts.push([bx + r * Math.cos(a), by + r * Math.sin(a) * 0.85]); }
    poly(pts, '#ec7e26');
    ell(bx, by, 8, 6.5, '#fcd460');
    ell(x + w * 0.62, y + h * 0.06, 16, 7, '#aeaaa0');
  } else if (kind === 'store') {
    rect(x + w * 0.03, y + h * 0.3, w * 0.94, h * 0.7, INK);
    for (let i = 0; i < 7; i++) poly([[x + w * (0.01 + i * 0.14), y + h * 0.3], [x + w * (0.085 + i * 0.14), y + h * 0.3], [x + w * (0.075 + i * 0.14), y + h * 0.47], [x + w * (0.025 + i * 0.14), y + h * 0.47]], i % 2 ? '#f2ead8' : '#c52d28');
    rect(x + w * 0.1, y + h * 0.58, w * 0.27, h * 0.3, '#bcd2e4'); rect(x + w * 0.63, y + h * 0.58, w * 0.27, h * 0.3, '#bcd2e4');
    rect(x + w * 0.44, y + h * 0.58, w * 0.12, h * 0.42, '#d9a83f');
    rect(x + w * 0.03, y + h * 0.13, w * 0.94, h * 0.14, '#c52d28');
  } else if (kind === 'scales') {
    rect(cx - 2.5, y + h * 0.08, 5, h * 0.7, '#765228');
    line([[cx - w * 0.42, y + h * 0.16], [cx + w * 0.42, y + h * 0.16]], '#765228', 4.5);
    ell(cx, y + h * 0.08, 5, 5, '#926834');
    [-1, 1].forEach(sd => {
      const px2 = cx + sd * w * 0.42;
      line([[px2, y + h * 0.16], [px2 - 12, y + h * 0.55]], '#926834', 1.4);
      line([[px2, y + h * 0.16], [px2 + 12, y + h * 0.55]], '#926834', 1.4);
      ctx.beginPath(); ctx.arc(px2, y + h * 0.55, 13, 0, Math.PI); ctx.fillStyle = '#926834'; ctx.fill();
    });
    rect(cx - w * 0.2, y + h * 0.82, w * 0.4, 5, '#765228');
  } else if (kind === 'quake') {
    [[0.02, 0.46], [0.6, 0.4]].forEach(([fx, fh]) => {
      rect(x + w * fx, y + h * 0.72 - h * fh, w * 0.36, h * fh, INK);
      poly([[x + w * (fx - 0.03), y + h * 0.72 - h * fh], [x + w * (fx + 0.18), y + h * 0.72 - h * fh - h * 0.2], [x + w * (fx + 0.39), y + h * 0.72 - h * fh]], '#6e4630');
      rect(x + w * (fx + 0.07), y + h * 0.72 - h * fh * 0.6, w * 0.08, h * 0.13, '#fade82');
      rect(x + w * (fx + 0.21), y + h * 0.72 - h * fh * 0.6, w * 0.08, h * 0.13, '#fade82');
    });
    line([[x, y + h * 0.72], [x + w, y + h * 0.72]], '#4a3a22', 3.5);
    line([[x + w * 0.3, y + h * 0.72], [x + w * 0.38, y + h * 0.86], [x + w * 0.44, y + h * 0.72]], '#4a3a22', 3);
    ell(x + w * 0.5, y + h * 0.18, 12, 5.5, '#c8c2b2');
  } else if (kind === 'trade') {
    [[0.02, 0.48, 0.44, 0.44], [0.54, 0.48, 0.44, 0.44], [0.28, 0.1, 0.44, 0.36]].forEach(([fx, fy, fw, fh]) => {
      rect(x + w * fx, y + h * fy, w * fw, h * fh, '#8a6534');
      line([[x + w * (fx + fw / 2), y + h * fy], [x + w * (fx + fw / 2), y + h * (fy + fh)]], '#5e4423', 2.5);
      line([[x + w * fx, y + h * (fy + fh / 2)], [x + w * (fx + fw), y + h * (fy + fh / 2)]], '#5e4423', 1.5);
    });
    ell(x + w * 0.86, y + h * 0.2, 15, 15, '#b77a12');
    text('%', x + w * 0.86 - tw('%', F('SansB', 19)) / 2, y + h * 0.2 - 9.5, F('SansB', 19), '#ffffff');
  } else if (kind === 'ball') {
    rect(x, y + h * 0.78, w, h * 0.22, '#3e7d46');
    line([[x + w * 0.04, y + h * 0.14], [x + w * 0.04, y + h * 0.78]], '#42525c', 3);
    line([[x + w * 0.04, y + h * 0.14], [x + w * 0.36, y + h * 0.14]], '#42525c', 3);
    line([[x + w * 0.36, y + h * 0.14], [x + w * 0.36, y + h * 0.78]], '#42525c', 3);
    ell(x + w * 0.7, y + h * 0.46, 20, 20, '#fcfcfa');
    ctx.strokeStyle = '#2c2c2c'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(x + w * 0.7, y + h * 0.46, 20, 20, 0, 0, Math.PI * 2); ctx.stroke();
    ell(x + w * 0.7, y + h * 0.46, 5.5, 5.5, '#2c2c2c');
    [[0.615, 0.33], [0.785, 0.33], [0.7, 0.635]].forEach(([fx, fy]) => ell(x + w * fx, y + h * fy, 2.4, 2.4, '#2c2c2c'));
  } else if (kind === 'crown') {
    poly([[cx - w * 0.34, y + h * 0.72], [cx - w * 0.38, y + h * 0.22], [cx - w * 0.18, y + h * 0.48], [cx, y + h * 0.14], [cx + w * 0.18, y + h * 0.48], [cx + w * 0.38, y + h * 0.22], [cx + w * 0.34, y + h * 0.72]], '#d9a83f');
    rect(cx - w * 0.34, y + h * 0.72, w * 0.68, h * 0.13, '#b77a12');
    [-0.22, 0, 0.22].forEach(fx => ell(cx + w * fx, y + h * 0.79, 3.6, 3.6, '#c52d28'));
    ell(cx, y + h * 0.18, 4, 4, '#b77a12'); ell(cx - w * 0.36, y + h * 0.26, 3, 3, '#b77a12'); ell(cx + w * 0.36, y + h * 0.26, 3, 3, '#b77a12');
  }
  ctx.restore();
}

function cardPH(w, headline, dek, big = false) {
  const iw = Math.round(w * 0.40), ih = big ? 82 : 54;
  const hf = F(big ? 'SerifB' : 'SansB', big ? 15 : 11.5);
  const hl = wrap2(headline, hf, w, w).length;
  const df = F('Sans', big ? 10 : 9);
  const dl = wrap(dek, df, w - iw - 10).length;
  const bodyH = Math.max(ih, dl * (big ? 13 : 11.5));
  return 15 + 4 + hl * (big ? 19 : 15) + 3 + bodyH + 4 + 12;
}

function card2(x, y, w, num, zone, ill, headline, dek, tag, source, big = false, forceH = 0) {
  const iw = Math.round(w * 0.40), ih = big ? 82 : 54;
  const hf = F(big ? 'SerifB' : 'SansB', big ? 15 : 11.5);
  const hl = wrap2(headline, hf, w, w).length;
  const df = F('Sans', big ? 10 : 9);
  const dl = wrap(dek, df, w - iw - 10).length;
  const bodyH = Math.max(ih, dl * (big ? 13 : 11.5));
  const pH = forceH || (15 + 4 + hl * (big ? 19 : 15) + 3 + bodyH + 4 + 12);
  rr(x - 6, y - 6, w + 12, pH + 12, 6, '#ffffff');
  rrs(x - 6, y - 6, w + 12, pH + 12, 6, '#ddd3ba', 1);
  const cr = big ? 8.5 : 7.5;
  ell(x + cr, y + cr, cr, cr, zone);
  const nf = F('SansB', big ? 10 : 8.5), nt = String(num);
  text(nt, x + cr - tw(nt, nf) / 2, y + cr - (big ? 5.5 : 4.5), nf, '#ffffff');
  const zl = { [ZA]: 'ASIA-PACIFIC', [ZB]: 'EUROPE · AFRICA · MIDEAST', [ZC]: 'AMERICAS' }[zone];
  const zf = F('SansB', 8), zw = tw(zl, zf);
  rr(x + cr * 2 + 5, y - 1, zw + 12, 15, 7, zone);
  text(zl, x + cr * 2 + 11, y + 2.5, zf, '#ffffff');
  let ty = y + 19;
  wrap2(headline, hf, w, w).forEach(ln => { text(ln, x, ty, hf, INK); ty += big ? 19 : 15; });
  ty += 3;
  block(dek, x, ty, df, w - iw - 10, big ? 13 : 11.5, '#34302a');
  illoSide(ill, x + w - iw, ty, iw, ih);
  ty += bodyH + 4;
  const tf = F('SansB', 8);
  text(tag, x, ty + 1, tf, tag === 'CLAIM' ? RED : INK);
  text('— ' + source, x + tw(tag, tf) + 5, ty + 1, F('Sans', 8.5), GREY);
  return pH;
}
const CW3 = Math.floor((CW - 20) / 3), R1Y = 220;
const heroes = [
  [1, ZA, 'rocket', 'SHENZHOU-24 CARRIES FIRST FOREIGNER TO TIANGONG', "Long March 2F lifted off at 00:18 UTC from Jiuquan. Pakistan's Zeeshan Ali is the first foreign astronaut aboard Tiangong, flying with Tang Hongbo and Wu Yi.", 'CONFIRMED', 'Reuters · Xinhua'],
  [2, ZA, 'govt', 'SHANGHAI PLEDGES LOYALTY AS PARTY CHIEF FACES PROBE', "The city's leaders backed the probe into Chen Jining, 62 — the fourth Politburo member investigated since 2025. The probe was announced on Tuesday.", 'REPORTED', 'Reuters · Xinhua'],
  [3, ZC, 'gavel', 'HUAWEI GUILTY OF STEALING TRADE SECRETS IN US TRIAL', 'A Brooklyn jury convicted Huawei on 10 of 12 counts — bank fraud, sanctions breaches and trade-secret theft. It was cleared of racketeering.', 'CONFIRMED', 'Reuters'],
];
const heroH = Math.max(...heroes.map(c => cardPH(CW3, c[3], c[4], true)));
heroes.forEach((c, i) => card2(MX + i * (CW3 + 10), R1Y, CW3, ...c, true, heroH));
const CW5 = Math.floor((CW - 32) / 5);
const row2 = [
  [4, ZB, 'tower', 'WORLD CONDEMNS RIYADH TOWER STRIKE', 'Pakistan and the UAE condemned the Houthi attack on the PIF Tower that hurt 11 on Tuesday.', 'REPORTED', 'Al Jazeera'],
  [5, ZC, 'chart', 'NVIDIA BOUNCE FADES, SHARES SLIDE 6%', "The relief rally over Huang's return fizzled: Nvidia fell about 6%, the Nasdaq 1.5%.", 'CONFIRMED', 'Reuters'],
  [6, ZB, 'shield', 'POLAND SUMMONS RUSSIAN ENVOY', 'Kh-101 missile debris was found on Polish soil and a drone crossed its airspace; NATO plans AWACS.', 'REPORTED', 'Reuters · wires'],
  [7, ZB, 'bomb', 'RUSSIAN STRIKE KILLS 2, WOUNDS 48', 'A night attack on Zaporizhzhia hit the southern Ukrainian city as both sides traded long-range strikes.', 'CONFIRMED', 'AP'],
  [8, ZC, 'store', 'GUNMEN SEIZE 25 HOSTAGES IN CARTAGENA', 'Armed men took hostages in a supermarket after a failed armoured-truck robbery, police said.', 'CONFIRMED', 'AP'],
];
const row2Y = R1Y + heroH + 24;
const row2H = Math.max(...row2.map(c => cardPH(CW5, c[3], c[4], false)));
row2.forEach((c, i) => card2(MX + i * (CW5 + 8), row2Y, CW5, ...c, false, row2H));
const row3 = [
  [9, ZB, 'scales', 'SARKOZY AND WIFE ORDERED TO STAND TRIAL', "Sarkozy and Carla Bruni face trial over Libyan funding of his 2007 campaign; first hearing 1 April 2027.", 'CONFIRMED', 'Reuters · wires'],
  [10, ZA, 'quake', '5.3 QUAKE SHAKES NEPAL, FELT IN INDIA', 'The quake struck near Lelep in Koshi Province; tremors were felt across the border in India.', 'CONFIRMED', 'USGS · wires'],
  [11, ZC, 'trade', 'TRUMP SET TO UNVEIL NEW TARIFFS', 'A Section 301 probe targets excess capacity in 16 partners; the duties would replace lapsed global tariffs.', 'REPORTED', 'Reuters'],
  [12, ZB, 'ball', 'REAL MADRID ROUT PSV 5-1', 'Madrid came from behind to rout PSV in the Champions League and keep a perfect start to the league phase.', 'CONFIRMED', 'Reuters'],
  [13, ZC, 'crown', 'MISS UNIVERSE CROWNS ITS 75TH WINNER', '116 women competed in San Juan, Puerto Rico, as Fátima Bosch prepared to pass on the crown.', 'CONFIRMED', 'AP'],
];
const row3Y = row2Y + row2H + 24;
const row3H = Math.max(...row3.map(c => cardPH(CW5, c[3], c[4], false)));
row3.forEach((c, i) => card2(MX + i * (CW5 + 8), row3Y, CW5, ...c, false, row3H));

// bottom: map + ALSO (top-4 style)
const BY = row3Y + row3H + 28;
text('WHERE IT HAPPENED', MX, BY, F('SerifB', 13), INK);
text('ALSO ON WEDNESDAY 25 NOVEMBER — 25 MORE STORIES', MX + 400, BY, F('SerifB', 13), INK);
const MAPX = MX, MAPY = BY + 20, MAPW = 376, MAPH = 974 - (BY + 20) - 24;
rect(MAPX, MAPY, MAPW, MAPH, SEA);
const mapdata = JSON.parse(readFileSync(new URL('./mapdata25.json', import.meta.url)));
const ll = (lon, lat) => [MAPX + (lon + 180) / 360 * MAPW, MAPY + (80 - lat) / 140 * MAPH];
const coast = JSON.parse(readFileSync(new URL('./mapdata2.json', import.meta.url)));
ctx.save(); ctx.beginPath(); ctx.rect(MAPX, MAPY, MAPW, MAPH); ctx.clip();
for (const ring of coast.rings) {
  const clat = ring.reduce((a, p) => a + p[1], 0) / ring.length;
  if (clat < -56) continue;
  const lons = ring.map(p => p[0]), lats = ring.map(p => p[1]);
  const bw = Math.max(...lons) - Math.min(...lons), bh = Math.max(...lats) - Math.min(...lats);
  if (bw < 1.1 && bh < 1.1) continue;
  const raw = ring.map(([lon, lat]) => ll(lon, lat));
  const simp = [raw[0]];
  for (let i = 1; i < raw.length; i++) {
    const px = raw[i][0], py = raw[i][1], qx = simp[simp.length - 1][0], qy = simp[simp.length - 1][1];
    if (Math.hypot(px - qx, py - qy) >= 1.15) simp.push(raw[i]);
  }
  const subs = [[simp[0]]];
  for (let i = 1; i < simp.length; i++) {
    const px = simp[i][0], py = simp[i][1], q = subs[subs.length - 1][subs[subs.length - 1].length - 1];
    if (Math.hypot(px - q[0], py - q[1]) > 90) subs.push([simp[i]]);
    else subs[subs.length - 1].push(simp[i]);
  }
  for (const sub of subs) {
    if (sub.length < 3) continue;
    poly(sub, LAND);
    ctx.strokeStyle = '#a68d4f'; ctx.lineWidth = 0.6; ctx.beginPath();
    sub.forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py));
    ctx.closePath(); ctx.stroke();
  }
}
ctx.restore();
rrs(MAPX, MAPY, MAPW, MAPH, 4, '#968e7e', 1);
const ZMAP = { ZA, ZB, ZC };
for (const [num, lon, lat, z] of mapdata.pins) {
  const [px, py] = ll(lon, lat);
  ell(px, py, 6.5, 6.5, ZMAP[z]);
  ctx.strokeStyle = '#faf8f0'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(px, py, 6.5, 6.5, 0, 0, Math.PI * 2); ctx.stroke();
  const nt = String(num), fnt = F('SansB', num < 10 ? 7 : 6);
  text(nt, px - tw(nt, fnt) / 2, py - 3.5, fnt, '#ffffff');
}
text('Pins 1–13 = the illustrated stories; pin colours match the three zones above.', MAPX, MAPY + MAPH + 4, F('Sans', 8.5), GREY);

const liners = [
  [14, ZB, 'STOCKHOLM — Vote on Kristersson ends months of no government (wires).'],
  [15, ZB, 'JERUSALEM — Eisenkot party signs first coalition deal (wires).'],
  [16, ZB, 'ADEN — Houthis close to 60 km from Yemen\'s government seat (wires).'],
  [17, ZB, 'HORMUZ — Iran sets 7 conditions for US talks; rial plunges (wires).'],
  [18, ZB, 'BALTIC — Kyiv confirms strike on Russian cargo ship Sparta II (wires).'],
  [19, ZB, 'LONDON — UK sanctions Myanmar generals after Rohingya ruling (BBC).'],
  [20, ZB, 'PRETORIA — Zimbabwean convicted of trying to join Russia\'s war (BBC).'],
  [21, ZB, 'ANTALYA — COP31 chief blames EU for the talks\' failure (BBC).'],
  [22, ZB, 'BERLIN — Ifo business morale index 90.6 in November (wires).'],
  [23, ZB, 'BRUSSELS — EU agrees 22nd Russia sanctions pack; 60 banks hit (wires).'],
  [24, ZB, 'LONDON — Two arrested over break-in at Prince William\'s home (wires).'],
  [25, ZB, 'VATICAN — Pope\'s diary tells of decades-long spiritual crisis (wires).'],
  [26, ZA, 'ISLAMABAD — Pakistan condemns Houthi attack on Riyadh tower (wires).'],
  [27, ZA, 'TOKYO — Nikkei seen at 65,000 by June 2027 in Reuters poll (Reuters).'],
  [28, ZC, 'LANGLEY — CIA says breach hit its open-source intel network (NYT · AP).'],
  [29, ZC, 'WASHINGTON — Shein to pay $100m to settle FTC deception claims (wires).'],
  [30, ZC, 'CHICAGO — Radar fault delays flights into O\'Hare, FAA says (wires).'],
  [31, ZC, 'MILWAUKEE — Bucks end 13-game skid; Herro scores 32 (Reuters).'],
  [32, ZC, 'WASHINGTON — Giuliani gets Medal of Freedom; turkeys pardoned (wires).'],
  [33, ZC, 'FORT HOOD — Hasan seeks a stay of execution (wires).'],
  [34, ZC, 'WASHINGTON — Soldier admits selling military info to China (wires).'],
  [35, ZC, 'CALIFORNIA — Extreme flooding threatens the state (wires).'],
  [36, ZC, 'MEXICO CITY — Inflation hits a six-month high at 3.96% (wires).'],
  [37, ZC, 'NEW YORK — Consumer confidence jumps to a two-year high (wires).'],
  [38, ZA, 'NEW DELHI — BJP and Akali Dal reunite for 2027 Punjab elections (wires).'],
];
const LW2 = Math.floor((CW - 400 - 16) / 2);
for (let col = 0; col < 2; col++) {
  let yy = BY + 21;
  for (let r = 0; r < 13; r++) {
    const idx = col * 13 + r;
    if (idx >= liners.length) break;
    const [n, zc, txt] = liners[idx];
    const lx = MX + 400 + col * (LW2 + 16);
    rr(lx, yy, 16, 11, 2, zc);
    const nt = String(n), fnt = F('SansB', 7.5);
    const [lab, rest] = txt.split(' — ');
    ctx.textBaseline = 'alphabetic';
    const bl = yy + 8.2;
    ctx.font = fnt; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left';
    ctx.fillText(nt, lx + 8 - tw(nt, fnt) / 2, bl);
    ctx.font = F('SansB', 7.2); ctx.fillStyle = INK;
    ctx.fillText(lab, lx + 20, bl);
    ctx.font = F('Sans', 7.2); ctx.fillStyle = '#34302a';
    ctx.fillText('— ' + rest, lx + 20 + tw(lab, F('SansB', 7.2)) + 3, bl);
    ctx.textBaseline = 'top';
    yy += (974 - 10 - (BY + 21)) / 13;
  }
}

// date check
const DY = 974;
rrs(MX, DY, CW, 42, 4, RED, 2);
rect(MX, DY, 104, 42, RED);
text('DATE', MX + 9, DY + 6, F('SansB', 13), '#ffffff');
text('CHECK', MX + 9, DY + 23, F('SansB', 13), '#ffffff');
block("Left out — earlier days: Gaza strike kills Hamas security chief (Tue 24) · Sanofi buys Insmed for $41bn (Tue 24) · Hormuz tanker claim (Tue 24) · Hasina sets Dec 16 return (Tue 24) · COP31 collapses (Sun 22) · Huang's Nvidia reinstatement rally (Mon 23) · Merkury sinking (23 Nov). Wires read to 05:00 UTC, Wed 25 Nov.   TAGS: CONFIRMED = 2+ wires · OFFICIAL = on the record · REPORTED = one outlet · CLAIM = one side says · ONGOING = still unfolding.",
  MX + 116, DY + 5, F('Sans', 8.5), CW - 128, 11, '#34302a');

// export: Skia master 2048 -> Sharp lanczos3 -> final 1024
const master = await canvas.png;
await sharp(master).png().toFile(new URL('./poster-2048.png', import.meta.url).pathname);
await sharp(master).resize(1024, 1024, { kernel: 'lanczos3' }).png().toFile(new URL('./entry.png', import.meta.url).pathname);
console.log('rendered: poster-2048.png + entry.png');
