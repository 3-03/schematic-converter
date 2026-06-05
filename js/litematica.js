/**
 * Litematica File Generator
 * Generates .litematic files from block grids.
 * Format: Gzip-compressed NBT (Java Edition Big-Endian)
 */

import { NBTWriter, TAG } from './nbtWriter.js';
import { BLOCK_PALETTE } from './palette.js';

/**
 * Generate a .litematic file from a block grid.
 * @param {number[][]} blockGrid - 2D array of palette indices (-1 = air)
 * @param {number} width - Grid width (X axis)
 * @param {number} height - Grid height (Z axis)
 * @param {string} [name="PixelArt"] - Schematic name
 * @returns {Uint8Array} Gzip-compressed .litematic file bytes
 */
function generateLitematic(blockGrid, width, height, name = "PixelArt") {
  // ── Step 1: Build the block state palette ─────────────────
  // Collect unique block IDs used in the grid
  // Air is always index 0 in the palette
  const paletteEntries = [{ id: "minecraft:air" }]; // index 0 = air
  const blockToPaletteMap = new Map(); // original palette index → litematic palette index
  blockToPaletteMap.set(-1, 0); // transparent/air → 0

  let totalBlocks = 0;

  for (let z = 0; z < height; z++) {
    for (let x = 0; x < width; x++) {
      const blockIdx = blockGrid[z][x];
      if (blockIdx === -1) continue; // air

      totalBlocks++;

      if (!blockToPaletteMap.has(blockIdx)) {
        blockToPaletteMap.set(blockIdx, paletteEntries.length);
        paletteEntries.push(BLOCK_PALETTE[blockIdx]);
      }
    }
  }

  const paletteSize = paletteEntries.length;
  const sizeX = width;
  const sizeY = 1; // Flat pixel art is 1 block tall
  const sizeZ = height;
  const totalVolume = sizeX * sizeY * sizeZ;

  // ── Step 2: Bit-pack block states into LongArray ──────────
  const bitsPerBlock = Math.max(2, Math.ceil(Math.log2(paletteSize)));
  const totalBits = totalVolume * bitsPerBlock;
  const totalLongs = Math.ceil(totalBits / 64);

  // Use BigInt array for 64-bit precision
  const blockStates = new Array(totalLongs).fill(0n);

  for (let y = 0; y < sizeY; y++) {
    for (let z = 0; z < sizeZ; z++) {
      for (let x = 0; x < sizeX; x++) {
        const blockIndex = y * (sizeX * sizeZ) + z * sizeX + x;
        const originalIdx = blockGrid[z][x];
        const paletteIdx = blockToPaletteMap.get(originalIdx);

        const startBit = blockIndex * bitsPerBlock;
        const longIndex = Math.floor(startBit / 64);
        const bitOffset = startBit % 64;

        const val = BigInt(paletteIdx);

        if (bitOffset + bitsPerBlock <= 64) {
          // Fits in one long
          blockStates[longIndex] |= (val << BigInt(bitOffset));
        } else {
          // Spans two longs
          blockStates[longIndex] |= (val << BigInt(bitOffset));
          const overflow = bitsPerBlock - (64 - bitOffset);
          blockStates[longIndex + 1] |= (val >> BigInt(64 - bitOffset));
        }
      }
    }
  }

  // Convert to signed 64-bit (Java long)
  for (let i = 0; i < blockStates.length; i++) {
    blockStates[i] = BigInt.asIntN(64, blockStates[i]);
  }

  // ── Step 3: Write NBT structure ───────────────────────────
  const nbt = new NBTWriter();
  const now = BigInt(Date.now());

  // Root compound
  nbt.beginRootCompound("");

  // Minecraft data version (1.20.4 = 3700)
  nbt.writeInt("MinecraftDataVersion", 3700);
  // Litematica schematic version
  nbt.writeInt("Version", 5);
  nbt.writeInt("SubVersion", 1);

  // ── Metadata ──────────────────────────────────────────
  nbt.beginCompound("Metadata");
  nbt.writeString("Name", name);
  nbt.writeString("Author", "SchematicConverter");
  nbt.writeString("Description", "Generated from image by SchematicConverter");
  nbt.writeInt("RegionCount", 1);
  nbt.writeInt("TotalBlocks", totalBlocks);
  nbt.writeInt("TotalVolume", totalVolume);
  nbt.writeLong("TimeCreated", now);
  nbt.writeLong("TimeModified", now);

  // EnclosingSize
  nbt.beginCompound("EnclosingSize");
  nbt.writeInt("x", sizeX);
  nbt.writeInt("y", sizeY);
  nbt.writeInt("z", sizeZ);
  nbt.writeEnd(); // EnclosingSize

  nbt.writeEnd(); // Metadata

  // ── Regions ───────────────────────────────────────────
  nbt.beginCompound("Regions");

  // Single region: "PixelArt"
  nbt.beginCompound("PixelArt");

  // Position
  nbt.beginCompound("Position");
  nbt.writeInt("x", 0);
  nbt.writeInt("y", 0);
  nbt.writeInt("z", 0);
  nbt.writeEnd(); // Position

  // Size
  nbt.beginCompound("Size");
  nbt.writeInt("x", sizeX);
  nbt.writeInt("y", sizeY);
  nbt.writeInt("z", sizeZ);
  nbt.writeEnd(); // Size

  // BlockStatePalette (List of Compounds)
  nbt.beginList("BlockStatePalette", TAG.COMPOUND, paletteSize);
  for (let i = 0; i < paletteSize; i++) {
    // Each compound in a list: no tag header, just contents + END
    const entry = paletteEntries[i];
    nbt.writeString("Name", entry.id);
    nbt.writeEnd(); // end compound element
  }

  // BlockStates (LongArray)
  nbt.writeLongArray("BlockStates", blockStates);

  // Empty lists
  nbt.beginList("Entities", TAG.COMPOUND, 0);
  nbt.beginList("TileEntities", TAG.COMPOUND, 0);
  nbt.beginList("PendingBlockTicks", TAG.COMPOUND, 0);
  nbt.beginList("PendingFluidTicks", TAG.COMPOUND, 0);

  nbt.writeEnd(); // PixelArt region
  nbt.writeEnd(); // Regions
  nbt.writeEnd(); // Root compound

  // ── Step 4: Gzip compress ─────────────────────────────────
  const uncompressed = nbt.getBuffer();
  const compressed = pako.gzip(uncompressed);

  return compressed;
}

/**
 * Trigger a file download in the browser.
 * @param {Uint8Array} data - File content
 * @param {string} filename - Download filename
 */
function downloadFile(data, filename) {
  const blob = new Blob([data], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export { generateLitematic, downloadFile };
