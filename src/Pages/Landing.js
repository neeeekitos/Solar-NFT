import React, { Component } from "react";
import * as THREE from "three";
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import BlockchainContext from "../context/BlockchainContext";



class ThreeScene extends Component {

    constructor(props) {
      super(props);
  
      this.state = {
        width: window.innerWidth,
        height: window.innerHeight,
        planets: [],
        raycaster: new THREE.Raycaster(),
        intersected: null,
        isSelected: false,
        balance: 0,
        accounts: null,
        showPopup: false,
        showNFTLoader: true,
        contract: null,
        clickPlanetID: 0,
      };
  
      this.planetArray = [];
      this.planetDictionary = {};
      this.GraphURL = "https://api.studio.thegraph.com/query/3145/ks/v0.0.15";
      this.mouse = new THREE.Vector2();
      this.intersected = null;
  
      this.updateDimensions = this.updateDimensions.bind(this);
      this.getXYPosition = this.getXYPosition.bind(this);
      this.getRandomLogInt = this.getRandomLogInt.bind(this);
      this.start = this.start.bind(this);
    
    }
  
    updateDimensions = () => {
      this.setState({ width: window.innerWidth, height: window.innerHeight });
    };

  
    async componentDidMount() {
  
      this.setState({ contract: this.context.instance });
      this.setState({ accounts: await this.context.accountsPromise }); 
  
      const width = this.state.width;
      const height = this.state.height;
      this.scene = new THREE.Scene();
      this.setState({ mouse: new THREE.Vector2() });
      //Add Renderer
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setClearColor("#000000");
      this.renderer.setSize(width, height);
      this.mount.appendChild(this.renderer.domElement);
      //add Camera
      this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      this.camera.position.z = 228;
      this.camera.position.y = 102;
      this.camera.rotation.x = -0.2;
      this.camera.lookAt(this.scene.position);

      var loader  = new THREE.TextureLoader();
      const texture = loader.load( "url(http://localhost:3000/skydome.png)" );
      this.scene.background = texture;

      //LIGHTS
      var lights = [];
      lights[0] = new THREE.PointLight(0x304ffe, 1, 0);
      lights[1] = new THREE.PointLight(0xffffff, 1, 0);
      lights[2] = new THREE.PointLight(0xffffff, 1, 0);
      lights[0].position.set(0, 200, 0);
      lights[1].position.set(100, 200, 100);
      lights[2].position.set(-100, -200, -100);
      this.scene.add(lights[0]);
      this.scene.add(lights[1]);
      this.scene.add(lights[2]);
  
      for (let i = 2; i < 6; i++) {
        const curve = new THREE.EllipseCurve(
          0, 0,            // ax, aY
          100 * Math.log(i), 100 * Math.log(i),           // xRadius, yRadius
          0, 2 * Math.PI,  // aStartAngle, aEndAngle
          false,            // aClockwise
          0                 // aRotation
        );
  
        const points = curve.getPoints(128);
        const geometry3 = new THREE.BufferGeometry().setFromPoints(points);
        geometry3.rotateX(-Math.PI / 2);
        const material3 = new THREE.LineBasicMaterial({ color: 0xCC0000 });
        const ellipse = new THREE.Line(geometry3, material3);
        this.scene.add(ellipse);
      }
      
      const graphResult = await this.queryPlanetsFromGraph();
      graphResult.data.transfers.map((transfer)=>{
        const radius = this.getRandomLogInt(2,5);
        this.createSphere(radius, transfer.id);
      });
      this.renderScene();
      //start animation
      this.start();
  
      window.addEventListener('resize', this.updateDimensions);
      window.addEventListener('mousemove', this.onMouseMove, false);
  
      window.addEventListener('click', this.onMouseClick, false);
      this.setState({ showPopup: true })
  
    }
  
    createSphere(radius, planetID) {

      let planet = {
        radius: radius,
        angle: Math.random() * 360,
        id: planetID,
        color: "#"+ Math.floor(Math.random()*16777215).toString(16),
      }

      const cubeGeometry = new THREE.SphereBufferGeometry(3, 16, 16);
      const material = new THREE.MeshPhongMaterial({
        color: planet.color
      });
      let cubeMesh = new THREE.Mesh(cubeGeometry, material);
  
      const posXY = this.getXYPosition(planet);
      cubeMesh.position.x = posXY.positionX;
      cubeMesh.position.z = posXY.positionZ;
      cubeMesh.position.y = 0;
      planet.mesh = cubeMesh;
      this.planetDictionary[planet.mesh.uuid] = planetID
      this.addPlanet(planet);
  
      cubeMesh.rotation.x = Math.random() * 2 * Math.PI;
      cubeMesh.rotation.y = Math.random() * 2 * Math.PI;
      cubeMesh.rotation.z = Math.random() * 2 * Math.PI;
  
      const scale = Math.random() + 0.5;
      cubeMesh.scale.x = scale;
      cubeMesh.scale.y = scale;
      cubeMesh.scale.z = scale;
  
      cubeMesh.rotation.x = Math.random() * 2 * Math.PI;
      cubeMesh.rotation.y = Math.random() * 2 * Math.PI;
      cubeMesh.rotation.z = Math.random() * 2 * Math.PI;
  
      this.scene.add(cubeMesh);
    }
  
    addPlanet = (planet) => {
      this.planetArray.push(planet);
      this.setState({ planets: planet }, () => {
        console.log(this.state.planets);
      });
    }
  
    getXYPosition = (planet) => {
      return {
        positionX: planet.radius * Math.cos(planet.angle),
        positionZ: planet.radius * Math.sin(planet.angle)
      }
    }
  
    getRandomLogInt = (min, max) => {
      min = Math.ceil(min);
      max = Math.floor(max);
      return 100 * Math.log(Math.floor(Math.random() * (max - min + 1)) + min);
    }
  
    start = () => {
      if (!this.frameId) {
        this.frameId = requestAnimationFrame(this.animate);
      }
    };
    stop = () => {
      cancelAnimationFrame(this.frameId);
    };
    animate = () => {
      for (let i = 0; i < this.planetArray.length; i++) {
        this.planetArray[i].angle = (this.planetArray[i].angle > 360) ? 0 : this.planetArray[i].angle + this.planetArray[i].radius / 100000;
        this.planetArray[i].mesh.position.x = this.getXYPosition(this.planetArray[i]).positionX;
        this.planetArray[i].mesh.position.z = this.getXYPosition(this.planetArray[i]).positionZ;
      }


      this.renderScene();
      this.frameId = window.requestAnimationFrame(this.animate);
  
    };
  
    queryPlanetsFromGraph = () => {
      const planetRequest = `
              query {
                transfers {
                  id
                }
              }
            `
      const client = new ApolloClient({
        uri: this.GraphURL,
        cache: new InMemoryCache()
      });
  
      const result = client.query({
        query: gql(planetRequest)
      })
        .then(data => {
          console.log("Subgraph data: ", data)
          return data;
        })
        .catch(err => { console.log("Error fetching data: ", err) });
      return result;
    }
    queryNftsFromGraph = () => {
      const nftRequest = `
            query {
              nftinplanets {
                planetid
                owner
                nftaddress
                nftid
              }
            }
            `
      const client = new ApolloClient({
        uri: this.GraphURL,
        cache: new InMemoryCache()
      });
  
      let receivedData;
      client.query({
        query: gql(nftRequest)
      })
        .then(data => {
          console.log("Subgraph data: ", data)
          receivedData = data;
        })
        .catch(err => { console.log("Error fetching data: ", err) });
      return receivedData;
    }
  
    renderScene = () => {
  
      if (this.renderer) this.renderer.render(this.scene, this.camera);
  
    };
    render() {
      return (
        <div className="App">
          <div ref={mount => {
            this.mount = mount
          }}
          />
        <div style={{position: 'absolute', top: '25%', margin: 'auto', left: '30%', right: '30%', textAlign: "center"}}>
            <h1 className="text-center" style={{color: "white"}}>Welcome to Planeth</h1>
            <a className="href" target="_self" href="/play" style={{paddingLeft: 15, paddingRight: 15, paddingTop: 10, paddingBottom: 5, fontSize: 20, textDecoration: 'none'}} >Play</a>
        </div>

        </div>
      )
    }
}
ThreeScene.contextType = BlockchainContext;
  
export default ThreeScene;
