import {haveCommon} from './utils';

class ComponentRefNode{
	constructor(component,mountingLevel){
		this.component = component;
		this.pendingUpdate = false;
		this.mountedLvl = 0;
	}

	onMounting(lvl){
		this.mountedLvl = lvl;
	}

	onUpdating(){
		this.pendingUpdate = false;
	}

	markForUpdate(){
		if(this.pendingUpdate === false && this.mountedLvl > 0 && 
			this.component.shouldComponentUpdate(this.component.props,this.component.state)){

			this.pendingUpdate = true;
			return true;
		}
		return false;
	}

	needToFlush(){
		return this.pendingUpdate === true && this.mountedLvl > 0;
	}

	flush(){
		this.component.forceUpdate();
	}
}

export class StoreInstantiable{
	constructor(){
		this._registeredListeners = [];
		this._keyRefsAssoc = {};
		this._mountingLevelCtr = 0;
		this._state = {};
		this._nextState = this._state;
	}

	setPartial(partialstate){
		let triggered = Object.keys(partialstate);
		let prevstate = this._state;

		this._nextState = Object.assign({},this._state);
		Object.assign(this._nextState,partialstate);

		let updatingCmpRefs = this.markComponentsForUpdate(triggered);
		
		this._state = this._nextState;

		this.notifyListeners(triggered,prevstate);
		this.flushComponentsUpdate(updatingCmpRefs);
	}

	addListener(callback,...triggers){
		if(typeof(callback) !== 'function'){
			throw new Error('Callback must be a function: ');
		}else{
			this._registeredListeners.push({callback,triggers});
		}
	}

	removeListener(callback){
		if(typeof(callback) !== 'function'){
			throw new Error('Callback must be a function');
		}else{
			let index = -1;
			for(let i = 0; i < this._registeredListeners.length;i++){
				if(this._registeredListeners[i].callback === callback){
					index = i;
				}
			}
			if (index > -1) {
				this._registeredListeners.splice(index, 1);
			}
		}
	}

	notifyListeners(triggered,prevState){
		for(let r of this._registeredListeners){
			if(haveCommon(r.triggers,triggered)){
				r.callback(prevState);
			}
		}
	}

	markComponentsForUpdate(triggered){
		let updatingComponents =[];

		for(let t of triggered){
			if(this._keyRefsAssoc[t] != null){
				for(let tn of this._keyRefsAssoc[t]){
					if(tn.markForUpdate() === true){
						updatingComponents.push(tn);
					}
				}
			}
		}
		return updatingComponents;
	}

	flushComponentsUpdate(updatingCmpRefs){
		//sort first, as parent components may re-render children.
		updatingCmpRefs.sort((c1,c2)=>{
			return c1.mountingLevel - c2.mountingLevel;
		});
		for(var c of updatingCmpRefs){
			if(c.needToFlush()){
				c.flush();
			}
		}
	}

	onComponentMounted(ref){
		ref.onMounting(this._mountingLevelCtr);
		this._mountingLevelCtr--;
	}

	onComponentUpdated(){
		this._mountingLevelCtr--;
	}

	onComponentUpdating(ref){
		ref.onUpdating();
		this._mountingLevelCtr++;
	}

	unRegisterComponent(ref,triggers){
		for(let t of triggers){
			if(this._keyRefsAssoc[t] == null || !Array.isArray(this._keyRefsAssoc[t])){
				continue;
			}
			let idx = this._keyRefsAssoc[t].indexOf(ref);
			if(idx !== -1){
				this._keyRefsAssoc[t].splice(idx,1);
				break;
			}
		}
	}

	registerComponent(component,triggers){
		let ref = new ComponentRefNode(component,0);
		for(let t of triggers){
			if(this._keyRefsAssoc[t] == null || !Array.isArray(this._keyRefsAssoc[t])){
				this._keyRefsAssoc[t] = [];
			}
			this._keyRefsAssoc[t].push(ref);
		}
		return ref;
	}
}

/**
 * Callback that takes a snapshot of the central state before updating as an argument
 * @callback centralStateListener
 * @param {Object} prevState
 */


const Store = new StoreInstantiable();
export default Store;
