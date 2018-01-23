const env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
console.log('loading configuration for environment : ' + env);

import { configDev } from './config.development';
import { configProd } from './config.production';

export const config = (env === 'production') ? configProd : configDev;
