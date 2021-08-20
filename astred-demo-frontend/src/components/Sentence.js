import React, { Component } from 'react'

class Sentence extends Component {
    constructor(props) {
        super(props);
        this.onClickSentence = this.onClickSentence.bind(this);
        this.onMouseOverSentence = this.onMouseOverSentence.bind(this);
        this.buildWordClass = this.buildWordClass.bind(this);
    }

    onClickSentence(evt) {
        if (evt.target.tagName === "SPAN") {
            this.props.onClickSentence(this.props.side, parseInt(evt.target.dataset.index))
        }
    }

    onMouseOverSentence(evt) {
        if (evt.target.tagName === "SPAN") {
            this.props.onMouseOverSentence(this.props.side, parseInt(evt.target.dataset.index), JSON.parse(evt.target.dataset.aligned))
        }
    }

    buildWordClass(wordIdx, alignedIdxs) {
        const side = this.props.side
        const otherSide = side === "src" ? "tgt" : "src"
        let className = "word"

        if (this.props.hovered[side].includes(wordIdx) || this.props.clicked[side] === wordIdx) {
            className += " highlight"
        }

        if (this.props.clicked[otherSide] !== null && this.props.clicked[side] === null) {
            className += alignedIdxs.includes(this.props.clicked[otherSide]) ? " removable" : " alignable"
        }

        return className
    }

    render() {
        return (
            <div className={`${this.props.side} sentence`} onClick={this.onClickSentence} onMouseOver={this.onMouseOverSentence}>
                {
                    this.props.words.map((word, wordIdx) => {
                        const alignedIdxs = JSON.stringify(word.alignedIdxs)
                        return (<span key={wordIdx} className={this.buildWordClass(wordIdx, alignedIdxs)} data-side={this.props.side} data-aligned={alignedIdxs} data-index={wordIdx}
                        onMouseLeave={this.props.removeHovered}>{word.text}</span>)
                    })
                }
            </div>
        );
    }
}

export default Sentence;
