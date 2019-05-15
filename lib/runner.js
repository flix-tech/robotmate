
require('colors');

const DIALOGFLOW_CONSTANTS = {
  containerMode: 'dialogflow',
  langCapability: 'DIALOGFLOW_LANGUAGE_CODE',
};

const FACEBOOK_RECEIVER_CONSTANTS = {
  containerMode: 'fbdirect',
};

class Logger {
  constructor(fileName) {
    this.fileName = ` ${fileName.split('/').pop()}`;
  }

  error(msg) {
    console.error(`     ${this.fileName} ::: ${msg}`);
  }

  log(msg) {
    console.log(`     ${this.fileName} ::: ${msg}`);
  }
}

class ConversationProcessor {
  /**
   * @param {Object} container external dependency (botium)
   * @param {String} filePath File path of the file we are processing.
   * @param {ConversationItem[]} conversations Array of conversation objects.
   * @param {String} lang language of the conversation.
   */
  constructor(container, filePath, conversations, lang) {
    this.container = container;
    this.logger = new Logger(filePath);
    this.conversations = conversations;
    this.lang = lang;
  }

  assertLocal(result, action, actual, expected, lineNumber) {
    if (!result) {
      this.logger.error(`${'Assertion FAILED'.bold.red} @ line: ${lineNumber}`);
      this.logger.error(`Actual value: ${actual} Expected : ${action} ${expected}`);

      this.logger.log('BAD ROBOT'.red);
      throw new Error(`Assertion FAILED @ line: ${lineNumber}`);
    }
  }

  /**
   * Perform assertions for each response provided by the bot.
   *
   * @param {ConversationItem[]} rms collection of RMs (communication from the Robot to the user).
   * @param {String}   responseText response text as string provided by the Bot given a question.
   */
  doAssertions(rms, responseText) {
    this.logger.log(`${'=== Lets check the robot message!'.yellow}`);
    rms.forEach((rm) => {
      this.logger.log(`${'Assertion: '.blue} ${rm.actor} ${rm.action} : ${rm.parameter}`);
      switch (rm.action) {
        case 'equals':
          this.assertLocal(responseText === rm.parameter,
            rm.action, responseText, rm.parameter, rm.line);
          break;
        case 'starts with':
          this.assertLocal(responseText.startsWith(rm.parameter),
            rm.action, responseText, rm.parameter, rm.line);
          break;
        case 'contains':
          this.assertLocal(responseText.includes(rm.parameter),
            rm.action, responseText, rm.parameter, rm.line);
          break;
        case 'excludes':
          this.assertLocal(rm.parameter.split('" "').every(str => !responseText.includes(str)),
            rm.action, responseText, rm.parameter, rm.line);
          break;
        case 'includes any':
          this.assertLocal(rm.parameter.split('" "').some(str => responseText.includes(str)),
            rm.action, responseText, rm.parameter, rm.line);
          break;
        default:
          throw Error(`${rm.action} is not supported`);
      }
    });
    this.logger.log('=== Good!'.green);
  }

  /**
   * Take the conversation node and iterate to each item from the collection in order
   * to extract the message that was sent by the user and all the communication that
   * was provided by the Bot.
   */
  process() {
    const { driver } = this.container;
    if (driver.caps.CONTAINERMODE === DIALOGFLOW_CONSTANTS.containerMode
      || driver.caps.CONTAINERMODE === FACEBOOK_RECEIVER_CONSTANTS.containerMode) {
      driver.setCapability(DIALOGFLOW_CONSTANTS.langCapability, this.lang.replace('_', '-'));
    }
    const result = [];
    const conversationMap = this.buildConversationMap();

    conversationMap.forEach((assertions, hm) => {
      this.container.UserSaysText(hm.parameter);

      this.container.WaitBotSaysText((responseText) => {
        if (!responseText) {
          // This should not happen, there is a problem with botium
          this.logger.error(`${'Robot says: Empty response.'.bold.red}`);
        } else {
          this.logger.log(`${'The runner'.bold.green} ${hm.action.bold} : ${hm.parameter.italic}`);
          this.logger.log(`${'Robot says:'.bold.green}  ${responseText.italic}`);
          result.push(hm.parameter);
          result.push(responseText);
          this.doAssertions(assertions, responseText);
        }
      });
    });

    return result;
  }

  buildConversationMap() {
    const result = [];

    this.conversations.forEach((conversation) => {
      if (conversation.actor === 'HM') {
        result.push([conversation, []]);
      } else {
        result[result.length - 1][1].push(conversation);
      }
    });

    return new Map(result);
  }
}

module.exports = {
  ConversationProcessor, DIALOGFLOW_CONSTANTS,
};
