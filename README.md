# search-facet-builder

Get a faceted search data structure from some search results.

## Installation

    npm install --save search-facet-builder

## Usage

```js
// FacetStream is a Transform stream class
var FacetStream = require('search-facet-builder')
    // Get a readStream from somewhere, e.g. a mongo cursor
  , readStream = service.createReadStream(query, options)

// Instantiate a facet stream in which to pump your data
var facetStream = new FacetStream({ city: true, category: true })

// Pipe the search results through the facet stream
readStream.pipe(facetStream)

// When the data has finished flowing you can access the facet data structure
facetStream.on('finish', function () {
  facetStream.getFacets() //-> { city: { London: 2, Bath: 2, Watford: 2 }, category: { Talk: 3, Experience: 3 } }
  facetStream.getIds() //-> [ '001ab', '002ab', '003ab', etc ]
})
```

## Credits
Built by developers at [Clock](http://clock.co.uk).

## Licence
Licensed under the [New BSD License](http://opensource.org/licenses/bsd-license.php)
