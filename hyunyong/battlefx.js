// 전투 무대: 자동 전투에서 일어난 일을 도트 이펙트로 보여 준다.
// 이펙트는 pixelfx (MIT, github.com/patch-gg/pixelfx) 를 ./pixelfx 에 복사해 쓴다. 라이선스는 ./pixelfx/LICENSE 참고.
// 게임 본체(index.html)는 window.BattleFX 가 없어도 그대로 돌아간다. 이 파일은 보여 주기만 한다.

import { createFrame, clearFrame, createFx, composite, painterFor, stockActor, HERO2, DUMMY_PAL, hex } from "./pixelfx/src/core/index.js";
import * as swordSlash from "./pixelfx/src/fx/melee/sword-slash.js";
import * as hitSpark from "./pixelfx/src/fx/impacts/hit-spark.js";
import * as critHit from "./pixelfx/src/fx/impacts/crit-hit.js";
import * as bluntHit from "./pixelfx/src/fx/impacts/blunt-hit.js";
import * as heal from "./pixelfx/src/fx/holy/heal.js";
import * as soulRise from "./pixelfx/src/fx/spawn/soul-rise.js";
import * as poof from "./pixelfx/src/fx/spawn/poof.js";
import * as damageNumber from "./pixelfx/src/fx/ui/damage-number.js";
import * as critNumber from "./pixelfx/src/fx/ui/crit-number.js";
import * as levelUp from "./pixelfx/src/fx/ui/level-up.js";
import * as arrow from "./pixelfx/src/fx/projectiles/arrow.js";
import * as magicMissile from "./pixelfx/src/fx/projectiles/magic-missile.js";

const W = 320, H = 132, GROUND = 114;
const ALLY_X = [120, 94, 68, 42], ENEMY_X = [206, 242, 278];

/* ---------- 겉모습 ---------- */
// 아군: 라이브러리의 기본 캐릭터(24x38)를 직업 색으로 물들인다
const ROLE_TINT = { "전사": "#7fa2e8", "궁수": "#7ed08a", "마법사": "#b48cf0", "사제": "#f2dc9a" };
const STAR_MARK = { 1: "#9aa5b1", 2: "#5fd08a", 3: "#5bb0f0", 4: "#b07cf0", 5: "#f5c542" };
const ch3 = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const toHex = (r, g, b) => "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
function heroPal(role, star) {
  const t = ch3(ROLE_TINT[role] || "#c0c4cc"), pal = {};
  for (const [k, v] of Object.entries(DUMMY_PAL)) {
    if (k === "k") { pal[k] = v; continue; }
    if (k === "m") { pal[k] = STAR_MARK[star] || STAR_MARK[1]; continue; }
    const c = ch3(v); pal[k] = toHex(c[0] * (0.4 + 0.6 * t[0] / 255), c[1] * (0.4 + 0.6 * t[1] / 255), c[2] * (0.4 + 0.6 * t[2] / 255));
  }
  return pal;
}
// 적: 16x16 도트 네 종. 이름으로 종류를 고른다
const MON = {
  slime: ["................", "................", "................", "......KKKK......", "....KKLLLLKK....", "...KLLLLLLLLK...", "..KLLWKLLWKLLK..", "..KLLKKLLKKLLK..", "..KEEEEEEEEEEK..", "..KEEEEKKEEEEK..", "..KEEEEEEEEEEK..", "..KDEEEEEEEEDK..", "..KDDEEEEEEDDK..", "...KDDDDDDDDK...", "....KKKKKKKK....", "................"],
  golem: [".....KKKKKK.....", "....KEEEEEEK....", "....KEWKKWEK....", "....KEEEEEEK....", "..KKKKEEEEKKKK..", ".KDDDKEEEEKEEEK.", ".KDLDKEEEEKEEEK.", ".KDDDKDEEDKEEEK.", ".KDLDKEEEEKKKKK.", ".KDDDKDEEDK.....", ".KDDDKEEEEK.....", "..KKKKEEEEK.....", ".....KDKKDK.....", ".....KEKKEK.....", "....KEEKKEEK....", "....KKKKKKKK...."],
  eye: ["................", ".....KKKKKK.....", "...KKDDDDDDKK...", "..KDDDDDDDDDDK..", ".KDDDKKKKKKDDDK.", ".KDDKWWWWWWKDDK.", ".KDKWWKEEKWWKDK.", ".KDKWWKEEKWWKDK.", ".KDDKWWWWWWKDDK.", ".KDDDKKKKKKDDDK.", "..KDDDDDDDDDDK..", "...KKDDLLDDKK...", ".....KDLLDK.....", "....KDDKKDDK....", "...KDK....KDK...", "...KK......KK..."],
  beast: ["..KK........KK..", ".KLLK......KLLK.", ".KLLLK....KLLLK.", "..KLLKKKKKKLLK..", "...KKEEEEEEKK...", "...KEEEEEEEEK...", "..KEEWKEEKWEEK..", "..KEEKKEEKKEEK..", "..KEEEEEEEEEEK..", "..KEEKKKKKKEEK..", "...KEEEEEEEEK...", "..KKKKEEEEKKKK..", ".KEEEKEEEEKEEEK.", ".KEEKKEEEEKKEEK.", "....KEEKKEEK....", "....KKKK.KKKK..."],
};
const MON_COLORS = [["#4caf50", "#8bd98f", "#2e7d32"], ["#e85d4a", "#ffa38f", "#9c2f22"], ["#c9973a", "#e8c87a", "#7a5a1e"], ["#9aa9b8", "#d7dfe8", "#5c6a78"], ["#4a86e8", "#9dc0ff", "#2b4f9c"], ["#8f6fd1", "#c7b2f2", "#3a2a63"]];
function monsterLook(name) {
  const n = name.replace("👑 우두머리 ", "");
  let kind = "slime";
  if (/골렘|기사|가고일|수호자|광부|리자드맨/.test(n)) kind = "golem";
  else if (/망령|정령|마수|거미|살라만더/.test(n)) kind = "eye";
  else if (/드래곤|와이번|늑대|예티|들개|멧돼지|고블린|개구리/.test(n)) kind = "beast";
  let hsh = 0; for (const c of n) hsh = (hsh * 31 + c.charCodeAt(0)) >>> 0;
  const [e, l, d] = MON_COLORS[hsh % MON_COLORS.length];
  return { rows: MON[kind], pal: { K: "#14162a", E: e, L: l, D: d, W: "#f4f4ff" } };
}

/* ---------- 상태 ---------- */
let canvas = null, ctx = null, frame = null, img = null, raf = 0, last = 0, clock = 0;
let units = new Map(), fxs = [], movers = [], timers = [], pending = [], banner = null, shakeUntil = 0, mode = "HUNT";
const C = {}; // 자주 쓰는 색 (hex()는 라이브러리의 색 형식으로 바꿔 준다)

function setup() {
  canvas = document.getElementById("bt-stage"); if (!canvas) return false;
  if (!ctx) { ctx = canvas.getContext("2d"); frame = createFrame(W, H); img = new ImageData(W, H);
    Object.assign(C, { bg: hex("#0f1222"), sky: hex("#151a2e"), ground: hex("#1b2233"), edge: hex("#3a4a6a"), sod: hex("#263047"), white: hex("#ffffff"), red: hex("#ff6b6b"), dark: hex("#0b0d18"), hpA: hex("#5fb57f"), hpE: hex("#e05545"), hpBack: hex("#2b2f4a"), gold: hex("#ffd84a"), bad: hex("#ff8a80"), inv: hex("#2a1620") }); }
  return true;
}
const after = (sec, fn) => timers.push({ at: clock + sec, fn });
const addFx = (mod, o) => { const f = createFx(mod, o); fxs.push(f); return f; };

function begin({ allies, enemies, mode: m }) {
  if (!setup()) return;
  units = new Map(); fxs = []; movers = []; timers = []; pending = []; banner = null; mode = m || "HUNT";
  const order = [...allies].sort((a, b) => (a.role === "전사" ? 0 : 1) - (b.role === "전사" ? 0 : 1));
  order.forEach((h, i) => units.set("a_" + h.id, { id: "a_" + h.id, side: "ally", x: ALLY_X[i % 4], y: GROUND + (i % 2 ? 4 : 0), role: h.role, pal: heroPal(h.role, h.star), hp: h.hp, maxHp: h.maxHp, alpha: 1, flash: 0, shake: 0, lunge: -9 }));
  enemies.forEach((e, i) => { const look = monsterLook(e.name); units.set(e.id, { id: e.id, side: "enemy", x: ENEMY_X[i % 3], y: GROUND + (i % 2 ? 4 : 0), rows: look.rows, pal: look.pal, scale: e.isBoss ? 3 : 2, hp: e.hp, maxHp: e.maxHp, alpha: 1, flash: 0, shake: 0, lunge: -9 }); });
  if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
}
function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; units = new Map(); fxs = []; movers = []; timers = []; pending = []; banner = null; if (canvas) canvas.style.transform = ""; }
const emit = (ev) => { pending.push(ev); };
function flush(tickMs) {
  const list = pending; pending = []; if (!list.length) return;
  const span = Math.max(0.12, (tickMs / 1000) * 0.72), stepT = span / list.length;
  list.forEach((ev, i) => after(i * stepT, () => play(ev)));
}
function end(victory) { after(0.5, () => { banner = { text: victory ? "VICTORY" : "DEFEAT", col: victory ? C.gold : C.bad, t0: clock }; }); }

/* ---------- 한 사건을 연출 ---------- */
function landHit(u, ev, fromLeft) {
  if (!u) return;
  const hy = u.side === "ally" ? 20 : 8 * (u.scale || 2);
  // 같은 대상에게 숫자가 연달아 뜰 때 겹치지 않게 조금씩 비켜 놓는다
  u.numN = (u.numN || 0) + 1; const nx = u.x + ((u.numN % 3) - 1) * 14, ny = -((u.numN % 2) * 9);
  if (ev.crit) { addFx(critHit, { x: u.x, y: u.y, height: hy, flip: !fromLeft }); addFx(critNumber, { x: nx, y: u.y - hy - 26 + ny, text: ev.dmg + "!" }); shakeUntil = clock + 0.3; }
  else { addFx(fromLeft ? hitSpark : bluntHit, { x: u.x, y: u.y, height: hy, flip: !fromLeft }); addFx(damageNumber, { x: nx, y: u.y - hy - 12 + ny, text: "-" + ev.dmg }); }
  u.flash = clock + 0.1; u.flashCol = fromLeft ? C.white : C.red; u.shake = clock + 0.22;
  if (ev.hp !== undefined) u.hp = ev.hp;
  if (ev.kill) kill(u);
}
function kill(u) {
  if (u.dead) return; u.dead = true; u.hp = 0;
  if (u.side === "ally") { addFx(soulRise, { x: u.x, y: u.y }); u.fadeFrom = clock; u.fadeFor = 0.5; shakeUntil = clock + 0.25; }
  else { addFx(poof, { x: u.x, y: u.y }); u.fadeFrom = clock; u.fadeFor = 0.12; }
}
function play(ev) {
  const from = units.get(ev.from), to = units.get(ev.to);
  if (ev.type === "atk") {
    if (!from || !to) return;
    if (ev.role === "궁수") {
      const f = addFx(arrow, { x: from.x + 12, y: from.y - 22 });
      movers.push({ fx: f, x0: from.x + 12, x1: to.x - 6, t0: clock, dur: 0.16, done: () => landHit(to, ev, true) });
    } else if (ev.role === "마법사" || ev.role === "사제") {
      const opt = { x: from.x + 6, y: from.y, reach: Math.max(40, to.x - from.x - 8), height: 24 };
      if (ev.role === "사제") opt.palette = ["#3b1d2a", "#7a3a2c", "#c4652e", "#f0a040", "#ffd25e", "#fff0a0", "#fffbe0", "#ffffff"];
      addFx(magicMissile, opt); after(0.62, () => landHit(to, ev, true));
    } else {
      from.lunge = clock; from.lungeDir = 1; from.lungeDist = Math.max(10, to.x - from.x - 34);
      after(0.1, () => { addFx(swordSlash, { x: to.x - 30, y: to.y }); });
      after(0.16, () => landHit(to, ev, true));
    }
  } else if (ev.type === "eatk") {
    if (!from || !to) return;
    from.lunge = clock; from.lungeDir = -1; from.lungeDist = Math.max(10, from.x - to.x - 30);
    after(0.14, () => landHit(to, ev, false));
  } else if (ev.type === "heal") {
    if (!to) return; addFx(heal, { x: to.x, y: to.y }); if (ev.hp !== undefined) to.hp = ev.hp;
    addFx(damageNumber, { x: to.x, y: to.y - 34, text: "+" + ev.amt, palette: ["#0e2a24", "#14472f", "#1d6e3a", "#2f9a45", "#5cc654", "#a0e46c", "#dcffb4", "#ffffff"] });
  } else if (ev.type === "levelup") {
    if (to && !to.dead) addFx(levelUp, { x: to.x, y: to.y, text: "LEVEL UP!" });
  }
}

/* ---------- 그리기 ---------- */
function drawUnit(u) {
  let a = u.alpha;
  if (u.fadeFrom !== undefined) { a = Math.max(0, 1 - (clock - u.fadeFrom) / u.fadeFor); if (a <= 0) return; }
  let dx = 0;
  const lt = clock - u.lunge;
  if (lt >= 0 && lt < 0.32) dx = Math.round(Math.sin(Math.min(1, lt / 0.32) * Math.PI) * (u.lungeDist || 12)) * (u.lungeDir || 1);
  if (clock < u.shake) dx += Math.round(Math.sin(clock * 90) * 2);
  const bob = u.dead ? 0 : Math.round(Math.sin(clock * 3.2 + u.x) * 0.6);
  const tint = clock < u.flash ? u.flashCol : undefined;
  const p = painterFor(frame); p.place(u.x + dx, u.y + bob);
  let top;
  if (u.side === "ally") { const A = stockActor(2); p.sprite(HERO2, u.pal, A.x, A.y, { a, tint }); top = A.y; }
  else { const s = u.scale; p.sprite(u.rows, u.pal, -8 * s, -16 * s, { scale: s, flip: true, a, tint }); top = -16 * s; }
  if (!u.dead) { const w = u.side === "ally" ? 22 : 12 * u.scale, x0 = -Math.round(w / 2); p.rect(x0 - 1, top - 7, w + 2, 4, C.dark); p.rect(x0, top - 6, w, 2, C.hpBack); p.rect(x0, top - 6, Math.max(0, Math.round(w * u.hp / u.maxHp)), 2, u.side === "ally" ? C.hpA : C.hpE); }
}
function loop(now) {
  raf = requestAnimationFrame(loop);
  const dt = Math.min(0.05, (now - last) / 1000); last = now; clock += dt;
  try {
    for (let i = timers.length - 1; i >= 0; i--) if (timers[i].at <= clock) { const t = timers.splice(i, 1)[0]; t.fn(); }
    for (let i = movers.length - 1; i >= 0; i--) { const m = movers[i], u = (clock - m.t0) / m.dur; m.fx.options.x = m.x0 + (m.x1 - m.x0) * Math.min(1, u); if (u >= 1) { movers.splice(i, 1); fxs = fxs.filter((f) => f !== m.fx); m.done(); } }
    for (const f of fxs) f.update(dt);
    fxs = fxs.filter((f) => !f.done());
    clearFrame(frame);
    const p = painterFor(frame); p.place(0, 0);
    p.rect(0, 0, W, GROUND, mode === "INVASION" ? C.inv : C.sky); p.rect(0, GROUND, W, H - GROUND, C.ground); p.rect(0, GROUND, W, 1, C.edge);
    for (let x = 6; x < W; x += 23) p.rect(x + ((x * 7) % 5), GROUND + 3 + ((x * 3) % 9), 5, 1, C.sod);
    for (const f of fxs) f.draw(frame, "back");
    [...units.values()].sort((a, b) => a.y - b.y).forEach(drawUnit);
    for (const f of fxs) f.draw(frame, "front");
    if (banner) { const q = painterFor(frame); q.place(0, 0); const k = Math.min(1, (clock - banner.t0) / 0.25); q.rect(0, 22, W, 26, C.dark, 0.8 * k); q.text(banner.text, W / 2, 28, banner.col, { font: "big", scale: 2, align: "center", outline: C.dark, a: k }); }
    composite(frame, img.data, C.bg);
    ctx.putImageData(img, 0, 0);
    canvas.style.transform = clock < shakeUntil ? `translate(${Math.round(Math.sin(clock * 80) * 3)}px,${Math.round(Math.cos(clock * 67) * 2)}px)` : "";
  } catch (e) { console.error("[BattleFX]", e); cancelAnimationFrame(raf); raf = 0; }
}

window.BattleFX = { begin, emit, flush, end, stop };
