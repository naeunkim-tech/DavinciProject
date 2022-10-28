import openai
import googletrans
import json

openai.api_key = "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"

def hexcode(input):
    # translate input
    translator = googletrans.Translator()
    result = translator.translate(input, dest="en")
    # use openai
    response = openai.Completion.create(
    model="text-davinci-002",
    prompt="The CSS code for a color like " + result.text + "\nbackground-color: #",
    temperature=0,
    max_tokens=64,
    top_p=1.0,
    frequency_penalty=0.0,
    presence_penalty=0.0,
    stop=[";"]
    )
    return response.choices[0].text

"""
def translate(input):
    translator = googletrans.Translator()
    result = translator.translate(input, dest="en")
    return result.text
"""