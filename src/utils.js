export function element(nodeName, attributes, ...children) {
  const node = document.createElement(nodeName);

  if (attributes) {
    for (let attr of Object.keys(attributes)) {
      node.setAttribute(attr, attributes[attr]);
    }
  }
  
  node.append(...children);

  return node;
}


function getAlignmentOffset(alignmentMode, refLength, targetLength) {

  switch (alignmentMode) {
    case 'start':
      return 0;
    case 'center':
      return  -(targetLength - refLength) / 2;
    case 'end':
      return -targetLength + refLength;
    case 'start-outside':
      return -targetLength;
    case 'end-outside':
      return refLength;
    default:
      throw new Error(`Invalid alignment mode: "${alignmentMode}"`);
  }

}

function getAxialAlignment(mode, targetLength, refOrigin, refLength, containOrigin, containLength) {
  
  let usedMode = mode;
  
  const reverseAlignment = new Map([
    ['start-outside', 'end-outside'],
    ['start', 'end'],
    ['end', 'start'],
    ['end-outside', 'start-outside']
  ]);

  let targetOrigin = refOrigin + getAlignmentOffset(mode, refLength, targetLength);

  if (
    reverseAlignment.has(mode) &&
    !fitsInViewport(containOrigin, containLength, targetOrigin, targetLength)
  ) {
    targetOrigin = refOrigin + getAlignmentOffset(reverseAlignment.get(mode), refLength, targetLength);
    usedMode = reverseAlignment.get(mode);
  }
  
  if (!fitsInViewport(containOrigin, containLength, targetOrigin, targetLength)) {
    targetOrigin = containOrigin + containLength - targetLength;
    usedMode = 'contain';
  }

  return [targetOrigin, usedMode];

}

// determines if a box fits inside a viewport in a single dimension
function fitsInViewport(viewportStart, viewportLength, boxStart, boxLength) {
  if (boxStart + boxLength > viewportStart + viewportLength)
    return false;
  else if (boxStart < viewportStart)
    return false;
  return true;
}

// boxes must have keys {x, y, width, height}
export function alignElementToReference(viewBox, elemBox, refBox, hAlign, vAlign) {
  
  const [ x, horizontalAlignmentMode ] =
    getAxialAlignment(hAlign, elemBox.width, refBox.x, refBox.width, viewBox.x, viewBox.width);
  const [ y, verticalAlignmentMode ] =
    getAxialAlignment(vAlign, elemBox.height, refBox.y, refBox.height, viewBox.y, viewBox.height);

  return {
    x,
    y,
    horizontalAlignmentMode,
    verticalAlignmentMode
  };

}