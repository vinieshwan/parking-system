<h3 align="center">Parking System</h3>

### Installation

_\* `Please note that this system is developed under node v16.13.1`_

1. Clone the repo
   ```sh
   git clone https://github.com/vinieshwan/parking-system
   ```
2. Install NPM packages in the server directory
   ```sh
   cd server
   npm install
   ```
3. Install NPM packages in the client directory
   ```sh
   cd client
   npm install
   ```

### Usage Guide

- Build necessary data:
  ```sh
  docker-compose up --build
  ```
- To run the docker container in the background:
  ```sh
  docker-compose up -d
  ```
- To run both server and client:<br />
  Under the main directory run the following:<br />
  ```sh
  npm start
  ```
- To run the tests:
  ```sh
  npm test
  ```
- To run test coverage:
  ```sh
  npm run test-coverage
  ```
