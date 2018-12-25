import {haveCommon} from './utils';

/**
 * Helper class, represents a node in an abstract tree.
 * Its purpose is to only dispatch updates on react
 * components if needed, increasing the overall perfomance 
 * of the central state management
 */
export class ComponentTreeNode{
	/**
	 * Creates a new instance.
	 * @constructor
	 * @param {stateComponent} component reference to react component
	 * @param {Array<string>} triggers , triggers that, when at least one
	 * matches the update's, dispatches an update
	 * @param {boolean=} isRoot whether or not the component is the root node
	 * of the entire tree
	 * @package
	 */
	constructor(component,triggers,isRoot){
		this._isRoot = isRoot || false;
		this._component = component || null;
		this._parent = null;
		this._childs = [];
		this._triggers = triggers || [];
		this._pendingUpdate = false;
	}
	
	/**
	 * Marks the component as pending an update,
	 * if at least one of its triggers was changed.
	 * Otherwise, forwards its children updating 
	 * decision  to them.
	 * @param {Array<string>} triggered , property keys that fired an update
	 * @param {boolean} force, whether or not to update regardless of the triggers
	 */
	prepareUpdate = function(triggered,force){
		if(!this._isRoot && (force || this._triggers.length === 0 ||
			haveCommon(this._triggers,triggered))){

			if(!this._isRoot){
				console.log("prepare update "+ this._component.constructor.name)
				console.log(triggered)
			}
			this._pendingUpdate = true;
		}else{
			for(var i =0; i < this._childs.length; i++){
				this._childs[i].prepareUpdate(triggered);
			}
		}
	}

	/**
	 * Flushes all updates in a DFS manner, according to 
	 * pending updates.
	 * If the component updated after calling prepareUpdate,
	 * the update is considered useless and canceled
	 */
	flushUpdate = function(){
		if(this._pendingUpdate === true){
			if(!this._isRoot){
				console.log("flush update "+ this._component.constructor.name+ " "+ this._pendingUpdate)
			}
			this._component._onGlobalStateUpdated_();
		}else{
			for(var i =0; i < this._childs.length; i++){
				this._childs[i].flushUpdate();
			}
		}
	}

	/**
	 * Callback for component updates
	 */
	onUpdate = function(){
		this._pendingUpdate = false;
	}

	/**
	 * @returns {Object} stateComponent instance
	 */
	getComponent = function(){
		return this._component;
	}

	/**
	 * @returns {Object} tree node's parent
	 */
	getParent = function(){
		return this._parent;
	}

	/**
	 * @param {int} idx index of the requested child
	 * @returns {Object} child at given index
	 */
	getChild = function(idx){
		if(idx > -1 && idx < this._childs.length){
			return this._childs[idx]
		}else{
			return null
		}
	}

	/**
	 * Adds a child not if not exists already.
	 * @param {Object}child  tree node child
	 */
	ensureChild = function(child){
		let idx = this._childs.indexOf(child);
		if(idx < 0){
			this._childs.push(child)
			child._parent = this;
		}
	}

	removeChild = function(child){
		let idx = this._childs.indexOf(child);
		if(idx > -1){
			this._childs.splice(idx,1)
		}	
		child._parent = null;
		return child;
	}
}
