import { combineReducers } from 'redux';
import {
  TEXT_CHANGE,
  SYNC_AUTHENTICATED,
  DISCONNECTED,
  TEXT_SYNCED,
  TEXT_SAVED,
  TEXT_SYNCING,
  TEXT_EDITING,
  KINTO_LOADED,
  SEND_TO_NOTES,
  OPENING_LOGIN,
  RECONNECT_SYNC,
  CREATE_NOTE,
  PLEASE_LOGIN
} from './utils/constants';

import { getFirstLineFromContent, stripHtmlWithoutFirstLine } from './utils/utils';

function sync(sync = {}, action) {
  switch (action.type) {
    case SYNC_AUTHENTICATED:
      return Object.assign({}, sync, {
        isOpeningLogin: false,
        isPleaseLogin: false,
        isReconnectSync: false,
        email: action.email
      });
    case DISCONNECTED:
      return Object.assign({}, sync, {
        email: null,
        isOpeningLogin: false,
        isPleaseLogin: false,
        isReconnectSync: false,
      });
    case OPENING_LOGIN:
      return Object.assign({}, sync, {
        isOpeningLogin: true,
        isPleaseLogin: false,
        isReconnectSync: false,
      });
    case PLEASE_LOGIN:
      return Object.assign({}, sync, {
        isOpeningLogin: false,
        isPleaseLogin: true,
        isReconnectSync: false,
      });
    case RECONNECT_SYNC:
      return Object.assign({}, sync, {
        isOpeningLogin: false,
        isPleaseLogin: false,
        isReconnectSync: true,
      });
    default:
      return sync;
  }
}

function kinto(kinto = {}, action) {
  switch (action.type) {
    case KINTO_LOADED:
      return Object.assign({}, kinto, {
        isLoaded: true
      });
    default:
      return kinto;
  }
}

function notes(notes = [], action) {
  switch (action.type) {
    case KINTO_LOADED: {
      const list = Array.from(action.notes);
      list.map((note) => {
        note.firstLine = getFirstLineFromContent(note.content);
        note.secondLine = stripHtmlWithoutFirstLine(note.content);
        if (!note.lastModified) {
          note.lastModified = new Date();
        }
      });
      return list;
    }
    case CREATE_NOTE: {
      const list = Array.from(notes);
      if (action.id) {
        list.forEach((note) => {
          if (!note.id) {
            note.id = action.id;
          }
        });
        return list;
      }
      list.push({
        id: null,
        content: '',
        lastModified: new Date()
      });
      return list;
    }
    case TEXT_CHANGE: {
      const list = Array.from(notes);
      let note = list.find((note) => {
        return note.id === action.id;
      });
      if (note) {
        note.content = action.content;
        note.firstLine = getFirstLineFromContent(action.content);
        note.secondLine = stripHtmlWithoutFirstLine(action.content);
        note.lastModified = action.lastModified;
      }
      return list;
    }
    default:
      return notes;
  }
}

const noteApp = combineReducers({
  sync,
  kinto,
  notes
});

export default noteApp;