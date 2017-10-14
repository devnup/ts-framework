ts-framework
============

A minimalistic framework for typescript based applications.

## Getting Started

### Installing the Alpha Preview

The currently API is considered to be "alpha" so it can change at any time. To 
ensure your project won't crash, refer to the specific commit, instead of a 
SemVer tag or git branch.

For example:

```bash
npm install --save https://gitlab.devnup.com/npm/ts-framework.git#3471f9004798c35c5943cdf9160bd0ce856db62c 
``` 

### Configuring the Server

Start by extending the default server. It's easier to control its behaviour by
extending the **Server** base class.

```typescript
import {Server} from 'ts-framework';

export default class MainServer extends Server {

  /** For example, extend the onStartup method to handle post-listen routines */
  async onStartup() {
    // This method will be called right after the server.listen() has been called.
    console.log(`Server listening on port: ${this.options.port}`);
  }
} 
```

The main entrypoint for your application should be a **Server** instance. For 
instance, inside a ```start.ts``` file, initialize and listen in the supplied 
port.

```typescript
import MainServer from './server';

const server = new MainServer({ port: process.env.PORT || 3000 });

// Start listening for requests...
server.listen().catch(error => {
  console.error(error);
  process.exit(1);
});
```


### Configuring the Database


The framework comes with a thin abstraction layer over the great 
[Mongoose ODM](https://npmjs.org/package/mongoose). The goal of this layer is to
provide a simple and consistent base class, that can be extended in the same way 
as the **Server** was done in the last section. 

```typescript
import {Database} from 'ts-framework';

export default class MainDatabase extends Database {
  constructor(options: DatabaseOptions) {
    super(options);
    // Some post initialization routines...
  }
  
  async connect() {
    // Do some pre-connection routines...
    await super.connect();
    // Do some post-connection routines...
  }
}
```

Now, you can bind the database initialization to the MainServer instance.

```typescript
import {Server, ServerOptions, Logger} from 'ts-framework';
import MainDatabase from './database';

export default class MainServer extends Server {
  database: MainDatabase;

  constructor(options: ServerOptions) {
    super({
      // Recommended: Start with the SimpleLogger to ease the debug process
      logger: Logger,
      ...options
    });
    
    // Prepare the database to be connected later
    this.database = new MainDatabase({
      logger: this.logger,
      url: process.env.MONGO_URL || 'mongodb://localhost:27017/example'
    })
  }

  /** For example, extend the onStartup method to handle pre-listen routines */
  async onStartup() {
    // Connect to database instance
    await this.database.connect();
    this.logger.info(`Server listening on port: ${this.options.port}`);
  }
} 
```

## Writing your Application

### Controllers

A controller is a class that handles HTTP calls. This is achieved in the **Server**
using [express](https://npmjs.org/package/express), and is fully configurable using
experimental decorators.

```typescript
import * as Package from 'pjson';
import { Controller, Get } from "ts-framework";

@Controller('/status')
export default class StatusController {

  static STARTED_AT = Date.now();

  @Get('/')
  static getStatus(req, res) {
    res.json({
      name: Package.name,
      version: Package.version,
      environment: process.env.NODE_ENV || 'development',
      uptime: Date.now() - StatusController.STARTED_AT
    });
  }

}
```

For example, this status controller would produce this response when requested:

```
GET /status

{
    "name": "example",
    "version": "0.0.1",
    "environment": "production",
    "uptime": 1445563
}
```

### Model

// TODO



## Documentation

It's in the roadmap an automated documentation based on JSDocs. Currently there are
only the JSDocs tags inside of some key class and components.


## License

The project is licensed under [MIT License](./LICENSE.md).