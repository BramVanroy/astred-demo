import React, { PureComponent, Fragment } from 'react'

import '../styles/AlignViz.css';

import Sentence from "./Sentence"
import { createAlignsFromStr, createStrFromAligns, removeItemfromArray } from "../utils"


// HERE: problem with lines: they highlight whenever a src or tgt is currently in hover. But we only want if line connects to currently hovered item
// So, maybe add hovered.focusSide = "src" or "tgt", and then only check that side with the lines

class AlignViz extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            hovered: { src: [], tgt: [] },
            clicked: { src: null, tgt: null },
            focusedSide: null
        }

        this.removeHovered = this.removeHovered.bind(this);
        this.removeClicked = this.removeClicked.bind(this);
        this.addOrRemoveAlignable = this.addOrRemoveAlignable.bind(this);
        this.onWindowClick = this.onWindowClick.bind(this);
        this.onMouseOverSentence = this.onMouseOverSentence.bind(this);
        this.onClickSentence = this.onClickSentence.bind(this);

        this.setSvgWidth = this.setSvgWidth.bind(this);
        this.reDraw = this.reDraw.bind(this);
        this.buildLineClass = this.buildLineClass.bind(this);        

        this.alignVizDom = React.createRef();
    }

    updateLinePosition(fromTextMargin = 4) {
        if (!this.alignVizDom.current.querySelector(".sentence.src")) {
            return
        }
        const wrapperBox = this.alignVizDom.current.getBoundingClientRect()
        const textH = this.alignVizDom.current.querySelector(".sentence.src").getBoundingClientRect().height

        const srcNodes = this.alignVizDom.current.querySelectorAll(".sentence.src .word")
        const tgtNodes = this.alignVizDom.current.querySelectorAll(".sentence.tgt .word")
        const scrollX = this.alignVizDom.current.scrollLeft

        this.alignVizDom.current.querySelectorAll("line").forEach(line => {
            try {
                const srcRect = srcNodes[parseInt(line.getAttribute("src"))].getBoundingClientRect()
                const tgtRect = tgtNodes[parseInt(line.getAttribute("tgt"))].getBoundingClientRect()
                line.setAttribute("x1", srcRect.x + (srcRect.width / 2) - wrapperBox.x + scrollX)
                line.setAttribute("y1", srcRect.y - wrapperBox.y + textH + fromTextMargin)
                line.setAttribute("x2", tgtRect.x + (tgtRect.width / 2) - wrapperBox.x + scrollX)
                line.setAttribute("y2", tgtRect.y - wrapperBox.y - fromTextMargin)
            } catch (err) {
                // you return in ForEach to do "continue" because you return _from the callback_
                return
            }
        })
    }

    /**
     * Remove the "highlight" class from all words and lines
     */
    removeHovered() {
        this.setState({
            hovered: { src: [], tgt: [] },
            focusedSide: null
        })
    }

    /**
     * Remove the clicked status
     */
    removeClicked() {
        this.setState({
            clicked: { src: null, tgt: null },
        })
    }

    removeClickedHovered() {
        this.setState({            
            hovered: { src: [], tgt: [] },
            clicked: { src: null, tgt: null }
        })
    }

    /**
     * Align a source word to a target word (it is not required that word1 is source).
     * The added alignment link, based on the indices of the two words, is added to
     * the input field `alignInpEl` and subsequently a redraw event is triggered.
     * If word1 was already aligned with word2, then the alignment will be removed instead.
     * @param {HTMLElement} word1 
     * @param {HTMLElement} word2 
     * @param {HTMLElement} alignInpEl 
     */
    addOrRemoveAlignable() {
        const newAlign = [this.state.clicked.src, this.state.clicked.tgt]
        const newAlignStr = newAlign.join("-")
        const alignStrArray = this.props.wordAlignsStr.split(" ")
        
        let aligns = this.props.wordAligns
        if (alignStrArray.includes(newAlignStr)) {
            aligns = removeItemfromArray(this.props.wordAligns, newAlign)
        } else {
            aligns.push(newAlign)
        }

        if (aligns.length === 0) {
            this.props.onAlignUpdate("")
        } else {
            this.props.onAlignUpdate(createStrFromAligns(aligns))
        }

        this.removeClicked()
    }

    onWindowClick(evt) {
        /**
         * When a user has already clicked on a word, but then wants to click somewhere else
         * (e.g. to copy something), we abort the whole operation and stop aligning.
         */
        if (evt.target.tagName !== "SPAN" && !evt.target.classList.contains("word")) {
            this.removeClicked()
        }
    }

    setSvgWidth() {
        const svg = this.alignVizDom.current.querySelector(":scope > svg")

        if (svg) {
            // Briefly set to 0 so that we can find the actual parent width
            svg.setAttribute("width", 0)
            svg.setAttribute("width", this.alignVizDom.current.scrollWidth)
        }
    }

    reDraw() {
        this.setSvgWidth()
        this.updateLinePosition()
    }

    componentDidUpdate() {
        this.reDraw()
    }

    componentDidMount() {
        window.addEventListener("click", this.onWindowClick)
        window.addEventListener("resize", this.reDraw)
        this.reDraw()
    }

    componentWillUnmount() {
        window.removeEventListener("click", this.onWindowClick)
        window.addEventListener("resize", this.reDraw)
    }

    onMouseOverSentence(side, wordIdx, alignedIdxs) {
        const otherSide = side === "src" ? "tgt" : "src"
        this.setState({
            hovered: {[side]: [wordIdx], [otherSide]: alignedIdxs},
            focusedSide: side
        })
    }

    onClickSentence(side, wordIdx) {
        this.setState({
            clicked: {...this.state.clicked, [side]: wordIdx}
        }, () => {
            if (this.state.clicked.src !== null && this.state.clicked.tgt !== null) {
                this.addOrRemoveAlignable()
            }
        })
    }

    buildLineClass(lineIdxSrc, lineIdxTgt) {
        let className = ""

        if ((this.state.focusedSide === "src" && this.state.hovered.src.includes(lineIdxSrc)) || (this.state.focusedSide === "tgt" &&  this.state.hovered.tgt.includes(lineIdxTgt))) {
            className = "highlight"
        }

        return className
    }

    render() {
        const isEmpty = !(this.props.srcWords && this.props.srcWords.length > 0 && this.props.tgtWords && this.props.tgtWords.length > 0 && this.props.wordAlignsValid && this.props.wordAligns.length > 0)

        return (
            <output className={isEmpty ? "align-viz empty" : "align-viz"} ref={this.alignVizDom}>
                {
                    !isEmpty && <Fragment>
                        <Sentence
                            side="src"
                            words={this.props.srcWords}
                            onClickSentence={this.onClickSentence}
                            onMouseOverSentence={this.onMouseOverSentence}
                            hovered={this.state.hovered}
                            clicked={this.state.clicked}
                            removeClicked={this.removeClicked}
                            removeHovered={this.removeHovered}
                        />

                        <svg xmlns="http://www.w3.org/2000/svg">
                            <g className="alignments">
                                {this.props.wordAligns.map(([srcIdx, tgtIdx], lineIdx) => {                                    
                                    return <line key={lineIdx} src={srcIdx} tgt={tgtIdx} className={this.buildLineClass(srcIdx, tgtIdx)}></line>
                                }
                                )}
                            </g>
                        </svg>

                        <Sentence
                            side="tgt"
                            words={this.props.tgtWords}
                            onClickSentence={this.onClickSentence}
                            onMouseOverSentence={this.onMouseOverSentence}
                            hovered={this.state.hovered}
                            clicked={this.state.clicked}
                            removeClicked={this.removeClicked}
                            removeHovered={this.removeHovered}
                        />
                    </Fragment>
                }
            </output>
        );
    }
}

export default AlignViz;
