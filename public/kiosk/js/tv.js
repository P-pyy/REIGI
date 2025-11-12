document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("tickets")
        const totalBoxes = 10;
        const startOpacity = 0.5;
        const step = (1 - startOpacity) / (totalBoxes - 1);

        for (let i = 1; i <= totalBoxes; i++) {
            const box = document.createElement("div");
            box.className = "container-ticket-number"
            box.textContent = i;
            box.style.opacity = startOpacity + (i - 1) * step;
            container.appendChild(box);
        }
});


