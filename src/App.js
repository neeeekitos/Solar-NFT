import React, {Component, useLayoutEffect} from "react";
import * as THREE from "three";
import { MTLLoader, OBJLoader } from "three-obj-mtl-loader";
import OrbitControls from "three-orbitcontrols";
class ThreeScene extends Component {

  constructor(props) {
    super(props);

    this.state = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    this.updateDimensions = this.updateDimensions.bind(this);

  }

  updateDimensions = () => {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  };

  componentDidMount() {
    const width = this.state.width;
    const height = this.state.height;
    this.scene = new THREE.Scene();
    //Add Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor("#263238");
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);
    //add Camera
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 8;
    this.camera.position.y = 5;
    //Camera Controls
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
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
    //ADD Your 3D Models here
    const cubeGeometry = new THREE.SphereGeometry(3);
    const material = new THREE.MeshBasicMaterial({
      color: '#6ab056',
      wireframe: true
    });
    this.cubeMesh = new THREE.Mesh(cubeGeometry, material);
    this.scene.add(this.cubeMesh);

    var geometry2 = new THREE.CircleGeometry(36, 128);
    geometry2.rotateX(-Math.PI / 2);
    var material2 = new THREE.LineBasicMaterial( { color: 0xCC0000 } );
    var mesh2 = new THREE.Line( geometry2, material2 );


    this.renderScene();
    //start animation
    this.start();

    window.addEventListener('resize', this.updateDimensions);

  }
  start = () => {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate);}
  };
  stop = () => {
    cancelAnimationFrame(this.frameId);
  };
  animate = () => {
//Animate Models Here
//ReDraw Scene with Camera and Scene Object
    this.renderScene();
    this.frameId = window.requestAnimationFrame(this.animate);
  };
  renderScene = () => {
    if (this.renderer) this.renderer.render(this.scene, this.camera);
  };

  render() {
    return (<div
        style={{ width: '100%', height: "800px" }}
        ref={mount => { this.mount = mount}}
    />)
  }}
export default ThreeScene;
