
export const keydownRouter = {
  target: null,
  handleEvent(e) {
    
    if (this.target === null)
      return;
    
    if (e.type === 'keydown') {
      this.target.dispatchEvent(new CustomEvent('ContextKeydown', {
        bubbles: false,
        detail: {
          originalEvent: e
        }
      }));
      e.stopPropagation();
    }
    
  }
}


window.addEventListener('keydown', keydownRouter, true);