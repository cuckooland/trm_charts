const assert = require("assert");

// *********************
// Properties definition
// *********************


// ****************
// Test Definitions
// ****************

describe("Scatter-Matrix-Plot", function () {
    describe("Class1", function () {
        describe("#func1()", class1func1);
    });

    describe("Class2", function () {
        describe("#func1()", class2func1);
    });

    describe("Class3", function () {
        describe("#func1()", class3func1);
    });
});

function class1func1() {
    it("should class2func1 be wonderful", async function () {
        assert.equal(
            "bidule", 
            "bidule");
    });
}

function class2func1() {
    it("should class2func1 be wonderful", async function () {
        assert.equal(
            "toto", 
            "toto");
    });
}

function class3func1() {
    it("should class2func1 be wonderful", async function () {
        assert.equal(
            "truc", 
            "truc");
    });
}