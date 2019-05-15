const assert = require('assert');
const fs = require('fs');
const parser = require('../lib/parser.js');

const assertParseLine = (line, conversationItem) => {
  assert.deepEqual(parser.parseLine(line, 0, '2018-07-31'), conversationItem);
};

const assertParseLineError = (line, msg) => {
  assert.throws(() => parser.parseLine(line, 0, '2018-07-31'), { message: msg });
};

const assertFiles = (filename) => {
  assert.deepEqual(parser.parseFile(`test/resources/${filename}.rmc`),
    JSON.parse(fs.readFileSync(`test/resources/${filename}_model.json`, 'utf-8')));
};

const assertParseErrors = (filename, msg) => {
  assert.throws(() => parser.parseFile(`test/resources/${filename}.rmc`), { message: msg });
};

describe('Parser', () => {
  describe('Parse Line', () => {
    it('Should parse every action successfully', () => {
      assertParseLine('HM says : "Hello Gugu!"',
        new parser.ConversationItem(0, 'HM', 'says', 'Hello Gugu!'));

      assertParseLine('RM contains : "Hi!"',
        new parser.ConversationItem(0, 'RM', 'contains', 'Hi!'));

      assertParseLine('HM says : "I am fine, how are you?"',
        new parser.ConversationItem(0, 'HM', 'says', 'I am fine, how are you?'));

      assertParseLine('RM starts with : "I am"',
        new parser.ConversationItem(0, 'RM', 'starts with', 'I am'));

      assertParseLine('HM says : "What are you doing?"',
        new parser.ConversationItem(0, 'HM', 'says', 'What are you doing?'));

      assertParseLine('RM equals : "Nothing!"',
        new parser.ConversationItem(0, 'RM', 'equals', 'Nothing!'));

      assertParseLine('RM includes any : "Fist word" "Second word"',
        new parser.ConversationItem(0, 'RM', 'includes any', 'Fist word" "Second word'));

      assertParseLine('RM includes any : "Fist word"',
        new parser.ConversationItem(0, 'RM', 'includes any', 'Fist word'));

      assertParseLine('RM excludes : "Fist word" "Second word"',
        new parser.ConversationItem(0, 'RM', 'excludes', 'Fist word" "Second word'));

      assertParseLine('RM excludes : "Fist word"',
        new parser.ConversationItem(0, 'RM', 'excludes', 'Fist word'));
    });
  });
  describe('Fail on incorrect lines', () => {
    it('Wrong actor', () => {
      assertParseLineError('M says : "Hello Gugu!"', 'The actor M  doesn\'t exists (Line: 0)');
    });
    it('Wrong action', () => {
      assertParseLineError('HM sayos : "Hello Gugu!"', 'The actor HM doesn\'t have the action sayos (Line: 0)');
    });
  });
  describe('Parse File', () => {
    it('Should parse the list of given files', () => {
      assertFiles('sample');
      assertFiles('sample_1');
    });
  });
  describe('Fail on incorrect files', () => {
    it('File without lang', () => {
      assertParseErrors('sample_2', 'Your test doesn\'t have the language set (Line: 1)');
    });
    it('File without separation of action', () => {
      assertParseErrors('sample_4', 'This line doesn\'t have a separator as required: (Line: 18)');
    });
    it('File without action or actor in line', () => {
      assertParseErrors('sample_5', 'This line doesn\'t have a separator as required: (Line: 20)');
    });
  });
});
