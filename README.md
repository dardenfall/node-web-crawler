### Dependencies
Since this crawler relies on many ES2015 features it requires node version [6.9.0](https://nodejs.org/en/blog/release/v6.9.0/) or greater

### Installation

`npm install`

### Running the Crawler

`npm start <url>`

The `<url>` parameter requires the full url including the protocol e.g. `npm start https://william.kamovit.ch`

Once over, it returns with a in the console, but since node shortens very long console logging writing to a json file would be a better idea.

### Running tests
Tests are built using [Jest](https://facebook.github.io/jest/)

`npm test`
