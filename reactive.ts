const isObject = (target : any) => target !== null && typeof target == 'object'
export const reactive = <T extends object>(target: T): any => {
    return new Proxy(target, {
        get(target, key, receiver) {
            const res = Reflect.get(target, key, receiver) as object
            track(target, key)
            if(isObject(res)) {
                return reactive(res)
            }
            return res
        },

        set(target, key, value, receiver){
            const res = Reflect.set(target, key, value, receiver)
            trigger(target, key)
            return res
        }
    })
}

let active: any

export const effect = (fn: Function) => {
    const _effect = () => {
        active = _effect
        fn()
    }

    _effect()
}


let targetMap = new WeakMap()
const track = <T extends object>(target: T , key: any) => {
    let depsMap = targetMap.get(target)
    if(!depsMap){
        depsMap = new WeakMap()
        targetMap.set(target, depsMap)
    }
    let deps = depsMap.get(key)
    if(!deps){
        deps = new Set()
        depsMap.set(key, deps)
    }
    deps.add(active)
}

const trigger = <T extends object>(target: T, key: any) => {
    const depsMap = targetMap.get(target)
    const deps = depsMap.get(key)

    deps.forEach((effect: any) => effect());
}