import Ember from 'ember';
import ajax from '../utils/ajax';

export default Ember.ArrayController.extend({
  message: null,
  pendingFrom: null,
  pendingTo: null,
  actions: {
    reset: function() {
      var _this = this;
      ajax({
        type: 'POST',
        url: '/admin/reset'
      }).then(function() {
        return 'Reset successful!';
      }, function(err) {
        console.log(err);
        return 'Reset failed!';
      }).then(function(msg) {
        _this.set('message', msg);
      });
    },
    removeConnection: function(conn) {
      var _this = this;
      var removeFromUI = function() { _this.removeObject(conn); };
      ajax({
        type: 'DELETE',
        url: ['/connections', conn.from, conn.to].join('/'),
      }).then(removeFromUI, removeFromUI);
    },
    addConnection: function() {
      var _this = this;
      var from = this.get('pendingFrom');
      var to = this.get('pendingTo');
      if (!to || !from) {
        return;
      }
      var conn = {from: from, to: to};
      ajax({
        type: 'POST',
        url: '/connections',
        data: JSON.stringify(conn),
        contentType: 'application/json',
        dataType: 'json'
      }).then(function(conn) {
        _this.pushObject(conn);
      }, function(err) {
        console.log(err);
        _this.set('message', 'Unable to add connection!');
      });
    }
  }
});
