/**
 * Send GET (fetch) request to the API to tokenize the string.
 * @param {URL} url URL to fetch
 * @returns {string} Tokenised string as returned by the API
 */
export async function fetchUrl(url) {
  return fetch(url).then(response => response.json())
}


/**
 * Handling errors. Both involves showing errors and hiding them. A given
 * message will be injected and the error displayed. If the message is 
 * empty, the error wrapper will be emptied and hidden.
 * @param {string} [message] The error message to display (optionally empty/undefined)
 * that can contain HTML tags
 */
export function errorHandling(message) {
  console.log(message)
}

/**
* Turn a given string into alignments (array of tuples of integers). If an error occurs
* during parsing, then `false` is returned and an error thrown.
* @param {string} align_str 
* @returns {number[][]|false}
*/
export function createAlignsFromStr(align_str) {
  try {
    // Will also throw an error when giving a negative value
    let aligns = align_str.split(" ").map(pair => pair.split("-", 2))
    const n = aligns.length

    aligns = numberArraysSort(aligns.map(pair => pair.map(x => parseInt(x)))).filter(pair => {
      return pair.length === 2 && pair.every(el => el !== "" && !Number.isNaN(parseInt(el)))
    })
    // return whether or not the alignments are valid
    // if values were filtered, then that means the alignments are not valid
    return [aligns, n === aligns.length]
  } catch (error) {
    return [null, false]
  }
}

/**
 * Convert an array of tuples of integers/strings to a Pharaoh format representation
 * @param {number[][]|string[][]} aligns 
 * @returns {string}
 */
export function createStrFromAligns(aligns) {
  return numberArraysSort(aligns).map(arr => arr.map(String).join("-")).join(" ")
}

/**
 * Create directional info of alignments. src=>[tgt_idxs...] or tgt=>[src_ids...]
 * @param {number[][]} aligns 
 * @param {number} index use 0 for source and 1 for target
 * @param {number} nmax the number of items on the left side, so that we can fill in null alignments
 */
export function createAlignMapping(aligns, index, nmax) {
  const otherIndex = index === 0 ? 1 : 0

  let mapping = {};
  for (const arr of aligns) {
    if (arr[index] in mapping) {
      mapping[arr[index]].push(arr[otherIndex])
    } else {
      mapping[arr[index]] = [arr[otherIndex]]
    }
  }
  for (let i = 0; i < nmax; i++) {
    if (!(i in mapping)) {
      mapping[i] = []
    }
  }

  return mapping
}

export function zip(arrays) {
  // https://stackoverflow.com/a/10284006/1150683
  return arrays[0].map(function (_, i) {
    return arrays.map(function (array) { return array[i] })
  });
}

export function valuesNotEmpty(...vals) {
  // Return false if any of the given (trimmed) values is "" 
  return vals.every(val => val.trim() !== "")
}

function numberArraysSort(array) {
  // If the first index is equal, sort by second index, otherwise by first
  return array.sort(function (a, b) {
    return a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]
  });
}

export function scrollIntoView(el) {
  el.scrollIntoView({
    behavior: "smooth",
    block: "start"
  })
}

export function addAlignmentToWordsObj(words, mapping) {
  return Object.entries(mapping).map(([idx, aligned_idxs]) => {
    return {text: words[idx].text, alignedIdxs: aligned_idxs}
  })
}

export function removeItemfromArray(array, value) {
  // because you cannot simply compare arrays in JS, we need to stringify them first
  const strArray = array.map(JSON.stringify)
  const idx = strArray.indexOf(JSON.stringify(value))
  if (idx > -1) {
    array.splice(idx, 1)
  }
  return array
}