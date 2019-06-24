#!/usr/bin/env node

const { BotDriver } = require('botium-core');
const fs = require('fs');
const tap = require('tap');
const csv = require('csv-parser');
const mustache = require('mustache');
const klawSync = require('klaw-sync');
const rimraf = require('rimraf');
const devnull = require('dev-null');
require('colors');
const { argv } = require('yargs')
  .usage('Usage: $0 <path> --conf <conf> [--jobs [num]] [--retries [num]]')
  .option('conf')
  .describe('conf', 'Botium configuration.')
  .describe('jobs', 'Number of parallel executions to trigger.')
  .describe('retries', 'Number of retries to perform when a conversation fails.');

const parser = require('./lib/parser.js');
const runner = require('./lib/runner.js');

const maxRetries = argv.retries || 0;
const run = (data, childTest, retries = 0) => {
  const driver = new BotDriver();
  const container = driver.BuildFluent().Start();

  new runner.ConversationProcessor(container, data.fileName, data.conversation, data.lang).process();

  container
    .Stop()
    .Clean()
    .Exec()
    .then(() => {
      childTest.end();
    })
    .catch((error) => {
      if (retries < maxRetries) {
        run(data, childTest, retries + 1);
      } else {
        childTest.fail(error);
        childTest.end();
      }
    });
};

const clean = () => {
  rimraf.sync(new BotDriver().caps.TEMPDIR);
};

const report = () => {
  const failures = tap.results.failures.length;
  const testsFailed = tap.results.failures.length > 0;

  const failedTests = (testsFailed) ? `${failures} failed, ` : '';
  const passedTests = `${tap.results.count - failures} passed, `;
  console.info();
  console.info(`Conversations: ${failedTests} ${passedTests} ${tap.results.count} total`);
  console.info(`Duration: ${(tap.time / 1000).toFixed(2)} seconds`);

  if (testsFailed) {
    console.error(`${failures} failed conversations:`.red);
    tap.results.failures.forEach(x => console.error(x.name.red));
    process.exit(1);
  }
};

const conversationsPath = argv._[0] || '.';
process.env.BOTIUM_CONFIG = argv.conf || 'botium.json';

const files = conversationsPath.endsWith('.rmc') ? [conversationsPath]
  : klawSync(conversationsPath)
    .filter(file => file.path.endsWith('.rmc'))
    .map(file => file.path);

tap.jobs = argv.jobs || 1;
tap.pipe(devnull());

files.forEach((filePath) => {
  const testName = filePath;
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const csvFilePath = filePath.replace('.rmc', '.csv');
  if (fs.existsSync(csvFilePath)) {
    const csvRows = [];
    fs.createReadStream(csvFilePath)
      .pipe(csv({ delimiter: ',' }))
      .on('data', csvRow => csvRows.push(csvRow))
      .on('end', () => {
        csvRows.forEach((csvRow, index) => {
          const processedFileContent = mustache.render(fileContent, csvRow);
          const data = parser.parseString(processedFileContent, filePath);
          tap.test(`${testName} CSV Line : ${index + 1}`, (childTest) => {
            data.fileName = `${data.fileName}:${index + 1}`;
            run(data, childTest, this.timeout);
          });
        });
      });
  } else {
    const data = parser.parseString(fileContent, filePath);
    tap.test(testName, (childTest) => {
      run(data, childTest, this.timeout);
    });
  }
});

tap.tearDown(clean);
tap.tearDown(report);
