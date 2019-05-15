const assert = require('assert');
const parser = require('../lib/parser.js');
const { ConversationProcessor, DIALOGFLOW_CONSTANTS } = require('../lib/runner.js');

class MockContainer {
  constructor(answers) {
    this.answers = new Map(answers);
    this.driver = {
      capabilitiesLoaded: false,
      setCapability(cap, value) {
        assert(cap, DIALOGFLOW_CONSTANTS.langCapability);
        assert(value, 'en-EN');
        this.capabilitiesLoaded = true;
      },
      caps: { CONTAINERMODE: DIALOGFLOW_CONSTANTS.containerMode },
    };
  }

  UserSaysText(text) { this.lastText = text; }

  WaitBotSaysText(callback) {
    callback(this.answers.get(this.lastText));
  }
}

describe('Runner', () => {
  it('Should run a MOCK conversation', () => {
    const data = parser.parseFile('test/resources/runner/book_a_ride.rmc');
    const answers = [
      ['I would like to go to Berlin', "What's your departure city?"],
      ['Berlin', 'Ok, lets go to Berlin there! When do you want to go?'],
      ['Tomorrow', 'Have a ticket! Enjoy your ride!'],
    ];

    const mockContainer = new MockContainer(answers);
    const result = new ConversationProcessor(mockContainer, data.fileName, data.conversation, data.lang).process();
    assert(mockContainer.driver.capabilitiesLoaded, true);
    assert.deepEqual(answers.reduce((acc, val) => acc.concat(val), []), result);
  });
  it('Should run a failing conversation', () => {
    const data = parser.parseFile('test/resources/runner/book_a_ride_failing.rmc');
    const answers = [
      ['I would like to go to Berlin', "What's your departure city?"],
      ['Berlin', 'Ok, lets go to Berlin there! When do you want to go?'],
      ['Tomorrow', 'Have a ticket! Enjoy your ride!'],
    ];

    const mockContainer = new MockContainer(answers);
    assert.throws(() => new ConversationProcessor(mockContainer, data.fileName, data.conversation, data.lang)
      .process(), { message: 'Assertion FAILED @ line: 6' });
    assert(mockContainer.driver.capabilitiesLoaded, true);
  });
});
