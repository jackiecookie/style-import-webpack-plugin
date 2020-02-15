import Test from "./test.vue";
expect(Test).not.toBeNull();
expect(typeof Test.render).toEqual("function")
expect(Array.isArray(Test.beforeCreate)).toBeTruthy();
let context = {};
context.styles;
Test.beforeCreate.forEach(fn=>{
    fn(context);
});
expect(context.Button).toEqual("Button");
expect(context.styles.indexOf(`.button{
    color: red;
}`)>-1).toBeTruthy();
