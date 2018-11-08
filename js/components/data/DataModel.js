import axios from 'axios';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import applyPartialUpdate from 'immutability-helper';

import {updateBroadcast, updateFeeds} from '../../actions';
import siteconfig from '../../siteconfig';

const FEEDS = ['contest', 'standings', 'teams'];

function initializeApp() {
  const options = Object.assign({}, siteconfig.firebase);
  const hostname = window.location.hostname;
  if (hostname === 'localhost') {
    options.authDomain = 'icpcsec.firebaseapp.com';
    options.databaseURL = 'ws://localhost:5001';
  } else if (hostname.endsWith('.firebaseapp.com')) {
    const appName = hostname.split(".")[0];
    options.authDomain = appName + '.firebaseapp.com';
    options.databaseURL = 'https://' + appName + '.firebaseio.com';
  } else {
    throw new Error('Unsupported host: ' + hostname);
  }
  return firebase.initializeApp(options);
}

class DataModel {
  constructor(dispatch) {
    this.dispatch_ = dispatch;
    this.app_ = initializeApp();
    this.db_ = firebase.database(this.app_);
    this.auth_ = firebase.auth(this.app_);

    for (const feed of FEEDS) {
      this.db_.ref(`feeds/${feed}`).on(
          'value', (snapshot) => this.onFeedUpdate_(feed, snapshot.val()));
    }
    this.db_.ref('broadcast').on('value', (snapshot) => {
      const broadcast = snapshot.val();
      if (broadcast) {
        const update = {};
        for (const key in broadcast) {
          if (broadcast.hasOwnProperty(key)) {
            update[key] = {$set: broadcast[key]};
          }
        }
        this.dispatch_(updateBroadcast(update));
      }
    });

    this.auth_.onAuthStateChanged((user) => {
      const signedIn = !!user;
      this.dispatch_(updateBroadcast({ signedIn: { $set: signedIn } }));
    });
  }

  async signIn() {
    const provider = new firebase.auth.GoogleAuthProvider();
    await this.auth_.signInWithPopup(provider);
  }

  async signOut() {
    await this.auth_.signOut();
  }

  updateBroadcast(update) {
    const ref = this.db_.ref('broadcast');
    ref.once('value', (snapshot) => {
      const broadcast = applyPartialUpdate(snapshot.val() || {}, update);
      ref.set(broadcast);
    });
  }

  async onFeedUpdate_(feed, url) {
    if (!url) {
      return;
    }
    const response = await axios.get(url);
    const data = response.data;
    this.dispatch_(updateFeeds({[feed]: {$set: data}}));
  }
}

export default DataModel;