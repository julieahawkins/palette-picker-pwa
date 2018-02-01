const mainPalette = [
  { div: color1, hexName: name1, lock: lock1 },
  { div: color2, hexName: name2, lock: lock2 },
  { div: color3, hexName: name3, lock: lock3 },
  { div: color4, hexName: name4, lock: lock4 },
  { div: color5, hexName: name5, lock: lock5 }
];

let allPalettes = [];

const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
const chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ...letters];

const generatePalette = () => {
  mainPalette.forEach(color => {
    if (!$(color.lock).hasClass('locked')) {
      const { hex, isDark } = generateColor();

      $(color.div).css("background", hex);
      $(color.hexName).text(hex);

      setDarkClass(isDark, $(color.hexName));
      setDarkClass(isDark, $(color.lock));
    }
  });
  chooseTitleHighlight();
};

const chooseTitleHighlight = () => {
  const randomNum = randomNumber(mainPalette.length);
  const color = $(mainPalette[randomNum].hexName).text();

  $('.title-highlight').css("color", color);
};

const chooseSubTitleHighlight = () => {
  const randomNum = randomNumber(allPalettes.length);
  const color = allPalettes[randomNum][`color${randomNumber(5)}`];

  $('.subtitle-highlight').css("color", color);
};

const generateColor = () => {
  const nums = letters.map(letter => randomNumber(16));
  const hex = `#${chars[nums[0]]}${chars[nums[1]]}${chars[nums[2]]}${chars[nums[3]]}${chars[nums[4]]}${chars[nums[5]]}`;
  const isDark = determineDarkness(nums);

  return { hex, isDark };
};

const randomNumber = (max) => {
  return Math.floor(Math.random() * max);
};

const determineDarkness = (nums) => {
  const sum = nums.reduce((sum, num, index) => {
    if ( index % 2 === 0 ) {
      sum += num;
    }
    return sum;
  }, 0);

  return sum < 19;
};

function updateLock () {
  $(this).toggleClass('locked');
};

const setDarkClass = (isDark, colorElement) => {
  const result = isDark ? colorElement.addClass('dark') : colorElement.removeClass('dark');

  return result;
};

const setNoneClass = (bool, element) => {
  const result = bool ? element.addClass('none') : element.removeClass('none');

  return result;
};

const clearInput = (input) => {
  input.val('');
};

const openSavePrompt = () => {
  setNoneClass(false, $('.save-container'));
  setNoneClass(false, $('.save-prompt-container'));

  setNoneClass(true, $('.create-project-container'));
  setNoneClass(true, $('.save-palette-container'));

  setNoneClass(true, $('.project-error'));
  setNoneClass(true, $('.palette-error'));
};

const openSaveProject = () => {
  setNoneClass(true, $('.save-prompt-container'));

  setNoneClass(false, $('.create-project-container'));
};

const openSavePalette = () => {
  setNoneClass(true, $('.save-prompt-container'));
  setNoneClass(true, $('.create-project-container'));

  setNoneClass(false, $('.save-palette-container'));
};

const viewProjects = () => {
  setNoneClass(false, $('.projects-container'));
  chooseSubTitleHighlight();
};

function closeForms() {
  setNoneClass(true, $(this.closest('.save-container')));
};

const closeProjects = () => {
  setNoneClass(true, $('.projects-container'));
};

const fetchProjects = async () => {
  const fetchResult = await fetch('/api/v1/projects');
  const fetchedProjects = await fetchResult.json();

  populateProjects(fetchedProjects.projects);
};

const fetchPalettes = async (project) => {
  const fetchResult = await fetch(`/api/v1/projects/${project.id}/palettes`);
  const fetchedPalettes = await fetchResult.json();

  allPalettes.push(...fetchedPalettes.palettes);

  return [...fetchedPalettes.palettes]; 
};

const populateProjects = (projects) => {
  projects.forEach( async (project) => {
    appendProjectOption(project.title, project.id);
    appendProjects(project.title);
    const palettes = await fetchPalettes(project);

    appendPalettes(project.title, palettes);
    updateCount();
  });
};

const appendProjectOption = (projectTitle, projectID) => {
  $('#projectSelect').append($('<option>', {
      value: projectID,
      text: projectTitle
  }));
};

const appendProjects = (projectTitle) => {
  const projectTitleClass = projectTitle.replace(/\s/g, '');

  $('.projects').append(
    `<div class="project">
      <header>
        <h3>${projectTitle}</h3>
      </header>
      <div class="palettes ${projectTitleClass}">
        <h5>This project has no saved Palettes...</h5>
      </div>
    </div>`
  );
};

const appendPalettes = (projectTitle, palettes) => {
  const projectTitleClass = projectTitle.replace(/\s/g, '');

  if (palettes.length) {
    setNoneClass(true, $(`.${projectTitleClass} h5`));

    palettes.forEach(colorPalette =>{
      $(`.${projectTitleClass}`).append(
        `<div class="single-palette">
          <header>
            <p class="palette-title">${colorPalette.title}</p>
            <button class="delete-btn"></button>
          </header>
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
  }
};

const updateCount = () => {
  let num = parseInt($(projectCount).text());
  num += 1;

  $(projectCount).text(num);
};

const displayWarning = (elem, msg) => {
  elem.append(msg);
};

const saveProject = async () => {
  const title = $('.project-input').val();
  const alreadyExists = $(`#projectSelect option:contains(${title})`).val();

  if (!title) {
    setNoneClass(false, $('.project-error'));
    displayWarning($('.project-error'), 'You must include a project name...');
  } else if (!alreadyExists) {
    createProject(title);
  } else {
    setNoneClass(false, $('.project-error'));
    displayWarning($('.project-error'), `A project called ${title} already exists!`);
  }
  clearInput($('.project-input'));
};

const createProject = async (title) => {
  const post = await fetch('/api/v1/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title })
  });
  const projectID = await post.json();

  appendProjectOption(title, projectID.id);
  appendProjects(title);
  updateCount();
  $(`#projectSelect option[value=${projectID.id}]`).prop('selected', true);
  openSavePalette();
};

const savePalette = async () => {
  const title = $('.palette-input').val();
  const colors = { 
    color1: $(name1).text(), 
    color2: $(name2).text(), 
    color3: $(name3).text(), 
    color4: $(name4).text(), 
    color5: $(name5).text() 
  };
  const palette = { title, ...colors };
  const projectID = $('#projectSelect').val();
  const projectName = $('#projectSelect option:selected').text();

  if (projectID === 'choose') {
    setNoneClass(false, $('.palette-error'));
    displayWarning($('.palette-error'), 'You must choose a project...');
  } else if (!title) {
    setNoneClass(false, $('.palette-error'));
    displayWarning($('.palette-error'), 'You must name the palette...');
  } else {
    setNoneClass(true, $('.save-container'));
    createPalette(projectID, projectName, palette);
    clearInput($('.palette-input'));
    $('#projectSelect option[value="choose"]').prop('selected', true);
  }
};

const createPalette = async (projectID, projectName, palette) => {
  const postedPalette = await fetch(`/api/v1/projects/${projectID}/palettes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(palette)
  });
  const paletteID = await postedPalette.json();

  appendPalettes(projectName, [palette]);
  allPalettes.push({ ...palette, id: paletteID.id, project_id: projectID });
};

function selectPalette () {
  const paletteName = $(this).parent().children().children('.palette-title').text();
  const selectedPalette = allPalettes.find( palette => palette.title === paletteName );

  const { color1, color2, color3, color4, color5 } = selectedPalette;
  const colors = Object.values({ color1, color2, color3, color4, color5 });

  mainPalette.forEach((color, index) => {
    const hex = colors[index];

    $(color.div).css("background", hex);
    $(color.hexName).text(hex);

    let hexChars = [...hex];

    hexChars.shift();
    const nums = hexChars.map( char => chars.indexOf(char) );
    let isDark = determineDarkness(nums);

    setDarkClass(isDark, $(color.hexName));
    setDarkClass(isDark, $(color.lock));
  });

  closeProjects();
}; 

async function deletePalette () {
  const paletteName = $(this).parent().children('p').text();
  const palette = (allPalettes.find(palette => palette.title === paletteName));
  const { id, project_id } = palette;

  allPalettes = allPalettes.filter(palette => palette.id !== id);

  const paletteToDelete = await fetch(`/api/v1/projects/${project_id}/palettes/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  (this).closest('.single-palette').remove();

  checkForPalettes(project_id);
};

const checkForPalettes = (project_id) => {
  const foundPalette = allPalettes.find(palette => palette.project_id === project_id);
  if (!foundPalette) {
    console.log('should append')
    const projectTitle = $(`#projectSelect option[value=${project_id}]`).text();
    const projectTitleClass = projectTitle.replace(/\s/g, '');

    $(`.${projectTitleClass}`).append('<h5>This project has no saved Palettes...</h5>');
  }
};

$(document).ready(fetchProjects());
$(document).on('keyup', (e) => {
  if (e.keyCode === 32 && e.target === document.body) {
    generatePalette();
  }
});
$('.colors-btn').on('click', generatePalette);
$('.lock-icon').on('click', updateLock);

$('.save-btn').on('click', openSavePrompt);
$('.open-save-projects-btn').on('click', openSaveProject);
$('.open-save-palettes-btn').on('click', openSavePalette);

$('.save-project-btn').on('click', saveProject);
$('.save-palette-btn').on('click', savePalette);

$('.view-palettes-btn').on('click', viewProjects);
$('.close-btn').on('click', closeProjects);
$('.close-form-btn').on('click', closeForms);

$('.projects').on('click', '.palette', selectPalette);
$('.projects').on('click', '.delete-btn', deletePalette);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('../service-worker.js')
      .then(registration => navigator.serviceWorker.ready)
      .then(registration => {
        Notification.requestPermission();
        console.log('serviceWorker registration successful');
      })
      .catch(error => {
        console.log(`serviceWorker failed at ${error}`);
      })
  })
}
