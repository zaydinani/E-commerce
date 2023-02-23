

//!-----------------------hamburer menu --------------------
const menu_btn = document.querySelector('.hamburger')
const mobile_menu = document.querySelector('.mobile-nav')
menu_btn.addEventListener('click', function(){
  menu_btn.classList.toggle('is-active')
  mobile_menu.classList.toggle('is-active')
})


//carousel


var swiper = new Swiper(".mySwiper", {
    slidesPerView: 4,
    spaceBetween: 30,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });