import React, { PureComponent, Fragment } from 'react'

import '../styles/Astred.css';

import AstredViz from "./AstredViz"

import CheckboxInput from "./CheckboxInput"



class AstredSec extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            drawSeqGroups: false,
            drawSacrGroups: false,
            clicked: {}
        }

        this.wordProps = {
            text: "the given token",
            lemma: "lemma (base form)",
            head: "head of current word in dependency tree",
            pos: "universal part of speech tag",
            feats: "morphological features",
            cross: "number of times this word's alignment line crosses other alignments"
        }

        this.groupProps = {
            text: "the tokens of this group",
            cross: "number of times this word group's alignment line crosses other alignments",
            root: "the linguistic root of this group, i.e. the highest node in this group's dependency structure"
        }

        this.onChangeCheckbox = this.onChangeCheckbox.bind(this);
        this.onChangeClicked = this.onChangeClicked.bind(this);
    }

    onChangeCheckbox(checkbox) {
        this.setState({ [checkbox.name]: checkbox.checked })
    }

    onChangeClicked(el) {
        this.setState({ clicked: { side: el.dataset.side, index: el.dataset.index } })
    }

    render() {
        const isEmpty = !(this.props.astred && Object.keys(this.props.astred).length > 0)
        const clickedWord = (this.state.clicked && Object.keys(this.state.clicked).length > 0 && !isEmpty) ? this.props.astred[this.state.clicked.side][this.state.clicked.index] : null
        let legendClass = "legend"
        if (this.state.drawSeqGroups) {
            legendClass += " has-seq"
        }
        if (this.state.drawSacrGroups) {
            legendClass += " has-sacr"
        }

        return (
            <section id="astred" className={isEmpty ? "empty" : ""}>
                <div className="content">
                    <h2>ASTrED</h2>
                    <p>To be added...</p>
                    {
                        !isEmpty &&
                        <Fragment>
                            <div className="secondary-content">
                                <div className="item-info">
                                    {clickedWord ?
                                        <Fragment>
                                            <div className="item-info-content">
                                                <div>
                                                    <h3>Word information</h3>
                                                    <ul>
                                                        {
                                                            Object.entries(clickedWord).map(([prop, val], propId) => {
                                                                if (prop in this.wordProps) {
                                                                    if (prop === "feats") {
                                                                        return <li key={propId}><strong><abbr title={this.wordProps[prop]}>{prop}</abbr></strong>: {val.split("|").join(" ")}</li>
                                                                    }
                                                                    return <li key={propId}><strong><abbr title={this.wordProps[prop]}>{prop}</abbr></strong>: {val ? val : 0}</li>
                                                                }
                                                                return null
                                                            })
                                                        }
                                                        <li key="42"><strong>side</strong>: {this.state.clicked.side === "src" ? "source" : "target"}</li>                                                
                                                    </ul>

                                                </div>
                                                <div>
                                                    <h3>Sequence information</h3>
                                                    <ul>
                                                        {
                                                            Object.entries(clickedWord.seq).map(([prop, val], propId) => {
                                                                if (prop in this.groupProps) {
                                                                    return <li key={propId}><strong><abbr title={this.groupProps[prop]}>{prop}</abbr></strong>: {val ? val : 0}</li>
                                                                }
                                                                return null
                                                            })
                                                        }
                                                    </ul>
                                                    <h3>SACr information</h3>
                                                    <ul>
                                                        {
                                                            Object.entries(clickedWord.sacr).map(([prop, val], propId) => {
                                                                if (prop in this.groupProps) {
                                                                    return <li key={propId}><strong><abbr title={this.groupProps[prop]}>{prop}</abbr></strong>: {val ? val : 0}</li>
                                                                }
                                                                return null
                                                            })
                                                        }
                                                    </ul>
                                                </div>
                                            </div>
                                        </Fragment> : <p>Click a word to see its information.</p>
                                    }
                                </div>
                                <div className="controls">
                                    <form onSubmit={evt => evt.preventDefault()}>
                                        <CheckboxInput key={0} label="Seq." title="Draw sequence group alignments" name="drawSeqGroups" iconName="pencil-alt"
                                            onChangeCheckbox={this.onChangeCheckbox} checked={this.state.drawSeqGroups} />
                                        <CheckboxInput key={1} label="SACr" title="Draw SACr (linguistic) group alignments" name="drawSacrGroups" iconName="pencil-alt"
                                            onChangeCheckbox={this.onChangeCheckbox} checked={this.state.drawSacrGroups} />
                                    </form>

                                    <aside className={legendClass}>
                                        <ul>
                                            <li key="0">Word alignments: <svg xmlns="http://www.w3.org/2000/svg" height="4" width="36"><line x1="0" y1="2" x2="100%" y2="2" className="legend-line-word"></line></svg></li>
                                            {this.state.drawSeqGroups && <li key="1">Sequence alignments: <svg xmlns="http://www.w3.org/2000/svg" height="4" width="36"><line x1="0" y1="2" x2="100%" y2="2" className="legend-line-seq"></line></svg></li>}
                                            {this.state.drawSacrGroups && <li key="2">SACr alignments: <svg xmlns="http://www.w3.org/2000/svg" height="4" width="36"><line x1="0" y1="2" x2="100%" y2="2" className="legend-line-sacr"></line></svg></li>}
                                        </ul>
                                    </aside>
                                </div>
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

export default AstredSec;
