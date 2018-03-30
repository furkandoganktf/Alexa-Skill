import _ from 'lodash';
import * as AWS from 'aws-sdk';

export const MemoryBackendName = 'memory';
export const DynomoDBBackendName = 'dynamodb';

class MemoryStorageBackend {
  constructor() {
    this.data = new Map();
  }

  create(key, data) {
    this.data.set(key, data);
    return Promise.resolve(true);
  }

  update(key, data) {
    const pdata = this.data.get(key);
    if (typeof pdata === 'undefined') {
      return Promise.reject('key not found');
    }
    const save = _.merge(pdata, data);
    this.data.set(key, save);
    return Promise.resolve(true);
  }

  delete(key) {
    const r = this.data.delete(key);
    if (r) {
      return Promise.resolve(r);
    }
    return Promise.reject(new Error('key not found'));
  }

  get(key) {
    const d = this.data.get(key);
    if (d) {
      return Promise.resolve(d);
    }
    return Promise.reject('key not found');
  }
}

/**
 * DynamoDB storage backend
 * TODO(furkan): look for http://docs.aws.amazon.com/amazondynamodb/latest/gettingstartedguide/GettingStarted.NodeJs.03.html
 * @class DynamoDBStorageBackend
 */
class DynamoDBStorageBackend {
  constructor() {
    this.table = process.env.OTSIMO_DYNAMO_TABLE;
    this.client = new AWS.DynamoDB.DocumentClient();
  }

  create(key, data) {
    const params = {
      TableName: this.table,
      Item: { id: key, save: data },
    };

    console.log('Adding a new item...');
    return new Promise((resolve, reject) => {
      this.client.put(params, (err, out) => {
        if (err) {
          console.error('Unable to add item. Error JSON:', JSON.stringify(err, null, 2));
          reject(err);
        } else {
          console.log('Added item:', JSON.stringify(out, null, 2));
          resolve(true);
        }
      });
    });
  }

  update(key, data) {
    const params = {
      TableName: this.table,
      Key: { id: key },
      UpdateExpression: '',
      ExpressionAttributeValues: {
      },
      ReturnValues: 'ALL_NEW',
    };
    let ue = 'set ';
    Object.keys(data.data).forEach((k) => {
      params.ExpressionAttributeValues[':' + k] = data.data[k];
      ue += k + ' = :' + k + ',';
    });
    params.UpdateExpression = ue.substring(0, ue.length - 1);
    console.log('Updating the item...');
    return new Promise((resolve, reject) => {
      this.client.update(params, (err, out) => {
        if (err) {
          console.error('Unable to update item. Error JSON:', JSON.stringify(err, null, 2));
          reject(err);
        } else {
          console.log('UpdateItem succeeded:', JSON.stringify(out, null, 2));
          resolve(true);
        }
      });
    });
  }

  delete(key) {
    const params = {
      TableName: this.table,
      Key: { id: key },
      ConditionExpression: 'id <> :num',
      ExpressionAttributeValues: {
        ':num': 0,
      },
    };

    return new Promise((resolve, reject) => {
      this.client.delete(params, (err, out) => {
        if (err) {
          console.error('Unable to delete item. Error JSON:', JSON.stringify(err, null, 2));
          reject(err);
        } else {
          console.log('DeleteItem succeeded:', JSON.stringify(out, null, 2));
          resolve(true);
        }
      });
    });
  }

  get(key) {
    const params = {
      TableName: this.table,
      Key: { id: key },
    };

    return new Promise((resolve, reject) => {
      this.client.get(params, (err, out) => {
        if (err) {
          console.error('Unable to read item. Error JSON:', JSON.stringify(err, null, 2));
          reject(err);
        } else {
          console.log('GetItem succeeded:', JSON.stringify(out, null, 2));
          resolve(out.data);
        }
      });
    });
  }
}

/**
 * @param {AlexaSession} session
 * @returns {Object}
 */
function newEmptySessionData(session) {
  return {
    sessionID: session.sessionId,
    awsUser: session.user.userId,
    // TODO add otsimo user id and other otsimo releated properties by accessToken
    data: {},
  };
}

export class Storage {
  /**
   * Creates an instance of Storage.
   * @param {string} backend The session backend, valid values are 'memory' and 'dynamodb'
   */
  constructor(backend = 'memory') {
    this.backend = new MemoryStorageBackend();
    this.init(backend);
  }
  /**
   * Gets the session data, if session not found than creates a new one
   *
   * @param {AlexaSession} session
   */
  async fetchSession(session) {
    try {
      const sdata = await this.backend.get(session.sessionId);
      return sdata.data;
    } catch (err) {
      const sessionObj = newEmptySessionData(session);
      try {
        await this.backend.create(session.sessionId, sessionObj);
        return Promise.resolve(sessionObj);
      } catch (err2) {
        return Promise.reject(err2);
      }
    }
  }

  /**
   * Save the session data
   * @param {AlexaSession} session
   * @param {Object} data
   */
  saveSessionData(session, data) {
    return this.backend.update(session.sessionId, { data });
  }

  /**
   * Delete the session from storage backend
   * @param {AlexaSession} session the session id
   */
  deleteSession(session) {
    return this.backend.delete(session.sessionId);
  }

  /**
   * Initialize the storage interface
   * @param {string} backend
   */
  init(backend) {
    if (this._initialized) {
      console.error('Storage is already initialized');
      return;
    }
    if (backend === MemoryBackendName) {
      this.backend = new MemoryStorageBackend();
    } else if (backend === DynomoDBBackendName) {
      this.backend = new DynamoDBStorageBackend();
    } else {
      console.error('invalid storage backend:', backend);
      process.exit(2);
    }
    this._initialized = true;
  }
}

