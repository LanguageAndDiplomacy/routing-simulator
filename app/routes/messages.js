import Ember from 'ember';
import ajax from '../utils/ajax';
import Poller from '../utils/poller';

function get(url) {
  return ajax({ type: 'GET', url: url, dataType: 'json' });
}

export default Ember.Route.extend({
  actions: {
    reload: function() {
      this.refresh();
    }
  },
  myUserName: function() {
    return this.controllerFor('login').get('name');
  },
  beforeModel: function() {
    var login = this.controllerFor('login');
    if (!login.get('isLoggedIn')) {
      this.transitionTo('login');
    }
  },
  model: function() {
    var _this = this;
    var name = this.myUserName();
    var msgs = get('/users/' + name + '/messages');
    var sent = get('/users/' + name + '/sent-messages');
    var conns = get('/connections?related-to=' + name);

    var p = Ember.RSVP.hash({msgs: msgs, conns: conns, sent: sent});
    return p.then(function(hash) {
      _this.set('connections', hash.conns);
      hash.sent.sort(function(msg1, msg2) { return msg2.id - msg1.id; });
      _this.set('sentMessages', hash.sent);
      return hash.msgs;
    });
  },
  setupController: function(controller, model) {
    this._super(controller, model);
    controller.set('connections', this.get('connections'));
    var sent = Ember.ArrayController.create({model: this.get('sentMessages')});
    controller.set('sentMessages', sent);
    this.setupPoller(controller);
  },
  setupPoller: function(controller) {
    if (Ember.isNone(this.get('poller'))) {
      var _this = this;
      var p = Poller.create({
        interval: 3000,
        isPolling: false,
        onPoll: function() {
          var poller = this;
          if (this.get('isPolling')) {
            return;
          }
          this.set('isPolling', true);
          var latest = controller.get('latestMessageId');
          var query = latest ? '?since=' + latest : '';
          ajax({
            type: 'GET',
            url: '/users/' + _this.myUserName() + '/messages' + query,
            dataType: 'json'
          }).then(function(results) {
            controller.get('model').pushObjects(results);
          }).finally(function() {
            poller.set('isPolling', false);
          });
        }
      });
      this.set('poller', p);
    }
    this.get('poller').start();
  },
  deactivate: function() {
    this.get('poller').stop();
  }
});
