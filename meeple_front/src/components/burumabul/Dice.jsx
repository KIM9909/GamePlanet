import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { mergeVertices, mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';



const Dice = ({ onComplete ,onClose }) => {
    const canvasRef = useRef(null);
    const [score, setScore] = useState('');
    const [totalScore, setTotalScore] = useState(0);
    
    const params = {
        numberOfDice: 2,
        segments: 40,
        edgeRadius: 0.1,
        notchRadius: 0.15,
        notchDepth: 0.09,
    };

    const gameState = useRef({
        renderer: null,
        scene: null,
        camera: null,
        diceMesh: null,
        physicsWorld: null,
        diceArray: [],
    });

    const createBoxGeometry = () => {
        let boxGeometry = new THREE.BoxGeometry(1, 1, 1, params.segments, params.segments, params.segments);
        const positionAttr = boxGeometry.attributes.position;
        const subCubeHalfSize = 0.5 - params.edgeRadius;

        for (let i = 0; i < positionAttr.count; i++) {
            let position = new THREE.Vector3().fromBufferAttribute(positionAttr, i);
            const subCube = new THREE.Vector3(
                Math.sign(position.x),
                Math.sign(position.y),
                Math.sign(position.z)
            ).multiplyScalar(subCubeHalfSize);
            const addition = new THREE.Vector3().subVectors(position, subCube);

            // Edge rounding logic
            if (Math.abs(position.x) > subCubeHalfSize && 
                Math.abs(position.y) > subCubeHalfSize && 
                Math.abs(position.z) > subCubeHalfSize) {
                addition.normalize().multiplyScalar(params.edgeRadius);
                position = subCube.add(addition);
            } else if (Math.abs(position.x) > subCubeHalfSize && 
                      Math.abs(position.y) > subCubeHalfSize) {
                addition.z = 0;
                addition.normalize().multiplyScalar(params.edgeRadius);
                position.x = subCube.x + addition.x;
                position.y = subCube.y + addition.y;
            } else if (Math.abs(position.x) > subCubeHalfSize && 
                      Math.abs(position.z) > subCubeHalfSize) {
                addition.y = 0;
                addition.normalize().multiplyScalar(params.edgeRadius);
                position.x = subCube.x + addition.x;
                position.z = subCube.z + addition.z;
            } else if (Math.abs(position.y) > subCubeHalfSize && 
                      Math.abs(position.z) > subCubeHalfSize) {
                addition.x = 0;
                addition.normalize().multiplyScalar(params.edgeRadius);
                position.y = subCube.y + addition.y;
                position.z = subCube.z + addition.z;
            }

            // Notch creation functions
            const notchWave = (v) => {
                v = (1 / params.notchRadius) * v;
                v = Math.PI * Math.max(-1, Math.min(1, v));
                return params.notchDepth * (Math.cos(v) + 1);
            };
            const notch = (pos) => notchWave(pos[0]) * notchWave(pos[1]);

            const offset = 0.23;

            // Apply notches for dice faces
            if (position.y === 0.5) {
                position.y -= notch([position.x, position.z]);
            } else if (position.x === 0.5) {
                position.x -= notch([position.y + offset, position.z + offset]);
                position.x -= notch([position.y - offset, position.z - offset]);
            } else if (position.z === 0.5) {
                position.z -= notch([position.x - offset, position.y + offset]);
                position.z -= notch([position.x, position.y]);
                position.z -= notch([position.x + offset, position.y - offset]);
            } else if (position.z === -0.5) {
                position.z += notch([position.x + offset, position.y + offset]);
                position.z += notch([position.x + offset, position.y - offset]);
                position.z += notch([position.x - offset, position.y + offset]);
                position.z += notch([position.x - offset, position.y - offset]);
            } else if (position.x === -0.5) {
                position.x += notch([position.y + offset, position.z + offset]);
                position.x += notch([position.y + offset, position.z - offset]);
                position.x += notch([position.y, position.z]);
                position.x += notch([position.y - offset, position.z + offset]);
                position.x += notch([position.y - offset, position.z - offset]);
            } else if (position.y === -0.5) {
                position.y += notch([position.x + offset, position.z + offset]);
                position.y += notch([position.x + offset, position.z]);
                position.y += notch([position.x + offset, position.z - offset]);
                position.y += notch([position.x - offset, position.z + offset]);
                position.y += notch([position.x - offset, position.z]);
                position.y += notch([position.x - offset, position.z - offset]);
            }

            positionAttr.setXYZ(i, position.x, position.y, position.z);
        }

        boxGeometry.deleteAttribute('normal');
        boxGeometry.deleteAttribute('uv');
        boxGeometry = mergeVertices(boxGeometry);
        boxGeometry.computeVertexNormals();

        return boxGeometry;
    };

    const createInnerGeometry = () => {
        const baseGeometry = new THREE.PlaneGeometry(
            1 - 2 * params.edgeRadius,
            1 - 2 * params.edgeRadius
        );
        const offset = 0.48;
        return mergeGeometries([
            baseGeometry.clone().translate(0, 0, offset),
            baseGeometry.clone().translate(0, 0, -offset),
            baseGeometry.clone().rotateX(0.5 * Math.PI).translate(0, -offset, 0),
            baseGeometry.clone().rotateX(0.5 * Math.PI).translate(0, offset, 0),
            baseGeometry.clone().rotateY(0.5 * Math.PI).translate(-offset, 0, 0),
            baseGeometry.clone().rotateY(0.5 * Math.PI).translate(offset, 0, 0),
        ], false);
    };

    const createDiceMesh = () => {
        const boxMaterialOuter = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            shininess: 60,
            specular: 0x444444,
        });
        const boxMaterialInner = new THREE.MeshStandardMaterial({
            color: 0x000000,
            roughness: 0,
            metalness: 1,
            side: THREE.DoubleSide,
        });

        const diceMesh = new THREE.Group();
        const innerMesh = new THREE.Mesh(createInnerGeometry(), boxMaterialInner);
        const outerMesh = new THREE.Mesh(createBoxGeometry(), boxMaterialOuter);
        outerMesh.castShadow = true;
        diceMesh.add(innerMesh, outerMesh);

        return diceMesh;
    };

    const createDice = () => {
        const mesh = gameState.current.diceMesh.clone();
        gameState.current.scene.add(mesh);

        mesh.scale.set(1.8, 1.8, 1.8)

        const body = new CANNON.Body({
            mass: 0.3,
            shape: new CANNON.Box(new CANNON.Vec3(0.9, 0.9, 0.9)),
            sleepTimeLimit: 0.02,
            linearDamping: 0.3,      // 추가: 운동 감쇠
            angularDamping: 0.3,     // 추가: 회전 감쇠
            material: new CANNON.Material()
        });
        gameState.current.physicsWorld.addBody(body);

        return { mesh, body };
    };

    const addDiceEvents = (dice) => {
        dice.body.addEventListener('sleep', (e) => {
            dice.body.allowSleep = false;

            const euler = new CANNON.Vec3();
            e.target.quaternion.toEuler(euler);

            const eps = 0.1;
            const isZero = (angle) => Math.abs(angle) < eps;
            const isHalfPi = (angle) => Math.abs(angle - 0.5 * Math.PI) < eps;
            const isMinusHalfPi = (angle) => Math.abs(0.5 * Math.PI + angle) < eps;
            const isPiOrMinusPi = (angle) =>
                Math.abs(Math.PI - angle) < eps || Math.abs(Math.PI + angle) < eps;

            if (isZero(euler.z)) {
                if (isZero(euler.x)) {
                    showRollResults(1);
                } else if (isHalfPi(euler.x)) {
                    showRollResults(4);
                } else if (isMinusHalfPi(euler.x)) {
                    showRollResults(3);
                } else if (isPiOrMinusPi(euler.x)) {
                    showRollResults(6);
                } else {
                    dice.body.allowSleep = true;
                }
            } else if (isHalfPi(euler.z)) {
                showRollResults(2);
            } else if (isMinusHalfPi(euler.z)) {
                showRollResults(5);
            } else {
                // landed on edge => wait to fall on side and fire the event again
                dice.body.allowSleep = true;
            }
        });
    };

    const showRollResults = (newScore) => {
        setScore(prev => prev === '' ? `${newScore}` : `${prev} + ${newScore}`);
        setTotalScore(prevTotalScore => prevTotalScore + newScore)

    };
    

    const throwDice = () => {
        setScore('');
        setTotalScore(0);
        
        const centerX = 0;
        const centerY = 0;


        // 화면 범위 내에 주사위가 던져지도록 제한
        const boundary = 9; // 범위 값 (화면의 제한을 설정)

        // 화면의 가로 세로 비율
        const aspectRatio = canvasRef.current.clientWidth / canvasRef.current.clientHeight; 

        // 카메라 시야 범위 계산
        const cameraHeight = 2 * Math.tan(THREE.MathUtils.degToRad(gameState.current.camera.fov / 2)) * gameState.current.camera.position.z;
        const cameraWidth = cameraHeight * aspectRatio;

        // 던져지는 위치를 화면 크기에 따라 제한
        const boundaryX = cameraWidth / 2 - 2; // 여유 공간 추가
        const boundaryY = cameraHeight / 2 - 2;


        gameState.current.diceArray.forEach((d, dIdx) => {
            d.body.velocity.setZero();
            d.body.angularVelocity.setZero();

            const xPos = centerX + (Math.random() -0.5) * 2 * boundaryX;
            const yPos = centerY + (Math.random() -0.5) * 2 * boundaryY;

            // 주사위의 위치를 화면 범위 내에만 설정
            d.body.position = new CANNON.Vec3(
              centerX,
              dIdx * 1.5,
              centerY
            );
            d.mesh.position.copy(d.body.position);

            d.mesh.rotation.set(
                2 * Math.PI * Math.random(),
                0,
                2 * Math.PI * Math.random()
            );
            d.body.quaternion.copy(d.mesh.quaternion);

            // 랜덤한 방향 계산
            const angle = Math.random() * Math.PI * 2;
            const force = 2 + Math.random() * 1.5;

            d.body.applyImpulse(
                new CANNON.Vec3(
                    Math.cos(angle) * force,
                    force * 1.5,
                    Math.sin(angle) * force
                ),
                new CANNON.Vec3(0, 0, 0.2)
            );

            d.body.allowSleep = true;
        });
    };

    const initPhysics = () => {
        gameState.current.physicsWorld = new CANNON.World({
            allowSleep: true,
            gravity: new CANNON.Vec3(0, -80, 0),
        });
        gameState.current.physicsWorld.defaultContactMaterial.restitution = 0.3;
        gameState.current.physicsWorld.defaultContactMaterial.contactEquationStiffness = 1e9;
        gameState.current.physicsWorld.defaultContactMaterial.contactEquationRelaxation = 4;
    };

    const createBoundaries = () => {
        const wallSize = 10;
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(wallSize * 2, wallSize * 2),
            new THREE.ShadowMaterial({
                opacity: 0,
            })
        );
        // floor.receiveShadow = true;
        floor.position.y = -7;
        floor.quaternion.setFromAxisAngle(new THREE.Vector3(-1, 0, 0), Math.PI * 0.5);
        gameState.current.scene.add(floor);

        const floorBody = new CANNON.Body({
            type: CANNON.Body.STATIC,
            shape: new CANNON.Plane(),
        });
        floorBody.position.copy(floor.position);
        floorBody.quaternion.copy(floor.quaternion);
        gameState.current.physicsWorld.addBody(floorBody);

        // 벽 생성
        const wallGeometry = new THREE.BoxGeometry(0.1, wallSize * 2, wallSize * 2);
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0
        });

        // 벽의 물리적 크기 = 시각적 크기
        const wallShape = new CANNON.Box(new CANNON.Vec3(0.05, wallSize, wallSize));

        
        // 앞쪽 벽 -> 화면 밖으로 나가지 않게
        const wallFront = new THREE.Mesh(wallGeometry, wallMaterial);
        wallFront.rotation.y = Math.PI * 0.5;
        wallFront.position.set(0, 3, wallSize - 0.5);
        gameState.current.scene.add(wallFront);

        const wallFrontBody = new CANNON.Body({
            type: CANNON.Body.STATIC,
            shape: wallShape
        });
        wallFrontBody.position.copy(wallFront.position);
        wallFrontBody.quaternion.copy(wallFront.quaternion);
        gameState.current.physicsWorld.addBody(wallFrontBody);
    };
    

    const initScene = () => {
        const { current: state } = gameState;
        
      
        state.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            canvas: canvasRef.current,
        });
        state.renderer.shadowMap.enabled = true;
        state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        state.scene = new THREE.Scene();

        state.camera = new THREE.PerspectiveCamera(
            50,
            canvasRef.current.clientWidth / canvasRef.current.clientHeight,
            0.1,
            1000
        );
        state.camera.position.set(0, 10, 0).multiplyScalar(4);
        state.camera.lookAt(0, 0, 0);
        state.camera.up.set(0, 0, -1);
        state.camera.fov = 45;

        const ambientLight = new THREE.AmbientLight(0xffffff, 2.8);
        state.scene.add(ambientLight);
        
        const topLight = new THREE.PointLight(0xffffff, 2);
        topLight.position.set(10, 15, 3);
        topLight.castShadow = true;
        topLight.shadow.mapSize.width = 2048;
        topLight.shadow.mapSize.height = 2048;
        topLight.shadow.camera.near = 5;
        topLight.shadow.camera.far = 400;
        state.scene.add(topLight);

        createBoundaries();
        state.diceMesh = createDiceMesh();
        
        for (let i = 0; i < params.numberOfDice; i++) {
            const dice = createDice();
            state.diceArray.push(dice);
            addDiceEvents(dice);
        }

        updateSceneSize();
        throwDice();
    };

    const updateSceneSize = () => {
        const { current: state } = gameState;
        if (state.camera && state.renderer && canvasRef.current) {
            state.camera.aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight;
            state.camera.updateProjectionMatrix();
            state.renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);

        }
    };
    

    const animate = () => {
        const { current: state } = gameState;
        
        state.physicsWorld.fixedStep();

        for (const dice of state.diceArray) {
            dice.mesh.position.copy(dice.body.position);
            dice.mesh.quaternion.copy(dice.body.quaternion);
        }

        state.renderer.render(state.scene, state.camera);
        requestAnimationFrame(animate);
    };

    useEffect(() => {
      initPhysics();
      initScene();
  
      const handleResize = () => updateSceneSize();
      window.addEventListener('resize', handleResize);
      const animationId = requestAnimationFrame(animate);
    
      return () => {
          window.removeEventListener('resize', handleResize);
          cancelAnimationFrame(animationId);
  
          const { current: state } = gameState;
          if (state.renderer) state.renderer.dispose();
          if (state.scene) state.scene.clear();
      };
    }, []);

    useEffect(() => {
        if (totalScore > 0) {
            // 주사위 동작이 완료된 후 약 1.7초 뒤에 모달을 닫고 'onComplete' 함수 호출
            const timer = setTimeout(() => {
                onComplete(totalScore);
            }, 1700);

            return () => clearTimeout(timer);
        }
    }, [totalScore, onComplete]);

    return (
        <div className="container modal">
            <canvas id='canvas' ref={canvasRef} className="w-full h-full" />
        </div>
    );
};

export default Dice;