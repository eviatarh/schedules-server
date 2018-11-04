let _ = require('lodash');

class FormatUtils {
  static formatter(json, formatMap = {}){
    if (!json || Array.isArray(json) || typeof json !== 'object'){
      return null;
    } else {
      let result = {};
      const keys = Object.keys(json);
      for (let key of keys){
        const changedKey=formatMap[key];
        if (changedKey) {
          FormatUtils.updateResultForKey(key, json[key], formatMap, result);
        } else {
          result[key] = json[key];
        }
      }

      const additionalKeys = Object.keys(formatMap).filter(formatKey => keys.indexOf(formatKey) === -1);
      for (let key of additionalKeys){
        FormatUtils.updateResultForKey(key, null, formatMap, result);
      }
      return result;
    }
  }

  static updateResultForKey(key, value, formatMap, result){
    const changedKey=formatMap[key];
    let newKey = changedKey;
    let converterFunc = _.identity;
    if (Array.isArray(changedKey) && changedKey.length ===2){
      newKey = changedKey[0];
      converterFunc = changedKey[1];
    }
    const newValue = converterFunc(value);
    _.set(result, newKey, newValue);
  }
}

module.exports = FormatUtils;
