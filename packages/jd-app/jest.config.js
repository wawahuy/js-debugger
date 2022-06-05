const {compilerOptions} = require('./tsconfig');
const {pathsToModuleNameMapper} = require("ts-jest");

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: ".spec.ts$",
  rootDir: './',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/src/' })
};