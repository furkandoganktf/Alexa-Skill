
interface AlexaApplication {
  applicationId: string;
}

interface AlexaUser {
  userId: string;
}

interface AlexaSession {
  sessionId: string;
  application: AlexaApplication;
  user: AlexaUser;
  new: boolean;
}

interface AlexaEvent {
  session: AlexaSession;
}

/*
{
  "session": {
    "sessionId": "SessionId.a5cfd286-0880-4e9c-af7e-82d5bb11a78f",
    "application": {
      "applicationId": "amzn1.ask.skill.9d67179c-0ab4-43fe-b14f-117283752b56"
    },
    "attributes": {},
    "user": {
      "userId": "amzn1.ask.account.AFOQEH4MSBNS274YUWNS6BAC7LEHUALJ7ANWAYNSH6WEAJWG742NYRXYKSJGTEJOYH6G5CF2E3J4NYUCAWXI4G3BDUQL37X2LRUQBLEGD3QSNH4OJ326JAAHBLF23WJK4N2HBXQQ2SBP6HB75AK2AAPEROLT7MLVDERCFNDO3Q664JAM4UQ4W6VPATNRUMEEFY3PBHECHBEIDUA"
    },
    "new": true
  },
  "request": {
    "type": "IntentRequest",
    "requestId": "EdwRequestId.4380f830-62fe-46d7-ab39-edd5ddfafc43",
    "locale": "en-US",
    "timestamp": "2017-03-09T21:48:52Z",
    "intent": {
      "name": "AnswerIntent",
      "slots": {
        "Answer": {
          "name": "Answer"
        }
      }
    }
  },
  "version": "1.0"
}
*/