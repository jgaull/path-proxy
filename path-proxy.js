
module.exports = PathProxy 

function PathProxy(params) {

	if (!params) {
		params = {}
	}

	var root = params.root
	var base = params.base
	var keys = params.keys

	if (!base) {
		base = {}
	}

	if (!keys) {
		keys = []
	}

	var thisBase = base
	if (keys.length == 0 && root) {
		thisBase = root
	}

	//check for non-string keys
	for (var i = 0; i < keys.length; i++) {
		var key = keys[i]
		if (typeof key !== typeof 'string') {
			//If there is one throw an error
			throw Error("All keys must be of type string")
		}
	}

	//store this for use later
	thisBase.keys = keys

	//prefix is added to the beginning of every path string (eg. http://)
	if (!thisBase.prefix || typeof thisBase.prefix !== typeof 'string') {
		thisBase.prefix = ""
	}

	//suffix is added to the end of every path string (eg. .json)
	if (!thisBase.suffix || typeof thisBase.suffix !== typeof 'string') {
		thisBase.suffix = ""
	}

	//concatenationString is added between each path key (eg. object.a.path)
	if (!thisBase.concatentationString || typeof thisBase.concatentationString !== typeof 'string') {
		thisBase.concatentationString = "."
	}

	//does the base object have a toPath() function?
	if (!thisBase.toPath) {
		//If it doesn't then use the default
		thisBase.toPath = function () {
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
	if (!thisBase.getValue) {
		//If it doesn't then use the default
		thisBase.getValue = function (obj, key) {
			//Basic get value
			return obj[key]
		}
	}

	var proxy = new Proxy(thisBase, 
	{
		//override the getter for the base object
		get: function (obj, key) {
			//Key must be a string
			if (typeof key !== typeof 'string') {
				throw Error("key must be a string")
			}

			//console.log("key: " + key)

			var value = thisBase.getValue(obj, key)

			//console.log('key: ' + key + ', value: ' + value)
			if (value !== undefined) {
				return value
			}

			//If there isn't a value then we need to create one
			var keysCopy = keys.slice(0) //copy the keys array
			keysCopy.push(key) //add the current key to the current path

			var baseObject = root
			if (root && typeof root.getNode === 'function') {
				baseObject = root.getNode(keysCopy)
			}

			var newProxy = new PathProxy({
				root: root, 
				keys: keysCopy,
				base: baseObject
			})

			return newProxy //return a PathProxy with the new path
		}
	})

	return proxy
}