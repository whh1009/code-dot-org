#!/usr/bin/env node
/** @file Build script for JS assets in the code-studio package, which is loaded
    by dashboard (our "Code Studio" Rails app). */
'use strict';

var build_commands = require('./build-commands');
var program = require('commander');

/** @const {string} */
var SRC_PATH = './src/js/';

/** @const {string} */
var BUILD_PATH = './build/js/';

/**
 * Files to build, given as paths rooted at code-studio/src/js/
 * Each will result in an output file.
 * @type {string[]}
 */
var FILES = [
  'levelbuilder.js',
  'levelbuilder_dsl.js',
  'levelbuilder_studio.js',
  'leveltype_widget.js'
];

/**
 * Build script main entry point.
 */
function main() {
  // Use commander to parse command line arguments
  // https://github.com/tj/commander.js
  program
      .option('--min', 'Build minified output', false)
      .parse(process.argv);

  // Run build (exits on failure)
  build_commands.execute([
    build_commands.ensureDirectoryExists(BUILD_PATH),
    build_commands.browserifyCommand(SRC_PATH, BUILD_PATH, FILES, program.min)
  ]);

  console.log("code-studio js built\n");
}

// Execute build script
main();
