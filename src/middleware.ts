import { Connect } from 'vite';
import type { MockConfig } from './type';
import { join, relative, resolve } from 'path';
import fs from 'fs/promises';
import { getRandom, handleQuery, getApiUrl, getMaybeUrl, filesExisted, getFilesSync } from './utils';
import { cond, equals, not, compose, pluck, head, defaultTo, map } from 'ramda';

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
        const mockDir = resolve( process.cwd(), dir );

        function response ( url: string, args: string[] = [] ) {
            if ( !!!url ) return;
            const apis = requireApi( url );
            // await delayApi( timeout );
            const response = apis[functionName]?.( ...args, req, res ) || {};
            res.end( JSON.stringify( response ) );
        }

        if ( originalUrl?.startsWith( prefix ) ) {
            const files = getFilesSync( [`${ mockDir }/**/*.[tj]s`] );
            try {
                // /user/1 /user/1.ts /user/[id].ts
                // 获取 query body参数
                //@ts-ignore
                req.query = handleQuery( originalUrl );
                const apiUrl = getApiUrl( originalUrl );
                // 处理直接命中的情况
                const result: string[] = filesExisted( ['.ts', '/index.ts'] )( join( `${ mockDir }${ apiUrl }` ) );
                map( compose( response, defaultTo( '' ) as ( str: string ) => string ) )( result );

                // try {
                //     // /role/1/permission
                //     // /user/1
                //     // split   ['role','1','permission']
                //     const paths = originalUrl.split( '/' ).filter( Boolean );
                //     let root = join( mockDir );
                //     // console.log( paths, root );
                //     let args: string[] = [];
                //     for ( let i = 0; i < paths.length; ++i ) {
                //         const path = paths[i];
                //         const u = join( root, path );
                //         const existed = await isDirExisted( u );
                //         if ( existed ) {
                //             const stat = await fs.stat( u );
                //             // if ( stat.isDirectory() ) {
                //             root = join( root, path );
                //             // } else {
                //             //     // 不是一个文件夹的时候
                //             //     const files = await fs.readdir( root );
                //             //     files.forEach( file => console.log( file ) );
                //             //     // const parent = paths[index - 1];
                //             // }
                //         } else {
                //             // 不是一个文件夹的时候
                //             const files = await fs.readdir( root );

                //             const file = files.find( file => {
                //                 const u = relative( root, join( root, path ) );
                //                 if ( file.startsWith( '[' ) ) {
                //                     args.push( path );
                //                     return true;
                //                 }
                //             } );
                //             if ( !file ) {
                //                 throw Error( '请求路径不对' );
                //             }
                //             // console.log( file );
                //             root = join( root, file );
                //         }
                //     }
                //     console.log( root );
                //     response( root, args );
                // } catch ( error ) {
                //     next();
                // }


            } catch ( error ) {

            }
            // 不走next
            return;
        }
        next();
    };
};