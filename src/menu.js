// v. 0.102.0 - 2021-03-28
// Written by Felipe Longhi

import EventEmitter from './events.js';
import {element, alignElementToReference} from './utils.js';
import MenuItem from './menu-item.js';

export {default as MenuItem} from './menu-item.js';
export * from './icons.js';


let DEBUG_MODE = false;

export function _SET_DEBUG_MODE(enabled) {
  DEBUG_MODE = !!enabled;
}

export class Menu extends EventEmitter {

  constructor({ onshow } = {}) {
    super();
    this.items = [];
    this.$element = null;
    this.parentItem = null;
    this.onshow = onshow || null;
    this._active = false;
  }

  append(text, onclick, options = {}) {
    if (typeof onclick === 'object' && onclick !== null)
      options = onclick;
    else
      options.onclick = onclick;

    options.text = text;

    const item = new MenuItem(options);
    
    item.parentMenu = this;
    
    this.items.push(item);
    
    return item;
  }

  appendSeparator() {
    const item = new MenuItem({type: 'separator'});
    
    this.items.push(item);
    
    return item;
  }

  fromObject(items) {
    for (var item of items) {
      if (!(item instanceof MenuItem))
        item = new MenuItem(item);
      item.parentMenu = this;
      this.items.push(item);
    }
    return this;
  }

  render() {
    
    if (typeof this.onshow === 'function') {
      this.onshow();
    }

    let ul = this.$element = element('div', {class: 'menu'});
    ul.style.position = 'fixed';
    
    let clearItemsTimeout = null;
    
    ul.addEventListener('mouseover', e => {
      
      clearItemsTimeout = setTimeout(() => {
        for (let item of this.items)
          item.active = false;
      }, 250);
      
      this._focus();
      e.stopPropagation();
    });
    
    ul.addEventListener('mouseout', e => {
      clearTimeout(clearItemsTimeout);
    });
    
    ['mousedown', 'mouseup', 'contextmenu'].forEach(eventName => {
      ul.addEventListener(eventName, e => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    this.items.forEach(item => {
      
      const li = ul.appendChild(item.render());
      
      if (item._containsIcon)
        ul.classList.add('menu-contains-icons');
      
      let timeout = null;

      li.addEventListener('mouseover', (e) => {
        e.stopPropagation();
        
        if (item.active)
          return;
        
        
        clearTimeout(timeout);
        
        timeout = setTimeout(() => {
          for (let item of this.items)
            item.active = false;
            
          if (item.menu && !item.disabled) { // only activate item if it has a submenu
            item.active = true;
            this._blur();
          }
        }, 250);
      });

      li.addEventListener('mouseout', () => {
        clearTimeout(timeout);
      });
      
      item.menu && item.menu.on('dismiss', () => {
        this._focus();
      });
      
    });
    
    ul.addEventListener('click', (e) => {
      e.stopPropagation();
    })
    
    ul.addEventListener('command', () => {
      this.hide();
      this.emit('command');
    });

    return ul;
  }
  
  _focus() {
    this._active = true;
  }
  
  _blur() {
    this._active = false;
  }

  addListeners() {
    //window.addEventListener('mousedown', this);
    //window.addEventListener('keydown', this);
    //if (!DEBUG_MODE) {
    //  window.addEventListener('blur', this);
    //  window.addEventListener('resize', this);
    //}
  }

  removeListeners() {
    //window.removeEventListener('mousedown', this);
    //window.removeEventListener('keydown', this);
    //if (!DEBUG_MODE) {
    //  window.removeEventListener('blur', this);
    //  window.removeEventListener('resize', this);
    //}
  }

  
  show() {
    if (this.$element)
      this.hide();
    document.body.appendChild(this.render());
    this.addListeners();
    this._focus();
    const maxTextLen = this.items.reduce((acc, item) => {
      return Math.max(acc, item._getTextLength());
    }, 0);
    
    this.items.forEach(item => { item._setTextLength(maxTextLen); });
  }
  
  hide(closeAll) {
    this._blur();

    this.items.forEach(item => {
      item.active = false;
    });

    if (this.$element) {
      this.$element.remove();
      this.$element = null;
    }

    this.removeListeners();
    
    this.emit('dismiss');
  }

  
  position(x, y) {
    Object.assign(this.$element.style, {
      top: y + 'px',
      left: x + 'px'
    });
  }

  alignToElement(elem, hAlign, vAlign) {
    const viewBox = {
      x: 0,
      y: 0,
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight
    };

    const menu    = this.$element;
    const menuBox = menu.getBoundingClientRect();
    const refBox  = elem.getBoundingClientRect();
    
    let {
      x,
      y,
      horizontalAlignmentMode,
      verticalAlignmentMode
    }  = alignElementToReference(viewBox, menuBox, refBox, hAlign, vAlign);

    if (verticalAlignmentMode === 'start')
      y = y - parseInt(getComputedStyle(menu).paddingTop) -
        parseInt(getComputedStyle(menu).borderTopWidth);
    else if (verticalAlignmentMode === 'end')
      y = y + parseInt(getComputedStyle(menu).paddingBottom)
        + parseInt(getComputedStyle(menu).borderBottomWidth);

    this.position(x, y);
  }
  
  alignToPoint(px, py) {
    const viewBox = {
      x: 0,
      y: 0,
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight
    };

    const refBox = {
      x: px,
      y: py,
      width: 0,
      height: 0
    };
    
    const menuBox = this.$element.getBoundingClientRect();
    const {x, y}  = alignElementToReference(viewBox, menuBox, refBox, 'end-outside', 'end-outside');
    
    this.position(x, y);
  }

  handleEvent(e) {

    if (e.type === 'mousedown') {
      if (!this.$element.contains(e.target)) {
        this.hide();
      }
    }
    else if (e.type === 'keydown') {

      if (e.key === 'Escape' || e.key === 'ArrowLeft') {
        this.hide();
        e.preventDefault();
        e.stopPropagation();
      }

    } else if (e.type === 'blur' || e.type === 'resize') {
      this.hide();
    }

  }
}


export class ContextMenu extends Menu {
  constructor() {
    super();
    this.context = null;
  }

  setContext(element) {
    this.context = element;
    this.context.addEventListener('contextmenu', e => {
      this.show();
      this.alignToPoint(e.clientX, e.clientY);
      
      const close = (e) => {
        this.hide();
        window.removeEventListener('mousedown', close);
      }
      window.addEventListener('mousedown', close);

      e.preventDefault();
    });
  }
}

export class DropdownMenu extends Menu {

  constructor(context) {
    super();
    this.alignment = 'start';
    this.context = context;

    let open = (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      
      this.show();
      this.alignToElement(this.context, this.alignment, 'end-outside');
      window.addEventListener('mousedown', close);
    };

    let close = () => {
      this.hide();
      window.removeEventListener('mousedown', close);
    };

    if (this.context)
      this.context.addEventListener('click', open);

    this.open = open;
    this.close = close;
  }

  setContext(ctx) {
    this.context = ctx;
    this.context.addEventListener('click', this.open);
  }
}

export class MenuBarItem {
  constructor({
    text = '',
    menu = null
  } = {}) {
    this.text = text;
    this.menu = menu;
    
    let active = false;
    
    Object.defineProperties(this, {
      'active': {
        get() {
          return active;
        },
        set(v) {
          active = !!v;
          
          if (active) {
            this._expand();
          } else {
            this._undoExpand();
          }
        }
      }
    });
  }
  
  _expand() {
    this.menu.show();
    this.menu.alignToElement(this.$element, 'start', 'end-outside');
    this.$element.classList.add('active');
  }
  
  _undoExpand() {
    this.menu.hide();
    this.$element.classList.remove('active');
  }
  
  render() {
    const $el = this.$element = element('button', {
      'class': 'menubar-item'
    }, this.text);
    
    return $el;
  }
}

export class MenuBar {
  constructor(parent) {
    this.parent = parent;
    this.items = [];
    this._activeIndex = -1;
    
    if (this.parent) {
      this.render();
    }
  }
  
  append(text, menu) {
    this.items.push(new MenuBarItem({text, menu}));
  }
  
  expandItem(index, toggle) {
    if (index === this._activeIndex) {
      if (toggle) {
        this.items[this._activeIndex].active = false;
        this._activeIndex = -1;
      }
      return;
    }

    this._activeIndex = index;
    this.items.forEach((item, itemIndex) => {
      item.active = index === itemIndex;
    });
  }
  
  render() {
    const $el = this.$element = element('div', {class: 'menubar'});
    
    this.items.forEach((item, index) => {
      $el.append(item.render());
      item.menu.on('command', () => {
        this.expandItem(this._activeIndex, true);
      });
    });
    
    this.parent.textContent ='';
    this.parent.append($el);
    
    const close = (e) => {
      if ($el.contains(e.target))
        return;
      if (this._activeIndex !== -1)
        this.expandItem(this._activeIndex, true);
      window.removeEventListener('mouseup', close)
    }
    
    $el.addEventListener('click', e => {
      
      Array.from($el.children).forEach((elem, i) => {
        if (e.target === elem) {
          this.expandItem(i, true);
          window.removeEventListener('mouseup', close);
        }
      });
      
      window.addEventListener('mouseup', close);
      
    });
    
    $el.addEventListener('mouseover', e => {
      if (this._activeIndex === -1)
        return;
      Array.from($el.children).forEach((elem, i) => {
        if (e.target === elem) {
          this.expandItem(i, false);
        }
      });
    });
    
    
    
    return $el;
  }
}