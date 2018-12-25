# react-central-state
Easy to use global state for React
Shared along all components, and updatedes them in a tree-like manner.
## Installation

Requires react *16.4.0* or later

`npm install --save react-central-state`

## Getting Started

```javascript
import {StateComponent} from 'react-central-state'  
// or , if you want to operate the state on a non react-component class
import {StateHandler} from 'react-central-state'
```
Your component should extend `StateComponent`.

You can read and update the state pretty much like in react's default one:
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
**That's pretty much it.**


You can also subscribe callbacks to some property changes on the central state, either on a `StateComponent` or a `StateHandler`, with `addCentralStateListener` :

```javascript
this.callback = function(){
    let foo = this.centralState.foo;
    ...
};

//Call this method with a callback function and a property
//key name that will said function when it changes.
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


### How Does It Work?
The state manager keeps an updated tree of components hierarchy, by analyzing the mounting/updating order. 
When an update is done to the state, the tree is runned in a dfs lookup dispatching an update if needed.
<img alt="React-central-state update flow" src="docs/stateDiagram.png" align="center" />
