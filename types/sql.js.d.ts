declare module "sql.js" {
  export interface QueryExecResult {
    columns: string[];
    values: Array<Array<number | string | Uint8Array | null>>;
  }

  export interface Database {
    run(sql: string): Database;
    exec(sql: string): QueryExecResult[];
    close(): void;
  }

  export interface SqlJsStatic {
    Database: new (data?: ArrayLike<number> | Buffer | null) => Database;
  }

  export interface InitSqlJsConfig {
    locateFile?: (file: string) => string;
    wasmBinary?: ArrayBuffer | Uint8Array;
  }

  const initSqlJs: (config?: InitSqlJsConfig) => Promise<SqlJsStatic>;
  export default initSqlJs;
}
