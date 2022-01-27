const fs = require('fs');
const f = 'node_modules/@angular-devkit/build-angular/src/webpack/configs/browser.js';

let overwrite = false;

if(overwrite) {
    fs.readFile(f, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        var result = data.replace(/node: false/g, `node: {crypto: true, stream: true}`);

        fs.writeFile(f, result, 'utf8', function (err) {
            if (err) return console.log(err);
        });
    });
}

