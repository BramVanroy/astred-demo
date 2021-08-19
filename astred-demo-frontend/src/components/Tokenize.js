import React, { PureComponent } from 'react'

import '../styles/Tokenize.css';

import LangSelect from "./LangSelect"
import TextInput from "./TextInput"

import { TOKENIZE_URL } from "../constants"
import { fetchUrl } from "../utils"


class TokenizeSec extends PureComponent {
    constructor(props) {
        super(props);
        this.handleLangChange = this.handleLangChange.bind(this);
        this.handleTextFieldChange = this.handleTextFieldChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async getTok(side) {
        let url = new URL(TOKENIZE_URL)
        let reqData = new FormData()
        reqData.append("sentence", this.props[side])
        reqData.append("lang", this.props[`${side}Lang`])
        url.search = new URLSearchParams(reqData).toString()

        const result = (await fetchUrl(url)).tok
        return result
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

    handleTextFieldChange(textField) {
        const val = this.validateTextField(textField)
        this.props.onAppStateChange(textField.name, val)
    }

    handleLangChange(selectEl) {
        this.props.onAppStateChange(selectEl.name, selectEl.value)
    }

    async handleSubmit(evt) {
        evt.preventDefault();

        const [srcTok, tgtTok] = await Promise.all([this.getTok("src"), this.getTok("tgt")])
        this.props.onTokenizeFetch({ srcTok: srcTok, tgtTok: tgtTok })
    }

    render() {
        return (
            <section id="tokenize">
                <div className="content">
                    <h2>Tokenization and language selection</h2>
                    <p>Below you can enter the source and target sentences that you wish to analyze.
                        Make sure to select the correct respective language. The language selection will be used later on as well so make sure it is correct.</p>
                    <p>With ASTrED, we want to get information for each <em>token</em>, a self-contained linguistic element.
                        For instance, <em>you're</em> consists of the tokens <em>you</em> and <em>'re</em>. For our linguistic analysis, we therefore have
                        to make sure that our input is tokenized: all tokens need a space between them, e.g. <em>you're</em>. Another example is that syntactic punctuation
                        is often a token by itself and separate from other tokens, except in cases where it is clearly part of that token, as indicated by the <em>you 're</em> example.</p>
                    <p>Manually tokenizing your data is a tedious process, so <strong>this tool will automatically try to tokenize your input for you</strong>. In the next step you can make adjustments
                    to the proposed tokenization.
                    </p>

                    <form onSubmit={this.handleSubmit}>
                        <div>
                            <TextInput
                                label="Source sentence"
                                name="src"
                                value={this.props.src}
                                onChange={evt => this.handleTextFieldChange(evt.target)}
                            />
                            <LangSelect
                                label="Source language"
                                name="srcLang"
                                defaultValue={this.props.srcLang}
                                onChange={evt => this.handleLangChange(evt.target)}
                                languages={this.props.langs}
                            />
                        </div>
                        <div>
                            <TextInput
                                label="Target sentence"
                                name="tgt"
                                value={this.props.tgt}
                                onChange={evt => this.handleTextFieldChange(evt.target)}
                            />
                            <LangSelect
                                label="Target language"
                                name="tgtLang"
                                defaultValue={this.props.tgtLang}
                                onChange={evt => this.handleLangChange(evt.target)}
                                languages={this.props.langs}
                            />
                        </div>
                        <input type="submit" value="Continue" />
                    </form>
                </div>
            </section>
        );
    }
}

export default TokenizeSec;
