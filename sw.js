self.addEventListener("install", (e) => {
    console.log("Service Worker instalado");
});

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
}