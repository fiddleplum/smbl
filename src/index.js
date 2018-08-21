class Symbol {
	constructor(parent) {
		this._parent = parent;

		if (this._parent !== null) {
			this._depth = parent.depth + 1;
		}
		else {
			this._depth = 0;
		}

		this._element = document.createElement('span');
		this._element.classList.add('symbol');
		this._element.onclick = (event) => {
			App.select(this);
			event.stopPropagation();
		};
		this._element.style.zIndex = this._depth;
	}

	get parent() {
		return this._parent;
	}

	get element() {
		return this._element;
	}

	get depth() {
		return this._depth;
	}

	get childIndex() {
		if (this._parent !== null) {
			for (let i = 0, l = this._parent.numChildren; i < l; i++) {
				if (this._parent.getChild(i) === this) {
					return i;
				}
			}
		}
		return undefined;
	}
}

class Variable extends Symbol {
	constructor(parent, letter) {
		super(parent);

		this._letter = letter;

		this.element.classList.add('variable');
		this.element.innerHTML = this._letter;
	}

	get letter() {
		return this._letter;
	}
}

class Placeholder extends Symbol {
	constructor(parent) {
		super(parent);

		this.element.classList.add('placeholder');
		this.element.innerHTML = '▢';
	}
}

class CompoundSymbol extends Symbol {
	constructor(parent) {
		super(parent);

		this._children = [];
	}

	get numChildren() {
		return this._children.length;
	}

	getChild(index) {
		return this._children[index];
	}

	setChild(index, symbol) {
		for (let i = 0; i < this.element.children.length; i++) {
			let childElement = this.element.children[i];
			if (childElement === this._children[index].element) {
				this.element.replaceChild(symbol.element, childElement);
			}
		}
		this._children[index] = symbol;
	}
}

class Addition extends CompoundSymbol {
	constructor(parent) {
		super(parent);

		this._children.push(new Placeholder(this));
		this._children.push(new Placeholder(this));

		this.element.appendChild(this._children[0].element);

		let plus = document.createElement('span');
		plus.innerHTML = ' + ';
		this.element.appendChild(plus);

		this.element.appendChild(this._children[1].element);
	}
}

class App {
	static initialize() {
		// Setup all of the variable names.
		App.variableNames = new Set();
		for (let i = 0; i < 26; i++) {
			App.variableNames.add(String.fromCodePoint('a'.codePointAt(0) + i));
		}
		for (let i = 0; i < 26; i++) {
			App.variableNames.add(String.fromCodePoint('A'.codePointAt(0) + i));
		}
		for (let i = 0; i < 25; i++) {
			App.variableNames.add(String.fromCodePoint('α'.codePointAt(0) + i));
		}
		for (let i = 0; i < 25; i++) {
			App.variableNames.add(String.fromCodePoint('Α'.codePointAt(0) + i));
		}

		// Create the initial placeholder symbol.
		App.root = new Placeholder(null);
		document.querySelector('#workspace').appendChild(App.root.element);

		// Initialize the input element.
		App.input = document.getElementById('input');
		App.input.addEventListener('keyup', (event) => {
			event.preventDefault();
			console.log(event.keyCode);
			if (event.keyCode === 13) {
				App.setSymbol(App.input.value);
				App.input.value = '';
			}
			if (event.keyCode === 9) {
				if (App.selectedSymbol !== null) {
					let nextNode = null;
					// Move up
					// while(nextNode === null) {
					// 	let childIndex = App.selectedSymbol.childIndex;
					// 	if (childIndex + 1 < App.selectedSymbol.parent.numChildren) {
					// 	}
					// }
				}
				else {
					App.select(App.root);
				}
			}
		});
		window.addEventListener('keyup', (event) => {
			if (App.selectedSymbol !== null) {
				let parent = App.selectedSymbol.parent;
				let childIndex = App.selectedSymbol.childIndex;
				let newSelectedSymbol = null;
				if (event.keyCode === 37 && parent !== null) { // left
					if (childIndex > 0) {
						newSelectedSymbol = App.selectedSymbol.parent.getChild(childIndex - 1);
					}
				}
				else if (event.keyCode === 38 && parent !== null) { // up
					App.select(App.selectedSymbol.parent);
				}
				else if (event.keyCode === 39 && parent !== null) { // right
					if (childIndex + 1 < App.selectedSymbol.parent.numChildren) {
						newSelectedSymbol = App.selectedSymbol.parent.getChild(childIndex + 1);
					}
				}
				else if (event.keyCode === 40 && App.selectedSymbol.getChild !== undefined) { // down
					newSelectedSymbol = App.selectedSymbol.getChild(0);
				}
				if (newSelectedSymbol) {
					App.select(newSelectedSymbol);
				}
			}
		});
		App.input.focus();

		App.message('Smbl has been initialized.');
	}

	/**
	 * @param {Symbol} symbol
	 */
	static select(symbol) {
		if (App.selectedSymbol !== null) {
			App.selectedSymbol.element.classList.remove('selected');
		}
		App.selectedSymbol = symbol;
		if (App.selectedSymbol !== null) {
			App.selectedSymbol.element.classList.add('selected');
		}
	}

	/**
	 * @param {string} text
	 */
	static setSymbol(text) {
		let oldSymbol = App.selectedSymbol;
		let newSymbol = null;
		let parent = null;
		let childIndex = 0;

		// Figure out where the old symbol is.
		if (oldSymbol !== null) {
			parent = oldSymbol.parent;
			childIndex = oldSymbol.childIndex;
		}

		// Create the new symbol.
		if (App.variableNames.has(text)) {
			App.message('Adding ' + text);
			newSymbol = new Variable(parent, text);
		}
		else if (text.startsWith('/')) {
			let token = text.substr(1);
			if (token === 'add') {
				newSymbol = new Addition(parent);
			}
		}

		// Add the child to the heirarchy.
		if (parent !== null) {
			parent.setChild(childIndex, newSymbol);
		}
		else {
			if (App.root !== null) {
				document.querySelector('#workspace').removeChild(App.root.element);
			}
			App.root = newSymbol;
			document.querySelector('#workspace').appendChild(App.root.element);
		}

		// Select the new symbol.
		App.select(newSymbol);
	}

	static message(text) {
		let escapedText = text.replace(/[&<>"'/]/g, (s) => {
			var entityMap = {
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				'"': '&quot;',
				'\'': '&#39;',
				'/': '&#x2F;'
			};

			return entityMap[s] || s;
		});
		document.getElementById('message').innerHTML = escapedText;
	}
}

App.variableNames = new Set();
App.root = null;
App.input = null;
App.selectedSymbol = null;

document.addEventListener('DOMContentLoaded', () => {
	App.initialize();
});

window.App = App;
