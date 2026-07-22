// CTAバー「LINE」文字色のコントラスト比を実測する
// 背景: rgba(255,253,249,.97) on white ≒ #fffdf9 / 文字サイズ: 11px (small text扱い)

function srgbToLinear(c) {
  c /= 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relLuminance([r, g, b]) {
  const [rl, gl, bl] = [r, g, b].map(srgbToLinear);
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function contrastRatio(rgb1, rgb2) {
  const l1 = relLuminance(rgb1);
  const l2 = relLuminance(rgb2);
  const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (lighter + 0.05) / (darker + 0.05);
}

const bg = [255, 253, 249]; // #fffdf9 (背景 rgba(255,253,249,.97) on white ≒ ほぼ同色)
const colors = {
  '#04a847 (旧・修正前)': [0x04, 0xa8, 0x47],
  '#03823a (新・修正後)': [0x03, 0x82, 0x3a],
};

console.log('=== CTAバー LINE文字色 コントラスト比 ===');
for (const [label, rgb] of Object.entries(colors)) {
  const ratio = contrastRatio(rgb, bg);
  const pass45 = ratio >= 4.5 ? 'PASS(AA小文字4.5:1)' : 'FAIL';
  console.log(`${label}: ${ratio.toFixed(2)}:1 → ${pass45}`);
}
