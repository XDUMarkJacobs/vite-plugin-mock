export const getRandom = ( lower: number, upper: number ) => {
    return Math.floor( Math.random() * ( upper - lower + 1 ) + lower );
};

export const bodyParser = () => {
    function json () {
        return async ( req, res, next ) => {
            req.body = { name: 'zz' };
            next();
        };
    }

    return {
        json
    };
}; 