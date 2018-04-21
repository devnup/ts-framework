ts-framework
============

A minimalistic framework for typescript based applications, with async/await and decorators support.


## Getting Started

### Release Candidate Disclaimer

The current API is considered to be a "Release Candidate". That means that small, potentially breaking 
changes may still occur. Be sure to use a specific GIT_REV_HASH and a lock file in your project, so you
won't be immediately affected by such a change.

For example:

```bash
# Install using Yarn
yarn add git+https://github.com/devnup/ts-framework.git#GIT_REV_HASH 

# Install using NPM
npm install --save git+https://github.com/devnup/ts-framework.git#GIT_REV_HASH 
``` 

### TL;DR - A single file server

Configure a new Server instance and start listening on desired port. 

```typescript
import Server, { Logger, BaseRequest, BaseResponse } from 'ts-framework';

// Define a sample hello world route
const SampleRoutes {
  '/': async (req: BaseRequest, res: BaseResponse) => {
    res.success({ message: 'Hello world!' });
  }
}

// Define the server configuration
const server = new Server({
  port: process.env.PORT as any || 3000,
  routes: {
    get: SampleRoutes,
  },
});


// Startup the simple server
server.listen()
  .then(() => Logger.info(`Server listening on port: ${server.config.port}`))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
```

You can also check a full project seed in the [Examples directory](./examples) of this repository.

### Usage Guide

Follow the [Usage Guide](./GUIDE.md) for the basic boilerplate and a sample project configuration with
Database and user authentication samples.

Internal components:

- Logger (backed by [winston](https://npmjs.org/package/winston))
- Database (backed by [Mongoose](https://npmjs.org/package/mongoose))
- Router (backed by [Express](https://npmjs.org/package/express))
  - **Controllers:** Classes for handling API calls with decorators and async/await support
  - **Filters:** Middlewares for body validation, permission handling and other interception routines
  - **Responses:**: Simple wrappers over `res.status(code).json(result)` for success and error responses.

External components available as built-in middlewares: 

- OAuth 2.0 (express-oauth2-server)
- Sentry (RavenJS)
- CORS (express/cors)
- Multipart (express/multer)
- User Agent (express-useragent and request-ip)
- Body Parser (express/body-parser)
- Method Override (express/method-override)
- Cookie Parser (express/cookie-parser)

Other external plugins and middlewares for this framework

- **[ts-framework-versioning](https://gitlab.devnup.com/npm/ts-framework-versioning)**

    Handles API versioning using HTTP Headers.
    
- **[ts-framework-notification](https://gitlab.devnup.com/npm/ts-framework-notification)**

    Handles transactional notifications using SMTP (email templates) and Firebase Messaging (push notifications).

- **[ts-framework-migration](https://gitlab.devnup.com/npm/ts-framework-migration)**

    Advanced usage plugin for handling Schema migrations safely within production environments.

- **ts-framework-sockets (coming soon)**

    Socket.io layer over the TS-Framework. Currently in closed alpha.

- **ts-framework-queue (coming soon)**

    Redis based task rotation queue services. Currently in closed alpha.

- **ts-framework-cache (coming soon)**

    Redis based cache services for performance. Currently in closed alpha.

- **ts-framework-sql (coming soon)**

    MySQL / Postgres database layer based on Sequelize. Currently in closed alpha.


## Documentation


### Server

The basic HTTP Server definitions, wraps an Express to integrate all framework modules.


#### Utility classes

- **Logger**: A simple Logger based on [Winston](https://npmjs.org/package/winston).

#### Base classes

- **BaseError**: The base error instance for all framework exceptions.
    - `error.stackId`: An unique uuid/v4 for Errors to be sent to external service, such as ELK or Sentry.
    - `error.details`: An object with misc details associated with the error instance. 

- **BaseRequest**: Extends Express.js request class for framework binding.
    - `request.logger`: The Server logger instance, if supplied in the Server constructor.

- **BaseResponse**: Extends Express.js response class for framework binding.
    - `response.success(data: any)`: A shortcut for setting status as `200` and calling `data.toJSON()` if available.
    - `response.error(error: String | Error)`: Handles errors before sending to response, cleaning the stack and assigned an unique `stackId`.

#### Decorators

- **@Controller(baseRoute: string, middlewares?: Function[])**: Decorator for controller classes.

- **@Get(route: string, middlewares?: Function[])**: Decorator for GET methods, must be static.

- **@Post(route: string, middlewares?: Function[])**: Decorator for POST methods, must be static.

- **@Put(route: string, middlewares?: Function[])**: Decorator for PUT methods, must be static.

- **@Delete(route: string, middlewares?: Function[])**: Decorator for DELETE methods, must be static.


### Database

The MongoDB ODM definitions.

#### Base classes

- **BaseModel**: The base class for all model instances decorated with `@Model`. 
    - `BaseModel.modelName`: The name of the model collection in MongoDB, as supplied in the `@Model` decorator.


#### Decorators

- **@Model(name: string)**: Assigns a name for the decorated model class to be used as collection name in MongoDB. Must
be used in classes that extends `BaseModel`.


## Full module reference

To generate the Typedoc reference of the available modules, run the following command:

```sh
yarn run docs
```

Then check the documentation at `./docs/index.html`.


## License

The project is licensed under the [MIT License](./LICENSE.md).
