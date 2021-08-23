python -m spacy download en_core_web_sm
python -m spacy download nl_core_news_sm
python -m spacy download fr_core_news_sm
python -m spacy download de_core_news_sm

python -c "import stanza; stanza.download('en')"
python -c "import stanza; stanza.download('nl')"
python -c "import stanza; stanza.download('fr')"
python -c "import stanza; stanza.download('de')"

python -c "from awesome_align.configuration_bert import BertConfig; from awesome_align.modeling import BertForMaskedLM; from awesome_align.tokenization_bert import BertTokenizer; tokenizer = BertTokenizer.from_pretrained('bert-base-multilingual-cased'); config = BertConfig.from_pretrained('bert-base-multilingual-cased'); model = BertForMaskedLM.from_pretrained('bert-base-multilingual-cased', tokenizer.cls_token_id, tokenizer.sep_token_id, config=config);"
