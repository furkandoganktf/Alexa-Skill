import * as jwt from 'jsonwebtoken';

export async function authenticate(event, emit) {
  const token = event.session.user.accessToken;
  if (token === undefined) {
    emit(':tellWithLinkAccountCard', 'Please use the companion app to authenticate on Amazon to start using this skill');
  }
  const decoded = jwt.decode(token, { complete: true });
  if (decoded.payload.groups[0] === undefined) {
    emit(':tell', 'To start using this skill you need to have premium account.');
  }
}

