/* http://127.0.0.1:3000 */

const { Configuration, OpenAIApi } = require("openai");
const express = require('express');
const app = express();
const port = 3000;
const {PythonShell} = require('python-shell');
const fs = require('fs');

/* OpenAI GPT-3 API apiKey 변경 필요 */
const configuration = new Configuration({
    apiKey: "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",
});
const openai = new OpenAIApi(configuration);

/* Papago API client_id, client_secret 변경 필요 */
const client_id = 'k5q6gbfefg';
const client_secret = 'cJXtvJ1iTgpLk3kj07noDbTqAxLggx1rzT232Ded';

app.use(express.json());
app.use('/', express.static('./'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/start.html');
});

app.post('/data', (req, res) => {
    try {
        const data = req.body.data;
        const readFile = fs.readFileSync(__dirname + '/data.json').toString();
        const parseData = readFile.length > 1 ? JSON.parse(readFile) : [];
        parseData.push(data);
        fs.writeFileSync(__dirname + '/data.json', JSON.stringify(parseData));
        res.send('success');
    } catch (err) {
        console.log(err);
    }
});

/*  문장 생성  */
app.post('/generate', async (req, res) => {
    const completion = await openai.createCompletion({
        model: "text-davinci-002",
        prompt: generateSentencePrompt(req.body.sentence),
        temperature: 1,     // 0.0 ~ 1.0 낮을 수록 일관된 답변
        max_tokens: 500,    // 사용할 최대 토큰 수 (토큰이 모자라면 문장이 잘려서 나옴)
    });
    const sentences = completion.data.choices[0].text;
    console.log("BACK : " + sentences);
    res.status(200).json({ result: completion.data.choices[0].text });
});

/*  색상 생성  */
app.post('/get_color', async (req, res) => {
    const completion = await openai.createCompletion({
        model: "text-davinci-002",
        prompt: generateColorPrompt(req.body.color),
        temperature: 0.2,
        max_tokens: 10,
    });
    console.log("RAW DATA : ");
    console.log(completion.data.choices);
    const colorHex = completion.data.choices[0].text;
    console.log("COLOR HEX : " + colorHex);
    res.status(200).json({ result: completion.data.choices[0].text });
});

app.post('/translate', function (req, res) {
    let api_url = 'https://naveropenapi.apigw.ntruss.com/nmt/v1/translation';
    let request = require('request');
    let options = {
        url: api_url,
        form: {'source':req.body.source, 'target':req.body.target, 'text':req.body.sentence},
        headers: {'X-NCP-APIGW-API-KEY-ID':client_id, 'X-NCP-APIGW-API-KEY': client_secret}
    };
    request.post(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.writeHead(200, {'Content-Type': 'text/json;charset=utf-8'});
            console.log(body);
            res.end(body);
        } else {
            res.status(response.statusCode).end();
            console.log('error = ' + response.statusCode);
        }
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});

function generateSentencePrompt(sentence) {
    return `Source: You are the person 100% pure, enjoying other people's attention and thinking of the world as your stage, honest with myself than anyone else. 
Result: (1) You are the person 100% pure, enjoying other people's attention and thinking of the world as your stage, honest with myself than anyone else. (2) You are confident and enjoy being the center of attention. (3) You are honest with yourself and others, and you have a strong sense of self. (4) You are independent and unique, and you think of the world as your stage. (5) You are always learning and growing, and you are open to new experiences. (6) You are kind and compassionate, and you care about making a difference in the world. (7) You are a true individual, and you are always true to yourself.

Source: ${sentence}
Result:`;
}

function generateColorPrompt(color) {
    return `The CSS code for a color like ${color}
    background-color: #`;
}
