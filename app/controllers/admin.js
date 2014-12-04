import Ember from 'ember';
import ajax from '../utils/ajax';

export default Ember.Controller.extend({
  message: null,
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
    }
  }
});
