/* http://127.0.0.1:3000 */

const express = require('express');
const app = express();
const port = 3000;
const {PythonShell} = require('python-shell');
const fs = require('fs');

app.use(express.json());
app.use('/', express.static('./'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/start.html');
});

app.get('/run', (req, res) => {
    var options = {
        mode: 'text',
        pythonPath: '',
        pythonOptions: ['-u'],
        scriptPath: '',
        args: [req.query.input]
    };


    return PythonShell.run('aifunction.py', options, function (err, result) {
        if (err) throw err;
        res.send(result);
    });
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

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});