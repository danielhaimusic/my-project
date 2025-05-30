# ner_extractor.py

import spacy

# Load a multilingual NER model (install with: pip install spacy-langdetect)
nlp = spacy.load("xx_ent_wiki_sm")

def extract_entities(text):
    doc = nlp(text)
    return [(ent.label_, ent.text) for ent in doc.ents]

def clean_and_structure_data(entities):
    """
    Organize entities into a dict grouped by label.
    """
    structured = {}
    for label, text in entities:
        structured.setdefault(label, []).append(text)
    return structured

if __name__ == '__main__':
    sample = open('example.txt', encoding='utf-8').read()
    ents = extract_entities(sample)
    data = clean_and_structure_data(ents)
    for label, items in data.items():
        print(f"{label}: {items}")