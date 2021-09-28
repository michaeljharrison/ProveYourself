const stream = require('stream')
const util = require('util')
const Writable = stream.Writable

function MemoryStream(options) {
  if (!(this instanceof MemoryStream)) {
    return new MemoryStream(options)
  }
  Writable.call(this, options) // init super
}
util.inherits(MemoryStream, Writable)

MemoryStream.prototype._write = function (chunk, enc, cb) {
  const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.alloc(chunk, enc)

  if (Buffer.isBuffer(this.memStore)) {
    this.memStore = Buffer.concat([this.memStore, buffer])
  } else {
    this.memStore = buffer
  }
  cb()
}

MemoryStream.prototype.toBuffer = function () {
  return this.memStore
}

module.exports = MemoryStream
