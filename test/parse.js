#!/usr/bin/env node
const fs = require('fs');
const { argv } = require('yargs')
  .usage('Usage: $0 <path>')
  .required(1, 'Path is required');

const parser = require('./lib/parser.js');

if (argv._[0].endsWith('.rmc')) {
  const data = parser.parseFile(argv._[0]);
  console.log(JSON.stringify(data, null, 4));
} else {
  fs.readdirSync(argv._[0])
    .filter(file => file.endsWith('.rmc'))
    .map(file => `${argv._[0]}/${file}`)
    .forEach((file) => {
      console.log(`=== Parsing: ${file}`);
      parser.parseFile(file);
      console.log('  = OK');
    });
}
