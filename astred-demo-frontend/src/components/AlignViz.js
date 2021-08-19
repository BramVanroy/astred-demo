import React, { PureComponent, Fragment } from 'react'

import '../styles/AlignViz.css';

import { createAlignsFromStr, createStrFromAligns } from "../utils"

class AlignViz extends PureComponent {
    constructor(props) {
        super(props);


        this.highlight = this.highlight.bind(this);
        this.removeHighlights = this.removeHighlights.bind(this);
        this.addOrRemoveAlignable = this.addOrRemoveAlignable.bind(this);
        this.align = this.align.bind(this);
        this.onOutClick = this.onOutClick.bind(this);
        this.onWordMouseOver = this.onWordMouseOver.bind(this);
        this.onWordMouseLeave = this.onWordMouseLeave.bind(this);
        this.setSvgWidth = this.setSvgWidth.bind(this);
        this.reDraw = this.reDraw.bind(this);

        this.alignVizDom = React.createRef();
    }

    updateLinePosition(fromTextMargin = 4) {
        if (!this.alignVizDom.current.querySelector(".source")) {
            return
        }
        const wrapperBox = this.alignVizDom.current.getBoundingClientRect()
        const textH = this.alignVizDom.current.querySelector(".source").getBoundingClientRect().height

        const srcNodes = this.alignVizDom.current.querySelectorAll(".source .word")
        const tgtNodes = this.alignVizDom.current.querySelectorAll(".target .word")
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
     * Given a word and an index, add the index to the word's `dataset.aligned`
     * property, which is a JSON encoded Array of aligned indices.
     * @param {HTMLElement} word 
     * @param {number|string} aligned_idx 
     */
    setWordAligned(word, aligned_idx) {
        aligned_idx = aligned_idx.toString()
        if ("aligned" in word.dataset) {
            let aligned_idxs = JSON.parse(word.dataset.aligned).map(String)
            aligned_idxs.push(aligned_idx)
            // Only unique items
            aligned_idxs = [...new Set(aligned_idxs)]
            word.dataset.aligned = JSON.stringify(aligned_idxs)
        } else {
            word.dataset.aligned = JSON.stringify([aligned_idx])
        }
    }

    /**
     * Given a word and an index, remove the index from the word's `dataset.aligned`
     * property, which is a JSON encoded Array of aligned indices.
     * @param {HTMLElement} word 
     * @param {number|string} aligned_idx 
     */
    removeWordAligned(word, aligned_idx) {
        aligned_idx = aligned_idx.toString()
        const aligned_idxs = JSON.parse(word.dataset.aligned).map(String)
        const idx_in_arr = aligned_idxs.indexOf(aligned_idx)

        // If index is in array, remove it
        if (idx_in_arr !== -1) {
            aligned_idxs.splice(idx_in_arr, 1)
            word.dataset.aligned = JSON.stringify(aligned_idxs)
        }
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
            const otherParent = this.alignVizDom.current.querySelector(`.sentence.${otherSideClass}`)

            // Because all other `dataset` items are str, convert indices to str
            const aligned_idxs = JSON.parse(word.dataset.aligned).map(String)
            let lines = Array.from(this.alignVizDom.current.querySelectorAll("line"))
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
        this.alignVizDom.current.querySelectorAll("span.word, line").forEach(el => {
            if (!("clicked" in el.dataset)) {
                el.classList.remove("highlight")
            }
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
    addOrRemoveAlignable(word1, word2) {
        let new_align
        if (word1.dataset.side === "src") {
            new_align = [word1.dataset.index, word2.dataset.index].join("-")
        } else {
            new_align = [word2.dataset.index, word1.dataset.index].join("-")
        }

        let align_pairs = this.props.wordAlignsStr

        if (align_pairs) {
            align_pairs = align_pairs.split(" ").filter(Boolean)
        } else {
            align_pairs = []
        }

        if (align_pairs.includes(new_align)) {
            // Remove alignment
            this.removeWordAligned(word1, word2.dataset.index)
            this.removeWordAligned(word2, word1.dataset.index)
            align_pairs.splice(align_pairs.indexOf(new_align), 1)
        } else {
            // Add alignment
            this.setWordAligned(word1, word2.dataset.index)
            this.setWordAligned(word2, word1.dataset.index)
            align_pairs.push(new_align)
        }

        if (align_pairs.length === 0) {
            this.props.onAlignUpdate("")
        } else {
            // Not the most efficient way to sort the alignments, but hey...
            // So before we work with strings, but we want to sort the alignments,
            // so we convert the string to integer alignments, then sort them,
            // and then convert them back
            const aligns = createAlignsFromStr(align_pairs.join(" "))
            // TODO: catch any errors that may occur when generating alignments
            this.props.onAlignUpdate(createStrFromAligns(aligns[0]))
        }
    }

    /**
     * Handle manual alignment. Checks if a word on the other side had already been
     * clicked (dataset.clicked). If so, this click event will align the clicked word
     * to the previously clicked word. If no word on the other side was clicked, simply
     * add dataset.clicked. 
     * Programmatic alignment (setting properties) and redrawing is done in `addOrRemoveAlignable`
     * @param {Event} evt 
     */
    align(evt) {
        if (evt.target.tagName === "SPAN") {
            const el = evt.target
            const alignViz = el.closest(".align-viz")
            const otherSideClass = el.dataset.side === "tgt" ? "source" : "target"
            const otherParent = alignViz.querySelector(`.sentence.${otherSideClass}`)

            const otherClicked = Array.from(otherParent.querySelectorAll("span.word")).some(el => "clicked" in el.dataset)
            const thisParent = el.closest(".sentence")

            if (otherClicked) {
                const otherClickedEl = otherParent.querySelector("span.word[data-clicked='true']")
                this.addOrRemoveAlignable(el, otherClickedEl)

                thisParent.querySelectorAll("span.word").forEach(el => el.classList.remove("alignable", "removable"))
                delete otherClickedEl.dataset.clicked
                this.removeHighlights()
            } else {
                const prevThisClicked = thisParent.querySelector("span.word[data-clicked='true']")
                if (prevThisClicked) {
                    delete prevThisClicked.dataset.clicked
                    otherParent.querySelectorAll("span.word").forEach(el => el.classList.remove("alignable", "removable"))
                }

                el.dataset.clicked = "true"
                this.highlight(el)

                otherParent.querySelectorAll("span.word").forEach(el => el.classList.add("alignable"))
                if ("aligned" in el.dataset) {
                    const aligned_idxs = JSON.parse(el.dataset.aligned).map(String)
                    Array.from(otherParent.querySelectorAll("span.word")).filter(el => aligned_idxs.includes(el.dataset.index)).forEach(el => el.classList.add("removable"))
                }
            }
        }
    }

    onOutClick(evt) {
        /**
         * When a user has already clicked on a word, but then wants to click somewhere else
         * (e.g. to copy something), we abort the whole operation and stop aligning.
         */
        if (evt.target.tagName !== "SPAN" && !evt.target.classList.contains("word")) {
            this.alignVizDom.current.querySelectorAll("span.word[data-clicked='true']").forEach(el => delete el.dataset.clicked)
            this.alignVizDom.current.querySelectorAll("span.word").forEach(el => el.classList.remove("alignable", "removable"))
            this.removeHighlights()
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
        window.addEventListener("click", this.onOutClick)    
        window.addEventListener("resize", this.reDraw)
        this.reDraw()
    }

    componentWillUnmount() {
        window.removeEventListener("click", this.onOutClick)    
        window.addEventListener("resize", this.reDraw)
    }

    onWordMouseOver(evt) {
        if (!evt.target.classList.contains("alignable")) {
            this.highlight(evt.target)
        }
    }

    onWordMouseLeave(evt) {
        this.removeHighlights()
    }

    render() {
        const isEmpty = !(this.props.srcWords && this.props.srcWords.length > 0 && this.props.tgtWords && this.props.tgtWords.length > 0 && this.props.wordAlignsValid && this.props.wordAligns.length > 0)

        return (
            <output className={isEmpty ? "align-viz empty" : "align-viz"} ref={this.alignVizDom} onMouseLeave={this.removeHighlights}>
                {
                    !isEmpty && <Fragment>
                        <div className="source sentence" onClick={this.align}>
                            {
                                Object.entries(this.props.src2tgt).map(([srcIdx, tgt_idxs], index) => {
                                    tgt_idxs = [...new Set(tgt_idxs)]
                                    return (<span key={index} className="word" data-side="src" data-aligned={JSON.stringify(tgt_idxs)} data-index={index} onMouseOver={this.onWordMouseOver} onMouseLeave={this.onWordMouseLeave}>{this.props.srcWords[srcIdx]}</span>)
                                })
                            }
                        </div>

                        <svg xmlns="http://www.w3.org/2000/svg">
                            <g className="alignments">
                                {this.props.wordAligns.map(([srcIdx, tgtIdx], lineIdx) => <line key={lineIdx} src={srcIdx} tgt={tgtIdx}></line>)}
                            </g>
                        </svg>
                        
                        <div className="target sentence" onClick={this.align}>
                            {
                                Object.entries(this.props.tgt2src).map(([tgtIdx, src_idxs], index) => {
                                    src_idxs = [...new Set(src_idxs)]
                                    return (<span key={index} className="word" data-side="tgt" data-aligned={JSON.stringify(src_idxs)} data-index={index} onMouseOver={this.onWordMouseOver} onMouseLeave={this.onWordMouseLeave}>{this.props.tgtWords[tgtIdx]}</span>)
                                })
                            }
                        </div>
                    </Fragment>
                }
            </output>
        );
    }
}

export default AlignViz;
