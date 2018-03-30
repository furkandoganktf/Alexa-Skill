import PositiveWords from './positivewords';
import Letters from './letters';
import { languageString } from './speechoutputs';

const states = {
  ANSWERMODE: '_ANSWERMODE', // Asking questions.
  STARTMODE: '_STARTMODE', // Entry point, start the game.
};

const msg = languageString.en.translation;
const smallLogo = 'https://s3-us-west-1.amazonaws.com/otsimo-en/numbers/logo.png';
const largeLogo = 'https://s3-us-west-1.amazonaws.com/otsimo-en/numbers/logo-2.png';

// Random number
export async function answerRandomIntent(event, emit, handler, attributes, storage) {
  const randomArray = attributes.dataToSave.randomArray;
  const answer = event.request.intent.slots.Answer.value;
  const randomIndex = attributes.dataToSave.randomIndex;
  console.log('Answer :', answer);
  console.log('Answer2 :', answer.toLowerCase());
  if (answer.toLowerCase() === randomArray[randomIndex][0] || answer.toLowerCase() === randomArray[randomIndex][1] || answer.toLowerCase() === randomArray[randomIndex][2] || answer.toLowerCase() === randomArray[randomIndex][3]) {
    randomTrueAnswer(event, emit, handler, attributes, storage);
  } else {
    randomFalseAnswer(event, emit, handler, attributes, storage);
  }
}

// Inorder number
export async function answerInorderIntent(event, emit, handler, attributes, storage) {
  const answer = event.request.intent.slots.Answer.value;
  const inorderIndex = attributes.dataToSave.inorderIndex;
  // True answer
  console.log('Answer :', answer);
  console.log('Answer2 :', answer.toLowerCase());
  if (answer.toLowerCase() === Letters[inorderIndex][0] || answer.toLowerCase() === Letters[inorderIndex][1] || answer.toLowerCase() === Letters[inorderIndex][2] || answer.toLowerCase() === Letters[inorderIndex][3]) {
    inorderTrueAnswer(event, emit, handler, attributes, storage);
    // False answer but still have chance
  } else {
    inorderFalseAnswer(event, emit, handler, attributes, storage);
  }
}

async function randomTrueAnswer(event, emit, handler, attributes, storage) {
  const randomArray = attributes.dataToSave.randomArray;
  const inorderIndex = attributes.dataToSave.inorderIndex;
  let randomIndex = attributes.dataToSave.randomIndex;
  let randomNumber = randomArray[randomIndex][0];
  let score = attributes.dataToSave.score;
  let totalscore = attributes.dataToSave.totalscore;
  let numerate = attributes.dataToSave.numerate;
  let smallimageurl = randomArray[randomIndex][4];
  let largeimageurl = randomArray[randomIndex][5];
  /* eslint-disable */
  attributes.dataToSave = {
    randomArray: randomArray, inorderArray: Letters, randomIndex: randomIndex, inorderIndex: inorderIndex, numerate: numerate, score: score, totalscore: totalscore,
  };
  /* eslint-enable */
  randomIndex += 1;
  score = countScore(numerate);
  totalscore += score;
  numerate = 0;
  /* eslint-disable */
  attributes.dataToSave.randomIndex = randomIndex;
  attributes.dataToSave.numerate = numerate;
  attributes.dataToSave.score = score;
  attributes.dataToSave.totalscore = totalscore;
  /* eslint-enable */
  try {
    const res = await storage.saveSessionData(event.session, attributes.dataToSave);
    console.log('Running random answer saveSessionData', res, event.sessionData);
  } catch (err) {
    console.error(err);
  }
  if (typeof randomArray[randomIndex] !== 'undefined') {
    randomNumber = randomArray[randomIndex][0];
    smallimageurl = randomArray[randomIndex][4];
    largeimageurl = randomArray[randomIndex][5];
  }
  // Answer is true but no more number
  if (typeof randomArray[randomIndex] === 'undefined') {
    const oldNumber = -1;
    gameOver(emit, handler, oldNumber, totalscore);
  }
  const oldNumber = -1;
  tryAnother(emit, handler, oldNumber, randomNumber, smallimageurl, largeimageurl);
}

async function randomFalseAnswer(event, emit, handler, attributes, storage) {
  const randomArray = attributes.dataToSave.randomArray;
  const inorderIndex = attributes.dataToSave.inorderIndex;
  const answer = event.request.intent.slots.Answer.value;
  let randomIndex = attributes.dataToSave.randomIndex;
  let randomNumber = randomArray[randomIndex][0];
  const score = attributes.dataToSave.score;
  const totalscore = attributes.dataToSave.totalscore;
  let numerate = attributes.dataToSave.numerate;
  let smallimageurl = randomArray[randomIndex][4];
  let largeimageurl = randomArray[randomIndex][5];
  /* eslint-disable */
  attributes.dataToSave = {
    randomArray: randomArray, inorderArray: Letters, randomIndex: randomIndex, inorderIndex: inorderIndex, numerate: numerate, score: score, totalscore: totalscore,
  };
  /* eslint-enable */
  // False answer but still have chance
  if (parseInt(answer, 10) !== randomNumber && numerate < 2) {
    numerate += 1;
    /* eslint-disable */
    attributes.dataToSave.numerate = numerate;
    /* eslint-enable */
    try {
      const res = await storage.saveSessionData(event.session, attributes.dataToSave);
      console.log('Running random answer saveSessionData', res, event.sessionData);
    } catch (err) {
      console.error(err);
    }
    tryAgain(emit, handler, randomNumber, smallimageurl, largeimageurl);
    // False answer and there is no chance
  } else {
    randomIndex += 1;
    numerate = 0;
    const oldNumber = randomArray[randomIndex - 1][0];
    if (typeof randomArray[randomIndex] !== 'undefined') {
      randomNumber = randomArray[randomIndex][0];
      smallimageurl = randomArray[randomIndex][4];
      largeimageurl = randomArray[randomIndex][5];
    }
    /* eslint-disable */
    attributes.dataToSave.randomIndex = randomIndex;
    attributes.dataToSave.numerate = numerate;
    /* eslint-enable */
    try {
      const res = await storage.saveSessionData(event.session, attributes.dataToSave);
      console.log('Running random answer saveSessionData', res, event.sessionData);
    } catch (err) {
      console.error(err);
    }
    // Answer is false and no more number
    if (typeof randomArray[randomIndex] === 'undefined') {
      gameOver(emit, handler, oldNumber, totalscore);
    }
    tryAnother(emit, handler, oldNumber, randomNumber, smallimageurl, largeimageurl);
  }
}

async function inorderTrueAnswer(event, emit, handler, attributes, storage) {
  const randomArray = attributes.dataToSave.randomArray;
  const randomIndex = attributes.dataToSave.randomIndex;
  let inorderIndex = attributes.dataToSave.inorderIndex;
  let score = attributes.dataToSave.score;
  let totalscore = attributes.dataToSave.totalscore;
  let numerate = attributes.dataToSave.numerate;
  let inorderNumber = Letters[inorderIndex][0];
  let smallimageurl = Letters[inorderIndex][4];
  let largeimageurl = Letters[inorderIndex][5];
  /* eslint-disable */
  attributes.dataToSave = {
    randomArray: randomArray, inorderArray: Letters, randomIndex: randomIndex, inorderIndex: inorderIndex, numerate: numerate, score: score, totalscore: totalscore,
  };
  /* eslint-enable */
  inorderIndex += 1;
  score = countScore(numerate);
  totalscore += score;
  numerate = 0;
  /* eslint-disable */
  attributes.dataToSave.inorderIndex = inorderIndex;
  attributes.dataToSave.numerate = numerate;
  attributes.dataToSave.score = score;
  attributes.dataToSave.totalscore = totalscore;
  /* eslint-enable */
  try {
    const res = await storage.saveSessionData(event.session, attributes.dataToSave);
    console.log('Running inorder answer saveSessionData', res, attributes.dataToSave);
  } catch (err) {
    console.error(err);
  }
  if (typeof Letters[inorderIndex] !== 'undefined') {
    inorderNumber = Letters[inorderIndex][0];
    smallimageurl = Letters[inorderIndex][4];
    largeimageurl = Letters[inorderIndex][5];
  }
  // Answer is true but no more number
  if (typeof Letters[inorderIndex] === 'undefined') {
    const oldNumber = -1;
    gameOver(emit, handler, oldNumber, totalscore);
  }
  const oldNumber = -1;
  tryAnother(emit, handler, oldNumber, inorderNumber, smallimageurl, largeimageurl);
}

async function inorderFalseAnswer(event, emit, handler, attributes, storage) {
  const randomArray = attributes.dataToSave.randomArray;
  const randomIndex = attributes.dataToSave.randomIndex;
  const answer = event.request.intent.slots.Answer.value;
  let inorderIndex = attributes.dataToSave.inorderIndex;
  const score = attributes.dataToSave.score;
  const totalscore = attributes.dataToSave.totalscore;
  let numerate = attributes.dataToSave.numerate;
  let inorderNumber = Letters[inorderIndex][0];
  let smallimageurl = Letters[inorderIndex][4];
  let largeimageurl = Letters[inorderIndex][5];
  /* eslint-disable */
  attributes.dataToSave = {
    randomArray: randomArray, inorderArray: Letters, randomIndex: randomIndex, inorderIndex: inorderIndex, numerate: numerate, score: score, totalscore: totalscore,
  };
  /* eslint-enable */
  if (parseInt(answer, 10) !== inorderNumber && numerate < 2) {
    numerate += 1;
    /* eslint-disable */
    attributes.dataToSave.numerate = numerate;
    /* eslint-enable */
    try {
      const res = await storage.saveSessionData(event.session, attributes.dataToSave);
      console.log('Running inorder answer saveSessionData', res, event.sessionData);
    } catch (err) {
      console.error(err);
    }
    tryAgain(emit, handler, inorderNumber, smallimageurl, largeimageurl);
    // False answer and there is no chance
  } else {
    inorderIndex += 1;
    numerate = 0;
    const oldNumber = Letters[inorderIndex - 1][0];
    if (typeof Letters[inorderIndex] !== 'undefined') {
      inorderNumber = Letters[inorderIndex][0];
      smallimageurl = Letters[inorderIndex][4];
      largeimageurl = Letters[inorderIndex][5];
    }
    /* eslint-disable */
    attributes.dataToSave.inorderIndex = inorderIndex;
    attributes.dataToSave.numerate = numerate;
    /* eslint-enable */
    try {
      const res = await storage.saveSessionData(event.session, attributes.dataToSave);
      console.log('Running inorder answer saveSessionData', res, event.sessionData);
    } catch (err) {
      console.error(err);
    }
    // Answer is false and no more number
    if (typeof Letters[inorderIndex] === 'undefined') {
      gameOver(emit, handler, oldNumber, totalscore);
    }
    tryAnother(emit, handler, oldNumber, inorderNumber, smallimageurl, largeimageurl);
  }
}

function countScore(numerate) {
  return 3 - numerate;
}

function gameOver(emit, handler, oldNumber, totalscore) {
  const randomPositiveWords = PositiveWords[Math.floor(Math.random() * PositiveWords.length)];
  /* eslint-disable */
  handler.state = states.STARTMODE;
  totalscore = getTotalScore(totalscore);
  /* eslint-enable */
  const smallimageurl = smallLogo;
  const largeimageurl = largeLogo;
  const cardImage = {
    smallImageUrl: smallimageurl,
    largeImageUrl: largeimageurl,
  };
  let speechOutput = randomPositiveWords + msg.GAME_OVER_MESSAGE;
  if (oldNumber !== -1) {
    speechOutput = msg.FALSE_ANSWER_MESSAGE(oldNumber) + msg.GAME_OVER_MESSAGE;
  }
  const reprompt = msg.GAME_OVER_REPROMT;
  emit(':askWithCard', speechOutput, reprompt, 'Game is over', 'Your score is' + totalscore.toString(), cardImage);
}

function tryAnother(emit, handler, oldNumber, number, smallimageurl, largeimageurl) {
  const randomPositiveWords = PositiveWords[Math.floor(Math.random() * PositiveWords.length)];
  const cardImage = {
    smallImageUrl: smallimageurl,
    largeImageUrl: largeimageurl,
  };
  let speechOutput = randomPositiveWords + msg.TRY_ANOTHER_MESSAGE + number;
  if (oldNumber !== -1) {
    speechOutput = msg.FALSE_ANSWER_MESSAGE(oldNumber) + msg.TRY_ANOTHER_MESSAGE + number;
  }
  const reprompt = msg.QUESTION_MESSAGE + number;
  emit(':askWithCard', speechOutput, reprompt, 'Say this letter', number.toString(), cardImage);
}

function tryAgain(emit, handler, number, smallimageurl, largeimageurl) {
  const cardImage = {
    smallImageUrl: smallimageurl,
    largeImageUrl: largeimageurl,
  };
  const speechOutput = msg.TRY_AGAIN_MESSAGE + number;
  const reprompt = msg.QUESTION_MESSAGE + number;
  emit(':askWithCard', speechOutput, reprompt, 'Try again', number.toString(), cardImage);
}

function getTotalScore(totalscore) {
  return Math.round((totalscore / 78) * 100);
}
