import '../styles/PageIntroduction.css';

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import Publication from './Publication';


class PageIntroduction extends PureComponent {
  render() {
    return (
      <section id="introduction">
        <div className="content">
          <div>
            <h2>Introduction</h2>
            <p>This demo illustrates a number of metrics that quantify the syntactic differences between two sentences. These sentences can (but need not) be written in a different language. Such metrics are for instance useful when comparing a (machine) translation with the original source text, to find differences and similarities between two different translations, or to see how a machine translation differs from a reference translation.</p>
            <p>The demo allows you to provide two sentences and their respective language (currently <span className="languages">{this.props.languages.join(', ')}</span> {this.props.languages.length > 1 ? 'are' : 'is'} supported). In the following steps your given text will be automatically tokenized and aligned, but you can improve the suggestions at every step. Finally, after analyzing the processed data, the resulting metrics are given for each word.</p>
          </div>
          <div id="publications">
            <h2>Publications</h2>
            <div className="publications">
              <Publication
                contents={<p>Vanroy, B., Schaeffer, M., &amp; Macken, L. (2021) Comparing the Effect of Product-Based Metrics on the Translation Process. <em>Frontiers in Psychology</em>, 12. <a href="https://doi.org/10.3389/fpsyg.2021.681945" title="Comparing the Effect of Product-Based Metrics on the Translation Process" target="_blank" rel="noreferrer noopener">https://doi.org/10.3389/fpsyg.2021.681945</a></p>}
                iconName="file-alt"
                title="Comparing the Effect of Product-Based Metrics on the Translation Process"
                url="https://doi.org/10.3389/fpsyg.2021.681945" />
              <Publication
                contents={<p>Vanroy, B., De Clercq, O., Tezcan, A., Daems, J., &amp; Macken, L. (2021). Metrics of Syntactic Equivalence to Assess Translation Difficulty. In <em>Explorations in Empirical Translation Process Research</em> (pp. 259–294). Springer International Publishing. <a href="https://doi.org/10.1007/978-3-030-69777-8_10" title="Metrics of Syntactic Equivalence to Assess Translation Difficulty" target="_blank" rel="noreferrer noopener">https://doi.org/10.1007/978-3-030-69777-8_10</a></p>}
                iconName="file-alt"
                title="Metrics of Syntactic Equivalence to Assess Translation Difficulty"
                url="https://doi.org/10.1007/978-3-030-69777-8_10" />
              <Publication
                contents={<p>Open-source Python implementation of all proposed syntactic metrics on <a href="https://github.com/BramVanroy/astred" title="Open-source implementation of ASTrED" target="_blank" rel="noreferrer noopener">Github</a></p>}
                iconName="file-code"
                title="Open-source implementation of ASTrED"
                url="https://github.com/BramVanroy/astred" />
            </div>
          </div>
        </div>
      </section>
    );
  }
}

PageIntroduction.propTypes = {
  languages: PropTypes.arrayOf(PropTypes.string),
};

export default PageIntroduction;
