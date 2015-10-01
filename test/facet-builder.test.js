var jsonStream = require('jsonstream')
  , fs = require('fs')
  , assert = require('assert')
  , FacetBuilder = require('../')
  , stream = require('stream')

describe('facet builder', function () {

  describe('getFacets()', function () {

    it('should generate a data structure containing all facet options', function (done) {

      var facetBuilder = new FacetBuilder({ category: true, locations: true })
      fs.createReadStream(__dirname + '/fixtures/objects.json')
        .pipe(jsonStream.parse())
        .pipe(facetBuilder)
        .on('finish', function () {
          var facets = facetBuilder.getFacets()
            , expected = { category: { Experience: 3, Talk: 3 }, locations: { London: 2, Bath: 2, Watford: 2 } }
          assert.deepEqual(facets, expected)
          done()
        })
    })

    it('should generate a smaller data structure given fewer items', function (done) {

      var facetBuilder = new FacetBuilder({ category: true, locations: true })
        , filter = new stream.Transform({ objectMode: true })

      filter._transform = function (chunk, encoding, next) {
        if (!chunk.locations || chunk.locations.indexOf('Bath') === -1) return next()
        return next(null, chunk)
      }

      fs.createReadStream(__dirname + '/fixtures/objects.json')
        .pipe(jsonStream.parse())
        .pipe(filter)
        .pipe(facetBuilder)
        .on('finish', function () {
          var facets = facetBuilder.getFacets()
            , expected = { category: { Experience: 1, Talk: 1 }, locations: { Bath: 2 } }
          assert.deepEqual(facets, expected)
          done()
        })
    })

    it('should work with a function to extract a range of values from a property', function (done) {
      var facetBuilder = new FacetBuilder({ category: true, locations: extractLocation })

      function extractLocation (object) {
        if (!object.tags) return
        return object.tags
          .filter(function (tag) { return tag.type === 'Location' })
          .map(function (tag) { return tag.value })
      }

      fs.createReadStream(__dirname + '/fixtures/complex-objects.json')
        .pipe(jsonStream.parse())
        .pipe(facetBuilder)
        .on('finish', function () {
          var facets = facetBuilder.getFacets()
            , expected = { category: { Experience: 3, Talk: 3 }, locations: { London: 2, Bath: 2, Watford: 2 } }
          assert.deepEqual(facets, expected)
          done()
        })
    })

  })

  describe('getResultIds()', function () {

    it('should collect the _ids of all items in the stream', function (done) {

      var facetBuilder = new FacetBuilder({ category: true, locations: true })

      fs.createReadStream(__dirname + '/fixtures/objects.json')
        .pipe(jsonStream.parse())
        .pipe(facetBuilder)
        .on('finish', function () {
          var ids = facetBuilder.getResultIds()
            , expected = [ '001ab', '002ab', '003ab', '004ab', '005ab', '006ab', '007ab' ]
          assert.deepEqual(ids, expected)
          done()
        })

    })

  })

  it('should be a passthrough stream', function () {
    var facetBuilder = new FacetBuilder({ category: true, locations: true })
      , obj = { _id: 'abc', category: 'Test', locations: [ 'here', 'there' ] }
    facetBuilder.write(obj)
    assert.equal(facetBuilder.read(), obj)
  })

})
