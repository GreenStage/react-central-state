import Store from './csstore.js';

/**
 * Gives a component access to central state
 * @param {React.Component} wrappedComponent 
 * @return {Object} CSComponent
 */
export function CSComponent(wrappedComponent){

	if(!wrappedComponent.prototype.isReactComponent){
		throw new Error('Component should extend React.Component.');
	}

	Object.defineProperty(wrappedComponent.prototype,'centralState',{
		get: ()=>{return Store._state}
	});
	
	var wrapper = class extends wrappedComponent{
		constructor(props){
			super(props);
			if( !this.updateWith || typeof(this.updateWith) !== 'function'){
				throw new Error('CSComponents need to implement the updateWith() method.');
			}

			this.triggers = this.updateWith();
			if(!Array.isArray(this.triggers)){
				throw new Error('updateWith() method should return an array of property keys.');
			}

			this.storeRegRef = Store.registerComponent(this,this.triggers);
		}	

		componentDidMount(){
			Store.onComponentMounted(this.storeRegRef);
			if(super.componentDidMount){
				super.componentDidMount();
			}
		}

		componentWillUnmount(){
			if(super.componentWillUnmount){
				super.componentWillUnmount();
			}
			Store.unRegisterComponent(this.storeRegRef,this.triggers);
		}
		
		componentDidUpdate(prevProps, prevState, snapshot){
			Store.onComponentUpdated();
			if(super.componentDidUpdate){
				super.componentDidUpdate(prevProps, prevState, snapshot);
			}
		}

		shouldComponentUpdate(nextProps,nextState){
			if(super.shouldComponentUpdate){
				return super.shouldComponentUpdate(nextProps,nextState,Store._nextState);
			}
			return true;
		}

		render(){
			Store.onComponentUpdating(this.storeRegRef);
			return super.render();
		}

		addCentralStateListener(callback,...triggers){
			Store.addListener(callback,...triggers);
		}

		removeCentralStateListener(callback){
			Store.removeListener(callback)
		}

		setCentralState(partialstate){
			Store.setPartial(partialstate);
		}
	}

	wrapper.displayName = wrappedComponent.displayName ||  wrappedComponent.name;
	return wrapper;
}