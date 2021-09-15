from typing import Any, Dict, List, Optional

from astred.pairs import IdxPair
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import spacy

from astred import Aligner, AlignedSentences, Sentence
from astred.utils import load_parser


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

aligner = Aligner(no_cuda=True)

languages = {
    "en": {"spacy_model_name": "en_core_web_sm", "text": "English"},
    "nl": {"spacy_model_name": "nl_core_news_sm", "text": "Dutch"},
    "fr": {"spacy_model_name": "fr_core_news_sm", "text": "French"},
    "de": {"spacy_model_name": "de_core_news_sm", "text": "German"},
}


nlps = {f"{lang}_spacy": spacy.load(d["spacy_model_name"], exclude=["tok2vec", "tagger", "parser", "attribute_ruler", "lemmatizer"]) for lang, d in languages.items()}
nlps = {**nlps, **{f"{lang}_stanza": load_parser(lang, is_tokenized=True, tokenize_no_ssplit=True) for lang in languages.keys()}}


@app.get("/languages")
async def get_languages():
    return languages


@app.get("/tokenize")
async def tokenize(sentence: str, lang: str = "en"):
    doc = nlps[f"{lang}_spacy"](sentence)

    return {"sentence": sentence, "lang": lang,
            "tok": " ".join([token.text for token in doc])}


@app.get("/align")
async def align(src_sentence: str, tgt_sentence: str, src_lang: Optional[str] = None, tgt_lang: Optional[str] = None, is_tokenized: bool = True):
    output = {"src_sentence": src_sentence, "tgt_sentence": tgt_sentence,
              "is_tokenized": is_tokenized, "src_lang": src_lang, "tgt_lang": tgt_lang}

    if not is_tokenized:
        src_tok = (await tokenize(src_sentence, src_lang))["tok"]
        tgt_tok = (await tokenize(tgt_sentence, tgt_lang))["tok"]
    else:
        src_tok = src_sentence
        tgt_tok = tgt_sentence

    word_aligns = " ".join([f"{a[0]}-{a[1]}" for a in aligner.align(src_tok, tgt_tok)])

    return {**output,
            "src_tok": src_tok,
            "tgt_tok": tgt_tok,
            "word_aligns": word_aligns}


def get_word_info(sentence: Sentence, word_idx) -> Dict[str, Any]:
    word = sentence[word_idx]
    return {
        "text": word.text,
        "lemma": word.lemma,
        "head": f"{sentence[word.head].id-1}-{sentence[word.head].text}" if word.head else "root",
        "alignedIdxs": [w.id-1 for w in word.aligned],
        "pos": word.upos,
        "feats": word.feats,
        "cross": word.cross,
        "seq": {
            "text": word.seq_group.text,
            "cross": word.seq_group.cross,
        },
        "sacr": {
            "text": word.sacr_group.text,
            "cross": word.sacr_group.cross,
            "root": word.sacr_group.root.text if word.sacr_group.root else None
        },
        "astredOp": word.tree.astred_op,
        "deprel": word.deprel,
        "labelChanges": {idx-1: change for idx, change in word.changes().items()} if word.changes() else {},
    }


def get_groups(sentence: Sentence) -> Dict[str, List]:
    seq_idxs = [[span.word_idxs[0]-1, span.word_idxs[-1]-1] for span in sentence.no_null_seq_spans]
    sacr_idxs = [[span.word_idxs[0]-1, span.word_idxs[-1]-1] for span in sentence.no_null_sacr_spans]

    return {"seq": seq_idxs, "sacr": sacr_idxs}


def aligns_to_giza(aligns: List[IdxPair]) -> str:
    return " ".join([f"{p.src - 1}-{p.tgt - 1}" for p in aligns if p.src and p.tgt])


@app.get("/astred")
async def astred(src_sentence: str, tgt_sentence: str, aligns: str, src_lang: str, tgt_lang: str):
    src_sent = Sentence.from_text(src_sentence, nlps[f"{src_lang}_stanza"], is_tokenized=True)
    tgt_sent = Sentence.from_text(tgt_sentence, nlps[f"{tgt_lang}_stanza"], is_tokenized=True)
    aligned = AlignedSentences(src_sent, tgt_sent, word_aligns=aligns)

    src = {word.id-1: get_word_info(src_sent, word.id) for word in src_sent.no_null_words}
    tgt = {word.id-1: get_word_info(tgt_sent, word.id) for word in tgt_sent.no_null_words}

    src_groups = get_groups(src_sent)
    tgt_groups = get_groups(tgt_sent)

    results = {
               "src": src,
               "tgt":  tgt,
               "aligned": {"word_cross": aligned.word_cross,
                           "seq_cross": aligned.seq_cross,
                           "sacr_cross": aligned.sacr_cross,
                           "astred_cost": aligned.ted,
                           "aligns": aligned.giza_word_aligns,
                           "seq_aligns": aligns_to_giza(aligned.seq_aligns),
                           "sacr_aligns": aligns_to_giza(aligned.sacr_aligns)
                           },
               "spans": {
                   "src": src_groups,
                   "tgt": tgt_groups
               }}

    return results
