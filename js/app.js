/**
 * App — Main UI Logic
 * Handles file upload, preview rendering, size selection, downloads,
 * block tooltip on hover/click, and material list.
 */

import { BLOCK_PALETTE, findClosestBlockCached } from './palette.js';
import { processImage, renderBlockPreview, exportPreviewPNG } from './imageProcessor.js';
import { generateLitematic, downloadFile } from './litematica.js';

// ── DOM ─────────────────────────────────────────────────────
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const controls = document.getElementById('controls');
const sizeSelector = document.getElementById('sizeSelector');
const previewArea = document.getElementById('previewArea');
const originalPreview = document.getElementById('originalPreview');
const blockPreviewCanvas = document.getElementById('blockPreview');
const statsBar = document.getElementById('statsBar');
const btnDownloadLitematic = document.getElementById('btnDownloadLitematic');
const btnDownloadPNG = document.getElementById('btnDownloadPNG');
const toastEl = document.getElementById('toast');
const blockTip = document.getElementById('blockTip');
const matList = document.getElementById('matList');
const matListBody = document.getElementById('matListBody');

const statBlocks = document.getElementById('statBlocks');
const statUniqueBlocks = document.getElementById('statUniqueBlocks');
const statSize = document.getElementById('statSize');
const statDimensions = document.getElementById('statDimensions');
const originalSizeTag = document.getElementById('originalSizeTag');
const blockSizeTag = document.getElementById('blockSizeTag');

// ── State ───────────────────────────────────────────────────
let currentImage = null;
let currentSize = 64;
let currentBlockGrid = null;
let currentUsedPalette = null;

// ── Drag & Drop ─────────────────────────────────────────────
dropZone.addEventListener('click', (e) => {
  if (e.target !== fileInput) fileInput.click();
});

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) loadImage(file);
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) loadImage(file);
});

// ── Size Selector ───────────────────────────────────────────
sizeSelector.addEventListener('click', (e) => {
  const btn = e.target.closest('.pill');
  if (!btn) return;

  sizeSelector.querySelectorAll('.pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentSize = parseInt(btn.dataset.size);

  if (currentImage) processAndRender();
});

// ── Downloads ───────────────────────────────────────────────
btnDownloadLitematic.addEventListener('click', () => {
  if (!currentBlockGrid) return;
  try {
    const data = generateLitematic(currentBlockGrid, currentSize, currentSize, 'PixelArt');
    downloadFile(data, `pixelart_${currentSize}x${currentSize}.litematic`);
    showToast('Файл .litematic скачан');
  } catch (err) {
    console.error('Litematic generation error:', err);
    showToast('Ошибка генерации файла');
  }
});

btnDownloadPNG.addEventListener('click', async () => {
  if (!currentBlockGrid) return;
  try {
    const blob = await exportPreviewPNG(blockPreviewCanvas);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pixelart_${currentSize}x${currentSize}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('PNG скачан');
  } catch (err) {
    console.error('PNG export error:', err);
    showToast('Ошибка экспорта');
  }
});

// ── Block Tooltip (hover + click on canvas) ─────────────────
blockPreviewCanvas.addEventListener('mousemove', (e) => {
  if (!currentBlockGrid) return;
  showBlockTip(e);
});

blockPreviewCanvas.addEventListener('mouseleave', () => {
  blockTip.classList.remove('visible');
});

blockPreviewCanvas.addEventListener('click', (e) => {
  if (!currentBlockGrid) return;
  showBlockTip(e);
});

function showBlockTip(e) {
  const rect = blockPreviewCanvas.getBoundingClientRect();
  const scaleX = currentSize / rect.width;
  const scaleY = currentSize / rect.height;

  const bx = Math.floor((e.clientX - rect.left) * scaleX);
  const bz = Math.floor((e.clientY - rect.top) * scaleY);

  if (bx < 0 || bx >= currentSize || bz < 0 || bz >= currentSize) {
    blockTip.classList.remove('visible');
    return;
  }

  const idx = currentBlockGrid[bz][bx];

  if (idx === -1) {
    blockTip.innerHTML = `
      <span class="block-tip__swatch" style="background:transparent; border-style:dashed"></span>
      <span class="block-tip__name">Воздух</span>
    `;
  } else {
    const block = BLOCK_PALETTE[idx];
    const [r, g, b] = block.rgb;
    const name = block.id.replace('minecraft:', '').replaceAll('_', ' ');
    const textureFile = getTextureFilename(block.id);
    blockTip.innerHTML = `
      <span class="block-tip__swatch" style="background-color:rgb(${r},${g},${b}); background-image:url('textures/${textureFile}')"></span>
      <span class="block-tip__name"><strong>${name}</strong> (${bx}, ${bz})</span>
    `;
  }

  blockTip.classList.add('visible');

  // Position tooltip relative to parent preview__body
  const parentRect = blockPreviewCanvas.parentElement.getBoundingClientRect();
  let tipX = e.clientX - parentRect.left + 12;
  let tipY = e.clientY - parentRect.top - 32;

  // Keep within parent bounds
  const tipWidth = blockTip.offsetWidth;
  if (tipX + tipWidth > parentRect.width - 8) {
    tipX = e.clientX - parentRect.left - tipWidth - 12;
  }
  if (tipY < 4) tipY = 4;

  blockTip.style.left = tipX + 'px';
  blockTip.style.top = tipY + 'px';
}

// ── Core ────────────────────────────────────────────────────
function loadImage(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      currentImage = img;

      // Update drop zone
      dropZone.classList.add('has-image');
      
      const icon = dropZone.querySelector('.upload__icon');
      if (icon) icon.style.display = 'none';

      const label = dropZone.querySelector('.upload__label');
      if (label) label.innerHTML = `✓ <strong>${file.name}</strong>`;

      const hint = dropZone.querySelector('.upload__hint');
      if (hint) hint.textContent = 'Нажмите чтобы заменить';

      // Show original
      originalPreview.src = e.target.result;
      originalSizeTag.textContent = `${img.naturalWidth} × ${img.naturalHeight}`;

      // Show controls
      controls.classList.add('visible');
      processAndRender();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function processAndRender() {
  if (!currentImage) return;

  const result = processImage(currentImage, currentSize);
  currentBlockGrid = result.blockGrid;
  currentUsedPalette = result.usedPalette;

  renderBlockPreview(blockPreviewCanvas, currentBlockGrid, currentSize);

  previewArea.classList.add('visible');
  blockSizeTag.textContent = `${currentSize} × ${currentSize}`;

  // Stats
  let nonAir = 0;
  for (let z = 0; z < currentSize; z++)
    for (let x = 0; x < currentSize; x++)
      if (currentBlockGrid[z][x] !== -1) nonAir++;

  statBlocks.textContent = nonAir.toLocaleString();
  statUniqueBlocks.textContent = currentUsedPalette.size;
  statSize.textContent = `${currentSize}²`;
  statDimensions.textContent = `${currentSize} × 1 × ${currentSize}`;

  statsBar.classList.add('visible');

  btnDownloadLitematic.disabled = false;
  btnDownloadPNG.disabled = false;

  // Material list
  buildMaterialList();
}

// ── Material List ───────────────────────────────────────────
function buildMaterialList() {
  if (!currentBlockGrid || !currentUsedPalette) return;

  // Count blocks
  const counts = new Map(); // palette index → count
  for (let z = 0; z < currentSize; z++) {
    for (let x = 0; x < currentSize; x++) {
      const idx = currentBlockGrid[z][x];
      if (idx === -1) continue;
      counts.set(idx, (counts.get(idx) || 0) + 1);
    }
  }

  // Sort by count descending
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);

  // Render
  matListBody.innerHTML = '';
  for (const [idx, count] of sorted) {
    const block = BLOCK_PALETTE[idx];
    const [r, g, b] = block.rgb;
    const name = block.id.replace('minecraft:', '').replaceAll('_', ' ');
    const textureFile = getTextureFilename(block.id);

    const row = document.createElement('div');
    row.className = 'mat-row';
    row.innerHTML = `
      <span class="mat-row__swatch" style="background-color:rgb(${r},${g},${b}); background-image:url('textures/${textureFile}')"></span>
      <span class="mat-row__name">${name}</span>
      <span class="mat-row__count">×${count}</span>
    `;
    matListBody.appendChild(row);
  }

  matList.classList.add('visible');
}

// ── Helpers ──────────────────────────────────────────────────
function getTextureFilename(blockId) {
  const name = blockId.replace('minecraft:', '');
  if (name === 'snow_block') return 'snow.png';
  if (name === 'bone_block') return 'bone_block_top.png';
  if (name === 'quartz_block') return 'quartz_block_top.png';
  if (name === 'hay_block') return 'hay_block_top.png';
  if (name === 'dried_kelp_block') return 'dried_kelp_top.png';
  if (name.endsWith('froglight')) return `${name}_top.png`;
  return `${name}.png`;
}

// ── Toast ───────────────────────────────────────────────────
let toastTimer = null;

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('visible'), 2500);
}

// ── Global drag prevention ──────────────────────────────────
document.body.addEventListener('dragover', (e) => e.preventDefault());
document.body.addEventListener('drop', (e) => e.preventDefault());
