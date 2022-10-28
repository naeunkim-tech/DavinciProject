import openai
import googletrans
import json

openai.api_key = "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"

def hexcode(input):
    response = openai.Completion.create(
    model="text-davinci-002",
    prompt="The CSS code for a color like" + input + "\n\nbackground-color: #",
    temperature=0,
    max_tokens=64,
    top_p=1.0,
    frequency_penalty=0.0,
    presence_penalty=0.0,
    stop=[";"]
    )
    return response.choices[0].text

def translate(input):
    translator = googletrans.Translator()
    result = translator.translate(input, dest="en")
    hexcode(result.text)

data = {
    "hexcode" : translate
}