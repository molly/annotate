function deselectAllExcept(selector) {
  const allSelected = document.querySelectorAll('.selected');
  for (let i = 0; i < allSelected.length; i++) {
    if (
      allSelected[i].id !== selector &&
      allSelected[i].getAttribute('aria-details') !== selector
    ) {
      allSelected[i].classList.remove('selected');
    }
  }
}

function makeClickHandler(isHighlight) {
  return function onClick(event) {
    let targetElement, selector, corresponding;
    if (isHighlight) {
      selector = event.target.getAttribute('aria-details');
      targetElement = event.target;
    } else {
      if (event.target.getAttribute('role') === 'comment') {
        selector = event.target.id;
        targetElement = event.target;
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

function deselectAll() {
  const selectedComments = document.querySelectorAll('.selected');
  for (let i = 0; i < selectedComments.length; i++) {
    selectedComments[i].classList.remove('selected');
  }
}

function onInitialLoad() {
  document.documentElement.className = document.documentElement.className.replace(
    `no-js`,
    `js`,
  );

  const highlights = document.querySelectorAll('mark');
  highlights.map(highlight => (highlight.addEventListener('click', makeClickHandler(true))));

  const comments = document.querySelectorAll('.annotation');
  comments.map(comment => comment.addEventListener('click', makeClickHandler(false)))
  document.addEventListener('click', deselectAll);
}

(function () {
  if (document.readyState != 'loading') {
    onInitialLoad();
  } else {
    document.addEventListener('DOMContentLoaded', onInitialLoad);
  }
})();
