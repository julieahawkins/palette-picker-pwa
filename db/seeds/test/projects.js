exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('palettes').del()
    .then(() => knex('projects').del())

    .then(function () {
      // Inserts seed entries
      return Promise.all([
        knex('projects').insert({
          title: 'Stella Via',
        }, 'id')

          .then(projectId => {
            return knex('palettes').insert([
              { title: 'Main', color1: '#FF00FF', color2: '#0000FF', color3: '#FFFFFF',  color4: '#1200AF', color5: '#AF01FF', project_id: projectId[0]},
              { title: 'Optional', color1: '#EF0005', color2: '#FB00BF', color3: '#4F04FF',  color4: '#CF00CF', color5: '#AF000F', project_id: projectId[0]}
            ]);
          })
          .then(() => console.log('seeding finished!'))
          .catch(error => console.log(`error seeding data: ${error}`))
      ]);
    });
};
