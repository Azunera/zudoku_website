document.addEventListener("DOMContentLoaded", function() {
    const toggleButton = document.getElementById("toggleButton");
    const content = document.getElementById("content");

    toggleButton.addEventListener("click", function() {
        if (content.classList.contains("visible")) {
            content.classList.remove("visible");
            toggleButton.textContent = "^";
        } else {
            content.classList.add("visible");
            toggleButton.textContent = "v";
        }
    });
});
