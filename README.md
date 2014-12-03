# Routing-simulator

This README outlines the details of collaborating on this Ember application.

Simulator for a routing exercise.

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM) and [Bower](http://bower.io/)

## Installation

* `git clone <repository-url>` this repository
* change into the new directory
* `npm install`
* `bower install`

## Running / Development

* `ember server`
* Visit your app at [http://localhost:4200](http://localhost:4200).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `ember test`
* `ember test --server`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

### Deploying

Specify what it takes to deploy your app.

## Further Reading / Useful Links

* [ember.js](http://emberjs.com/)
* [ember-cli](http://www.ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)

## Server rest api

Run `node index.js`

### /users

```json
{
  "id": "andy"
}
```

- `GET /users`

- `GET /users/{id}`

- `POST /users`

### /connections

```json
{
  "from": "andy",
  "to": "bob
}
```

- `GET /connections?related-to={user_id}`

- `POST /connections`

### /messages

Message ids are guaranteed to increase.

```json
{
  "id": 1,
  "body": "hi bob",
  "to": "andy",
  "from": "bob"
}
```

- `POST /messages`

- `GET /users/{id}/messages`

- `GET /users/{id}/sent-messages`


## TODOS

### UI

- refresh messages
- sent messages
- topology view
- styling

### Functionality

- autogenerate topology
- reset sim
- topology editor?

