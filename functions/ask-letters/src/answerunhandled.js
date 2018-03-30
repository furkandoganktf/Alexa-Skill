import Letters from './letters';
import { languageString } from './speechoutputs';

const states = {
  ANSWERMODE: '_ANSWERMODE', // Asking questions.
  STARTMODE: '_STARTMODE', // Entry point, start the game.
};
const msg = languageString.en.translation;
const RANDOM_GAME = 0;
const INORDER_GAME = 1;
const smallLogo = 'https://s3-us-west-1.amazonaws.com/otsimo-en/numbers/logo.png';
const largeLogo = 'https://s3-us-west-1.amazonaws.com/otsimo-en/numbers/logo-2.png';

export async function unhandledAnswer(event, emit, handler, attributes, storage) {
  const gameType = attributes.gameType;
  if (gameType === RANDOM_GAME) {
    unhandledRandom(event, emit, handler, attributes, storage);
  } else if (gameType === INORDER_GAME) {
    unhandledInorder(event, emit, handler, attributes, storage);
  }
}

async function unhandledRandom(event, emit, handler, attributes, storage) {
  const randomArray = attributes.dataToSave.randomArray;
  const score = attributes.dataToSave.score;
  const totalscore = attributes.dataToSave.totalscore;
  let randomIndex = attributes.dataToSave.randomIndex;
  let randomNumber = randomArray[randomIndex][0];
  let numerate = attributes.dataToSave.numerate;
  let smallimageurl = randomArray[randomIndex][4];
  let largeimageurl = randomArray[randomIndex][5];
  const inorderIndex = attributes.dataToSave.inorderIndex;
  /* eslint-disable */
  attributes.dataToSave = {
    randomArray: randomArray, inorderArray: Letters, randomIndex: randomIndex, inorderIndex: inorderIndex, numerate: numerate, score: score, totalscore: totalscore,
  };
  /* eslint-enable */
  if (numerate < 2) {
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

async function unhandledInorder(event, emit, handler, attributes, storage) {
  const randomArray = attributes.dataToSave.randomArray;
  const score = attributes.dataToSave.score;
  const totalscore = attributes.dataToSave.totalscore;
  const randomIndex = attributes.dataToSave.randomIndex;
  let numerate = attributes.dataToSave.numerate;
  let smallimageurl = randomArray[randomIndex][4];
  let largeimageurl = randomArray[randomIndex][5];
  let inorderIndex = attributes.dataToSave.inorderIndex;
  let inorderNumber = Letters[inorderIndex][0];
  /* eslint-disable */
  attributes.dataToSave = {
    randomArray: randomArray, inorderArray: Letters, randomIndex: randomIndex, inorderIndex: inorderIndex, numerate: numerate, score: score, totalscore: totalscore,
  };
  /* eslint-enable */
  if (numerate < 2) {
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

function gameOver(emit, handler, oldNumber, totalscore) {
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
  const speechOutput = msg.FALSE_ANSWER_MESSAGE(oldNumber) + msg.GAME_OVER_MESSAGE;
  const reprompt = msg.GAME_OVER_REPROMT;
  emit(':askWithCard', speechOutput, reprompt, 'Game is over', 'Your score is' + totalscore.toString(), cardImage);
}

function tryAnother(emit, handler, oldNumber, number, smallimageurl, largeimageurl) {
  const cardImage = {
    smallImageUrl: smallimageurl,
    largeImageUrl: largeimageurl,
  };
  const speechOutput = msg.FALSE_ANSWER_MESSAGE(oldNumber) + msg.TRY_ANOTHER_MESSAGE + number;
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
