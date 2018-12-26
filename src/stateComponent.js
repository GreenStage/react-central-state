import React from 'react';
import {StateManager} from './stateManager.js';

/**
 * A react component that also operates and
 * updates with certain central state changes.
 */
export class StateComponent extends React.Component{

	/**
	 * @constructor
	 * Creates and registers the component on the 
	 * central state operators.
	 * @param {} props 
	 */
	constructor(props){
		super(props)

		//Tell the state manager which state are we operating in.
		this._stateManager_ = StateManager.Declare(this.useState());

		//For easy access
		Object.defineProperty(this,'centralState',{
			writable: 'false',
			value: this._stateManager_._store
		});

		this._triggers_ = this.triggers();

		//Request a tree node to notify changes
		this._stateTreeNode_ = this._stateManager_.registerComponent(this,this._triggers_);
			
		//Copy current overwritten methods prototypes
		this.childClass_componentDidMount = this.__proto__.componentDidMount;
		this.childClass_componentWillUnmount = this.__proto__.componentWillUnmount;
		this.childClass_componentDidUpdate = this.__proto__.componentDidUpdate;
		this.childClass_render = this.__proto__.render
		
		//Wrapp all overwritten methods with essential instructions
		//required to the proper work of the central state
		this.componentDidMount = function(){
			//notify central state this tree node was mounted.
			this._stateManager_.onComponentMounted(this._stateTreeNode_);

			if(this.childClass_componentDidMount){
				this.childClass_componentDidMount();
			}
		}

		this.componentWillUnmount = function(){
			if(this.childClass_componentWillUnmount){
				this.childClass_componentWillUnmount();
			}
			//remove this node from the cental state components tree.
			this._stateManager_.unRegisterComponent(this._stateTreeNode_);
		}
		
		this.componentDidUpdate = function(prevProps, prevState, snapshot){
			//notify central state this tree node finish updating.
			this._stateManager_.onComponentUpdated(this._stateTreeNode_);

			if(this.childClass_componentDidUpdate){
				this.childClass_componentDidUpdate(prevProps, prevState, snapshot);
			}
		}

		this.render = function(){
			//notify central state this tree node is updating.
			this._stateManager_.onComponentUpdating(this._stateTreeNode_);
			return this.childClass_render()
		}

		this._onCentralStateUpdated_ = function(prevState){
			//Give the child class an opportunity to cancel the
			//component update
			if(this.onCentralStateUpdated(prevState) !== false){
				this.forceUpdate();
			}
		}
	}

	/**
	 * @final
	 * @param {Object} partialstate object with keys and
	 * properties to assign to the current state
	 */
	setCentralState(partialstate){
		this._stateManager_.setPartial(partialstate);
	}

	/**
	 * @final
	 * Adds a callback to be called when at least one
	 * of the state properties with its key belonging 
	 * to triggers changes
	 * @param {centralStateListener} callback function to 
	 * call when the change occurs 
	 * @param {...string} triggers properties keys that 
	 * will trigger the callback on changing
	 */
	addCentralStateListener(callback,...triggers){
		this._stateManager_.addListener(callback,triggers)
	}

	/**
	 * @final
	 * Removes a callback if it is registered.
	 * @param {centralStateListener} callback function registered
	 * with addCentralStateListener
	 */
	removeCentralStateListener(callback){
		this._stateManager_.removeListener(callback)
	}

	/**
	 * @final
	 * Resets the state properties
	 */
	resetCentralState(){ 
		this._stateManager_.reset();
	}

	
	/**
	 * @returns {string} the statekey refering to the
	 * declared state
	 * The component should overwrite this method if
	 * it wants to operate in central state other than
	 * the dafault one
	 */
	useState(){
		return StateManager.defaultDescriptor;
	}


	/**
	 * Called after the central state updates with relevant
	 * changes on the properties referenced by triggers
	 * method.
	 * @param {Object} prevState snapshot of the central state before updating.
	 * @returns {boolean} If the component should update 
	 * with this changes. Defaults to true.
	 */
	onCentralStateUpdated(prevState){
		return true
	};


	/**
	 * IMPLEMENTATION REQUIRED
	 * Should return an array of strings representing
	 * state's properties that should trigger
	 * an update on this component.
	 * @returns {Array<string>} properties that trigger an update
	 * update when changed.
	 */
	triggers(){
		throw new Error("No triggers() function implemented");
	}

}	