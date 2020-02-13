#!/usr/bin/env node

const { BotDriver } = require('botium-core');
const fs = require('fs');
const tap = require('tap');
const klawSync = require('klaw-sync');
const rimraf = require('rimraf');
const devnull = require('dev-null');
require('colors');
const { argv } = require('yargs').strict()
  .usage('Usage: $0 <path> [--conf conf] [--jobs num] [--retries num]')
  .describe('conf', 'Botium configuration.')
  .nargs('conf', 1)
  .describe('jobs', 'Number of parallel executions to trigger.')
  .nargs('jobs', 1)
  .describe('retries', 'Number of retries to perform when a conversation fails.')
  .nargs('retries', 1);

const parser = require('./lib/parser.js');
const runner = require('./lib/runner.js');


const run = (driver, data, childTest, maxRetries, retries = 0) => {
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
        run(driver, data, childTest, maxRetries, retries + 1);
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


const BOTIUM_CONF_DEFAULT = 'botium.json';
const main = () => {
  const conversationsPath = argv._[0] || '.';

  if (argv.conf) {
    if (fs.existsSync(argv.conf)) {
      process.env.BOTIUM_CONFIG = argv.conf;
    } else {
      console.error(`Configuration file ${argv.conf} does not exist`);
      process.exit(1);
    }
  } else {
    console.info(`No configuration provided, using: ${BOTIUM_CONF_DEFAULT}`);
    process.env.BOTIUM_CONFIG = BOTIUM_CONF_DEFAULT;
  }
  let driver = null;
  try {
    driver = new BotDriver();
  } catch (e) {
    console.error('There is a problem with your Botium configuration, please check.');
    throw e;
  }


  const files = conversationsPath.endsWith('.rmc') ? [conversationsPath]
    : klawSync(conversationsPath)
      .filter(file => file.path.endsWith('.rmc'))
      .map(file => file.path);
  const maxRetries = argv.retries || 0;
  tap.jobs = argv.jobs || 1;
  tap.pipe(devnull());
  files.forEach((filePath) => {
    const testName = filePath;
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = parser.parseString(fileContent, filePath);
    tap.test(testName, (childTest) => {
      run(driver, data, childTest, maxRetries);
    });
  });
  tap.tearDown(clean);
  tap.tearDown(report);
};

main();
