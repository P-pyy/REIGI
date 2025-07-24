
// Script Dynamic Loader

function loadScript(url) {
    const script = document.createElement("script");
    script.src = url;
    script.async = false;
    document.head.appendChild(script);
}

loadScript("https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js");
loadScript("https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.min.js");