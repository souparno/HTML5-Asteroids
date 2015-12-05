module.exports = function (grunt) {
grunt.initConfig({
  connect: {
    server: {
      options: {
       port: 5000,
       keepalive: true,
       target: 'index.html'
      },
    },
  },
});

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.registerTask('default', ['connect:server']);
};
