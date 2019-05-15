
const configurations = {
  HM: ['says'],
  RM: ['starts with', 'contains', 'equals', 'excludes', 'includes any'],
};

// Check header lang
const hasHeaderLang = (line) => {
  const langParam = '(LANG)'; // Word 1
  const re2 = '.*?'; // Non-greedy match on filler
  const sepParam = '(:)'; // Any Single Character 1
  const re4 = '.*?'; // Non-greedy match on filler
  const valueParam = '((?:[a-z][a-z]+))'; // Word 2
  const p = new RegExp(langParam + re2 + sepParam + re4 + valueParam, ['i']);
  const m = p.exec(line);
  return m !== null;
};

// Check if it has the actor
const hasActor = who => who in configurations;

// Return list of actions
const getActions = who => (hasActor(who) ? configurations[who] : null);


// Check if the action is on the list
const hasAction = (who, action) => {
  const actions = getActions(who);
  return actions !== null && actions.includes(action);
};

module.exports = {
  hasAction, hasActor, hasHeaderLang,
};
