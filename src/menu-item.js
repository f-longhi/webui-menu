import {element} from './utils.js';
import {FontIcon} from './icons.js';
import {Menu} from './menu.js';

export default class MenuItem {
  constructor(options = {}) {

    if (options === 'separator')
      options = {type: 'separator'};

    let {
      type,
      text,
      defaultItem,
      disabled,
      checked,
      group,
      shortcut,
      onclick,
      onshow,
      menu,
      icon
    } = options;

    // basic properties
    this.type = type || 'command';
    this.text = text || '';
    this.defaultItem = !!defaultItem;
    this.disabled = !!disabled;
    this.group = group;
    this.icon = icon;
    this.shortcut = shortcut;

    // event handlers
    this.onclick = onclick || null;
    this.onshow = onshow || null;

    // checkboxes
    this.checked = checked;

    let submenu = null;

    Object.defineProperty(this, 'menu', {
      get() {
        return submenu;
      },
      set(value) {
        if (value !== null && !(value instanceof Menu)) {
          throw new TypeError('MenuItem.menu should be an instance of Menu or null');
        }

        submenu = value;

        if (submenu !== null) {
          submenu.parentItem = this;
          submenu.on('command', () => {
            this.$element.dispatchEvent(new CustomEvent('command', {bubbles:true}));
          });
        }
      }
    });

    this.menu = menu || null;
    this.parentMenu = null;
    
    let active = false;
    
    Object.defineProperties(this, {
      active: {
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
    })

  }
  
  _expand() {
    if (!this.menu)
      return;
    this.menu.show();
    this.menu.alignToElement(this.$element, 'end-outside', 'start');
    this.$element.classList.add('active');
  }
  
  _undoExpand() {
    if (!this.menu)
      return;
    this.menu.hide();
    
    if (this.$element) {
      this.$element.classList.remove('active');
    }
  }
  
  _setTextLength(n) {
    const t = this.$element && this.$element.querySelector('.menuitem-text');
    if (t) t.style.width = `${n}px`;
  }
  
  _getTextLength() {
    const t = this.$element && this.$element.querySelector('.menuitem-text');
    return t ? parseFloat(getComputedStyle(t).width) : 0;
  }

  render() {
    
    let menuitem, icon;

    if (typeof this.onshow === 'function')
      this.onshow(this);

    if (this.type === 'separator')
      return this.$element = element('hr', {'class': 'menu-separator'});

    menuitem = this.$element = element('button', {'class': 'menuitem'});
    
    
    // Icon
    if (this.icon instanceof FontIcon) {
      icon = this.icon;
      this._containsIcon = true;
    } else {
      icon = new FontIcon();
    }
    
    menuitem.append(icon.render());
    
    // Text
    menuitem.append(element('span', {class: 'menuitem-text'}, this.text));
    
    // Shortcut
    if (typeof this.shortcut === 'string') {
      menuitem.appendChild(element('span', {class: 'menuitem-shortcut'}, this.shortcut || ''));
    }

    // Checkbox
    if (this.type === 'checkbox') {
      menuitem.classList.add('checkbox');
      menuitem.addEventListener('click', () => {
        this.checked = !this.checked;
      });
      this._containsIcon = true;
    }
    // Radio
    else if (this.type === 'radio') {
      menuitem.classList.add('radio');
      menuitem.addEventListener('click', () => {
        if (this.parentMenu && this.parentMenu.items) {
          this.parentMenu.items.forEach(item => {
            if (item.type === 'radio' && item.group === this.group) {
              item.checked = false;
            }
          });
          this.checked = true;
        }
      });
      this._containsIcon = true;
    }

    if (this.checked)
      menuitem.classList.add('checked');

    if (this.defaultItem)
      menuitem.classList.add('default-item');

    menuitem.disabled = !!this.disabled;

    menuitem.addEventListener('click', e => {
      if (!this.disabled && typeof this.onclick == 'function') {
        this.onclick(this, e);
      }
      
      if (
        ['command', 'radio', 'checkbox'].includes(this.type) &&
        !this.disabled &&
        this.menu === null
      ) {
        menuitem.dispatchEvent(new CustomEvent('command', {
          bubbles: true
        }));
      }
      
      

      //if (this.menu === null) {
      //  this.parentMenu.hide(true);
      //}
      

      e.preventDefault();
      e.stopImmediatePropagation();
    });

    function preventdef(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }

    menuitem.addEventListener('mousedown', preventdef);
    menuitem.addEventListener('moudeup', preventdef);
    menuitem.addEventListener('contextmenu', preventdef);

    if (this.menu !== null) {
      menuitem.classList.add('has-menuitems');
    }

    return menuitem;
  }
}