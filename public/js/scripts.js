$('.lock-icon').on('click', updateLock);
$('.colors-btn').on('click', generatePalette);

$(document).on('keyup', (e) => {
  if (e.keyCode === 32 && e.target === document.body) {
    generatePalette();
  }
});

const paletteColors = [
  {
    div: color1,
    hex: name1,
    lock: lock1
  },
  {
    div: color2,
    hex: name2,
    lock: lock2
  },
  {
    div: color3,
    hex: name3,
    lock: lock3
  },
  {
    div: color4,
    hex: name4,
    lock: lock4
  },
  {
    div: color5,
    hex: name5,
    lock: lock5
  }
];

function updateLock () {
  $(this).toggleClass('locked');
};

function generatePalette () {
  paletteColors.forEach(color => {
    if (!$(color.lock).hasClass('locked')) {
      const newColor = generateColor();
      $(color.div).css("background", newColor);
      $(color.hex).text(newColor);
    }
  });
};

function generateColor () {
  return '#'+(Math.random()*0xFFFFFF<<0).toString(16).toUpperCase();
};
//chars [0-9, a-f];
//num = index (random number floored 0 - 16);
//1st, 3rd and 5th char <23 = dark
//string is 5 chars plus # at start
//dark = bool








