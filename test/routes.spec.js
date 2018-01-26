const knex = require('../db/knex');
const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../server');

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
    })
  });

  it('should return a 404 for a route that does not exist', () => {
    return chai.request(server)
    .get('/sadpath')
    .then(() => {
      // response.should.have.status(404);
    })
    .catch(error => {
      error.should.have.status(404);
    })
  });
});

describe('API Routes', () => {
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
      })
    })
  });

  describe('POST /api/v1/projects', () => {
    it('should create a new project', () => {
      return chai.request(server)
      .post('/api/v1/projects')
      .send({ 
        title: 'Dark',
      })
      .then(response => {
        response.should.have.status(201);
        response.should.be.json;
        response.body.should.be.a('object');
        response.body.should.have.property('id');
      })
      .catch(error => {
        throw error;
      })
    });

    it.skip('should not create a project with missing data', () => {
      return chai.request(server)
      .post('/api/v1/projects')
      .send({
        wrong: 'wrong'
      })
      .then(response => {
        response.should.have.status(422);
        response.body.error.should.equal('You are missing title');
      })
      .catch(error => {
        throw error;
      })
    })
  });
});
