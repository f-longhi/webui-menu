import {element} from './utils.js';

export class FontIcon {
  constructor(iconCode, fontFamily) {
    this.code = iconCode;
    this.fontFamily = fontFamily;
  }

  render() {
    let span = this.$element = element('span', {
      'class': 'menuitem-fonticon'
    });
    
    if (typeof this.code === 'string') {
      span.textContent = this.code;
    } else if (typeof this.code === 'number') {
      span.innerHTML = `&#${this.code};`;
    }
    
    if (this.fontFamily)
      span.style.fontFamily = this.fontFamily;
    
    return span;
  }
}
