import Ember from 'ember';
import ajax from '../utils/ajax';
import Poller from '../utils/poller';

export default Ember.Route.extend({
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
    var msgs = ajax({
      type: 'GET',
      url: '/users/' + name + '/messages',
      dataType: 'json'
    });
    var conns = ajax({
      type: 'GET',
      url: '/connections?related-to=' + name,
      dataType: 'json'
    });
    var p = Ember.RSVP.hash({msgs: msgs, conns: conns});
    return p.then(function(hash) {
      _this.set('connections', hash.conns);
      return hash.msgs;
    });
  },
  setupController: function(controller, model) {
    this._super(controller, model);
    controller.set('connections', this.get('connections'));
    this.setupPoller(controller);
  },
  setupPoller: function(controller) {
    if (Ember.isNone(this.get('poller'))) {
      var _this = this;
      var p = Poller.create({
        interval: 2000,
        onPoll: function() {
          var latest = controller.get('latestMessageId');
          if (!latest) {
            return;
          }
          ajax({
            type: 'GET',
            url: '/users/' + _this.myUserName() + '/messages?since=' + latest,
            dataType: 'json'
          }).then(function(results) {
            controller.get('model').pushObjects(results);
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
