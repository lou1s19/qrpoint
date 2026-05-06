const dots = [
  'square', 'mosaic', 'dot', 'circle', 'circle-zebra', 'circle-zebra-vertical', 
  'circular', 'edge-cut', 'edge-cut-smooth', 'japnese', 'leaf', 'pointed', 
  'pointed-edge-cut', 'pointed-in', 'pointed-in-smooth', 'pointed-smooth', 
  'round', 'rounded-in', 'rounded-in-smooth', 'rounded-pointed', 'star', 'diamond'
];

const frames = Array.from({length: 17}, (_, i) => `frame${i}`);
const balls = Array.from({length: 20}, (_, i) => `ball${i}`);

console.log("DOT_STYLES:");
console.log(dots.map(d => `{ value: '${d}', label: '${d.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}' }`).join(',\n'));

console.log("\nCORNER_STYLES:");
console.log(frames.map(d => `{ value: '${d}', label: '${d.charAt(0).toUpperCase() + d.slice(1)}' }`).join(',\n'));

console.log("\nBALL_STYLES:");
console.log(balls.map(d => `{ value: '${d}', label: '${d.charAt(0).toUpperCase() + d.slice(1)}' }`).join(',\n'));
