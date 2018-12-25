import React from 'react';
import {StateComponent} from 'react-central-state';
import { Creator } from './components/creator';
import { Display } from './components/display';

class App extends StateComponent {
	constructor(props){
		super(props);
		this.state ={name:"Todo List"};
	}
	triggers(){
		return [];
	}
	render() {
		return (
		<div className="App">
			<div className="title"><h2>{this.state.name}</h2></div>
			<Creator/>
			<Display/>
		</div>
		);
	}
}

export default App;
