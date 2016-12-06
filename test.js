
var should = require('should')

var PathProxy = require('./path-proxy')
var root = new PathProxy()

//PathProxy always returns an object
should.exist(root.a.deeply.nested.property)
//Call toPath on any PathProxy and get a string representation of the path
should(root.a.deeply.nested.property.toPath()).be.equal('a.deeply.nested.property')

//You can also use your own toPath and getValue functions
root = new PathProxy({
	//use a custom toPath() function
	toPath: function () {
		var keys = this.keys
		return keys.toString()
	},
	//use a custom getValue() function
	getValue: function (obj, key) {

		if (key === 'testProperty') {
			return 'this is a test'
		}
		else if (key === 'testFunction') {

			var testFunction = function (stringPath, anArgument) {
				return 'The path is ' + stringPath + '. The argument is ' + anArgument
			}

			return testFunction
		}

		return obj[key]
	}
})

//This will use your custom toPath() function
should(root.a.property.toPath()).be.equal('a,property')
//This will return the custom getValue() result for the key testProperty
should(root.a.property.testProperty).be.equal('this is a test')
//This will return the custom getValue() result for the key testFunction
should(root.a.property.testFunction('arbitrary argument')).be.equal('The path is a,property. The argument is arbitrary argument')

console.log("tests completed successfully!")