# Hue Server

This is a fully functional Philips Hue server and client built with 
NodeJS, Express, React and MongoDB. It allows anyone to create an account, login, and manage their light color, power, brightness, and effects from any network in the world using the cloud based service this repository provides.

## Getting Started

To get started contributing or simply testing the project you can clone this repository by running
`git clone https://github.com/cbartram/hue-server.git`

see the Prerequisites and Installation sections to learn how to install and dependencies and start up the servers!

### Prerequisites

All dependencies in this project are managed with Node package manager which helps to simplify the entire process.
Simply install any predefined dependencies by running

```
npm i
```

Note: Ensure you are in the project directory (which you cloned in the Getting Started section) before you run the `npm` command

### Installing

Now that you have cloned the project and installed the dependencies its time to fire up the engines and get
everything working!

There are several moving parts namely the client and the server. The server communicates with the lights on the network directly and in order to run it you must execute the following command: 
```
npm start
```

After the server is running it will be active on your network at http://localhost:3006 You can verify this by following the URL and you should see a Static HTML page notifying you that the server successfully processed your request! 

Next you've got to start up the client so you can have all the control over the lights. Try running the following command:

```
npm run client
```
Once the client is running you should be automatically taken to a web page at http://localhost:3006 And you should see a welcome screen prompting you to sign up or log in.

## Running the tests

Unit tests are an integral part of any project. To run unit tests for this repository run the command `npm run test`

## Deployment

This project can be deployed anywhere you like from AWS to Heroku, Azure, and more! I chose port forward ports :3000 and :3006 (which run the server and client respectively) and use No-IP's static DNS services to make both services accessible on both the internet and the local network. 

Its crucial for the server of this repository to remain running on the same network as the lights are connected to so that they can communicate. If you choose to deploy this project to another PaaS then it will be up to YOU to implement and ensure that the client can communicate with a server running on a home (or enterprise network) regardless of firewalls or blocked ports. 

## Built With

* [React](https://facebook.github.io/react/) - The frontend web framework used
* [NodeJS](https://nodejs.org/en/) - Server framework
* [Express](https://expressjs.com/) - Dependency Management
* [Mongo DB](https://www.mongodb.com/) - Used to generate RSS Feeds

## Contributing

Please read [CONTRIBUTING.md](https://github.com/cbartram/hue-server) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Christian Bartram** - *Lead Developer & Initial Work* - [@cbartram](https://github.com/cbartram)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Philips Hue for making some great lights to play with!
