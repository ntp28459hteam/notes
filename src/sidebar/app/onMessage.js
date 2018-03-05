import { SYNC_AUTHENTICATED,
         KINTO_LOADED,
         TEXT_CHANGE,
         TEXT_SYNCING,
         TEXT_EDITING,
         TEXT_SYNCED,
         TEXT_SAVED,
         RECONNECT,
         DISCONNECTED,
         SEND_TO_NOTES,
         // Actions
         authenticate,
         disconnect,
         saved,
         synced,
         syncing,
         saving,
         reconnect,
         textChange,
         sendToNote } from './actions';
import { INITIAL_CONTENT } from './data/initialContent';
import store from './store';

/**
 * For each event, action on redux to update UI. No longer any event from chrome in components
 * Share state between instances ... update-redux?
 * No idea if this is a good idea or not.
 */
chrome.runtime.onMessage.addListener(eventData => {
    switch (eventData.action) {
      //
      // FOOTER EVENTS
      //
      case SYNC_AUTHENTICATED:
        if (eventData.profile && eventData.profile.email) {
            store.dispatch(authenticate(eventData.profile.email));
        }
        break;
      case KINTO_LOADED:
        if (!eventData.data) {
          browser.storage.local.get('notes2').then(data => {
            if (!data.hasOwnProperty('notes2')) {
              store.dispatch(textChange(INITIAL_CONTENT));
            } else {
              store.dispatch(textChange(data.notes2));
              chrome.runtime
                .sendMessage({
                  action: 'kinto-save',
                  content: data.notes2
                })
                .then(() => {
                  // Clean-up
                  browser.storage.local.remove('notes2');
                });
            }
          });
        } else {
          store.dispatch(textChange(eventData.data));
        }
        break;
      case TEXT_CHANGE:
        browser.runtime.sendMessage({
          action: 'kinto-load'
        });
        break;
      case TEXT_SYNCING:
        store.dispatch(syncing());
        // this.setState({
        //   state: this.STATES.SYNCING
        // });
        break;
      case TEXT_EDITING:
        store.dispatch(saving());
        // this.setState({
        //   state: this.state.isAuthenticated ? this.STATES.SYNCING : this.STATES.SAVING
        // });
        break;
      case TEXT_SYNCED:
        if (store.getState().sync.email) {
          store.dispatch(synced(eventData.last_modified));
        }
        // Enable sync-action
        // this.setState({
        //   lastModified: eventData.last_modified,
        //   content: eventData.content || INITIAL_CONTENT
        // });
        // this.getLastSyncedTime();
        break;
      case TEXT_SAVED:
        store.dispatch(saved());
        // if (!this.state.state.ignoreChange && !this.state.isAuthenticated) {
        //   // persist reconnect warning, do not override with the 'saved at'
        //   this.setState({
        //     state: this.STATES.SAVED
        //   });
        // }
        break;
      case RECONNECT:
        // clearTimeout(this.loginTimeout);
        // this.setState({
        //   state: this.STATES.RECONNECTSYNC
        // });
        store.dispatch(reconnect());

        break;
      case DISCONNECTED:
        store.dispatch(disconnect());
        break;

      //
      // EDITOR EVENTS
      //
      // case 'kinto-loaded':
        // content = eventData.data;
        // this.handleLocalContent(this.editor, content);
        // this.setState({
        //   isKintoLoaded: true
        // });
        // break;
      // case 'text-change':
        // this.setState({
        //   ignoreNextLoadEvent: true
        // });
        // browser.runtime.sendMessage({
        //   action: 'kinto-load'
        // });
        // break;
      // case 'text-synced':
        // if (!this.state.ignoreTextSynced || eventData.conflict) {
        //   this.handleLocalContent(this.editor, eventData.content);
        // }
        // this.setState({
        //   ignoreTextSynced: false
        // });
        // break;
      case SEND_TO_NOTES:
        store.dispatch(sendToNote(eventData.text));
        break;
    }
});