import React, { PureComponent } from 'react'

import '../styles/AstredViz.css';

import Sentence from "./Sentence"
import { createAlignsFromStr } from "../utils"

class AstredViz extends PureComponent {
    // BUILD SUPER CLASS FOR ASTREDVIZ AND ALIGNVIZ
    constructor(props) {
        super(props);

        this.highlight = this.highlight.bind(this);
        this.removeHighlights = this.removeHighlights.bind(this);
        this.onOutClick = this.onOutClick.bind(this);
        this.onWordMouseOver = this.onWordMouseOver.bind(this);
        this.onWordMouseLeave = this.onWordMouseLeave.bind(this);
        this.showInfo = this.showInfo.bind(this);
        this.setSvgWidth = this.setSvgWidth.bind(this);
        this.reDraw = this.reDraw.bind(this);

        this.astredVizDom = React.createRef();
    }

    updateWordLinePosition(fromTextMargin = -4) {
        if (!this.astredVizDom.current.querySelector(".source")) {
            return
        }

        const wrapperBox = this.astredVizDom.current.getBoundingClientRect()
        const textH = this.astredVizDom.current.querySelector(".source").getBoundingClientRect().height

        const srcNodes = this.astredVizDom.current.querySelectorAll(".source .word")
        const tgtNodes = this.astredVizDom.current.querySelectorAll(".target .word")
        const scrollX = this.astredVizDom.current.scrollLeft

        this.astredVizDom.current.querySelectorAll(".alignments line").forEach(line => {
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

    updateSpanLinePosition() {
        if (!this.astredVizDom.current.querySelector(".source")) {
            return
        }
        const wrapperBox = this.astredVizDom.current.getBoundingClientRect()
        const scrollX = this.astredVizDom.current.scrollLeft

        this.astredVizDom.current.querySelectorAll(".groups").forEach(group => {
            const srcNodes = group.querySelectorAll(".src rect")
            const tgtNodes = group.querySelectorAll(".tgt rect")
            const isSeqGroups = group.classList.contains("seqGroups")
            const horiModifier = isSeqGroups ? 6 : -6

            group.querySelectorAll("line").forEach(line => {
                try {
                    const srcRect = srcNodes[parseInt(line.getAttribute("src"))].getBoundingClientRect()
                    const tgtRect = tgtNodes[parseInt(line.getAttribute("tgt"))].getBoundingClientRect()
                    line.setAttribute("x1", srcRect.x + (srcRect.width / 2) - wrapperBox.x + horiModifier + scrollX)
                    line.setAttribute("y1", srcRect.y - wrapperBox.y + srcRect.height)
                    line.setAttribute("x2", tgtRect.x + (tgtRect.width / 2) - wrapperBox.x + horiModifier + scrollX)
                    line.setAttribute("y2", tgtRect.y - wrapperBox.y)
                } catch (err) {
                    // you return in ForEach to do "continue" because you return _from the callback_
                    return
                }
            })
        })
    }

    updateRectPosition() {
        if (!this.astredVizDom.current.querySelector(".source")) {
            return
        }
        const wrapperBox = this.astredVizDom.current.getBoundingClientRect()
        const srcNodes = this.astredVizDom.current.querySelectorAll(".source .word")
        const tgtNodes = this.astredVizDom.current.querySelectorAll(".target .word")
        const scrollX = this.astredVizDom.current.scrollLeft

        this.astredVizDom.current.querySelectorAll("rect").forEach(rect => {
            const seqModifier = rect.dataset.type === "seq" && this.props.drawSacrGroups && this.props.drawSeqGroups ? 10 : 0
            try {
                let startWordRect, endWordRect

                if (rect.dataset.side === "src") {
                    startWordRect = srcNodes[parseInt(rect.dataset.start)].getBoundingClientRect()
                    endWordRect = srcNodes[parseInt(rect.dataset.end)].getBoundingClientRect()
                } else {
                    startWordRect = tgtNodes[parseInt(rect.dataset.start)].getBoundingClientRect()
                    endWordRect = tgtNodes[parseInt(rect.dataset.end)].getBoundingClientRect()
                }

                rect.setAttribute("width", endWordRect.x - startWordRect.x + endWordRect.width + seqModifier)
                rect.setAttribute("height", startWordRect.height + seqModifier)

                rect.setAttribute("x", startWordRect.x - wrapperBox.x - (seqModifier / 2) + scrollX)
                rect.setAttribute("y", startWordRect.y - wrapperBox.y - (seqModifier / 2))
            } catch (err) {
                // you return in ForEach to do "continue" because you return _from the callback_
                return
            }
        })
    }

    /**
     * For a given word, highlight it (add class "highlight") and also
     * to the lines and other words that it is aligned with.
     * @param {HTMLElement} word 
     */
    highlight(word) {
        this.removeHighlights()

        if ("aligned" in word.dataset) {
            const side = word.dataset.side;
            const otherSideClass = word.dataset.side === "tgt" ? "source" : "target"
            const otherParent = this.astredVizDom.current.querySelector(`.sentence.${otherSideClass}`)

            // Because all other `dataset` items are str, convert indices to str
            const aligned_idxs = JSON.parse(word.dataset.aligned).map(String)
            let lines = Array.from(this.astredVizDom.current.querySelectorAll("line"))
            let words = otherParent.querySelectorAll("span.word")

            // Only include lines whose dataset.src/.tgt is the current word's ID
            lines = lines.filter(line => line.getAttribute(side) === word.dataset.index)

            // Only include words whose index is in the aligned idxs
            words = Array.from(words).filter(word => aligned_idxs.includes(word.dataset.index))
            const elements = [...words, ...lines, word]
            elements.forEach(el => el.classList.add("highlight"))
        }
    }

    /**
     * Remove the "highlight" class from all words and lines in the 
     * current element if such element is not currently clicked on
     * (dataset.clicked).
     */
    removeHighlights() {
        this.astredVizDom.current.querySelectorAll("span.word, line").forEach(el => {
            if (!("clicked" in el.dataset)) {
                el.classList.remove("highlight")
            }
        })
    }

    onOutClick(evt) {
        /**
         * When a user has already clicked on a word, but then wants to click somewhere else
         * (e.g. to copy something), we abort the whole operation and stop aligning.
         */
        if (evt.target.tagName !== "SPAN" && !evt.target.classList.contains("word")) {
            this.removeHighlights()
        }
    }

    setSvgWidth() {
        const svg = this.astredVizDom.current.querySelector(":scope > svg")

        if (svg) {
            // Briefly set to 0 so that we can find the actual parent width
            svg.setAttribute("width", 0)
            svg.setAttribute("width", this.astredVizDom.current.scrollWidth)
        }
    }

    reDraw() {
        this.setSvgWidth()
        this.updateWordLinePosition()
        this.updateRectPosition()
        this.updateSpanLinePosition()
    }

    componentDidUpdate() {
        this.reDraw()
    }

    componentDidMount() {
        window.addEventListener("click", this.onOutClick)
        window.addEventListener("resize", this.reDraw)
        // word alignments need to be visible on initial render. componentDidUpdate
        // is not called on first render           
        this.setSvgWidth()
        this.updateWordLinePosition()
    }

    componentWillUnmount() {
        window.removeEventListener("click", this.onOutClick)
        window.addEventListener("resize", this.reDraw)
    }

    onWordMouseOver(evt) {
        this.highlight(evt.target)
    }

    onWordMouseLeave(evt) {
        if (evt.target.classList.contains("clicked")) {
            this.removeHighlights()
        }
    }

    showInfo(evt) {
        if (evt.target.tagName === "SPAN") {
            this.props.onChangeClicked(evt.target)
            const prevClicked = this.astredVizDom.current.querySelector("span.word[data-clicked='true']");
            if (prevClicked) {
                delete this.astredVizDom.current.querySelector("span.word[data-clicked='true']").dataset.clicked
            }
            evt.target.dataset.clicked = "true"
            this.highlight(evt.target)
        }
    }


    render() {
        const hasOverlayedLines = this.props.drawSeqGroups || this.props.drawSacrGroups

        return (
            <div className={hasOverlayedLines ? "has-overlay" : ""}>
                <output className="astred-viz align-viz" ref={this.astredVizDom} onMouseLeave={this.removeHighlights}>
                    <Sentence
                        side="src"
                        words={this.props.srcWords}
                        onClickSentence={this.showInfo}
                    />

                    <svg xmlns="http://www.w3.org/2000/svg">
                        <g className="alignments">
                            {createAlignsFromStr(this.props.astred.aligned.aligns)[0].map(([srcIdx, tgtIdx], lineIdx) => <line key={lineIdx} src={srcIdx} tgt={tgtIdx}></line>)}
                        </g>
                        {this.props.drawSeqGroups && <g className="seqGroups groups">
                            <g className="src">{this.props.astred.spans.src.seq.map(([startIdx, endIdx], boxIdx) => <rect key={boxIdx} data-start={startIdx} data-end={endIdx} data-type="seq" data-side="src"></rect>)}</g>
                            <g className="tgt">{this.props.astred.spans.tgt.seq.map(([startIdx, endIdx], boxIdx) => <rect key={boxIdx} data-start={startIdx} data-end={endIdx} data-type="seq" data-side="tgt"></rect>)}</g>

                            <g className="lines">{createAlignsFromStr(this.props.astred.aligned.seq_aligns)[0].map(([srcIdx, tgtIdx], lineIdx) => <line key={lineIdx} src={srcIdx} tgt={tgtIdx}></line>)}</g>
                        </g>}
                        {this.props.drawSacrGroups && <g className="sacrGroups groups">
                            <g className="src">{this.props.astred.spans.src.sacr.map(([startIdx, endIdx], boxIdx) => <rect key={boxIdx} data-start={startIdx} data-end={endIdx} data-type="sacr" data-side="src"></rect>)}</g>
                            <g className="tgt">{this.props.astred.spans.tgt.sacr.map(([startIdx, endIdx], boxIdx) => <rect key={boxIdx} data-start={startIdx} data-end={endIdx} data-type="sacr" data-side="tgt"></rect>)}</g>

                            <g className="lines">{createAlignsFromStr(this.props.astred.aligned.sacr_aligns)[0].map(([srcIdx, tgtIdx], lineIdx) => <line key={lineIdx} src={srcIdx} tgt={tgtIdx}></line>)}</g>
                        </g>}
                    </svg>

                    <Sentence
                        side="tgt"
                        words={this.props.tgtWords}
                        onClickSentence={this.showInfo}
                    />
                </output>
            </div>
        );
    }
}

export default AstredViz;
