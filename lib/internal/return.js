module.exports = function(result) {
  var _return = {};
  for(let key in result) {
      _return[key] = async function (...args) {
          if(args.length == 0) return result[key]();
          return result[key](null, args);
      }
  }
  delete _return.then;
  return _return;
}