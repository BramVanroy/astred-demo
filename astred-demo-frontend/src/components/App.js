import '../styles/App.css';

import {faAsterisk, faFileAlt, faFileCode, faFont, faLanguage, faPencilAlt} from '@fortawesome/free-solid-svg-icons';
import React, {Component, Fragment} from 'react';
import AlignSec from './Align';
import AstredSec from './Astred';
import Error from './Error';
import {LANG_URL} from '../constants';
import {library} from '@fortawesome/fontawesome-svg-core';
import PageFooter from './PageFooter';
import PageHeader from './PageHeader';
import PageIntroduction from './PageIntroduction';
import {scrollIntoView} from '../utils';
import TokenizeSec from './Tokenize';


library.add(faAsterisk, faFileAlt, faFileCode, faFont, faLanguage, faPencilAlt);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      srcStr: 'Sometimes she asks me why I used to call her father Harold',
      tgtStr: 'Soms vraagt ze waarom ik haar vader Harold noemde',
      srcLang: 'en',
      tgtLang: 'nl',
      srcTokStr: '',
      srcWords: [],
      tgtTokStr: '',
      tgtWords: [],
      wordAlignsStr: '',
      wordAligns: [],
      astred: {},
      languages: [],
      error: '',
    };

    this.fetchUrl = this.fetchUrl.bind(this);
    this.onAppStateChange = this.onAppStateChange.bind(this);
    this.onError = this.onError.bind(this);
    this.onWordAlignFetch = this.onWordAlignFetch.bind(this);
    this.onTokenizeFetch = this.onTokenizeFetch.bind(this);
    this.onAstredFetch = this.onAstredFetch.bind(this);

    this.alignSec = React.createRef();
  }

  onError(errorStr) {
    this.setState({'error': errorStr});
  }

  async fetchLanguages() {
    // Languages that we support and their abbreviations for the parsers
    // We assume that Dutch (nl) and English (en) are always included because we have en and nl defaults
    const langInfo = (await this.fetchUrl(LANG_URL));

    if (langInfo && Object.keys(langInfo).length > 0) {
      this.setState({languages: Object.entries(langInfo).map(([abbr, info]) => {
        return [info.text, abbr];
      })});
    }
  }

  tokStrToWords(tok) {
    return tok.split(' ').filter(Boolean).map((text) => {
      return {text: text};
    });
  }

  onTokenizeFetch(tokenizeInfo) {
    this.setState({
      ...tokenizeInfo,
      ...{
        srcWords: this.tokStrToWords(tokenizeInfo.srcTokStr),
        tgtWords: this.tokStrToWords(tokenizeInfo.tgtTokStr),

      },
    });
    // Need to validate here for cases where we tokenize, then remove everything in tok field, and then tokenize again
    // otherwise the field will not be revalidated and still considered invalid
    this.alignSec.current.validateAllFields(true);
    scrollIntoView(document.querySelector('#align'));
  }

  onAppStateChange(prop, val) {
    if (prop === 'srcTokStr') {
      // Filter false-y values (particularly empty strings)
      this.setState({srcWords: this.tokStrToWords(val), srcTokStr: val});
      return;
    } else if (prop === 'tgtTokStr') {
      this.setState({tgtWords: this.tokStrToWords(val), tgtTokStr: val});
      return;
    }

    this.setState({[prop]: val});
  }

  onAstredFetch(astredInfo) {
    this.setState({astred: astredInfo});
    scrollIntoView(document.querySelector('#astred'));
  }

  onWordAlignFetch(alignInfo) {
    this.setState(alignInfo);
  }

  componentDidMount() {
    this.fetchLanguages();
  }

  static getDerivedStateFromError(error) {
    return {error: error.toString()};
  }

  /**
 * Send GET (fetch) request to the API and return the Promise.
 * @param {URL} url URL to fetch
 * @return {Promise} Promise to the result of the API
 */
  async fetchUrl(url) {
    return fetch(url).then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        response.text().then((text) => {
          throw Error(text);
        });
      }
    },
    ).catch((errStr) => {
      this.onError(String(errStr));
    });
  }

  render() {
    return (
      <Fragment>
        <PageHeader />
        <main className="page-wrapper">
          {this.state.error ? <Error error={this.state.error}/> :
        <Fragment>
          <PageIntroduction languages={this.state.languages.map((langInfo) => langInfo[0])}/>
          <TokenizeSec
            fetchUrl={this.fetchUrl}
            onAppStateChange={this.onAppStateChange}
            onTokenizeFetch={this.onTokenizeFetch}
            srcStr={this.state.srcStr}
            srcLang={this.state.srcLang}
            tgtStr={this.state.tgtStr}
            tgtLang={this.state.tgtLang}
            languages={this.state.languages}
            onError={this.onError} />

          <AlignSec
            ref={this.alignSec}
            fetchUrl={this.fetchUrl}
            onAppStateChange={this.onAppStateChange}
            onWordAlignFetch={this.onWordAlignFetch}
            onAstredFetch={this.onAstredFetch}
            srcTokStr={this.state.srcTokStr}
            srcWords={this.state.srcWords}
            tgtTokStr={this.state.tgtTokStr}
            tgtWords={this.state.tgtWords}
            wordAlignsStr={this.state.wordAlignsStr}
            wordAligns={this.state.wordAligns}
            srcLang={this.state.srcLang}
            tgtLang={this.state.tgtLang}
            onError={this.onError}
          />

          <AstredSec
            astred={this.state.astred}
            onError={this.onError}
          />

        </Fragment>}
        </main>
        <PageFooter />
      </Fragment>
    );
  }
}

export default App;
