
var should = require('should')

var PathProxy = require('./path-proxy')
var rootPath = new PathProxy()


//PathProxy always returns an object
should.exist(rootPath.a.deeply.nested.property)

//Call toPath on any PathProxy and get a string representation of the path
should(rootPath.a.deeply.nested.property.toPath()).be.equal('a.deeply.nested.property')


//Use path proxy to generate URLs
url = new PathProxy({
	root: {
		concatentationString: "/",
		prefix: "http://modeo.co/",
		suffix: ".html"
	}
})

should(url.toPath()).be.equal('http://modeo.co/.html')
should(url.blog.post.toPath()).be.equal("http://modeo.co/blog/post.html")

//You can also use your own toPath and getValue functions
var root = {
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
	},

	customProperty: 'a property'
}

var customPath = new PathProxy( {root: root} )

//This will use your custom toPath() function
should(customPath.a.property.toPath()).be.equal('a,property')
//This will return the custom getValue() result for the key testProperty
should(customPath.a.property.testProperty).be.equal('this is a test')
//This will return the custom getValue() result for the key testFunction
//should(customPath.a.property.testFunction('arbitrary argument')).be.equal('The path is a,property. The argument is arbitrary argument')
//This will return the value of a custom property
should(customPath.customProperty).be.equal('a property')

//Supply a custom root node
root = {
	//use a custom toPath() function
	toPath: function () {
		return 'Enoch' //Read Cryptonomicon
	},
	getNode: function (keys) {

		var base
		var nodeType = keys[0]
		if (nodeType == 'foo') {

			base = {
				toPath: function () {
					return 'foo'
				}
			}
		}
		else if (nodeType == 'bar') {

			base = {
				toPath: function () {
					return 'bar'
				}
			}
		}

		return null //this always uses the root node
	},
	customProperty: 'a property on the root'
}

var customRoot = new PathProxy( {root:root} )
//The root object is always the root node
should(customRoot.toPath()).be.equal('Enoch')
//Define a getNode factory method to create nodes dynamically
should(customRoot.foo.toPath()).be.equal('foo')
should(customRoot.bar.toPath()).be.equal('bar')

console.log("tests completed successfully!")


