
module.exports = PathProxy 

function PathProxy (base = {}, keys = []) {
	//check for non-string keys
	for (var i = 0; i < keys.length; i++) {
		var key = keys[i]
		if (typeof key !== typeof 'string') {
			//If there is one throw an error
			throw Error("All keys must be of type string")
		}
	}

	//store this for use later
	base.keys = keys

	//prefix is added to the beginning of every path string (eg. http://)
	if (!base.prefix || typeof base.prefix !== typeof 'string') {
		base.prefix = ""
	}

	//suffix is added to the end of every path string (eg. .json)
	if (!base.suffix || typeof base.suffix !== typeof 'string') {
		base.suffix = ""
	}

	//concatenationString is added between each path key (eg. object.a.path)
	if (!base.concatentationString || typeof base.concatentationString !== typeof 'string') {
		base.concatentationString = "."
	}

	//does the base object have a toPath() function?
	if (!base.toPath) {
		//If it doesn't then use the default
		base.toPath = function () {
			//get the keys representing the path
			var keys = this.keys
			var pathString = ''
			//build up a string representation of the path
			for (var i = 0; i < keys.length; i++) {
				pathString += keys[i] + this.concatentationString
			}
			//return the path minus the last '.'
			return this.prefix + pathString.slice(0, -this.concatentationString.length) + this.suffix
		}
	}
	//Does the base object have a getValue() function?
	if (!base.getValue) {
		//If it doesn't then use the default
		base.getValue = function (obj, key) {
			//Basic get value
			return obj[key]
		}
	}

	var proxy = new Proxy(base, 
	{
		//override the getter for the base object
		get: function (obj, key) {
			//Key must be a string
			if (typeof key !== typeof 'string') {
				throw Error("key must be a string")
			}

			//console.log("key: " + key)

			var value
			//If the toPath() function is the target of the get
			if (key === "toPath") {
				//then value is toPath()
				value = base.toPath
			}
			else {
				//If it's not then use the base objects getValue function
				value = base.getValue(obj, key)
			}

			if (value) {
				//If value is a function
				if (typeof value === 'function') {
					//Return a function that returns the value of the function (recursion, amirite?)
					return function () {
						args = [].slice.call(arguments) //create a copy of the arguments array
						args.unshift(obj.toPath()) //add the path to this object as the first argument
						//console.log("args: " + JSON.stringify(args))
						return value.apply(base, args) //call the function with the base object as the 'this' argument
					}
				}
				else {
					return value //just return the value if it's not a function
				}
			}

			//If there isn't a value then we need to create one
			var keysCopy = keys.slice(0) //copy the keys array
			keysCopy.push(key) //add the current key to the current path

			return new PathProxy(base, keysCopy) //return a PathProxy with the new path
			
		}
	})

	return proxy
}