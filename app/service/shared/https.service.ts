import https from 'https';
import { RequestOptions } from '../../model/shared/https.model';
import { parseResponse } from '../../utils/helpers';

export class HttpsService {
  executeRequest<T>(postData: string | null, requestOptions: RequestOptions): Promise<T> {
    return new Promise((resolve, reject) => {
      const req = https.request(requestOptions, (res) => {
        res.setEncoding('utf8');

        let body = '';

        res.on('data', (chunk: any) => {
          body = body + chunk;
        });

        res.on('end', () => {
          if (res.statusCode !== 200) {
            reject(`request failed with status code: ${res.statusCode}`);
          }

          const response = parseResponse(body.toString());
          resolve(response as T);
        });
      });

      req.on('error', (e) => {
        reject(
          `Something went wrong connecting to ${requestOptions.hostname}: ${JSON.stringify(e)}`,
        );
      });

      if (postData !== null) {
        req.write(postData);
      }

      req.end();
    });
  }
}
