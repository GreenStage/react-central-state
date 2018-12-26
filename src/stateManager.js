import {haveCommon} from './utils';
import {ComponentTreeNode} from './componentTreeNode';

var _stateManagers_ = {};

/**
 * State Manager Class
 * Mantains the state and dispatches callbacks calls
 * and components  updates if needed.
 */
export class StateManager{

	/**
	 * Constructs a new central state manager
	 * @constructor
	 * @param {State} other existing state to copy data from
	 * @private
	 */
	constructor(other){
		if(other){
			this._registeredListeners = other._registeredListeners || [];
			this._store = other.store || {};
			this._treeRoot = other._treeRoot || {};
		}else{
			this._registeredListeners = [];
			this._store = {};
			this._treeRoot = new ComponentTreeNode(null,[],true);
		}
		this._updatestack = [this._treeRoot];
		this._stacksize = 1;
	}


	/**
	 * Sets a portion of the central state
	 * @param {Object} partialstate object to copy keys and values
	 * to the central state store
	 * @package
	 */
	setPartial(partialstate){
		var triggered = Object.keys(partialstate);

		var prevstate = Object.assign({}, this._store);

		this._store = Object.assign(this._store,partialstate);

		this.markComponentsForUpdate(triggered,false);

		this.notifyListeners(triggered,prevstate);

		this.flushComponentsUpdate(prevstate);
	}


	/**
	 * Resets the store
	 * to the central state store
	 * @package
	 */
	reset(){
		let keys = Object.keys(this._store)
		for(let i = 0; i < keys.length; i++){
			delete this._store[keys[i]];
		}

		var old_store = this._store;
		this._store = {};
		this.markComponentsForUpdate([],true);
		this.flushComponentsUpdate(old_store);
	}


	/**
	 * Registers a new callback to be called when the store 
	 * performs a change to any of the keys belonging to triggers
	 * @param {centralStateListener} callback The callback function to register.
	 * @param {...string} triggers list of keys that will proc the callback
	 * when their value(s) change
	 * @package
	 */
	addListener(callback,triggers){
		if(typeof(callback) !== 'function'){
			throw new Error('Callback must be a function: ');
		}else{
			this._registeredListeners.push({callback,triggers});
		}
	}


	/**
	 * Removes a callback from the store
	 * @param {centralStateListener} callback The callback function to remove.
	 * when their value(s) change
	 * @package
	 */
	removeListener(callback){
		if(typeof(callback) !== 'function'){
			throw new Error('Callback must be a function');
		}else{
			var index = -1;
			for(var i = 0; i < this._registeredListeners.length;i++){
				if(this._registeredListeners[i].callback === callback){
					index = i;
				}
			}
			if (index > -1) {
				this._registeredListeners.splice(index, 1);
			}
		}
	}

	/**
	 * Notifies registered callbacks, if they subscribe to 
	 * at least one of the changed store attributes.
	 * @param {Object} triggered - Changed properties
	 * @param {Function} prevState - State store before updating
	 * @private
	 */
	notifyListeners(triggered,prevState){
		for(var r of this._registeredListeners){
			if(haveCommon(r.triggers,triggered)){
				r.callback(prevState);
			}
		}
	}

	/**
	 * Goes trough the update tree marking relevant components for 
	 * update
	 * @param {Array<string>} triggered Triggered properties keys
	 * @param {boolean=} all True if the update should trigger 
	 * all components updating methods regardless of the passed
	 * triggered properties
	 * @private
	 */
	markComponentsForUpdate(triggered,all){
		var _all = typeof(all) === 'boolean'? all: false
		this._treeRoot.prepareUpdate(triggered,_all);
	}


	/**
	 * Rolls down the tree updating marked components
	 * @private
	 */
	flushComponentsUpdate(prevState){
		this._treeRoot.flushUpdate(prevState);
	}


	/**
	 * Should be called after a component is mounted
	 * Removes the component from the updating stack
	 * and adds it to its parent's sub-tree
	 * @param {ComponentTreeNode} treeNode node of the mounted component 
	 * @package
	 */
	onComponentMounted(treeNode){
		var idx = this._updatestack.indexOf(treeNode);
		if(idx < 1){
			throw new Error("Node not on stack.")
		}
		this._updatestack[idx-1].ensureChild(treeNode);
		this._updatestack.splice(idx,1)
		this._stacksize --;
	}


	/**
	 * Should be called after a component is updated
	 * Removes the component from the updating stack
	 * @param {ComponentTreeNode} treeNode node of the updated component 
	 * @package
	 */
	onComponentUpdated(treeNode){
		var idx = this._updatestack.indexOf(treeNode);
		if(idx < 1){
			throw new Error("Node not on stack.")
		}
		this._updatestack.splice(idx,1)
		this._stacksize --;
	}


	/**
	 * Should be called before a component updates
	 * Adds the component to the updating stack
	 * @param {ComponentTreeNode} treeNode node of the updating component 
	 * @package
	 */
	onComponentUpdating(treeNode){
		//
		treeNode.onUpdate();
		this._updatestack[this._stacksize++] = treeNode;
	}


	/**
	 * Adds a component to the update tree, for a possible update
	 * when at least one of the triggers properties changes
	 * @param {Object} component, component to register
	 * @param {Array<string>} triggers trigger keys that may proc
	 * @return {ComponentTreeNode} the branch created
	 * an update on the component
	 * @package
	 */
	registerComponent(component,triggers){
		return new ComponentTreeNode(component,triggers)
	}

	/**
	 * Removes a component from the updating tree.
	 * @param {Object} component, component to remove	
	 * @package
	 */
	unRegisterComponent(branch){
		var parent = branch.getParent();
		if(parent != null){
			parent.removeChild(branch);
		}
	}

	/**
	 * Declares the intention of using a state
	 * if the instance does not exists, it will be created.
	 * @param {string} descriptor, descriptor for the declaring state
	 * @returns {StateManager} a declared StateManager
	 */
	static Declare(descriptor){
		if(typeof(descriptor) !== 'string'){
			throw new Error("Can not declare a state manager without a descriptor string");
		}
		if(_stateManagers_[descriptor]==null){
			_stateManagers_[descriptor] = new StateManager();
		}
		return _stateManagers_[descriptor];
	}

	/**
	 * Return the state for the given descriptor
	 * @param {string} descriptor
	 * @returns {StateManager} the instance requested
	 */
	static GetState(descriptor){
		return _stateManagers_[descriptor] || null
	}
}

StateManager.defaultDescriptor  = "default"


/**
 * Callback that takes a snapshot of the central state before updating as an argument
 * @callback centralStateListener
 * @param {Object} prevState
 */