module.exports = fetch

var fs = require('fs')

function fetch (state, subject, method, options, results = []) {
  var cachePath = options.repo ? `./data/${subject}-${options.repo}.json` : `./data/${subject}.json`

  if (!options.page) {
    options.page = 1
  }

  try {
    var data = fs.readFileSync(cachePath, {encoding: 'utf8'})
    // console.log(`Reading ${subject} from chache at ${cachePath}`)
    return Promise.resolve(JSON.parse(data))
  } catch (error) {
    // console.log(`Fetching ${subject} from github`)

    return method(options)

    .then(function (currentResult) {
      results = results.concat(currentResult)
      console.log(`${subject}: ${currentResult.length} results found on page ${options.page} (${currentResult.meta['x-ratelimit-remaining']} / ${currentResult.meta['x-ratelimit-limit']})`)

      if (currentResult.meta.link && /; rel="next"/.test(currentResult.meta.link)) {
        console.log('loading next page ...')
        options.page++
        return fetch(state, subject, method, options, results)
      }

      fs.writeFileSync(cachePath, JSON.stringify(results), {encoding: 'utf8'})

      return results
    })
  }
}
