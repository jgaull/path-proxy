
var should = require('should')

var PathProxy = require('./path-proxy')
var rootPath = new PathProxy()

//PathProxy always returns an object
should.exist(rootPath.a.deeply.nested.property)

//Call toPath on any PathProxy and get a string representation of the path
should(rootPath.a.deeply.nested.property.toPath()).be.equal('a.deeply.nested.property')

//Use path proxy to generate URLs
url = new PathProxy({
	concatentationString: "/",
	prefix: "http://modeo.co/",
	suffix: ".html"
})

should(url.blog.post.toPath()).be.equal("http://modeo.co/blog/post.html")

//You can also use your own toPath and getValue functions
var customPath = new PathProxy({
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
should(customPath.a.property.toPath()).be.equal('a,property')
//This will return the custom getValue() result for the key testProperty
should(customPath.a.property.testProperty).be.equal('this is a test')
//This will return the custom getValue() result for the key testFunction
should(customPath.a.property.testFunction('arbitrary argument')).be.equal('The path is a,property. The argument is arbitrary argument')

console.log("tests completed successfully!")


