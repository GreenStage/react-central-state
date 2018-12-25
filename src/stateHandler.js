/**
 * Created by Eduardo Gomes @ 8/10/2018
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this project
 *
**/

import {StateManager} from './stateManager.js';

/**
 * StateHandler instances can subscribe
 */
export class StateHandler{
	
	/**
	 * Constructs a new Handler and 
	 * declares the state manager to use.
	 * @constructor
	 */
	constructor(){
		this._stateManager_ = StateManager.Declare(this.useState());

		Object.defineProperty(this,'globalState',{
			writable: 'false',
			value: this._stateManager_._store
		})
	}

	useState(){
		return StateManager.defaultDescriptor;
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

	resetState(){ 
		return this._stateManager_.reset();
	}
}