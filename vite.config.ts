import { MockPlugin } from './src';
import { defineConfig } from 'vite';


export default defineConfig( {
    plugins: [MockPlugin( { 'prefix': "/user" } )]
} );