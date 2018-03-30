import * as Alexa from 'alexa-sdk';
import Numbers from './numbers';
import { Storage, authenticate } from '../../../common';
import { answerRandomIntent, answerInorderIntent } from './answers';
import { unhandledAnswer } from './answerunhandled';
import { languageString } from './speechoutputs';

const storage = new Storage(process.env.OTSIMO_STORAGE);

const states = {
  ANSWERMODE: '_ANSWERMODE', // Asking questions.
  STARTMODE: '_STARTMODE', // Entry point, start the game.
};

const RANDOM_GAME = 0;
const INORDER_GAME = 1;
const smallLogo = 'https://s3-us-west-1.amazonaws.com/otsimo-en/numbers/logo.png';
const largeLogo = 'https://s3-us-west-1.amazonaws.com/otsimo-en/numbers/logo-2.png';
const msg = languageString.en.translation;

async function launchRequest() {
  authenticate(this.event, this.emit);
  const speechOutput = this.t('WELCOME_MESSAGE');
  const reprompt = this.t('WELCOME_REPROMT');
  this.emit(':ask', speechOutput, reprompt);
}

async function getNewGameIntent() {
  this.handler.state = states.STARTMODE;
  this.attributes.gameType = 0;
  let tempArray = new Array(Numbers.length);
  const score = 0; // numerate score
  const totalscore = 0; // numerate total score
  const numerate = 0;
  const randomIndex = 0; // index of random number
  const inorderIndex = 0; // index of inorder number
  for (let u = 0; u < Numbers.length; u++) {
    tempArray[u] = Numbers[u];
  }
  tempArray = shuffle(tempArray);
  /* eslint-disable */
  this.attributes.dataToSave = {
    randomArray: tempArray, inorderArray: Numbers, randomIndex: randomIndex, inorderIndex: inorderIndex, numerate: numerate, score: score, totalscore: totalscore,
  };
  /* eslint-enable */
  try {
    const res = await storage.saveSessionData(this.event.session, this.attributes.dataToSave);
    console.log('Running saveSessionData', res);
  } catch (err) {
    console.error(err);
  }
  const speechOutput = this.t('NEW_GAME_MESSAGE');
  const reprompt = this.t('NEW_GAME_MESSAGE');
  this.emit(':ask', speechOutput, reprompt);
}

// First question for random game
async function randomGameIntent() {
  this.handler.state = states.ANSWERMODE;
  this.attributes.gameType = RANDOM_GAME;
  let savedData = this.attributes.dataToSave;
  const randomArray = savedData.randomArray;
  const randomNumber = randomArray[0][0];
  const randomIndex = savedData.randomIndex;
  const inorderIndex = savedData.inorderIndex;
  const score = savedData.score;
  const totalscore = savedData.totalscore;
  const numerate = savedData.numerate;
  const smallimageurl = randomArray[0][1];
  const largeimageurl = randomArray[0][2];
  /* eslint-disable */
  savedData = {
    randomArray: randomArray, inorderArray: Numbers, randomIndex: randomIndex, inorderIndex: inorderIndex, numerate: numerate, score: score, totalscore: totalscore,
  };
  /* eslint-enable */
  try {
    const res = await storage.saveSessionData(this.event.session, savedData);
    console.log('Running saveSessionData', res);
  } catch (err) {
    console.error(err);
  }
  firstQuestion(this.emit, randomNumber, smallimageurl, largeimageurl);
}

// First question for inorder game
async function inorderGameIntent() {
  this.handler.state = states.ANSWERMODE;
  this.attributes.gameType = INORDER_GAME;
  let savedData = this.attributes.dataToSave;
  const randomArray = savedData.randomArray;
  const inorderNumber = Numbers[0][0];
  const randomIndex = savedData.randomIndex;
  const inorderIndex = savedData.inorderIndex;
  const score = savedData.score;
  const totalscore = savedData.totalscore;
  const numerate = savedData.numerate;
  const smallimageurl = Numbers[0][1];
  const largeimageurl = Numbers[0][2];
  /* eslint-disable */
  savedData = {
    randomArray: randomArray, inorderArray: Numbers, randomIndex: randomIndex, inorderIndex: inorderIndex, numerate: numerate, score: score, totalscore: totalscore,
  };
  /* eslint-enable */
  try {
    const res = await storage.saveSessionData(this.event.session, savedData);
    console.log('Running saveSessionData', res);
  } catch (err) {
    console.error(err);
  }
  firstQuestion(this.emit, inorderNumber, smallimageurl, largeimageurl);
}

function firstQuestion(emit, number, smallimageurl, largeimageurl) {
  const cardImage = {
    smallImageUrl: smallimageurl,
    largeImageUrl: largeimageurl,
  };
  const speechOutput = msg.QUESTION_MESSAGE + number;
  const reprompt = msg.QUESTION_MESSAGE + number;
  emit(':askWithCard', speechOutput, reprompt, 'Say this number', number.toString(), cardImage);
}

// Choose true game type
async function answerIntent() {
  if (this.attributes.gameType === RANDOM_GAME) {
    answerRandomIntent(this.event, this.emit, this.handler, this.attributes, storage);
  } else {
    answerInorderIntent(this.event, this.emit, this.handler, this.attributes, storage);
  }
}

function yesIntent() {
  this.handler.state = states.STARTMODE;
  getNewGameIntent();
}

function helpIntent() {
  const speechOutput = this.t('HELP_MESSAGE');
  const reprompt = this.t('HELP_REPROMT');
  this.emit(':ask', speechOutput, reprompt);
}

function cancelIntent() {
  this.emit('SessionEndedRequest');
}

function stopIntent() {
  this.emit('SessionEndedRequest');
}

async function sessionEndedRequest() {
  try {
    this.event.sessionData = await storage.deleteSession(this.event.session);
  } catch (err) {
    console.error(err);
  }
  const smallimageurl = smallLogo;
  const largeimageurl = largeLogo;
  const cardImage = {
    smallImageUrl: smallimageurl,
    largeImageUrl: largeimageurl,
  };
  const message = this.t('STOP_MESSAGE');
  this.emit(':tellWithCard', message, 'Good Bye :)', 'OTSIMO', cardImage);
}

function unhandled() {
  const message = this.t('UNHANDLED_MESSAGE');
  this.emit(':ask', message, message);
}

function answerUnhandled() {
  unhandledAnswer(this.event, this.emit, this.handler, this.attributes, storage);
}

function shuffle(array) {
  let randomIndex = 0;
  const arr = array;
  let currentIndex = arr.length;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    const temporaryValue = arr[currentIndex];
    arr[currentIndex] = arr[randomIndex];
    arr[randomIndex] = temporaryValue;
  }
  return arr;
}

const newSessionHandlers = {
  LaunchRequest: launchRequest,
  GetNewGameIntent: getNewGameIntent,
  'AMAZON.HelpIntent': helpIntent,
  'AMAZON.StopIntent': stopIntent,
  'AMAZON.CancelIntent': cancelIntent,
  SessionEndedRequest: sessionEndedRequest,
  Unhandled: unhandled,
};

const startGameHandlers = Alexa.CreateStateHandler(states.STARTMODE, {
  RandomGameIntent: randomGameIntent,
  InorderGameIntent: inorderGameIntent,
  'AMAZON:YesIntent': yesIntent,
  'AMAZON.HelpIntent': helpIntent,
  'AMAZON.StopIntent': stopIntent,
  'AMAZON.CancelIntent': cancelIntent,
  SessionEndedRequest: sessionEndedRequest,
  Unhandled: unhandled,
});

const answerModeHandlers = Alexa.CreateStateHandler(states.ANSWERMODE, {
  AnswerIntent: answerIntent,
  'AMAZON.HelpIntent': helpIntent,
  'AMAZON.StopIntent': stopIntent,
  'AMAZON.CancelIntent': cancelIntent,
  SessionEndedRequest: sessionEndedRequest,
  Unhandled: answerUnhandled,
});

/* eslint-disable no-param-reassign */
export default async function (event, context, callback) {
  console.log('handler process env:', process.env);
  console.log('Running handler function', event, context);
  try {
    event.sessionData = await storage.fetchSession(event.session);
    /* eslint-enable */
  } catch (err) {
    console.error(err);
  }
  const alexa = Alexa.handler(event, context, callback);
  alexa.appId = process.env.OTSIMO_APP_ID;
  alexa.resources = languageString;
  alexa.registerHandlers(newSessionHandlers, startGameHandlers, answerModeHandlers);
  alexa.execute();
}
