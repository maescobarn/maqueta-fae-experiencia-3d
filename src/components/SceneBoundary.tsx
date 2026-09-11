import {Component,type ReactNode} from 'react';

/** Keep navigation available if the dynamic 3D module or renderer fails. */
export default class SceneBoundary extends Component<{children:ReactNode;onError:()=>void},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 componentDidCatch(){this.props.onError();}
 render(){return this.state.failed?null:this.props.children;}
}
