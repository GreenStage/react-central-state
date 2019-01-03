import {Store} from './store.js';

/**
 * StateHandler instances can listen and change the current
 * central state, as well as provide callbacks for its changes.
 */
export class StateHandler{
	
	/**
	 * Constructs a new Handler and 
	 * declares a store instance to use.
	 * @constructor
	 */
	constructor(){
		this._store_ = Store.Declare(this.useState());

		//For easy access
		Object.defineProperty(this,'centralState',{
			get: ()=>{return this._store_._state}
		});
	}

	/**
	 * @returns {string} the statekey refering to the
	 * declared state
	 */
	useState(){
		return Store.defaultDescriptor;
	}

	/**
	 * @param {Object} partialstate object with keys and
	 * properties to assign to the current state
	 */
	setCentralState(partialstate){
		this._store_.setPartial(partialstate);
	}

	/**
	 * Adds a callback to be called when at least one
	 * of the state properties with its key belonging 
	 * to triggers changes
	 * @param {Function} callback function to 
	 * call when the change occurs 
	 * @param {...string} triggers properties keys that 
	 * will trigger the callback on changing
	 */
	addCentralStateListener(callback,...triggers){
		this._store_.addListener(callback,triggers)
	}

	/**
	 * Removes a callback if it is registered.
	 * @param {Function} callback function registered
	 * with addCentralStateListener
	 */
	removeCentralStateListener(callback){
		this._store_.removeListener(callback)
	}

	/**
	 * Resets the state properties
	 */
	resetCentralState(){ 
		this._store_.reset();
	}
}