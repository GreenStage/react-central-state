import React from 'react';
import {CSComponent} from 'react-central-state';
import  Creator  from './components/creator';
import  Display  from './components/display';

class App extends React.Component {
	constructor(props){
		super(props);
		this.state ={name:"Todo List"};
	}
	updateWith(){
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

export default CSComponent(App);
