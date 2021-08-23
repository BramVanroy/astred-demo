import '../styles/Tokenize.css';

import React, {PureComponent} from 'react';
import Details from './Details';
import LangSelect from './LangSelect';
import PropTypes from 'prop-types';
import TextInput from './TextInput';
import {TOKENIZE_URL} from '../constants';


class TokenizeSec extends PureComponent {
  constructor(props) {
    super(props);
    this.handleLangChange = this.handleLangChange.bind(this);
    this.handleTextFieldChange = this.handleTextFieldChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.tokenizer = React.createRef();
  }

  async getTokStr(side) {
    const url = new URL(TOKENIZE_URL);
    const reqData = new FormData();
    reqData.append('sentence', this.props[`${side}Str`]);
    reqData.append('lang', this.props[`${side}Lang`]);
    url.search = new URLSearchParams(reqData).toString();

    const tokReponse = (await this.props.fetchUrl(url));

    if (tokReponse && Object.keys(tokReponse).length > 0 && 'tok' in tokReponse) {
      return tokReponse.tok;
    }
    this.props.onError('Tokenization failed. Response did not contain the required data.');
    return '';
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

  handleTextFieldChange(textField) {
    const val = this.validateTextField(textField);
    this.props.onAppStateChange(textField.name, val);
  }

  handleLangChange(selectEl) {
    this.props.onAppStateChange(selectEl.name, selectEl.value);
  }

  async handleSubmit(evt) {
    evt.preventDefault();

    this.tokenizer.current.classList.add('loading');
    const [srcTokStr, tgtTokStr] = await Promise.all([this.getTokStr('src'), this.getTokStr('tgt')]);

    this.props.onTokenizeFetch({srcTokStr: srcTokStr, tgtTokStr: tgtTokStr});
    this.tokenizer.current.classList.remove('loading');
  }

  render() {
    return (
      <section id="tokenize" ref={this.tokenizer}>
        <div className="content">
          <h2>Tokenization and language selection</h2>
          <p>Enter the source and target sentences that you wish to analyze. The language selection will be used later on as well so make sure it is correct.</p>
          <p>The tool will attempt to automatically tokenize your given sentences, but if needed you can make changes in the next step.</p>

          <Details>
            <p>With ASTrED, we want to get information for each <em>token</em>, a self-contained linguistic element.
            For instance, <em>you&apos;re</em> consists of the tokens <em>you</em> and <em>&apos;re</em>. For our linguistic analysis, we therefore have
            to make sure that our input is tokenized: all tokens need a space between them, e.g. <em>you &apos;re</em>. Another example is that syntactic punctuation
            is often a token by itself and separate from other tokens, except in cases where it is clearly part of that token, as indicated by the <em>you &apos;re</em> example.</p>
          </Details>

          <form onSubmit={this.handleSubmit}>
            <TextInput
              label="Source sentence"
              name="srcStr"
              value={this.props.srcStr}
              onChange={(evt) => this.handleTextFieldChange(evt.target)}
            />
            <LangSelect
              label="Source language"
              name="srcLang"
              value={this.props.srcLang}
              onChange={(evt) => this.handleLangChange(evt.target)}
              languages={this.props.languages}
            />
            <TextInput
              label="Target sentence"
              name="tgtStr"
              value={this.props.tgtStr}
              onChange={(evt) => this.handleTextFieldChange(evt.target)}
            />
            <LangSelect
              label="Target language"
              name="tgtLang"
              value={this.props.tgtLang}
              onChange={(evt) => this.handleLangChange(evt.target)}
              languages={this.props.languages}
            />
            <input type="submit" value="Continue" />
          </form>
        </div>
      </section>
    );
  }
}

TokenizeSec.propTypes = {
  fetchUrl: PropTypes.func,
  languages: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
  onAppStateChange: PropTypes.func,
  onError: PropTypes.func,
  onTokenizeFetch: PropTypes.func,
  srcLang: PropTypes.string,
  srcStr: PropTypes.string,
  tgtLang: PropTypes.string,
  tgtStr: PropTypes.string,
};

export default TokenizeSec;
