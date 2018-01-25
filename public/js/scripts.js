const paletteColors = [
  {
    div: color1,
    hexName: name1,
    lock: lock1
  },
  {
    div: color2,
    hexName: name2,
    lock: lock2
  },
  {
    div: color3,
    hexName: name3,
    lock: lock3
  },
  {
    div: color4,
    hexName: name4,
    lock: lock4
  },
  {
    div: color5,
    hexName: name5,
    lock: lock5
  }
];

function updateLock () {
  $(this).toggleClass('locked');
};

const updateHexName = (isDark, hexName) => {
  const result = isDark ? hexName.addClass('dark') : hexName.removeClass('dark');
  return result;
};

const generatePalette = () => {
  paletteColors.forEach(color => {
    if (!$(color.lock).hasClass('locked')) {
      const { hex, isDark } = generateColor();

      $(color.div).css("background", hex);
      $(color.hexName).text(hex);
      updateHexName(isDark, $(color.hexName));
    }
  });
};

const generateColor = () => {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const nums = letters.map(letter => randomIndex());
  const chars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, ...letters];
  const hex = `#${chars[nums[0]]}${chars[nums[1]]}${chars[nums[2]]}${chars[nums[3]]}${chars[nums[4]]}${chars[nums[5]]}`;
  const isDark = (nums[0] + nums[2] + nums[4]) < 19;

  return { hex, isDark };
};

const randomIndex = () => {
  return Math.floor(Math.random() * 16);
};

const openSavePalette = () => {
  $('.save-container').removeClass('none');
};

const viewProjects = () => {
  $('.projects-container').removeClass('none');
};

const closeProjects = () => {
  $('.projects-container').addClass('none');
};

const savePalette = () => {
  $('.save-container').addClass('none');
  console.log('palette name:', $('.palette-input').val());
  const palette = {
    color1: $(name1).text(),
    color2: $(name2).text(),
    color3: $(name3).text(),
    color4: $(name4).text(),
    color5: $(name5).text(), 
  };
  console.log(palette);
  $('.palette-input').val('');
  //save palette to project selected
};

const fetchPalettes = async (project) => {
  const fetchedPalette = await fetch(`/api/v1/projects/${project.id}/palettes`);
  const palette = await fetchedPalette.json();

  displayProjectPalettes(project.title, palette.palettes);
};

const fetchProjects = async () => {
  const fetchedProjects = await fetch('/api/v1/projects');
  const projects = await fetchedProjects.json();

  projects.projects.forEach(project => {
    displayProjectSelect(project.title)
    fetchPalettes(project);
  });
};

const displayProjectSelect = (projectTitle) => {
  console.log(`in select: ${projectTitle}`)
  $('#projectSelect').append($('<option>', {
      value: projectTitle,
      text: projectTitle
  }));
};

const displayProjectPalettes = (projectTitle, palettes) => {
  console.log(projectTitle);
  console.log(palettes);
  palettes.forEach((colorPalette) => {
    $('.projects').append(
      `<div class="project">
        <h3>${projectTitle}</h3>
        <span>${colorPalette.title}</span>
        <div class="palette">
          <div class="palette-color" style="background-color:${colorPalette.color1}"></div>
          <div class="palette-color" style="background-color:${colorPalette.color2}"></div>
          <div class="palette-color" style="background-color:${colorPalette.color3}"></div>
          <div class="palette-color" style="background-color:${colorPalette.color4}"></div>
          <div class="palette-color" style="background-color:${colorPalette.color5}"></div>
        </div>  
      </div>`
    );
  });
};

$(document).ready(fetchProjects());

$('.lock-icon').on('click', updateLock);
$('.colors-btn').on('click', generatePalette);
$(document).on('keyup', (e) => {
  if (e.keyCode === 32 && e.target === document.body) {
    generatePalette();
  }
});
$('.save-btn').on('click', openSavePalette);
$('.save-palette-btn').on('click', savePalette);
$('.view-palettes-btn').on('click', viewProjects);
$('.close-btn').on('click', closeProjects);








