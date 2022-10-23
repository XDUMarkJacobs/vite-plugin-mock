

fetch( '/user?name1=123', {
    method: 'post',
    headers: {
        "Content-type": "application/json; charset=UTF-8"
    },
    body: JSON.stringify( {
        name: 'zz'
    } )
} ).then( ( res ) => res.json() )
    .then( console.log );

