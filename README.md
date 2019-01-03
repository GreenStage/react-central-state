# react-central-state
Easy to use global state for React.  
Shared along all components, updating them in a tree-like manner.  
No reducers, no actions, no providers.

## Installation

Requires react *16.4.0* or later

`npm install --save react-central-state`

## Getting Started

```javascript
import {StateComponent} from 'react-central-state'  
// or , if you want to operate the state on a non react-component class
import {StateHandler} from 'react-central-state'
```
Your components should now extend `StateComponent`.

Reading and updating the state is pretty much like in normal react:
```javascript
//Reading from state
this.centralState.SomeProperty
//Updating the state
this.setCentralState({foo:bar});
```

The only requirement it will add to your component is implementing the `triggers` method:
```javascript
/*StateComponent sub-classes need to implement this.
Should return an array of strings representing state's properties that should trigger an update on this component. Can be an empty array*/
triggers(){
    return['Foo','SomeOtherProperty','SomeOtherProperty2'];
}
```
<h3>
    <b>That's pretty much it.</b>
</h3>
&nbsp;

### Should Component Update?
`StateComponent` instances can intercept updates with the `onCentralStateUpdating` method:
```javascript
//Invoked before the central state changes
//It's like shouldComponentUpdate, but for central state changes.
//should return true if the component should re-render,or false otherwise. defaults to true.
onCentralStateUpdating(nextState){
    return true;
}
```

### Handling changes without triggering an update
You can also subscribe callbacks to central state properties changes, either on a `StateComponent` or a `StateHandler`, with `addCentralStateListener` :

```javascript
//callback receives a snapshot of the previous state.
this.callback = function(prevState){
    let foo = this.centralState.foo;
    ...
};

//Pass the callback, with a central state property key, 
//that when changes value will invoke it.
this.addCentralStateListener(this.callback,'foo');
```

You probably want to unsubscribe on unmounting:
```javascript
componentWillUnmount(){
    ...
    this.removeCentralStateListener(this.callback);
    ...  
}
```

## How Does It Work?
The store keeps updated info of the mounted components hierarchy, by analyzing their mounting/updating order. 
When  the state changes, the tree is runned in a dfs lookup dispatching updates to each component if needed.

<p align="center">
    <img alt="React-central-state update flow" src="docs/stateDiagram.png" />
</p>