fetch( '/user/1?name1=123', {
    method: 'post',
    body: JSON.stringify( {
        name: 'zz'
    } )
} ).then( ( res ) => res.json() )
    .then( console.log );