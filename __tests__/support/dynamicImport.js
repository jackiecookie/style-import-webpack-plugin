let name = './element/button'


export default {
    components: {
        'component': () => import(name),
        'componenta': () => import('./element/message')
    }
};