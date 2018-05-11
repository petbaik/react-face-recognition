import React, { Component } from 'react';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import Particles from 'react-particles-js';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import './App.css';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Clarifai from 'clarifai';
const app = new Clarifai.App({
  apiKey: 'a85df4c3318a4bc8b115d02efc8d9a6d'
});

const particlesOptions = {
  particles: {
    number: {
      value:30,
      density:{
        enable:true,    
        value_area:800
      }
    }
  }
};
const ininitalSate = {
      input:'',
      imageUrl:'',
      box:{},
      route:'signin',
      isSignedIn:false,
      user:{
          id:'',
          name:'',
          email:'',
          entries:0,
          joined:''
      }
}
class App extends Component {
  constructor(){
    super();
    this.state = ininitalSate;
  }

  loadUser = (data) => {
    this.setState({user:{
      id:data.id,
      name:data.name,
      email:data.email,
      entries:data.entries,
      joined:data.joined
    }});
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    
    this.setState({box: box});
  }

  
  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onSubmit = () => {

      this.setState({imageUrl:this.state.input});
      
      app.models.predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
      .then(response => {
        if(response){
          fetch('https://react-face-recognition-api.herokuapp.com/image',{
              method:'post',
              headers:{'Content-Type':'application/json'},
              body:JSON.stringify({
                id:this.state.user.id
              })
          })
          .then(response => response.json())
          .then(count => {
            this.setState(Object.assign(this.state.user,{entries:count}));
          })

        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch();

  }

  onRouteChange = (route) =>{
    if(route === 'signout'){
      this.setState(ininitalSate);
    }else if(route === 'home'){
      this.setState({route:''});
    }
    this.setState({route:route});
  }

  render() {
    const {imageUrl, box,isSignedIn,route} = this.state;
    return (
      <div className="App">
        <Particles className='particles'
              params={particlesOptions}

            />
        <Navigation onRouteChange={this.onRouteChange} isSignedIn={isSignedIn}/>
       { route === 'home'

         ?  <div> <Logo />
        <Rank name={this.state.user.name} entries={this.state.user.entries}/>
        <ImageLinkForm 
          onInputChange={this.onInputChange} 
          onSubmit={this.onSubmit}/>
         <FaceRecognition box={box} imageUrl={imageUrl} />
         </div>

        
         : (
          route === "signin" 
            ? <Signin loadUser={this.loadUser} onRouteChange = {this.onRouteChange}/>
            : <Register loadUser={this.loadUser} onRouteChange = {this.onRouteChange}/>
          )

          
       }
      </div>
    );
  }
}

export default App;
