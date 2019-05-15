const fs = require('fs');
const pconfig = require('./pconfig.js'); // Contains all the actions and actors

class ConversationItem {
  constructor(line, actor, action, parameter) {
    this.line = line;
    this.actor = actor;
    this.action = action;
    this.parameter = parameter;
  }
}

class Conversation {
  constructor(lang, fileName, conversation) {
    this.lang = lang;
    this.fileName = fileName;
    this.conversation = conversation;
  }
}

/**
 * @param {string} line line to be parsed.
 * @param {number} lineNumber the number of this line inside of the file.
 */
const parseLine = (line, lineNumber) => {
  if (line === '' || line.trim() === '' || line.startsWith('//')) { return null; }

  // Check if the line has a separator
  if (!line.includes(':')) {
    throw new Error(`This line doesn't have a separator as required: (Line: ${lineNumber})`);
  }

  const actor = line.slice(0, 2);
  const action = line.slice(3, line.indexOf(':')).trim();

  // Check if the actor exists
  if (!pconfig.hasActor(actor)) {
    throw new Error(`The actor ${actor} doesn't exists (Line: ${lineNumber})`);
  }

  // Check if the action for the actor exists
  if (!pconfig.hasAction(actor, action)) {
    throw new Error(`The actor ${actor} doesn't have the action ${action} (Line: ${lineNumber})`);
  }

  const parameterRaw = line.slice(line.indexOf(':') + 1).trim();

  const parameter = (parameterRaw.includes('"')) ? parameterRaw.slice(1, parameterRaw.length - 1) : parseFloat(parameterRaw);

  return new ConversationItem(lineNumber, actor, action, parameter);
};

const parseString = (fileContent, filePath) => {
  const fileLines = fileContent.split('\n');
  const langLine = fileLines[0];
  // Check if it has a lang parameter
  if (!pconfig.hasHeaderLang(langLine)) {
    throw new Error('Your test doesn\'t have the language set (Line: 1)');
  }
  const lang = langLine.slice(langLine.indexOf(':') + 1).trim();

  const conversation = fileLines.map((line, index) => [line, index])
    .slice(1)
    .map(([line, index]) => parseLine(line, index + 1)).filter(x => x != null);
  return new Conversation(lang, filePath, conversation);
};

/**
 * @param {string} filePath file path of the file to be parsed.
 */
const parseFile = (filePath) => {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return parseString(fileContent, filePath);
};

module.exports = {
  parseString, parseLine, parseFile, ConversationItem, Conversation,
};
