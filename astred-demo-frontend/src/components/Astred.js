import '../styles/Astred.css';

import React, {Fragment, PureComponent} from 'react';
import AstredViz from './AstredViz';
import CheckboxInput from './CheckboxInput';
import PropTypes from 'prop-types';


class AstredSec extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      drawSeqGroups: false,
      drawSacrGroups: false,
      clicked: {},
    };

    this.wordProps = {
      text: 'the given token',
      lemma: 'lemma (base form)',
      head: 'head of current word in dependency tree',
      pos: 'universal part of speech tag',
      feats: 'morphological features',
      cross: 'number of times this word\'s alignment line crosses other alignments',
      deprel: 'dependency label',
      labelChanges: 'whether the dependency label differs between this word and its aligned words',
      astredOp: 'which tree edit operation has to occur in the ASTrED trees (see papers for more info)',
    };

    this.groupProps = {
      text: 'the tokens of this group',
      cross: 'number of times this word group\'s alignment line crosses other alignments',
      root: 'the linguistic root of this group, i.e. the highest node in this group\'s dependency structure',
    };

    this.onChangeCheckbox = this.onChangeCheckbox.bind(this);
    this.onChangeClicked = this.onChangeClicked.bind(this);
  }

  onChangeCheckbox(checkbox) {
    this.setState({[checkbox.name]: checkbox.checked});
  }

  onChangeClicked(side, wordIdx) {
    this.setState({clicked: {side: side, index: wordIdx}});
  }

  static getDerivedStateFromProps(nextProps) {
    if (!(nextProps.astred && Object.keys(nextProps.astred).length > 0)) {
      return {
        drawSeqGroups: false,
        drawSacrGroups: false,
        clicked: {},
      };
    }
    return null;
  }

  render() {
    const isEmpty = !(this.props.astred && Object.keys(this.props.astred).length > 0);
    const clickedWord = (this.state.clicked && Object.keys(this.state.clicked).length > 0 && !isEmpty) ? this.props.astred[this.state.clicked.side][this.state.clicked.index] : null;
    const otherSide = this.state.clicked.side == 'src' ? 'tgt' : 'src';

    let legendClass = 'legend';
    if (this.state.drawSeqGroups) {
      legendClass += ' has-seq';
    }
    if (this.state.drawSacrGroups) {
      legendClass += ' has-sacr';
    }

    return (
      <section id="astred">
        <div className="content">
          <h2>ASTrED</h2>
          <p>Click on a word to see more information about it. Particularly the syntactic metrics are of interest in this demo: cross, astredOp, and labelChanges.</p>
          <ul>
            <li><strong>cross</strong>: number of times this word&apos;s alignment line crosses other alignments</li>
            <li><strong>astredOp</strong>: which tree edit operation has to occur for this word in the ASTrED tree (see <a href="#publications" title="ASTrED publications">papers</a> for more info)</li>
            <li><strong>labelChanges</strong>: whether the dependency label differs between this word and its aligned words
            </li>
          </ul>
          <p>We also provide cross values for two types of word groups. <strong>sequences</strong> and <strong>SACr groups</strong>. The interested reader can find a more elaborate explanation in our <a href="#publications" title="ASTrED publications">publications</a>. The formation of these groups can be visualized with their respective checkboxes.</p>
          <ul>
            <li><strong>Sequence</strong>: a sequence is defined as a word group whose words are consecutive and whose word alignments do not cross each other</li>
            <li><strong>SACr</strong>: a SACr group expands the definition of a sequence but also requires that all the words in it constitute a valid subtree in the dependency structure of its respective sentence</li>
          </ul>
          <p>The cross value of a group thus indicates how frequently the alignment line <em>of this group</em> crosses other groups of this type.</p>
          {
            !isEmpty &&
              <Fragment>
                <div className="secondary-content">
                  <div className="controls">
                    <form onSubmit={(evt) => evt.preventDefault()}>
                      <CheckboxInput key={0} label="Seq." title="Draw sequence group alignments" name="drawSeqGroups" iconName="pencil-alt"
                        onChange={this.onChangeCheckbox} checked={this.state.drawSeqGroups} />
                      <CheckboxInput key={1} label="SACr" title="Draw SACr (linguistic) group alignments" name="drawSacrGroups" iconName="pencil-alt"
                        onChange={this.onChangeCheckbox} checked={this.state.drawSacrGroups} />
                    </form>

                    <aside className={legendClass}>
                      <ul>
                        <li key="0">Word alignments: <svg xmlns="http://www.w3.org/2000/svg" height="4" width="36"><line x1="0" y1="2" x2="100%" y2="2" className="legend-line-word"></line></svg></li>
                        {this.state.drawSeqGroups && <li key="1">Sequence alignments: <svg xmlns="http://www.w3.org/2000/svg" height="4" width="36"><line x1="0" y1="2" x2="100%" y2="2" className="legend-line-seq"></line></svg></li>}
                        {this.state.drawSacrGroups && <li key="2">SACr alignments: <svg xmlns="http://www.w3.org/2000/svg" height="4" width="36"><line x1="0" y1="2" x2="100%" y2="2" className="legend-line-sacr"></line></svg></li>}
                      </ul>
                    </aside>
                  </div>
                  {clickedWord ?
                      <Fragment>
                        <div className="word-content">
                          <h3>Word information</h3>
                          <ul>
                            {
                              Object.entries(clickedWord).map(([prop, val], propId) => {
                                if (prop in this.wordProps) {
                                  if (prop === 'feats') {
                                    if (val === '_') {
                                      return null;
                                    }
                                    return <li key={propId}><strong><abbr title={this.wordProps[prop]}>{prop}</abbr></strong>:  <ul>
                                      {val.split('|').map((feat, featId) => {
                                        return <li key={featId}>{feat}</li>;
                                      })}
                                    </ul></li>;
                                  } else if (prop == 'labelChanges') {
                                    if (clickedWord.alignedIdxs[0] === -1) {
                                      // Don't add list items for non-aligned words
                                      return null;
                                    }
                                    return (<li key={propId}><strong><abbr title={this.wordProps[prop]}>{prop}</abbr></strong>: <ul>
                                      {Object.entries(val).map(([alignedIdx, changed], subId) => {
                                        return <li key={subId}><em>{this.props.astred[otherSide][alignedIdx].text}</em>:
                                          <span className={changed ? 'changed' : ''}>{this.props.astred[otherSide][alignedIdx].deprel}</span></li>;
                                      })}
                                    </ul></li>);
                                  }
                                  return <li key={propId}><strong><abbr title={this.wordProps[prop]}>{prop}</abbr></strong>: {val ? val : 0}</li>;
                                }
                                return null;
                              })
                            }
                          </ul>
                        </div>
                        <div className="groups-content">
                          <h3>Sequence information</h3>
                          <ul>
                            {
                              Object.entries(clickedWord.seq).map(([prop, val], propId) => {
                                if (prop in this.groupProps) {
                                  return <li key={propId}><strong><abbr title={this.groupProps[prop]}>{prop}</abbr></strong>: {val ? val : 0}</li>;
                                }
                                return null;
                              })
                            }
                          </ul>
                          <h3>SACr information</h3>
                          <ul>
                            {
                              Object.entries(clickedWord.sacr).map(([prop, val], propId) => {
                                if (prop in this.groupProps) {
                                  return <li key={propId}><strong><abbr title={this.groupProps[prop]}>{prop}</abbr></strong>: {val ? val : 0}</li>;
                                }
                                return null;
                              })
                            }
                          </ul>
                        </div>
                      </Fragment> : <p>Click on a word to see its information.</p>
                  }
                </div>
                <AstredViz
                  astred={this.props.astred}
                  drawSeqGroups={this.state.drawSeqGroups}
                  drawSacrGroups={this.state.drawSacrGroups}
                  onChangeClicked={this.onChangeClicked}
                  clicked={this.state.clicked}
                />
              </Fragment>}
        </div>
      </section>
    );
  }
}

AstredSec.propTypes = {
  astred: PropTypes.object,
};

export default AstredSec;
