// Add .selected to only currently selected item.
const deselectAllExcept = (selector) => {
  const allSelected = document.querySelectorAll('.selected');
  allSelected.forEach( currentSelected => {
    if (
      currentSelected.id !== selector &&
      currentSelected.getAttribute('aria-details') !== selector
    ) {
      currentSelected.classList.remove('selected');
    }
  })
}

/**
 * Build out functionality to connect highlights and comments for navigation.
 * @param {boolean} isHighlight - true: highlight, false: comment
 * @returns Click handler on each highlight and comment
 */
const makeClickHandler = (isHighlight) => {
  return (event) => {
    let targetElement, selector, corresponding;
    if (isHighlight) {
      selector = event.target.getAttribute('aria-details');
      targetElement = event.target;
    } else {
      if (event.currentTarget.getAttribute('role') === 'comment') {
        selector = event.currentTarget.id;
        targetElement = event.currentTarget;
      } else {
        // Depending on where they click, they may have targeted a child element
        const annotation = event.target.closest('[role="comment"]');
        targetElement = annotation;
        selector = annotation.id;
      }
    }

    if (isHighlight) {
      corresponding = document.querySelector(`#${selector}`);
    } else {
      corresponding = document.querySelector(`[aria-details="${selector}"]`);
    }

    // Highlight click target and corresponding element, and scroll to corresponding element
    // If target is already highlighted, dehilight (and don't scroll)
    const isSelected = targetElement.classList.toggle('selected');
    corresponding.classList.toggle('selected');
    if (isSelected) {
      const prefersReducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const prefersReducedMotion = !prefersReducedMotionQuery || prefersReducedMotionQuery.matches;
      corresponding.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'nearest',
      });
    }

    // Ensure this is the only highlighted pair
    deselectAllExcept(selector);

    // Avoid bubbling through to the deselectAll function
    event.stopPropagation();
  };
}

// Remove .selected from all elements.
const deselectAll = () => {
  const selectedComments = document.querySelectorAll('.selected');
  selectedComments.forEach(selectedComment => selectedComment.classList.remove('selected')) 
}

/**
 * - Switch html element class to "js."
 * - Listen for clicks on all highlights.
 * - Listen for clicks on all comments.
 * - Create deselect event on any click.
 */
const onInitialLoad = () => {
  document.documentElement.className = document.documentElement.className.replace(
    `no-js`,
    `js`,
  );

  const highlights = document.querySelectorAll('mark');
  highlights.forEach(highlight => (highlight.addEventListener('click', makeClickHandler(true))));

  const comments = document.querySelectorAll('.annotation-group');
  comments.forEach(comment => comment.addEventListener('click', makeClickHandler(false)))
  
  document.addEventListener('click', deselectAll);
}

// Run it only when the doc is ready.
const bootup = () => {
  if (document.readyState != 'loading') {
    onInitialLoad();
  } else {
    document.addEventListener('DOMContentLoaded', onInitialLoad);
  }
}

bootup()
