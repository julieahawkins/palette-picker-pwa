process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../server');

const config = require('../knexfile')['test'];
const knex = require('knex')(config);

chai.use(chaiHttp);

describe('Client Routes', () => {
  it('should return the homepage with text', () => {
    return chai.request(server)
      .get('/')
      .then(response => {
        response.should.have.status(200);
        response.should.be.html;
      })
      .catch(error => {
        throw error;
      });
  });

  it('should return a 404 for a route that does not exist', () => {
    return chai.request(server)
      .get('/sadpath')
      .then(() => {
        // response.should.have.status(404);
      })
      .catch(error => {
        error.should.have.status(404);
      });
  });
});

describe('API Routes', () => {
  beforeEach((done) => {
    knex.seed.run()
    .then(() => done())
  });

  describe('GET /api/v1/projects', () => {
    it('should return all of the projects', () => {
      return chai.request(server)
        .get('/api/v1/projects')
        .then(response => {
          response.should.have.status(200);
          response.should.be.json;
          response.body.should.be.a('object');
          response.body.projects.should.be.a('array');

          let expectedProject = { title: 'Stella Via' };
          let testProject = response.body.projects.find(project => project.title === expectedProject.title);
          
          testProject.should.have.property('title');
          testProject.should.have.property('id');
        })
        .catch(error => {
          throw error;
        });
    });
  });

  describe('GET /api/v1/projects/:id/palettes', () => {
    it('should return all of the palettes for a single project', () => {
      return chai.request(server)
        .get('/api/v1/projects')
        .then(response => {
          return response.body.projects[0].id;
        })
        .then(id => {
          return chai.request(server)
            .get(`/api/v1/projects/${id}/palettes`)
            .then(response => {
              response.should.have.status(200);
              response.should.be.json;
              response.body.should.be.a('object');
              response.body.palettes.should.be.a('array');
              response.body.palettes.length.should.equal(2);

              response.body.palettes.every(palette => {
                palette.should.have.property('title');
                palette.should.have.property('id');
                palette.should.have.property('project_id');
                palette.should.have.property('color1');
                palette.should.have.property('color2');
                palette.should.have.property('color3');
                palette.should.have.property('color4');
                palette.should.have.property('color5');
              })
            })
            .catch(error => {
              throw error;
            });
        });
    });
  });

  describe('POST /api/v1/projects', () => {
    it('should create a new project', () => {
      return chai.request(server)
        .post('/api/v1/projects')
        .send({ 
          title: 'Dark'
        })
        .then(response => {
          response.should.have.status(201);
          response.should.be.json;
          response.body.should.be.a('object');
          response.body.should.have.property('id');
        })
        .catch(error => {
          throw error;
        });
    });

    it('should not create a project with missing data', () => {
      return chai.request(server)
        .post('/api/v1/projects')
        .send({
          other: null
        })
        .then(response => {
          // console.log(response)
          // response.should.have.status(422);
          // response.body.error.should.equal('You are missing title');
        })
        .catch(error => {
          error.should.have.status(422);
        });
    });
  });

  describe('POST /api/v1/projects/:id/palettes', () => {
    it('should create a new palette under a project_id', () => {
      return chai.request(server)
        .get('/api/v1/projects')
        .then(response => {
          return response.body.projects[0].id;
        })
        .then(id => {
          return chai.request(server)
            .post(`/api/v1/projects/${id}/palettes`)
            .send({ 
              title: 'Dusk',
              color1: '#003300',
              color2: '#00DDBB',
              color3: '#99AABB',
              color4: '#9999FF',
              color5: '#000000'
            })
            .then(response => {
              response.should.have.status(201);
              response.should.be.json;
              response.body.should.be.a('object');
              response.body.should.have.property('id');
            })
            .catch(error => {
              throw error;
            });
        });
    });

    it('should not create a palette with missing data', () => {
      return chai.request(server)
        .get('/api/v1/projects')
        .then(response => {
          return response.body.projects[0].id;
        })
        .then(id => {
          return chai.request(server)
            .post(`/api/v1/projects/${id}/palettes`)
            .send({ 
              color1: '#003300',
              color2: '#00DDBB',
              color3: '#99AABB',
              color4: '#9999FF',
              color5: '#000000'
            })
            .then(response => {
              // response.should.have.status(422);
            })
            .catch(error => {
              error.should.have.status(422);
            });
        });
    });
  });

  describe('DELETE /api/v1/projects/:projectID/palettes/:id', () => {
    it('should delete a palette from a project', () => {
      return chai.request(server)
        .get('/api/v1/projects')
        .then(response => {
          return response.body.projects[0].id;
        })
        .then(id => {
          return chai.request(server)
            .get(`/api/v1/projects/${id}/palettes`)
            .then(response => {
              return { projectID: id, paletteID: response.body.palettes[0].id }
            })
            .then(result => {
              return chai.request(server)
                .delete(`/api/v1/projects/${result.projectID}/palettes/${result.paletteID}`)
                .then(response => {
                  response.should.have.status(204)
                })
            })
        })
        .catch(error => {
            error.should.have.status(204);
        });
    });
  });
});
