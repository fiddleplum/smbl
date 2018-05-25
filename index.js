class Symbol {
	constructor(element) {
		this._element = element;
		element.onclick = () => {
			this.select();
		};
	}

	element() {
		return this._element;
	}

	select() {
		this._element.classList.add('selected');
	}
}

class Variable extends Symbol {
	constructor(element, letter) {
		super(element);
		this._letter = letter;
		element.classList.add('variable');
		element.innerHTML = this._letter;
	}
}

class Placeholder extends Symbol {
	constructor(element) {
		super(element);
		element.classList.add('placeholder');
		element.innerHTML = '▢';
	}
}

class App {
	static initialize() {
		// Setup all of the variable names.
		App.variableNames = [];
		for (let i = 0; i < 26; i++) {
			App.variableNames.push(String.fromCodePoint('a'.codePointAt(0) + i));
		}
		for (let i = 0; i < 26; i++) {
			App.variableNames.push(String.fromCodePoint('A'.codePointAt(0) + i));
		}
		for (let i = 0; i < 25; i++) {
			App.variableNames.push(String.fromCodePoint('α'.codePointAt(0) + i));
		}
		for (let i = 0; i < 25; i++) {
			App.variableNames.push(String.fromCodePoint('Α'.codePointAt(0) + i));
		}

		// Create the initial placeholder symbol.
		let symbol = document.createElement('span');
		document.getElementById('workspace').appendChild(symbol);
		symbol.innerHTML = 'sss';
		App.symbols.push(new Placeholder(symbol));

		document.getElementById('input').focus();

		App.message('Smbl has been initialized.');
	}

	static message(text) {
		document.getElementById('message').innerHTML = text;
	}
}

App.variableNames = [];
App.symbols = [];

document.addEventListener('DOMContentLoaded', () => {
	App.initialize();
});

window.App = App;
