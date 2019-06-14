export const prepare = async () => {
    delete localStorage.vuex;

    if (!navigator.serviceWorker) return;
    (await navigator.serviceWorker.getRegistrations())
        .map(registration => registration.unregister());
};