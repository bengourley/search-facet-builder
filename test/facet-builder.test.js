var jsonStream = require('jsonstream')
  , fs = require('fs')
  , assert = require('assert')
  , FacetBuilder = require('../')
  , stream = require('stream')

describe('facet builder', function () {

  describe('getFacets()', function () {

    it('should generate a data structure containing all facet options', function (done) {

      var facetBuilder = new FacetBuilder({ category: true, location: true })
      fs.createReadStream(__dirname + '/fixtures/objects.json')
        .pipe(jsonStream.parse())
        .pipe(facetBuilder)
        .on('finish', function () {
          var facets = facetBuilder.getFacets()
            , expected = { category: { Experience: 3, Talk: 3 }, location: { London: 2, Bath: 2, Watford: 2 } }
          assert.deepEqual(facets, expected)
          done()
        })
    })

    it('should generate a smaller data structure given fewer items', function (done) {

      var facetBuilder = new FacetBuilder({ category: true, location: true })
        , filter = new stream.Transform({ objectMode: true })

      filter._transform = function (chunk, encoding, next) {
        if (chunk.location !== 'Bath') return next()
        return next(null, chunk)
      }

      fs.createReadStream(__dirname + '/fixtures/objects.json')
        .pipe(jsonStream.parse())
        .pipe(filter)
        .pipe(facetBuilder)
        .on('finish', function () {
          var facets = facetBuilder.getFacets()
            , expected = { category: { Experience: 1, Talk: 1 }, location: { Bath: 2 } }
          assert.deepEqual(facets, expected)
          done()
        })
    })

  })

  describe('getResultIds()', function () {

    it('should collect the _ids of all items in the stream', function (done) {

      var facetBuilder = new FacetBuilder({ category: true, location: true })

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

})
