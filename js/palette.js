/**
 * Minecraft Block Palette
 * Maps block IDs to their average top-face RGB colors.
 * Used for finding the closest block match for each pixel.
 */

const BLOCK_PALETTE = [
  // ── Concrete (16 colors) ─────────────────────────────────
  { id: "minecraft:white_concrete",      rgb: [207, 213, 214] },
  { id: "minecraft:orange_concrete",     rgb: [224, 97, 1] },
  { id: "minecraft:magenta_concrete",    rgb: [169, 48, 159] },
  { id: "minecraft:light_blue_concrete", rgb: [36, 137, 199] },
  { id: "minecraft:yellow_concrete",     rgb: [241, 175, 21] },
  { id: "minecraft:lime_concrete",       rgb: [94, 169, 24] },
  { id: "minecraft:pink_concrete",       rgb: [214, 101, 143] },
  { id: "minecraft:gray_concrete",       rgb: [54, 57, 61] },
  { id: "minecraft:light_gray_concrete", rgb: [125, 125, 115] },
  { id: "minecraft:cyan_concrete",       rgb: [21, 119, 136] },
  { id: "minecraft:purple_concrete",     rgb: [100, 32, 156] },
  { id: "minecraft:blue_concrete",       rgb: [45, 47, 143] },
  { id: "minecraft:brown_concrete",      rgb: [96, 60, 32] },
  { id: "minecraft:green_concrete",      rgb: [73, 91, 36] },
  { id: "minecraft:red_concrete",        rgb: [142, 33, 33] },
  { id: "minecraft:black_concrete",      rgb: [8, 10, 15] },

  // ── Wool (16 colors) ─────────────────────────────────────
  { id: "minecraft:white_wool",          rgb: [234, 236, 236] },
  { id: "minecraft:orange_wool",         rgb: [241, 118, 20] },
  { id: "minecraft:magenta_wool",        rgb: [189, 68, 179] },
  { id: "minecraft:light_blue_wool",     rgb: [58, 175, 217] },
  { id: "minecraft:yellow_wool",         rgb: [249, 198, 40] },
  { id: "minecraft:lime_wool",           rgb: [112, 185, 26] },
  { id: "minecraft:pink_wool",           rgb: [238, 141, 172] },
  { id: "minecraft:gray_wool",           rgb: [63, 68, 72] },
  { id: "minecraft:light_gray_wool",     rgb: [142, 142, 135] },
  { id: "minecraft:cyan_wool",           rgb: [21, 138, 145] },
  { id: "minecraft:purple_wool",         rgb: [122, 42, 173] },
  { id: "minecraft:blue_wool",           rgb: [53, 57, 157] },
  { id: "minecraft:brown_wool",          rgb: [114, 72, 41] },
  { id: "minecraft:green_wool",          rgb: [85, 110, 28] },
  { id: "minecraft:red_wool",            rgb: [161, 39, 35] },
  { id: "minecraft:black_wool",          rgb: [21, 21, 26] },

  // ── Terracotta (16 colors) ───────────────────────────────
  { id: "minecraft:white_terracotta",         rgb: [210, 178, 161] },
  { id: "minecraft:orange_terracotta",        rgb: [162, 84, 38] },
  { id: "minecraft:magenta_terracotta",       rgb: [150, 88, 109] },
  { id: "minecraft:light_blue_terracotta",    rgb: [113, 109, 138] },
  { id: "minecraft:yellow_terracotta",        rgb: [186, 133, 35] },
  { id: "minecraft:lime_terracotta",          rgb: [104, 118, 53] },
  { id: "minecraft:pink_terracotta",          rgb: [162, 78, 79] },
  { id: "minecraft:gray_terracotta",          rgb: [58, 42, 36] },
  { id: "minecraft:light_gray_terracotta",    rgb: [135, 107, 98] },
  { id: "minecraft:cyan_terracotta",          rgb: [87, 92, 92] },
  { id: "minecraft:purple_terracotta",        rgb: [118, 70, 86] },
  { id: "minecraft:blue_terracotta",          rgb: [74, 60, 91] },
  { id: "minecraft:brown_terracotta",         rgb: [77, 51, 36] },
  { id: "minecraft:green_terracotta",         rgb: [76, 83, 42] },
  { id: "minecraft:red_terracotta",           rgb: [143, 61, 47] },
  { id: "minecraft:black_terracotta",         rgb: [37, 23, 16] },

  // ── Natural & Mineral Blocks ─────────────────────────────
  { id: "minecraft:stone",              rgb: [126, 126, 126] },
  { id: "minecraft:deepslate",          rgb: [80, 80, 82] },
  { id: "minecraft:dirt",               rgb: [134, 96, 67] },
  { id: "minecraft:sand",               rgb: [219, 207, 163] },
  { id: "minecraft:red_sand",           rgb: [190, 102, 34] },
  { id: "minecraft:gravel",             rgb: [131, 127, 126] },
  { id: "minecraft:clay",               rgb: [161, 166, 179] },
  { id: "minecraft:calcite",            rgb: [224, 225, 221] },
  { id: "minecraft:tuff",               rgb: [108, 109, 102] },
  { id: "minecraft:dripstone_block",    rgb: [134, 107, 92] },
  { id: "minecraft:obsidian",           rgb: [15, 11, 25] },
  { id: "minecraft:netherrack",         rgb: [97, 38, 38] },
  { id: "minecraft:soul_sand",          rgb: [81, 62, 51] },
  { id: "minecraft:bone_block",         rgb: [229, 225, 207] },
  { id: "minecraft:quartz_block",       rgb: [236, 230, 224] },
  { id: "minecraft:snow_block",         rgb: [249, 254, 254] },
  { id: "minecraft:packed_ice",         rgb: [141, 180, 224] },
  { id: "minecraft:blue_ice",           rgb: [116, 168, 220] },
  { id: "minecraft:prismarine",         rgb: [99, 172, 158] },
  { id: "minecraft:moss_block",         rgb: [89, 109, 45] },
  { id: "minecraft:mud",                rgb: [60, 57, 61] },
  { id: "minecraft:packed_mud",         rgb: [142, 106, 80] },

  // ── Ore / Metal Blocks ───────────────────────────────────
  { id: "minecraft:iron_block",         rgb: [220, 220, 220] },
  { id: "minecraft:gold_block",         rgb: [246, 208, 62] },
  { id: "minecraft:diamond_block",      rgb: [99, 236, 228] },
  { id: "minecraft:emerald_block",      rgb: [42, 176, 67] },
  { id: "minecraft:lapis_block",        rgb: [30, 67, 140] },
  { id: "minecraft:redstone_block",     rgb: [171, 28, 7] },
  { id: "minecraft:coal_block",         rgb: [16, 15, 15] },
  { id: "minecraft:copper_block",       rgb: [192, 108, 79] },
  { id: "minecraft:raw_iron_block",     rgb: [166, 136, 107] },
  { id: "minecraft:raw_copper_block",   rgb: [154, 106, 73] },
  { id: "minecraft:raw_gold_block",     rgb: [221, 169, 47] },
  { id: "minecraft:amethyst_block",     rgb: [133, 97, 168] },

  // ── Organic / Decorative ─────────────────────────────────
  { id: "minecraft:oak_planks",         rgb: [162, 131, 79] },
  { id: "minecraft:spruce_planks",      rgb: [115, 85, 49] },
  { id: "minecraft:birch_planks",       rgb: [196, 179, 123] },
  { id: "minecraft:dark_oak_planks",    rgb: [67, 43, 20] },
  { id: "minecraft:crimson_planks",     rgb: [101, 49, 71] },
  { id: "minecraft:warped_planks",      rgb: [43, 105, 99] },
  { id: "minecraft:hay_block",          rgb: [166, 139, 12] },
  { id: "minecraft:dried_kelp_block",   rgb: [50, 55, 30] },
  { id: "minecraft:honeycomb_block",    rgb: [229, 149, 29] },
  { id: "minecraft:nether_wart_block",  rgb: [114, 2, 2] },
  { id: "minecraft:warped_wart_block",  rgb: [22, 120, 121] },
  { id: "minecraft:glowstone",          rgb: [171, 131, 84] },
  { id: "minecraft:shroomlight",        rgb: [240, 146, 70] },
  { id: "minecraft:ochre_froglight",    rgb: [248, 228, 165] },
  { id: "minecraft:verdant_froglight",  rgb: [209, 234, 175] },
  { id: "minecraft:pearlescent_froglight", rgb: [227, 210, 231] },
];

/**
 * Find the closest block in the palette for a given RGB color.
 * Uses weighted Euclidean distance (human eye is more sensitive to green).
 * @param {number} r - Red (0–255)
 * @param {number} g - Green (0–255)
 * @param {number} b - Blue (0–255)
 * @returns {{ block: object, index: number }} closest block and its palette index
 */
function findClosestBlock(r, g, b) {
  let bestIndex = 0;
  let bestDist = Infinity;

  for (let i = 0; i < BLOCK_PALETTE.length; i++) {
    const [br, bg, bb] = BLOCK_PALETTE[i].rgb;
    // Weighted Euclidean — emphasize green channel (human perception)
    const dr = r - br;
    const dg = g - bg;
    const db = b - bb;
    const dist = 2 * dr * dr + 4 * dg * dg + 3 * db * db;

    if (dist < bestDist) {
      bestDist = dist;
      bestIndex = i;
    }
  }

  return { block: BLOCK_PALETTE[bestIndex], index: bestIndex };
}

// Pre-build a lookup cache for performance (quantize to 5-bit per channel)
const COLOR_CACHE = new Map();

function findClosestBlockCached(r, g, b) {
  // Quantize to reduce cache size: 32 levels per channel = 32768 entries max
  const qr = r >> 3;
  const qg = g >> 3;
  const qb = b >> 3;
  const key = (qr << 10) | (qg << 5) | qb;

  if (COLOR_CACHE.has(key)) {
    return COLOR_CACHE.get(key);
  }

  const result = findClosestBlock(r, g, b);
  COLOR_CACHE.set(key, result);
  return result;
}

export { BLOCK_PALETTE, findClosestBlock, findClosestBlockCached };
