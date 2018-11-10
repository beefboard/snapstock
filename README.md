# Snapstock

Beefboard image storage api

## Development

### Dependencies
Development of snapstock is to be completed in typescript. The project
required `node 8.x.x`, Node 10 will not pass tests.

`npm install` to install dependencies

### Linting

Airbnb tslinting style is applied to snapstock, and is enforced via
githooks. Builds will not succeed unless linting rules are conformed to.

### Testing

Tests are written in jest, and require 100% coverage
in order for build to succeed.

`npm test` to run tests

### Running

Running in developer mode is as simple as `npm start`.

This starts `ts-node`, which compiles typescript to javascript on
the fly for node.

### Building

Building can be completed with `npm run build`

### Deploying

Deployment is automatic with `gitlab-ci`. Pushing to `master` or `development`
will automatically run tests, build the project and push to the docker repo
