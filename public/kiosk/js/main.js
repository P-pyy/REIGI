// Wait for the HTML document to be fully loaded
document.addEventListener("DOMContentLoaded", () => {

    // 1. Select all the elements you need
    const faqOption = document.querySelector(".faq-option-container");
    const overlay = document.querySelector(".container-overlay");
    const backBtn = document.getElementById("back-btn");
    
    const backdrop = document.getElementById("overlay-backdrop");

    
    // 2. Add click event to SHOW the overlay
    faqOption.addEventListener("click", () => {
        // Show the overlay
        overlay.classList.add("is-visible");
        
        // // Hide the search container
        // searchContainer.classList.add("is-hidden");
        backdrop.classList.add("is-visible");
    });

    
    // 3. Add click event for the BACK button to HIDE the overlay
    backBtn.addEventListener("click", (event) => {
        // This is crucial! It stops the <a> tag from
        // trying to navigate to a new page or jumping to the top.
        event.preventDefault(); 
        
        // Hide the overlay
        overlay.classList.remove("is-visible");

        backdrop.classList.remove("is-visible");
        
        // // Show the search container again
        // searchContainer.classList.remove("is-hidden");
    });

});