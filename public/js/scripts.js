
function updateLock () {
  $(this).toggleClass('locked');
  console.log('lock clicked');
};

$('.lock-icon').on('click', updateLock);





