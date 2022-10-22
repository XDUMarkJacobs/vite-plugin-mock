import { Connect } from 'vite';
import { MockConfig } from './type';
import { join, relative, resolve } from 'path';
import fs from 'fs/promises';
import { getRandom } from './utils';
import qs from 'qs';

require( 'ts-node' ).register( {} );

function requireApi ( url: string ) {
    // require是存在缓存的
    delete require.cache[url];
    return require( url );
}

function delayApi ( timeout: Pick<Required<MockConfig>, 'timeout'>['timeout'] ) {
    // 延时返回结果
    let [min, max] = timeout;
    min = Math.min( min, max );
    max = Math.max( min, max );
    const delayTime = getRandom( min, max );
    // await delay( delayTime );
}

async function isFileExisted ( url: string ) {
    try {
        const stat = await fs.stat( url );
        return stat.isFile();
    } catch ( error ) {
        return false;
    }
}

async function isDirExisted ( url: string ) {
    try {
        const stat = await fs.stat( url );
        return stat.isDirectory();
    } catch ( error ) {
        return false;
    }
}

export const useMiddleware = ( { prefix, dir, timeout }: Required<MockConfig> ): Connect.NextHandleFunction => {
    return async ( req, res, next ) => {
        // @ts-ignore
        const { originalUrl, method, body } = req;
        const functionName = method?.toLocaleLowerCase() || method?.toLocaleUpperCase() || 'get';
        const mockDirPath = resolve( process.cwd(), dir );

        async function response ( url: string, args: string[] = [] ) {
            const apis = requireApi( url );
            await delayApi( timeout );
            const response = apis[functionName]( ...args, req, res );
            res.end( JSON.stringify( response ) );
        }

        if ( originalUrl?.startsWith( prefix ) ) {
            try {
                // /user/1 /user/1.ts /user/[id].ts
                const theOriginUrl = originalUrl.replace( prefix, prefix );
                const [apiUrl, search] = theOriginUrl.split( '?' );
                const query = qs.parse( search );
                //@ts-ignore
                req.query = query;
                const result = await Promise.all( ['.ts', '/index.ts'].map( item => isFileExisted( join( mockDirPath, theOriginUrl + item ) ) ) );
                const existed = result.filter( Boolean ).length;
                if ( existed ) {
                    const url = join( mockDirPath, theOriginUrl );
                    return response( url );
                }

                try {
                    // /role/1/permission
                    // /user/1
                    // split   ['role','1','permission']
                    const paths = theOriginUrl.split( '/' ).filter( Boolean );
                    let root = join( mockDirPath );
                    // console.log( paths, root );
                    let args: string[] = [];
                    for ( let i = 0; i < paths.length; ++i ) {
                        const path = paths[i];
                        const u = join( root, path );
                        const existed = await isDirExisted( u );
                        if ( existed ) {
                            const stat = await fs.stat( u );
                            // if ( stat.isDirectory() ) {
                            root = join( root, path );
                            // } else {
                            //     // 不是一个文件夹的时候
                            //     const files = await fs.readdir( root );
                            //     files.forEach( file => console.log( file ) );
                            //     // const parent = paths[index - 1];
                            // }
                        } else {
                            // 不是一个文件夹的时候
                            const files = await fs.readdir( root );

                            const file = files.find( file => {
                                const u = relative( root, join( root, path ) );
                                if ( file.startsWith( '[' ) ) {
                                    args.push( path );
                                    return true;
                                }
                            } );
                            if ( !file ) {
                                throw Error( '请求路径不对' );
                            }
                            // console.log( file );
                            root = join( root, file );
                        }
                    }
                    console.log( root );
                    response( root, args );
                } catch ( error ) {
                    next();
                }


            } catch ( error ) {

            }
            // 不走next
            return;
        }
        next();
    };
};