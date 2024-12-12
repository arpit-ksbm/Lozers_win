const swaggerAuto = require('swagger-autogen');

const swaggerAutogen = swaggerAuto();

const doc = {
  info: {
    title: 'Lozers Win',
    description: 'API documentation for Lozers Win'
  },
  host: 'localhost:4012',
  // host: '194.238.17.230:4012',
  schemes: ['http'], // Change to ['https'] if using HTTPS
};

const outputFile = './swagger-output.json';
const routes = ['./app.js']; // Add other files here if needed

swaggerAutogen(outputFile, routes, doc);
