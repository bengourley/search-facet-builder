module.exports = FacetBuilder

var Writable = require('stream').Writable

function FacetBuilder (facets) {
  Writable.call(this, { objectMode: true })
  this._facetKeys = facets
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
    var values = Array.isArray(chunk[key]) ? chunk[key] : [ chunk[key] ]
    values.forEach(function (value) {
      if (!this._facets[key][value]) this._facets[key][value] = 0
      this._facets[key][value] += 1
    }.bind(this))
  }.bind(this))
  cb(null)
}

FacetBuilder.prototype.getResultIds = function () {
  return this._resultIds
}

FacetBuilder.prototype.getFacets = function () {
  return this._facets
}
