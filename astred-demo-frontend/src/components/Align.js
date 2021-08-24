import '../styles/Align.css';

import {addAlignmentToWordsObj,
  createAlignMapping,
  createAlignsFromStr,
  valuesNotEmpty, zip} from '../utils';
import {ALIGN_URL, ASTRED_URL} from '../constants';
import React, {PureComponent} from 'react';
import AlignViz from './AlignViz';
import Details from './Details';
import PropTypes from 'prop-types';
import TextInput from './TextInput';


class AlignSec extends PureComponent {
  constructor(props) {
    super(props);
    this.handleManualTokChange = this.handleManualTokChange.bind(this);
    this.handleManualAlignChange = this.handleManualAlignChange.bind(this);
    this.fetchWordAligns = this.fetchWordAligns.bind(this);
    this.fetchAstred = this.fetchAstred.bind(this);

    this.alignsCorrespondToWords = this.alignsCorrespondToWords.bind(this);
    this.validateAllFields = this.validateAllFields.bind(this);
    this.validateWordAlignField = this.validateWordAlignField.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.updateAlignFieldWithValue = this.updateAlignFieldWithValue.bind(this);
    this.state = {
      wordAlignsValid: true,
    };

    this.aligner = React.createRef();
  }

  handleManualTokChange(textField) {
    const val = this.validateTextField(textField);
    this.props.onAppStateChange(textField.name, val);
    // Also validate word alignments according to new tokens but do not "reportValidity" as that will trigger a focus
    const alignInfo = this.validateWordAlignField(this.aligner.current.querySelector('input[name=\'wordAlignsStr\']'), false);
    this.setState({wordAlignsValid: alignInfo.wordAlignsValid});
  }

  validateTextField(textField) {
    if (textField.value.trim() === '') {
      textField.setCustomValidity('Field cannot be empty or contain only spaces.');
    } else {
      textField.setCustomValidity('');
    }

    textField.reportValidity();

    return textField.value;
  }

  validateAllFields(skipWordAligns = false) {
    this.aligner.current.querySelectorAll('input[type=\'text\']').forEach((el) => {
      if (el.name === 'wordAlignsStr') {
        if (!skipWordAligns) {
          this.validateTextField(el);
          this.validateWordAlignField(el);
        }
      } else {
        this.validateTextField(el);
      }
    });
  }

  validateWordAlignField(alignField, reportValidity = true) {
    const alignStr = alignField.value;

    if (alignStr.trim() === '') {
      alignField.setCustomValidity('Field cannot be empty or contain only spaces.');
    }

    // returns a tuple: [aligns (if any), bool(validAligns)]
    const alignsTuple = createAlignsFromStr(alignStr.trim());
    let wordAlignsValid = false;

    // set aligns to previous aligns so that the visualizer still works
    // but the aligns will still be invalid (so user cannot continue to ASTrED due to state.wordAlignsValid)
    let aligns = this.props.wordAligns;

    if (!alignsTuple[1]) {
      alignField.setCustomValidity('Word alignments need to be of the format i-j for each source and target index pair.');
    } else {
      if (this.alignsCorrespondToWords(alignsTuple[0])) {
        alignField.setCustomValidity('');
        wordAlignsValid = true;
        aligns = alignsTuple[0];
      } else {
        alignField.setCustomValidity('The indices given in the word alignments must correspond to words. An index that you provided is not correct. Keep in mind that the indices are zero-based, so the first element has index 0.');
      }
    }

    if (reportValidity) alignField.reportValidity();

    return {wordAlignsStr: alignStr, wordAlignsValid: wordAlignsValid, aligns: aligns};
  }

  handleManualAlignChange(alignField) {
    const alignInfo = this.validateWordAlignField(alignField);

    this.setState({wordAlignsValid: alignInfo.wordAlignsValid});

    let srcWords = this.props.srcWords;
    let tgtWords = this.props.tgtWords;

    // Only update srcWords and tgtWords if the alignment is valid, otherwise we can get errors
    // in the mapping function
    // Note: words only change here with respect to their .alignedIdxs
    if (alignInfo.wordAlignsValid) {
      const src2tgt = createAlignMapping(alignInfo.aligns, 'src', this.props.srcWords.length);
      const tgt2src = createAlignMapping(alignInfo.aligns, 'tgt', this.props.tgtWords.length);
      srcWords = addAlignmentToWordsObj(this.props.srcWords, src2tgt);
      tgtWords = addAlignmentToWordsObj(this.props.tgtWords, tgt2src);
    }

    this.props.onWordAlignFetch({
      wordAlignsStr: alignInfo.wordAlignsStr,
      wordAligns: alignInfo.aligns,
      srcWords: srcWords,
      tgtWords: tgtWords,
    });
  }

  async fetchWordAligns() {
    if (this.props.srcTokStr.trim() !== '' && this.props.tgtTokStr.trim() !== '') {
      // Add class to the previous section so that loading CSS is set on current element
      this.aligner.current.previousElementSibling.classList.add('loading');

      const url = new URL(ALIGN_URL);
      const alignFormData = new FormData();
      alignFormData.append('src_sentence', this.props.srcTokStr);
      alignFormData.append('tgt_sentence', this.props.tgtTokStr);
      url.search = new URLSearchParams(alignFormData).toString();

      const alignResponse = (await this.props.fetchUrl(url));

      if (alignResponse && Object.keys(alignResponse).length > 0 && 'word_aligns' in alignResponse) {
        this.updateAlignFieldWithValue(alignResponse.word_aligns);
      } else {
        this.props.onError('Automatic alignment failed. Response did not contain the required data.');
      }

      this.aligner.current.previousElementSibling.classList.remove('loading');
    }
  }

  async fetchAstred() {
    if (this.props.srcTokStr.trim() !== '' && this.props.tgtTokStr.trim() !== '' && this.props.wordAlignsStr.trim() !== '') {
      this.aligner.current.classList.add('loading');
      const url = new URL(ASTRED_URL);
      const alignFormData = new FormData();
      alignFormData.append('src_sentence', this.props.srcTokStr);
      alignFormData.append('tgt_sentence', this.props.tgtTokStr);
      alignFormData.append('aligns', this.props.wordAlignsStr);
      alignFormData.append('src_lang', this.props.srcLang);
      alignFormData.append('tgt_lang', this.props.tgtLang);
      url.search = new URLSearchParams(alignFormData).toString();

      const astredInfo = (await this.props.fetchUrl(url));
      this.props.onAstredFetch(astredInfo);

      this.aligner.current.classList.remove('loading');
    }
  }

  updateAlignFieldWithValue(alignStr) {
    const alignField = this.aligner.current.querySelector('input[name=\'wordAlignsStr\']');
    alignField.value = alignStr;
    this.handleManualAlignChange(alignField);
  }

  handleSubmit(evt) {
    evt.preventDefault();

    this.validateAllFields();
    this.fetchAstred();
  }

  alignsCorrespondToWords(aligns) {
    // Do all indices in the alignment correspond to a word? (i.e. do the alignments contain an index larger than the number of words)
    const nSrcWords = this.props.srcWords.length;
    const nTgtWords = this.props.tgtWords.length;
    const maxIdxs = zip(aligns).map((arr) => Math.max(...arr));
    return (maxIdxs[0] < nSrcWords && maxIdxs[1] < nTgtWords);
  }

  render() {
    return (
      <section id="align" ref={this.aligner}>
        <div className="content">
          <h2>Word alignment</h2>
          <p>Here you can word-align the tokenized sentences and make changes to the suggested tokens. To ease the process, you can request suggestions for automatic word alignments. These are not always very accurate, so it is recommended to use these as guidelines or a starting point and then manually correct them.</p>
          <p>You can change the word alignments either by typing them (<code>src_word_idx-tgt_word_idx</code>; start counting at 0), or by clicking. First click on a word and then click on the target word
          you wish to align it with. To remove an alignment, do the same.</p>

          <Details>
            <p>Word alignment is the procedure of connecting (aligning) a word with its translation or corresponding meaning equivalent. As a rule for this tool, you should align the smallest possible meaningful entities. This is not always possible, however, for instance in multi-word expressions or free translations. In such cases you can align a word with multiple others. You can also remove an alignment if there is no meaning-equivalent available.</p>
            <p>Alignment suggestions are given by <a href="https://github.com/neulab/awesome-align" title="Awesome Align on Github" target="_blank" rel="noreferrer noopener">Awesome Align</a>, and linguistic processing is executed by StanfordNLP&apos;s <a href="https://stanfordnlp.github.io/stanza/" title="Stanza home page" target="_blank" rel="noreferrer noopener">Stanza</a>. This information is then used by <a href="https://github.com/BramVanroy/astred" title="Open-source implementation of ASTrED" target="_blank" rel="noreferrer noopener">ASTrED</a> to calculate the similarity metrics.</p>
          </Details>

          <form onSubmit={this.handleSubmit}>
            <TextInput
              label="Tokenized source sentence"
              name="srcTokStr"
              value={this.props.srcTokStr}
              onChange={(evt) => this.handleManualTokChange(evt.target)}
            />
            <TextInput
              label="Tokenized target sentence"
              name="tgtTokStr"
              value={this.props.tgtTokStr}
              onChange={(evt) => this.handleManualTokChange(evt.target)}
            />
            <TextInput
              label="Word alignments"
              name="wordAlignsStr"
              value={this.props.wordAlignsStr}
              onChange={(evt) => this.handleManualAlignChange(evt.target)}
              isAlignField={true}
              iconName="asterisk"
            />
            <input type="button" value="Suggest alignments" disabled={!valuesNotEmpty(this.props.srcTokStr, this.props.tgtTokStr)} name="fetch-aligns-btn" onClick={this.fetchWordAligns} />
            <input type="submit" value="Continue" disabled={!valuesNotEmpty(this.props.srcTokStr, this.props.tgtTokStr, this.props.wordAlignsStr) || !this.state.wordAlignsValid} name="calculate-astred-btn" />
          </form>
          <AlignViz
            srcWords={this.props.srcWords}
            tgtWords={this.props.tgtWords}
            wordAligns={this.props.wordAligns}
            wordAlignsStr={this.props.wordAlignsStr}
            onAlignUpdate={this.updateAlignFieldWithValue}
          />
        </div>
      </section>
    );
  }
}

AlignSec.propTypes = {
  fetchUrl: PropTypes.func,
  onAppStateChange: PropTypes.func,
  onAstredFetch: PropTypes.func,
  onError: PropTypes.func,
  onWordAlignFetch: PropTypes.func,
  srcLang: PropTypes.string,
  srcTokStr: PropTypes.string,
  srcWords: PropTypes.arrayOf(PropTypes.object),
  tgtLang: PropTypes.string,
  tgtTokStr: PropTypes.string,
  tgtWords: PropTypes.arrayOf(PropTypes.object),
  wordAligns: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  wordAlignsStr: PropTypes.string,
};


export default AlignSec;
