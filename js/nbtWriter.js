/**
 * NBT (Named Binary Tag) Writer
 * Writes Java Edition NBT format (Big-Endian).
 * Reference: https://minecraft.wiki/w/NBT_format
 */

// NBT Tag type IDs
const TAG = {
  END: 0,
  BYTE: 1,
  SHORT: 2,
  INT: 3,
  LONG: 4,
  FLOAT: 5,
  DOUBLE: 6,
  BYTE_ARRAY: 7,
  STRING: 8,
  LIST: 9,
  COMPOUND: 10,
  INT_ARRAY: 11,
  LONG_ARRAY: 12,
};

class NBTWriter {
  constructor() {
    // Use a growable array of bytes
    this.bytes = [];
  }

  // ── Primitive writers (Big-Endian) ────────────────────────

  _writeByte(v) {
    this.bytes.push(v & 0xff);
  }

  _writeUShort(v) {
    this.bytes.push((v >>> 8) & 0xff, v & 0xff);
  }

  _writeShort(v) {
    const buf = new ArrayBuffer(2);
    new DataView(buf).setInt16(0, v, false);
    const arr = new Uint8Array(buf);
    this.bytes.push(arr[0], arr[1]);
  }

  _writeInt(v) {
    const buf = new ArrayBuffer(4);
    new DataView(buf).setInt32(0, v, false);
    const arr = new Uint8Array(buf);
    this.bytes.push(arr[0], arr[1], arr[2], arr[3]);
  }

  _writeLong(bigintVal) {
    const buf = new ArrayBuffer(8);
    new DataView(buf).setBigInt64(0, BigInt(bigintVal), false);
    const arr = new Uint8Array(buf);
    for (let i = 0; i < 8; i++) this.bytes.push(arr[i]);
  }

  _writeFloat(v) {
    const buf = new ArrayBuffer(4);
    new DataView(buf).setFloat32(0, v, false);
    const arr = new Uint8Array(buf);
    this.bytes.push(arr[0], arr[1], arr[2], arr[3]);
  }

  _writeDouble(v) {
    const buf = new ArrayBuffer(8);
    new DataView(buf).setFloat64(0, v, false);
    const arr = new Uint8Array(buf);
    for (let i = 0; i < 8; i++) this.bytes.push(arr[i]);
  }

  _writeString(s) {
    const encoded = new TextEncoder().encode(s);
    this._writeUShort(encoded.length);
    for (let i = 0; i < encoded.length; i++) {
      this.bytes.push(encoded[i]);
    }
  }

  // ── Tag header (type + name) ──────────────────────────────

  _writeTagHeader(type, name) {
    this._writeByte(type);
    this._writeString(name);
  }

  // ── Named tag writers ─────────────────────────────────────

  writeByte(name, value) {
    this._writeTagHeader(TAG.BYTE, name);
    this._writeByte(value);
  }

  writeShort(name, value) {
    this._writeTagHeader(TAG.SHORT, name);
    this._writeShort(value);
  }

  writeInt(name, value) {
    this._writeTagHeader(TAG.INT, name);
    this._writeInt(value);
  }

  writeLong(name, value) {
    this._writeTagHeader(TAG.LONG, name);
    this._writeLong(value);
  }

  writeFloat(name, value) {
    this._writeTagHeader(TAG.FLOAT, name);
    this._writeFloat(value);
  }

  writeDouble(name, value) {
    this._writeTagHeader(TAG.DOUBLE, name);
    this._writeDouble(value);
  }

  writeString(name, value) {
    this._writeTagHeader(TAG.STRING, name);
    this._writeString(value);
  }

  writeByteArray(name, byteArray) {
    this._writeTagHeader(TAG.BYTE_ARRAY, name);
    this._writeInt(byteArray.length);
    for (let i = 0; i < byteArray.length; i++) {
      this._writeByte(byteArray[i]);
    }
  }

  writeIntArray(name, intArray) {
    this._writeTagHeader(TAG.INT_ARRAY, name);
    this._writeInt(intArray.length);
    for (let i = 0; i < intArray.length; i++) {
      this._writeInt(intArray[i]);
    }
  }

  /**
   * Write a LongArray tag from an array of BigInt values.
   */
  writeLongArray(name, longArray) {
    this._writeTagHeader(TAG.LONG_ARRAY, name);
    this._writeInt(longArray.length);
    for (let i = 0; i < longArray.length; i++) {
      this._writeLong(longArray[i]);
    }
  }

  /**
   * Begin a named Compound tag.
   * Call writeEnd() when done adding child tags.
   */
  beginCompound(name) {
    this._writeTagHeader(TAG.COMPOUND, name);
  }

  /**
   * Write the root compound tag (the outermost compound).
   */
  beginRootCompound(name = "") {
    this._writeTagHeader(TAG.COMPOUND, name);
  }

  /**
   * End a Compound tag.
   */
  writeEnd() {
    this._writeByte(TAG.END);
  }

  /**
   * Begin a named List tag.
   * @param {string} name - Tag name
   * @param {number} elementType - TAG type of list elements
   * @param {number} length - Number of elements
   */
  beginList(name, elementType, length) {
    this._writeTagHeader(TAG.LIST, name);
    this._writeByte(elementType);
    this._writeInt(length);
  }

  // ── List element writers (no tag header, just payload) ────

  listByte(value) {
    this._writeByte(value);
  }

  listShort(value) {
    this._writeShort(value);
  }

  listInt(value) {
    this._writeInt(value);
  }

  listLong(value) {
    this._writeLong(value);
  }

  listString(value) {
    this._writeString(value);
  }

  /**
   * Begin a compound element inside a list (no tag header).
   * Call writeEnd() when done.
   */
  beginListCompound() {
    // Compound elements in a list don't have a tag header,
    // they just start with their contents and end with TAG_End
  }

  // ── Output ────────────────────────────────────────────────

  /**
   * Get the final binary data as a Uint8Array.
   */
  getBuffer() {
    return new Uint8Array(this.bytes);
  }
}

export { NBTWriter, TAG };
