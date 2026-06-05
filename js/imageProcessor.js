/**
 * Image Processor
 * Handles image loading, resizing, and pixel-to-block mapping.
 */

import { BLOCK_PALETTE, findClosestBlockCached } from './palette.js';

/**
 * Process an image and map each pixel to the closest Minecraft block.
 * @param {HTMLImageElement} img - Source image element
 * @param {number} targetSize - Target size (e.g., 32, 64, 128)
 * @returns {{ blockGrid: number[][], usedPalette: Map<number, object>, width: number, height: number }}
 */
function processImage(img, targetSize) {
  // Create an offscreen canvas for resizing
  const canvas = document.createElement('canvas');
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  // Disable image smoothing for crisp pixel art when downscaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'medium';

  // Draw image scaled to target size (maintains aspect ratio by stretching to fill)
  ctx.drawImage(img, 0, 0, targetSize, targetSize);

  // Extract pixel data
  const imageData = ctx.getImageData(0, 0, targetSize, targetSize);
  const pixels = imageData.data; // RGBA array

  // Map each pixel to a block
  const blockGrid = [];
  const usedPalette = new Map(); // paletteIndex -> block object

  for (let z = 0; z < targetSize; z++) {
    const row = [];
    for (let x = 0; x < targetSize; x++) {
      const idx = (z * targetSize + x) * 4;
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];
      const a = pixels[idx + 3];

      let paletteIndex;
      if (a < 128) {
        // Transparent pixel → air (index 0 will be reserved for air separately)
        paletteIndex = -1; // Will be mapped to air
      } else {
        const result = findClosestBlockCached(r, g, b);
        paletteIndex = result.index;
        if (!usedPalette.has(paletteIndex)) {
          usedPalette.set(paletteIndex, result.block);
        }
      }
      row.push(paletteIndex);
    }
    blockGrid.push(row);
  }

  return {
    blockGrid,
    usedPalette,
    width: targetSize,
    height: targetSize,
  };
}

/**
 * Render a block grid preview onto a canvas.
 * @param {HTMLCanvasElement} canvas - Target canvas
 * @param {number[][]} blockGrid - 2D array of palette indices
 * @param {number} gridSize - Size of the grid (e.g., 32, 64, 128)
 */
function renderBlockPreview(canvas, blockGrid, gridSize) {
  const size = Math.min(canvas.width, canvas.height);
  const blockSize = size / gridSize;
  const ctx = canvas.getContext('2d');

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw checkerboard background for transparent areas
  for (let z = 0; z < gridSize; z++) {
    for (let x = 0; x < gridSize; x++) {
      const px = x * blockSize;
      const py = z * blockSize;

      if (blockGrid[z][x] === -1) {
        // Transparent — draw checkerboard
        const isLight = (x + z) % 2 === 0;
        ctx.fillStyle = isLight ? '#2a2a2a' : '#1a1a1a';
        ctx.fillRect(px, py, blockSize, blockSize);
      } else {
        // Draw block color
        const block = BLOCK_PALETTE[blockGrid[z][x]];
        const [r, g, b] = block.rgb;
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(px, py, blockSize, blockSize);
      }
    }
  }

  // Draw subtle grid lines for sizes <= 64
  if (gridSize <= 64) {
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= gridSize; i++) {
      const pos = i * blockSize;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(size, pos);
      ctx.stroke();
    }
  }
}

/**
 * Export the preview canvas as a PNG blob.
 * @param {HTMLCanvasElement} canvas
 * @returns {Promise<Blob>}
 */
function exportPreviewPNG(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}

export { processImage, renderBlockPreview, exportPreviewPNG };
