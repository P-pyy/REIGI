
        const listItems = document.querySelectorAll('.list-item-content');

        listItems.forEach(item =>{
            item.addEventListener('click', (e) =>{
                e.stopPropagation();

                const currentLi = item.closest('li');
                const currentImg = currentLi.querySelector('.calendar-image');
                const arrow = currentLi.querySelector('.arrow');
                const isVisible = window.getComputedStyle(currentImg).display === 'block';

                document.querySelectorAll('.calendar-image').forEach(img => {
                    img.style.display = 'none';
                });
                document.querySelectorAll('.arrow').forEach(a => a.classList.remove('open'));

                if (!isVisible){
                    currentImg.style.display = 'block';
                    arrow.classList.add('open');
                };
            });
        });



        document.addEventListener('DOMContentLoaded', () => {
            const video = document.getElementById('faqVideo');
            const faqsSection = document.getElementById('faqs');

            window.addEventListener('scroll', () => {
                const faqsRect = faqsSection.getBoundingClientRect();
                const middleY = window.innerHeight / 2;

                if (faqsRect.top < middleY && faqsRect.bottom > middleY) {
                    // Middle of screen is inside FAQ section
                    video.classList.remove('fixed', 'hidden');
                    video.classList.add('enlarged');
                    video.play();
                } else if (faqsRect.top >= middleY) {
                    // Above FAQ
                    video.classList.remove('enlarged', 'hidden');
                    video.classList.add('fixed');
                    video.pause();
                } else {
                    // Below FAQ (in next section)
                    video.classList.remove('fixed', 'enlarged');
                    video.classList.add('hidden');
                    video.pause();
                }
            });

            video.classList.add('fixed');

            document.getElementById('faq-btn').addEventListener('click', () => {
                faqsSection.scrollIntoView({ behavior: 'smooth' });
            });
        });

    /* --- home.html initializer --- */
function initHome() {
  console.log("Home page initialized");
  // put your home-specific JS here later
}

