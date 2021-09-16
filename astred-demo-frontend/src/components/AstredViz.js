import '../styles/AstredViz.css';

import AlignViz from './AlignViz';
import {createAlignsFromStr} from '../utils';
import PropTypes from 'prop-types';
import React from 'react';
import Sentence from './Sentence';


/** @extends React.Component */
class AstredViz extends AlignViz {
  updateSpanLinePosition() {
    if (!this.alignVizDom.current || !this.alignVizDom.current.querySelector('.sentence.src')) {
      return;
    }
    const wrapperBox = this.alignVizDom.current.getBoundingClientRect();
    const scrollX = this.alignVizDom.current.scrollLeft;

    this.alignVizDom.current.querySelectorAll('.groups').forEach((group) => {
      const srcNodes = group.querySelectorAll('.src rect');
      const tgtNodes = group.querySelectorAll('.tgt rect');
      const isSeqGroups = group.classList.contains('seqGroups');
      const horiModifier = isSeqGroups ? 6 : -6;

      group.querySelectorAll('line').forEach((line) => {
        try {
          const srcRect = srcNodes[parseInt(line.getAttribute('src'))].getBoundingClientRect();
          const tgtRect = tgtNodes[parseInt(line.getAttribute('tgt'))].getBoundingClientRect();
          line.setAttribute('x1', srcRect.x + (srcRect.width / 2) - wrapperBox.x + horiModifier + scrollX);
          line.setAttribute('y1', srcRect.y - wrapperBox.y + srcRect.height);
          line.setAttribute('x2', tgtRect.x + (tgtRect.width / 2) - wrapperBox.x + horiModifier + scrollX);
          line.setAttribute('y2', tgtRect.y - wrapperBox.y);
        } catch (err) {
          // you return in ForEach to do "continue" because you return _from the callback_
          return;
        }
      });
    });
  }

  updateRectPosition() {
    if (!this.alignVizDom.current || !this.alignVizDom.current.querySelector('.sentence.src')) {
      return;
    }
    const wrapperBox = this.alignVizDom.current.getBoundingClientRect();
    const srcNodes = this.alignVizDom.current.querySelectorAll('.src.sentence .word');
    const tgtNodes = this.alignVizDom.current.querySelectorAll('.tgt.sentence .word');
    const scrollX = this.alignVizDom.current.scrollLeft;

    this.alignVizDom.current.querySelectorAll('rect').forEach((rect) => {
      const seqModifier = rect.dataset.type === 'seq' && this.props.drawSacrGroups && this.props.drawSeqGroups ? 10 : 0;
      try {
        let startWordRect; let endWordRect;

        if (rect.dataset.side === 'src') {
          startWordRect = srcNodes[parseInt(rect.dataset.start)].getBoundingClientRect();
          endWordRect = srcNodes[parseInt(rect.dataset.end)].getBoundingClientRect();
        } else {
          startWordRect = tgtNodes[parseInt(rect.dataset.start)].getBoundingClientRect();
          endWordRect = tgtNodes[parseInt(rect.dataset.end)].getBoundingClientRect();
        }

        rect.setAttribute('width', endWordRect.x - startWordRect.x + endWordRect.width + seqModifier);
        rect.setAttribute('height', startWordRect.height + seqModifier);

        rect.setAttribute('x', startWordRect.x - wrapperBox.x - (seqModifier / 2) + scrollX);
        rect.setAttribute('y', startWordRect.y - wrapperBox.y - (seqModifier / 2));
      } catch (err) {
        // you return in ForEach to do "continue" because you return _from the callback_
        return;
      }
    });
  }

  reDraw() {
    // Event handlers (window, componentUpdated, etc.) are dealt with in super class
    // which calls reDraw
    this.setSvgWidth();
    // Let the word-align line go a bit further than the box lines for visibility's sake
    const lineMargin = this.props.drawSeqGroups || this.props.drawSacrGroups ? -4 : 4;
    this.updateLinePosition(lineMargin);
    this.updateRectPosition();
    this.updateSpanLinePosition();
  }

  onClickSentence(side, wordIdx) {
    // Overwrites super class method. In super class, click trigger manual align
    // here it triggers showing information
    // "clicked" is both here in AlignViz and astred.js class. This is poor design on my part,
    // but allows us at least to sub class AlignViz. Astred needs it to display clicked info
    this.setState({
      clicked: {[side]: wordIdx},
    }, () => {
      this.props.onChangeClicked(side, wordIdx);
    });
  }

  render() {
    const hasOverlayedLines = this.props.drawSeqGroups || this.props.drawSacrGroups;
    const className = hasOverlayedLines ? 'astred-viz align-viz has-overlayed-lines' : 'astred-viz align-viz';
    return (
      <output className={className} ref={this.alignVizDom} onMouseLeave={this.removeHighlights}>
        <Sentence
          side="src"
          words={Object.values(this.props.astred.src)}
          onClickSentence={this.onClickSentence}
          onMouseOverSentence={this.onMouseOverSentence}
          hovered={this.state.hovered}
          clicked={this.state.clicked}
          removeHovered={this.removeHovered}
          isAstred={true}
        />

        <svg xmlns="http://www.w3.org/2000/svg">
          <g className="alignments">
            {createAlignsFromStr(this.props.astred.aligned.aligns)[0].map(([srcIdx, tgtIdx], lineIdx) => <line key={lineIdx} src={srcIdx} tgt={tgtIdx} className={this.buildLineClass(srcIdx, tgtIdx)}></line>)}
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
          words={Object.values(this.props.astred.tgt)}
          onClickSentence={this.onClickSentence}
          onMouseOverSentence={this.onMouseOverSentence}
          hovered={this.state.hovered}
          clicked={this.state.clicked}
          removeHovered={this.removeHovered}
          isAstred={true}
        />
      </output>
    );
  }
}

AstredViz.propTypes = {
  astred: PropTypes.object,
  drawSacrGroups: PropTypes.bool,
  drawSeqGroups: PropTypes.bool,
  onChangeClicked: PropTypes.func,
};

export default AstredViz;
