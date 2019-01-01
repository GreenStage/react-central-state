import React from 'react';
import {StateComponent} from 'react-central-state';

export class Display extends StateComponent {
	constructor(props){
		super(props);

		this.addCentralStateListener((prevstate)=>{
		
			let todos = this.centralState.todos || [];
			todos.unshift(this.centralState.new_todo);
			this.todoListener = this.setCentralState({
				todos,
				confirmation: this.centralState.new_todo +" added!"
			});
		},"new_todo");
	}

	componentWillUnmount(){
		this.removeCentralStateListener(this.todoListener);
	}

	removeTodo(idx){
		let todos = this.centralState.todos;
		let removed = todos.splice(idx,1);
		if(removed.length > 0){
			this.setCentralState({
				todos,
				confirmation: removed[0] + " was removed"
			});
		}
	}

	triggers(){
		return ["todos"];
	}

	render() {
		let todos = this.centralState.todos || [];
		return (<div className="displayTodos col-sm-6">
			{todos.map((todo,idx)=>(
				<div key={idx} className="alert alert-info cur" onClick={()=>this.removeTodo(idx)}>
					{todo}
				</div>
			))}
		</div>);
	}
}
