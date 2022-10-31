declare global {
  namespace NodeJS {
    interface ProcessEnv {
      STATE: 'dev' | 'prod';
      DB_PASSWORD: any;
      DB_NAME: any;
      DB_HOST: any;
      DB_PORT: any;
      DB_USERNAME: any;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
