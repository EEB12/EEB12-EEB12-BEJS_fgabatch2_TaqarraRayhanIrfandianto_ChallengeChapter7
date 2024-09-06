const greet =require ('../utils/hello.util.js')


test('Greeting Function Testing',()=>{

    expect(greet('rayhan')).toBe('Hello rayhan')


})