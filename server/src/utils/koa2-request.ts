
/*
  Simple wrapper to request library
  http://github.com/mikeal/request
  For use in Koa2.
*/
import * as _request from 'request';

const requester: any = (uri: string, options: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    _request(uri, options, (error: Error, response: any, body: any) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
};

// Overwrite Request method
for (const attr in _request) {
  if (_request.hasOwnProperty(attr)) {
    if (['get', 'post', 'put', 'patch', 'head', 'del', 'delete'].indexOf(attr) > -1) {
      requester[attr] = ((attribute: string) => {
        return (uri: string, options: any) => {
          return new Promise((resolve, reject) => {
            _request(uri, options, (error: Error, response: any, body: any) => {
              if (error) {
                reject(error);
              } else {
                resolve(response);
              }
            });
          });
        };
      })(attr);
    } else {
      // requester[attr] = _request[attr];
      requester[attr] = null;
    }
  }
}

export const request = requester;
