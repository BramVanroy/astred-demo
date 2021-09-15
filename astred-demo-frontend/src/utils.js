/**
* Asa first reutnr value, turns a given string into alignments (array of arrays of numbers).
* If an error occurs, alignments are set to null.
* As a second return value, also verifies whether or not the alignments are valid. That is,
* whether they had to be filtered or not.
* @param {string} alignStr The alignment string in GIZA/Pharaoh format
* @return {Array.<Array.<number>|null,bool>} An array of the alignments or null and a boolean whether or not the alignments were valid
*/
export function createAlignsFromStr(alignStr) {
  try {
    // Will also throw an error when giving a negative value
    let aligns = alignStr.split(' ').map((pair) => pair.split('-', 2));
    const n = aligns.length;

    aligns = numberArraysSort(aligns.map((pair) => pair.map((x) => parseInt(x)))).filter((pair) => {
      return pair.length === 2 && pair.every((el) => el !== '' && !Number.isNaN(parseInt(el)));
    });
    // return whether or not the alignments are valid
    // if values were filtered, then that means the alignments are not valid
    return [aligns, n === aligns.length];
  } catch (error) {
    return [null, false];
  }
}

/**
 * Convert an array of arrays of numbers to a Pharaoh format representation.
 * @param {Array.<Array.<number>>} aligns Alignments in array form with numbers
 * @return {string} The alignments as a string as per GIZA/Pharaoh format
 */
export function createStrFromAligns(aligns) {
  return numberArraysSort(aligns).map((arr) => arr.map(String).join('-')).join(' ');
}


/**
 * Create a directional mapping of index to aligned indices. Also fills in unaligned words.
 * @param {Array.<Array.<number>>} aligns Alignments in array form with numbers
 * @param {string} side Use "src" or "tgt"
 * @param {number} nmax The number of items on the left side, so that we can fill in null alignments
 * @return {Object.<number, Array.<number>>} A mapping of index to aligned indices, e.g. src=>[tgt_idxs...] or tgt=>[src_ids...]
 */
export function createAlignMapping(aligns, side, nmax) {
  const index = side == 'src' ? 0 : 1;
  const otherIndex = index === 0 ? 1 : 0;

  const mapping = {};
  for (const arr of aligns) {
    if (arr[index] in mapping) {
      mapping[arr[index]].push(arr[otherIndex]);
    } else {
      mapping[arr[index]] = [arr[otherIndex]];
    }
  }
  for (let i = 0; i < nmax; i++) {
    if (!(i in mapping)) {
      mapping[i] = [];
    }
  }

  return mapping;
}

/**
 * Mimics the behavior of Python's zip to mutate embedded arrays.
 * @see https://stackoverflow.com/a/10284006/1150683
 * @param {Array.<Array>} arrays Embedded arrays, e.g. [[0, 1], [2, 3], [4, 5]]
 * @return {Array.<Array>} Zipped arrays, e.g. [[0, 2, 4], [1, 3, 5]]
 */
export function zip(arrays) {
  return arrays[0].map(function(_, i) {
    return arrays.map(function(array) {
      return array[i];
    });
  });
}

/**
 * Return false if any of the given (trimmed) values is the empty string.
 * @param  {...string} values Values to verify for emptiness
 * @return {boolean} Whether any of the given (trimmed) values is an empty string
 */
export function valuesNotEmpty(...values) {
  return values.every((val) => val.trim() !== '');
}

/**
 * Sorts a multi-dimensional array of numbers, first by the first item and then by the second.
 * This is the expected sort on multidimensional arrays, but JS does not support this out-of-the-box.
 * @param {Array.<Array.<number>>} array The multi-dimensional array of numbers to sort
 * @return {Array.<Array.<number>>} The sorted array
 */
function numberArraysSort(array) {
  return array.sort(function(a, b) {
    return a[0] === b[0] ? a[1] - b[1] : a[0] - b[0];
  });
}

/**
 * Smoothly scrolls an element into view.
 * @param {HTMLElement} el Element to scroll into view
 */
export function scrollIntoView(el) {
  el.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

/**
 * An object representation of a word (or token), with a text property as well as the indices it is aligned with.
 * @typedef {Object} Word
 * @property {string} text The text of the word
 * @property {Array.<number>} alignedIdxs The indices this word is aligned with
 */

/**
 * Adds aligned indices to all words in a given array of Words.
 * @param {Array.<Word>} words An array of {@link Word} elements
 * @param {Object.<number, Array.<number>>} mapping A mapping of index to aligned indices, e.g. src=>[tgt_idxs...] or tgt=>[src_ids...]
 * @return {Array.<Word>} The array of {@link Word} elements with alignedIdxs added based on the given mapping
 */
export function addAlignmentToWordsObj(words, mapping) {
  return Object.entries(mapping).map(([idx, alignedIdxs]) => {
    return {text: words[idx].text, alignedIdxs: alignedIdxs};
  });
}

/**
 * Reset aligned indices to empty arrays for all words.
 * @param {Array.<Word>} words An array of {@link Word} elements
 * @return {Array.<Word>} The array of {@link Word} elements with alignedIdxs reset to an empty array
 */
export function resetAlignedIdxs(words) {
  return words.map((word) => {
    return {text: word.text, alignedIdxs: []};
  });
}

/**
 * Remove an item (e.g. alignment pair, array of numbers) from an array (e.g. list of alignments, array of arrays of numbers).
 * @param {Array.<Array.<number>>} array Array of arrays of numbers
 * @param {Array.<number>} value Array of numbers to remove from array
 * @return {Array.<Array.<number>>|Array} A (potentially empty) array of arrays of numbers with value removed
 */
export function removeItemfromArray(array, value) {
  // because you cannot simply compare arrays in JS, we need to stringify them first
  const strArray = array.map(JSON.stringify);
  const idx = strArray.indexOf(JSON.stringify(value));
  if (idx > -1) {
    array.splice(idx, 1);
  }
  return array;
}

/**
 * Retrieving the tokens of an already tokenized string as an array.
 * Also filter out any potential false-y values.
 * @param {string} tok A string in which tokens are separated by white-space
 * @return {Array.<string>} Array of tokens strings
 */
export function tokStrToWords(tok) {
  return tok.split(' ').filter(Boolean).map((text) => {
    return {text: text, alignedIdxs: []};
  });
}
