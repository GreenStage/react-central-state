import React from 'react';
import {CSComponent} from 'react-central-state';

class Creator extends React.Component {
	constructor(props){
		super(props);
		this.setCentralState({todos:[]});
		this.inputRef = React.createRef();
	}

	addTodo(e,desc){
		e.preventDefault();
		this.setCentralState({new_todo:desc});
	}

	updateWith(){
		return ["confirmation"];
	}

	render() {
		let alertDiplay = this.centralState.confirmation != null? "block":"none";

		return (
			<div className="TodoCreator col-sm-6">
				<div >
					<form onSubmit={(e)=>this.addTodo(e,this.inputRef.current.value)}>
						<input ref={this.inputRef} type="text" placeholder="add todo here"></input>
						<button type="submit">Add todo</button>
					</form>
				</div>
				<div className="alert alert-success" style={{display:alertDiplay}}>
					{this.centralState.confirmation}
				</div>
			</div>
		);
	}
}

export default CSComponent(Creator)