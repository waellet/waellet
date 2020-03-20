const url = new URL(window.location.href);

window.RUNNING_IN_POPUP = url.searchParams.get('id') && window.location.pathname.includes('popup.html');
window.POPUP_TYPE = url.searchParams.get('type') ? url.searchParams.get('type') : null;
