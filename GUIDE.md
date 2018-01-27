# ts-framework

Configuration guide for the ts-framework.


### Configuring the Server

Start by extending the default server. It's easier to control its behaviour by
extending the **Server** base class.

```typescript
import { Server, ServerOptions } from 'ts-framework/server';

export default class MainServer extends Server {

  constructor(options?: ServerOptions) {
    super({
      port: process.env.PORT || 3000
      routes: {
        get: {
          '/': (req, res) => this.helloWorld(req, res)
        }
      },
      ...options,
    });
  }
  helloWorld(req, res) {
    res.json({ message: 'HelloWorld!' })
  }

  /** For example, extend the onStartup method to handle post-listen routines */
  async onStartup() {
    // This method will be called right after the server.listen() has been called.
    console.log(`Server listening on port: ${this.config.port}`);
  }
} 
```

The main entrypoint for your application should be a **Server** instance. For 
instance, inside a ```start.ts``` file, initialize and listen in the supplied 
port.

```typescript
import MainServer from './server';

const server = new MainServer();

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
import { Database } from 'ts-framework/database';

export default class MainDatabase extends Database {
  async connect() {
    // Do some pre-connection routines...
    await super.connect();
    // Do some post-connection routines...
  }
}
```

Now, you can bind the database initialization to the MainServer instance.

```typescript
import { Server, ServerOptions, Logger } from 'ts-framework/server';
import { StatusController } from './controllers/StatusController'
import MainDatabase from './database';

export default class MainServer extends Server {
  database: MainDatabase;

  constructor(options: ServerOptions) {
    super({
      // Recommended: Start with the SimpleLogger to ease the debug process
      logger: Logger,
      port: process.env.PORT || 3000,
      controllers: { status: StatusController },
      ...options
    });
    
    // Prepare the database to be connected later
    this.database = new MainDatabase({
      logger: Logger,
      url: process.env.MONGO_URL || 'mongodb://localhost:27017/example'
    })
  }

  /** For example, extend the onStartup method to handle pre-listen routines */
  async onStartup() {
    // Connect to database instance
    await this.database.connect();
    this.logger.info(`Server listening on port: ${this.config.port}`);
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
    res.success({
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

The framework is based on the [Mongoose Advanced Schemas](http://mongoosejs.com/docs/advanced_schemas.html) for ES6. The 
idea is to wrap your model in a class-oriented approach.

```typescript
import { Model, BaseModel } from "ts-framework/database";

/**
 * A simple user schema definition. 
 */
const UserSchema =  new Schema({
  name: {
    type: String
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  }
});

@Model("Users")
class UserModel extends BaseModel {
  
  /**
   * The schema definition is required and must be static. 
   */
  static Schema = UserSchema;
  
  /**
   * Example static method: finds an user with specified email.
   */
  static findByEmail(email: string): Promise<UserModel> {
    return this.findOne({ email, status: 'active'});
  }
  
  /**
   * Example instance method: sets user instance name.
   */
  async setName(name: string) {
    return this.update({ $set: { name }});
  }
}

// Register in a Database isntance
export default database.model(UserModel);
```
