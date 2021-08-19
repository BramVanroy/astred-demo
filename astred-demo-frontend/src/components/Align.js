import React, { PureComponent } from 'react'

import '../styles/Align.css';

import TextInput from "./TextInput"
import AlignViz from "./AlignViz"


import { ALIGN_URL, ASTRED_URL } from "../constants"
import { fetchUrl } from "../utils"

import { createAlignsFromStr, createAlignMapping, zip, valuesNotEmpty } from "../utils"
// import { errorHandling } from "../utils"

class AlignSec extends PureComponent {
    constructor(props) {
        super(props);
        this.handleManualTokChange = this.handleManualTokChange.bind(this);
        this.handleManualAlignChange = this.handleManualAlignChange.bind(this);
        this.fetchWordAligns = this.fetchWordAligns.bind(this);
        this.fetchAstred = this.fetchAstred.bind(this);
        
        this.alignsCorrespondToWords = this.alignsCorrespondToWords.bind(this);
        this.validateAllFields = this.validateAllFields.bind(this);
        this.validateWordAlignField = this.validateWordAlignField.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.updateAlignFieldWithValue = this.updateAlignFieldWithValue.bind(this);
        this.state = {
            wordAlignsValid: true,
        }

        this.aligner = React.createRef();
    }

    handleManualTokChange(textField) {
        const val = this.validateTextField(textField)
        this.props.onAppStateChange(textField.name, val, true)
        // Also validate word alignments according to new tokens but do not "reportValidity" as that will trigger a focus
        // wordAlignsValid: false will then make sure that incorrect wordAlignments are not drawn
        const alignInfo = this.validateWordAlignField(this.aligner.current.querySelector("input[name='wordAlignsStr']"), false)
        this.setState({ wordAlignsValid: alignInfo.wordAlignsValid })
    }

    validateTextField(textField) {
        if (textField.value.trim() === "") {
            textField.setCustomValidity("Field cannot be empty or contain only spaces.")
        } else {
            textField.setCustomValidity("")
        }

        textField.reportValidity();

        return textField.value
    }

    validateAllFields(skipWordAligns = false) {
        this.aligner.current.querySelectorAll("input[type='text']").forEach(el => {

            if (el.name === "wordAlignsStr") {
                if (!skipWordAligns) {
                    this.validateTextField(el)
                    this.validateWordAlignField(el)
                }
            } else {
                this.validateTextField(el)
            }
        })
    }

    validateWordAlignField(alignField, reportValidity=true) {
        const alignStr = alignField.value

        if (alignStr.trim() === "") {
            alignField.setCustomValidity("Field cannot be empty or contain only spaces.")
        }

        // returns a tuple: [aligns (if any), bool(validAligns)]
        const alignsTuple = createAlignsFromStr(alignStr.trim())
        let wordAlignsValid = false
        let aligns = []

        if (!alignsTuple[1]) {
            alignField.setCustomValidity("Word alignments need to be of the format i-j for each source and target index pair");
        }
        else {
            if (this.alignsCorrespondToWords(alignsTuple[0])) {
                alignField.setCustomValidity("");
                wordAlignsValid = true
                aligns = alignsTuple[0]
            } else {
                alignField.setCustomValidity("The indices given in the word alignments must correspond to words. An index that you provided is not correct. Keep in mind that the indices are zero-based, so the first element has index 0.");
            }

        }

        if (reportValidity) alignField.reportValidity();

        return { wordAlignsStr: alignStr, wordAlignsValid: wordAlignsValid, aligns: aligns }
    }

    handleManualAlignChange(alignField) {
        const alignInfo = this.validateWordAlignField(alignField)

        this.setState({ wordAlignsValid: alignInfo.wordAlignsValid })

        this.props.onWordAlignFetch({
            wordAlignsStr: alignInfo.wordAlignsStr,
            wordAligns: alignInfo.aligns,
            src2tgt: createAlignMapping(alignInfo.aligns, 0, this.props.srcWords.length),
            tgt2src: createAlignMapping(alignInfo.aligns, 1, this.props.tgtWords.length)
        })
    }

    async fetchWordAligns() {
        if (this.props.srcTok.trim() !== "" && this.props.tgtTok.trim() !== "") {
            let url = new URL(ALIGN_URL)
            let alignFormData = new FormData()
            alignFormData.append("src_sentence", this.props.srcTok)
            alignFormData.append("tgt_sentence", this.props.tgtTok)
            url.search = new URLSearchParams(alignFormData).toString()

            const alignStr = (await fetchUrl(url)).word_aligns
            this.updateAlignFieldWithValue(alignStr)
        }
    }

    async fetchAstred() {
        if (this.props.srcTok.trim() !== "" && this.props.tgtTok.trim() !== "" && this.props.wordAlignsStr.trim() !== "") {
            let url = new URL(ASTRED_URL)
            let alignFormData = new FormData()
            alignFormData.append("src_sentence", this.props.srcTok)
            alignFormData.append("tgt_sentence", this.props.tgtTok)
            alignFormData.append("aligns", this.props.wordAlignsStr)
            alignFormData.append("src_lang", this.props.srcLang)
            alignFormData.append("tgt_lang", this.props.tgtLang)
            url.search = new URLSearchParams(alignFormData).toString()

            const astredInfo = (await fetchUrl(url))
            this.props.onAstredFetch(astredInfo)
        }
    }

    updateAlignFieldWithValue(alignStr) {
        const alignField = this.aligner.current.querySelector("input[name='wordAlignsStr']")
        alignField.value = alignStr
        this.handleManualAlignChange(alignField)
    }

    handleSubmit(evt) {
        evt.preventDefault()
        this.validateAllFields()
    }

    alignsCorrespondToWords(aligns) {
        // Do all indices in the alignment correspond to a word? (i.e. do the alignments contain an index larger than the number of words)
        // move this to custom validation checker
        const nSrcWords = this.props.srcWords.length
        const nTgtWords = this.props.tgtWords.length
        const maxIdxs = zip(aligns).map(arr => Math.max(...arr))
        return (maxIdxs[0] < nSrcWords && maxIdxs[1] < nTgtWords)
    }

    render() {
        return (
            <section id="align" ref={this.aligner}>
                <div className="content">
                    <h2>Word alignment</h2>
                    <p>If you leave the word alignments empty, the alignment will be automatically generated and the word alignment
                        field will be filled out and visualise. You can then make changes to the proposed alignments. When you are done,
                        do not forget to submit the final word alignments!</p>

                    <form onSubmit={this.handleSubmit}>
                        <div>
                            <TextInput
                                label="Tokenized source sentence"
                                name="srcTok"
                                value={this.props.srcTok}
                                invalid={this.props.srcTok.trim() === ""}
                                onChange={evt => this.handleManualTokChange(evt.target)}
                            />
                            <TextInput
                                label="Tokenized target sentence"
                                name="tgtTok"
                                value={this.props.tgtTok}
                                invalid={this.props.tgtTok.trim() === ""}
                                onChange={evt => this.handleManualTokChange(evt.target)}
                            />
                            <TextInput
                                label="Word alignments"
                                name="wordAlignsStr"
                                value={this.props.wordAlignsStr}
                                invalid={this.state.wordAlignsValid}
                                onChange={evt => this.handleManualAlignChange(evt.target)}
                                isAlignField={true}
                                iconName="asterisk"
                            />
                        </div>
                        <div className="buttons">
                            <input type="button" value="Suggest alignments" disabled={!valuesNotEmpty(this.props.srcTok, this.props.tgtTok)} name="fetch-aligns-btn" onClick={this.fetchWordAligns} />
                            <input type="submit" value="Continue" disabled={!valuesNotEmpty(this.props.srcTok, this.props.tgtTok, this.props.wordAlignsStr) || !this.state.wordAlignsValid} name="calculate-astred-btn" onClick={this.fetchAstred} />
                        </div>
                    </form>
                    <AlignViz
                        src2tgt={this.props.src2tgt}
                        tgt2src={this.props.tgt2src}
                        srcWords={this.props.srcWords}
                        tgtWords={this.props.tgtWords}
                        wordAligns={this.props.wordAligns}
                        wordAlignsStr={this.props.wordAlignsStr}
                        wordAlignsValid={this.state.wordAlignsValid}
                        onAlignUpdate={this.updateAlignFieldWithValue}
                    />
                </div>
            </section>
        );
    }
}


export default AlignSec;
