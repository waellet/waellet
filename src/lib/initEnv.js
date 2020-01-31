const url = new URL(window.location.href)
Object.assign(process.env, {
    ...process.env.RUNNING_IN_POPUP === undefined && {
      RUNNING_IN_POPUP: url.searchParams.get('id') && window.location.pathname.includes("popup.html"),
    },
});