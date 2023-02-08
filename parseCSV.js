//install "npm install csv-parser"
const csv = require('csv-parser')
const fs = require('fs')
const words = [];

fs.createReadStream('words.csv')
  .pipe(csv())
  .on('data', (data) => words.push(data))
  .on('end', () => {
  console.log(words);
  });
//words is now array of objects with from and to properties