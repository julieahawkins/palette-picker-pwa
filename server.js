const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

const environment = process.env.NODE_ENV || 'development';
const config = require('./knexfile')[environment];
const database = require('knex')(config);

function checkParams(body, prop) {
  for (let requiredParameter of [ prop ]) {
    if (!body[requiredParameter]) {
      return { propsFound: false, requiredParameter }
    }
  }
  return { propsFound: true }
};

const requireHTTPS = (request, response, next) => {
  if (request.headers['x-forwarded-proto'] !== 'https') {
    return response.redirect('https://' + request.get('host') + request.url);
  }
  next();
};

if (process.env.NODE_ENV === 'production') {
  app.use(requireHTTPS)
}

app.set('port', process.env.PORT || 3000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

app.locals.title = 'palette-picker';

app.get('/api/v1/projects', (request, response) => {
  database('projects').select()
    .then(projects => {
      return response.status(200).json({ projects });
    })
    .catch(error => {
      return response.status(500).json({ error });
    });
});

app.get('/api/v1/projects/:id/palettes', (request, response) => {
  const { id } = request.params;

  database('palettes').where('project_id', id).select()
    .then(palettes => {
      return response.status(200).json({ palettes });
    })
    .catch(error => {
      return response.status(500).json({ error });
    });
});

app.post('/api/v1/projects', (request, response) => {
  const project = request.body;
  
  const result = checkParams(project, 'title');

  if (!result.propsFound) {
    return response.status(422).json({ 
      error: `You are missing ${result.requiredParameter}` 
    });
  }

  database('projects').insert(project, 'id')
    .then(project => {
      return response.status(201).json({ id: project[0] });
    })
    .catch(error => {
      return response.status(500).json({ error });
    });
});

app.post('/api/v1/projects/:id/palettes', (request, response) => {
  const { id } = request.params;
  const palette = Object.assign({}, request.body, { project_id: id });
  
  const result = checkParams(palette, 'title');
  
  if (!result.propsFound) {
    return response.status(422).json({ 
      error: `You are missing ${result.requiredParameter}` 
    });
  }

  database('palettes').insert(palette, 'id')
    .then(palette => {
      return response.status(201).json({ id: palette[0] });
    })
    .catch(error => {
      return response.status(500).json({ error });
    });
});

app.delete('/api/v1/projects/:projectID/palettes/:id', (request, response) => {
  const { projectID, id } = request.params;
  
  database('palettes').where('project_id', projectID).where('id', id).del()
    .then(result => {
      return response.status(204).json({ result });
    })
    .catch(error => {
      return response.status(500).json({ error });
    });
});

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`);
});

module.exports = app;
