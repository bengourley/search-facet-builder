module.exports = FacetBuilder

var Writable = require('stream').Writable

function FacetBuilder (facets) {
  Writable.call(this, { objectMode: true })
  this._facetDescriptors = facets
  this._facets = {}
  this._resultIds = []
  Object.keys(facets).forEach(function (key) {
    this._facets[key] = Object.create(null)
  }.bind(this))
}

FacetBuilder.prototype = Object.create(Writable.prototype)

FacetBuilder.prototype._write = function (chunk, enc, cb) {

  // Add this object's id to the results
  this._resultIds.push(chunk._id)

  // For each key in the object describing the search facets
  Object.keys(this._facetDescriptors).forEach(function (key) {

    var values

    if (typeof this._facetDescriptors[key] === 'function') {
      // If the value is a function, use it to extract the value
      // from the entire object
      values = this._facetDescriptors[key](chunk)
      if (!values) return
    } else {
      // Otherwise treat it as either the string or string[] with the same key name
      if (!chunk[key]) return
      values = Array.isArray(chunk[key]) ? chunk[key] : [ chunk[key] ]
    }

    // Once all of the values have been found, iterate them and increment the
    // counts for them in the resulting facet data structure
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
