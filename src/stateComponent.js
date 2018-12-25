/**
 * Created by Eduardo Gomes @ 8/10/2018
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this project
 *
**/

import React from 'react';
import {StateManager} from './stateManager.js';

export class StateComponent extends React.Component{

	constructor(props){
		super(props)

		this._stateManager_ = StateManager.Declare(this.useState());

		Object.defineProperty(this,'globalState',{
			writable: 'false',
			value: this._stateManager_._store
		});

		this._stateBranch_ = this._stateManager_.registerComponent(this,this.triggers());
			

		
		/*Copy current methods prototypes*/
		this.childClass_componentDidMount = this.__proto__.componentDidMount;
		this.childClass_componentWillUnmount = this.__proto__.componentWillUnmount;
		this.childClass_componentDidUpdate = this.__proto__.componentDidUpdate;
		this.childClass_render = this.__proto__.render
		
		/*Re-declare relevant react element life-cycle methods here to
		ensure no react component child class overrote essential instructions*/
		this.componentDidMount = function(){
			this._stateManager_.onComponentMounted(this._stateBranch_);

			this._ismounted = true;
			if(this.childClass_componentDidMount){
				this.childClass_componentDidMount();
			}
		}

		this.componentWillUnmount = function(){
			if(this.childClass_componentWillUnmount){
				this.childClass_componentWillUnmount();
			}
			this._ismounted = false;
			this._stateManager_.unRegisterComponent(this._stateBranch_);
		}
		
		this.componentDidUpdate = (prevProps, prevState, snapshot) =>{
			this._stateManager_.onComponentUpdated(this._stateBranch_);

			if(this.childClass_componentDidUpdate){
				this.childClass_componentDidUpdate(prevProps, prevState, snapshot);
			}
		}

		this.render = function(){
			this._stateManager_.onComponentUpdating(this._stateBranch_);
			return this.childClass_render()
		}
	}

	_updateFromGState_(){
		if(this._ismounted === true){
			this.forceUpdate();
		}
	};

	useState(){
		return StateManager.defaultDescriptor;
	}

	triggers(){
		return []
	}

	isMounted(){
		return this._ismounted;
	}

	resetState(){
		return this._stateManager_.reset();
	}

	setCentralState(partialstate){
		return this._stateManager_.setPartial(partialstate);
	}

	addCentralStateListener(callback,...triggers){
		return this._stateManager_.addListener(callback,triggers)
	}

	removeCentralStateListener(callback){
		return this._stateManager_.removeListener(callback)
	}

	/*Dummy methods to preserve inheritance chain*/
	componentDidMount(){}
	componentWillUnmount(){}
	componentDidUpdate(prevProps, prevState, snapshot){}
}