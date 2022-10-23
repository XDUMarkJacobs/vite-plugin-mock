import qs from 'qs';
import R, { compose, split, last, head, map, join, curryN, filter, length, flatten } from 'ramda';
import fg from 'fast-glob';

export const getRandom = ( lower: number, upper: number ) => {
    return Math.floor( Math.random() * ( upper - lower + 1 ) + lower );
};

export const handleQuery = compose( qs.parse, last, split( '?' ) );

export const getFilesSync = curryN( 2, fg.sync )( R.__, { dot: true } );

export const getApiUrl = compose( head, split( '?' ) );

export const getMaybeUrl = curryN( 2, ( suffix: string[], mockPath: string ) => {
    return map( ( item ) => { return join( '' )( [mockPath, item] ); }, suffix );
} );

export const fileExisted = getFilesSync;
export const filesExisted = curryN( 2, ( suffix: string[], mockPath: string ) => {
    // @ts-ignore
    return compose( flatten, filter( length ), map( fileExisted ) )( getMaybeUrl( suffix, mockPath ) );
} );



