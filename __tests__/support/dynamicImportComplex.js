// let name = './element/button'


let name1 = './element/message';
function a(){
    let name = './element/button'
    {
        let name = './element/button2'
    }
    return {
        components: {
            'component': () => import(name),
            'componenta': () => import(name1)
        }
    }
    name = ''
}

export default a();