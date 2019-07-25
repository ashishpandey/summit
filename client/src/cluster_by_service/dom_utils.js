export const openPage = (url) => {
  window.open(url, '_blank');
};

const elementsWithClassNameDo = (className, fn) => {
  const relatedElement = document.getElementsByClassName(className);
  for (let i = 0; i < relatedElement.length; i++) {
    const element = relatedElement[i];
    fn(element);
  }
};

export const elementsWithClassName = (className) => {

  return {
    addClass: (classNameToAdd) => {
      elementsWithClassNameDo(className, (e) => e.classList.add(classNameToAdd));
    },
    removeClass: (classNameToRemove) => {
      elementsWithClassNameDo(className, (e) => e.classList.remove(classNameToRemove));
    }
  }
};
