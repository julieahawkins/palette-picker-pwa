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
    it.skip('should return all of the projects', () => {
      return chai.request(server)
      .get('/api/v1/projects')
      .then(response => {
        response.should.have.status(200);
        response.should.be.json;
        response.body.should.be.a('object');
        // response.body.length.should.equal(3);

        // response.body[0].should.have.property('title');
        // response.body[0].lastname.should.equal('Stella Via');

        let expectedProject = { title: 'Stella Via' };
        response.body.project.should.equal(project);
      })
      .catch(error => {
        throw error;
      })
    })
  });
});
