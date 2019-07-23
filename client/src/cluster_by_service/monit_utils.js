import * as R from 'ramda';

export const postAll = (serviceUrlList, params) => {
  if (serviceUrlList) {

    serviceUrlList.forEach(url => {
      post(url, params)
    });
  } else {
    alert("I found nothing");
  }
};


export const post = (serviceUrl, params) => {

  const transformToInput = (params) => {
    return R.keys(params).map(k => {
      return `<input name="${k}" value="${params[k]}">`
    }).join()
  };

  const hiddenIframes = document.getElementById('hidden_iframes');

  const sendTheAction = () => {
    const iFrame = document.createElement('iframe');
    iFrame.setAttribute('class', 'very-small');
    hiddenIframes.appendChild(iFrame);

    iFrame.contentWindow.document.body.innerHTML =
      `<form action="${serviceUrl}" method="POST" id="my_form">${transformToInput(params)}</form>`;
    iFrame.contentWindow.document.getElementById('my_form').submit();
    setTimeout(() => {
      iFrame.remove();
    }, 5000)
  };

  sendTheAction();
};

export const retrievePermission = (serverUrls) => {

  const hiddenIframes = document.getElementById('hidden_iframes');
  serverUrls.forEach(url => {

    const iframeToGetThePermission = document.createElement('iframe');
    iframeToGetThePermission.setAttribute('class', 'very-small');
    iframeToGetThePermission.setAttribute('src', url);
    hiddenIframes.appendChild(iframeToGetThePermission);
    setTimeout(() => {
      iframeToGetThePermission.remove();
    }, 15000);
  });
};
