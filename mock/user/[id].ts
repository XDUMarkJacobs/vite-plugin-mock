export function get ( id: string, req: any ) {
    return {
        name: id,
        ...req.query
    };
}

export function post ( id: string, req: any ) {
    return {
        name: id,
        ...req.body,
        ...req.query
    };
}