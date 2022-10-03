function deselectAllExcept(selector) {
  var allSelected = document.getElementsByClassName('selected');
  for (var i = 0; i < allSelected.length; i++) {
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
    var targetElement, selector, corresponding;
    if (isHighlight) {
      selector = event.target.getAttribute('aria-details');
      targetElement = event.target;
    } else {
      if (event.target.getAttribute('role') === 'comment') {
        selector = event.target.id;
        targetElement = event.target;
      } else {
        // Depending on where they click, they may have targeted a child element
        var annotation = event.target.closest('[role="comment"]');
        targetElement = annotation;
        selector = annotation.id;
      }
    }

    if (isHighlight) {
      corresponding = document.getElementById(selector);
    } else {
      corresponding = document.querySelector(`[aria-details="${selector}"]`);
    }

    // Highlight click target and corresponding element, and scroll to corresponding element
    // If target is already highlighted, dehilight (and don't scroll)
    const isSelected = targetElement.classList.toggle('selected');
    corresponding.classList.toggle('selected');
    if (isSelected) {
      var prefersReducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      var prefersReducedMotion = !prefersReducedMotionQuery || prefersReducedMotionQuery.matches;
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
  var selectedComments = document.querySelectorAll('.selected');
  for (var i = 0; i < selectedComments.length; i++) {
    selectedComments[i].classList.remove('selected');
  }
}

function onInitialLoad() {
  document.documentElement.className = document.documentElement.className.replace(
    /\bno-js\b/,
    'js',
  );

  var highlights = document.getElementsByTagName('mark');
  for (var i = 0; i < highlights.length; i++) {
    highlights[i].addEventListener('click', makeClickHandler(true));
  }
  var comments = document.getElementsByClassName('annotation');
  for (var j = 0; j < comments.length; j++) {
    comments[j].addEventListener('click', makeClickHandler(false));
  }

  document.addEventListener('click', deselectAll);
}

(function () {
  if (document.readyState != 'loading') {
    onInitialLoad();
  } else {
    document.addEventListener('DOMContentLoaded', onInitialLoad);
  }
})();
