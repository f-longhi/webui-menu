export default class EventEmitter {
  constructor() {
    this._events = new Map();
  }
  
  on(eType, eCallback) {
    const eArray = this._events.get(eType) || [];
    eArray.push(eCallback);
    this._events.set(eType, eArray);
  }
  
  off(eType, eCallback) {
    if (!eCallback && this._events.has(eType)) {
      this._events.delete(eType);
      return;
    }
    
    const eArray = this._events.get(eType) || [];
    eArray = eArray.filter(fn => fn !== eCallback);
    if (eArray.length)
      this._events.set(eType, eArray);
    else
      this._events.delete(eType);
  }
  
  emit(eType, ...eArgs) {
    const eArray = this._events.get(eType) || [];
    for (let fn of eArray)
      fn(...eArgs);
  }
}