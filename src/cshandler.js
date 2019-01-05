import Store from './csstore.js';

/**
 * StateHandler instances can listen and change the current
 * central state, as well as provide callbacks for its changes.
 */
export class CSHandler{
	
	/**
	 * Constructs a new Handler and 
	 * declares a store instance to use.
	 * @constructor
	 */
	constructor(){
		//For easy access
		Object.defineProperty(this,'centralState',{
			get: ()=>{return Store._state}
		});
	}

	/**
	 * @param {Object} partialstate object with keys and
	 * properties to assign to the current state
	 */
	setCentralState(partialstate){
		Store.setPartial(partialstate);
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
		Store.addListener(callback,...triggers)
	}

	/**
	 * Removes a callback if it is registered.
	 * @param {Function} callback function registered
	 * with addCentralStateListener
	 */
	removeCentralStateListener(callback){
		Store.removeListener(callback)
	}
}