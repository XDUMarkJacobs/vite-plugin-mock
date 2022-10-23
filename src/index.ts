import { Plugin } from 'vite';
import { useMiddleware } from './middleware';
import { MockConfig } from './type';
import bodyParser from 'body-parser';

const MockConfigDefault = { dir: "mock", prefix: "", timeout: [100, 2000] };

export const MockPlugin = ( mockConfig: MockConfig = {} ): Plugin => {
    const config: Required<MockConfig> = Object.assign( {}, MockConfigDefault, mockConfig );
    return {
        name: 'vite-plugin-mock',
        configureServer ( server ) {
            server.middlewares.use( bodyParser.json() );
            server.middlewares.use( useMiddleware( config ) );
        }
    };
}; 