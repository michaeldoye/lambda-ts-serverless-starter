interface RequestOptions {
  path?: string;
  port?: number;
  hostname: string;
  headers?: RequestHeaders;
  method: 'POST' | 'GET' | 'PUT' | 'DELETE';
  pfx?: Buffer;
  cert?: Buffer | string;
  key?: Buffer | string;
  passphrase?: string;
}

interface RequestHeaders {
  [key: string]: string;
}

export { RequestOptions };
