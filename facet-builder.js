module.exports = FacetBuilder

var Writable = require('stream').Writable

function FacetBuilder (facets) {
  Writable.call(this, { objectMode: true })
  this._facets = {}
  this._resultIds = []
  Object.keys(facets).forEach(function (key) {
    this._facets[key] = Object.create(null)
  }.bind(this))
}

FacetBuilder.prototype = Object.create(Writable.prototype)

FacetBuilder.prototype._write = function (chunk, enc, cb) {
  this._resultIds.push(chunk._id)
  Object.keys(this._facets).forEach(function (key) {
    if (!chunk[key]) return
    if (!this._facets[key][chunk[key]]) this._facets[key][chunk[key]] = 0
    this._facets[key][chunk[key]] += 1
  }.bind(this))
  cb(null)
}

FacetBuilder.prototype.getResultIds = function () {
  return this._resultIds
}

FacetBuilder.prototype.getFacets = function () {
  return this._facets
}
