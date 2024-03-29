namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  export enum Affinity {
    Flame, Enemy
  };
  export enum State {
    Hidden, Idle, Move, Attack, Die, Hurt
  };

  // from config
  let arenaDimension: ƒ.Vector2;
  let floorTileSrc: string;

  // global variables
  let viewport: ƒ.Viewport;
  let branch: ƒ.Node;
  let gameStateMachine: GameStateMachine;
  export let counterGUI: GUI;
  export let camNode: ƒ.Node;
  export let flame: Flame;
  export let entities: Entity[] = [];
  export let projectiles: Projectile[] = [];
  export let powerUps: ƒ.Node[] = [];

  export let config: any;

  document.addEventListener("interactiveViewportStarted", <EventListener><unknown>start);

  window.addEventListener("load", init);
  window.addEventListener("keydown", stopLoop);

  // show dialog for startup, user interaction required e.g. for starting audio
  function init(_event: Event): void {
    let dialog: HTMLDialogElement = document.querySelector("dialog");
    dialog.querySelector("h1").textContent = document.title;
    dialog.addEventListener("click", function (_event) {
      dialog.close();
      let graphId: string = document.head.querySelector("meta[autoView]").getAttribute("autoView");
      startInteractiveViewport(graphId);
    });
    dialog.showModal();
  }

  async function startInteractiveViewport(_graphId: string): Promise<void> {
    // load resources referenced in the link-tag
    await ƒ.Project.loadResourcesFromHTML();
    // ƒ.Debug.log("Project:", ƒ.Project.resources);

    config = await (await fetch("./config.json")).json();
    // console.log(config.control);
    arenaDimension = new ƒ.Vector2(config.arena.dimensionX, config.arena.dimensionY);
    floorTileSrc = config.arena.floorTextureSource;
    Goriya.setFireballSrc(config.enemies.goriya.fireballTextureSrc);

    // get the graph to show from loaded resources
    let graph: ƒ.Graph = <ƒ.Graph>ƒ.Project.resources[_graphId];
    // ƒ.Debug.log("Graph:", graph);
    if (!graph) {
      alert("Nothing to render. Create a graph with at least a mesh, material and probably some light");
      return;
    }

    // setup the viewport
    let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    camNode = new ƒ.Node("Camera");
    camNode.addComponent(cmpCamera);

    camNode.addComponent(new ƒ.ComponentTransform());
    camNode.mtxLocal.translateZ(30);
    camNode.mtxLocal.rotateY(180, false);
    graph.appendChild(camNode);

    let canvas: HTMLCanvasElement = document.querySelector("canvas");
    viewport = new ƒ.Viewport();
    viewport.initialize("InteractiveViewport", graph, cmpCamera, canvas);
    // ƒ.Debug.log("Viewport:", viewport);
    branch = viewport.getBranch();

    // add Audio
    let cmpAudioListener = new ƒ.ComponentAudioListener();
    camNode.addComponent(cmpAudioListener);
    ƒ.AudioManager.default.listenWith(cmpAudioListener);
    ƒ.AudioManager.default.listenTo(branch);
    // ƒ.Debug.log("Audio:", ƒ.AudioManager.default);

    // hide the cursor when interacting, also suppressing right-click menu
    canvas.addEventListener("mousedown", canvas.requestPointerLock);
    canvas.addEventListener("mouseup", function () { document.exitPointerLock(); });

    viewport.draw();

    // dispatch event to signal startup done
    canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", { bubbles: true, detail: viewport }));
  }

  async function start(_event: CustomEvent): Promise<void> {
    let floorTexture: ƒ.TextureImage = new ƒ.TextureImage();
    await floorTexture.load(floorTileSrc);
    setUpFloor(floorTexture);
    AttributeUp.setTextures(config.powerUps);

    flame = new Flame(config.player);
    Control.getInstance();
    // flame.initializeAnimations();
    branch.appendChild(flame);
    // characters.push(flame);

    gameStateMachine = GameStateMachine.getInstance();
    gameStateMachine.transit(GameState.Start);

    document.addEventListener("keydown", flame.attack);
    branch.addEventListener("createPowerUp", hdlPowerUpCreation, true);
    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);

    ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a

    document.dispatchEvent(new CustomEvent("startedPrototype", { bubbles: true, detail: viewport }))
  }

  export function addEnemy(_amount: number): void {
    for (let index: number = 0; index < _amount; index++) {
      let randomX: number;
      if (Math.random() - 0.5 < 0) randomX = randomNumber(-arenaDimension.x / 2, -arenaDimension.x / 4);
      else randomX = randomNumber(arenaDimension.x / 4, arenaDimension.x / 2);

      let randomY: number;
      if (Math.random() - 0.5 < 0) randomY = randomNumber(-arenaDimension.y / 2, -arenaDimension.y / 7);
      else randomY = randomNumber(arenaDimension.y / 7, arenaDimension.y / 2);

      let randomPos: ƒ.Vector3 = new ƒ.Vector3(randomX, randomY);

      let enemy: Entity;
      if (index > 0 && index % 3 == 0) {
        enemy = new Goriya(randomPos, config.enemies.goriya);
      }
      else {
        enemy = new Octo(randomPos, config.enemies.octo);
      }

      // enemy.addEventListener("enemyIsClose", enemy.unveil);
      hdlCreation(enemy, entities);
      // enemy.initializeAnimations();
      // branch.appendChild(enemy);
      // characters.push(enemy);
    }
  }

  export function randomNumber(_lowEnd: number, _highEnd: number): number {
    let randomNumber: number = Math.floor(Math.random() * (_highEnd - _lowEnd));
    randomNumber += _lowEnd;
    return randomNumber;
  }

  function update(_event: Event): void {
    let deltaTime: number = ƒ.Loop.timeFrameGame / 1000;
    // update Control, which also moves the camera
    Control.getInstance().update(deltaTime);
    // update Character
    flame.update();
    for (const character of entities) {
      character.update(deltaTime);
    }
    for (const projectile of projectiles) {
      projectile.update(deltaTime);
    }

    checkHitbox();

    // counterGUI.enemyCounter = entities.length;
    // ƒ.Physics.simulate();  // if physics is included and used
    viewport.draw();
    ƒ.AudioManager.default.update();
  }

  function checkHitbox(): void {
    for (const entity of entities) {
      let posDifference: ƒ.Vector3 | ƒ.Vector2 = ƒ.Vector3.DIFFERENCE(flame.mtxLocal.translation, entity.mtxLocal.translation);
      posDifference = posDifference.toVector2();
      if (posDifference.magnitude < 6) {
        entity.dispatchEventToTargetOnly(new CustomEvent("enemyIsClose"))

        let dimensions: ƒ.Vector2 = ƒ.Vector2.SUM(flame.hitbox, entity.hitbox);
        posDifference = new ƒ.Vector2(getAmount(posDifference.x), getAmount(posDifference.y));
        if (dimensions.x > posDifference.x && dimensions.y > posDifference.y) {
          let damageEvent: Event = new CustomEvent("Damage", {
            bubbles: false, detail: { _sourcePower: entity.power, _sourcePos: entity.mtxLocal.translation }
          });
          flame.dispatchEventToTargetOnly(damageEvent);
        }
      }
    }
    for (const powerUpNode of powerUps) {
      let posDifference: ƒ.Vector3 | ƒ.Vector2 = ƒ.Vector3.DIFFERENCE(flame.mtxLocal.translation, powerUpNode.mtxLocal.translation);
      posDifference = posDifference.toVector2();
      if (posDifference.magnitude < 2) {
        let dimensions: ƒ.Vector2 = ƒ.Vector2.SUM(flame.hitbox, AttributeUp.getDimensions);
        posDifference = new ƒ.Vector2(getAmount(posDifference.x), getAmount(posDifference.y));
        if (dimensions.x > posDifference.x && dimensions.y > posDifference.y) {
          let powerUp: AttributeUp = powerUpNode.getComponent(AttributeUp);
          flame.changeAttributes(powerUp.getPowerBoost[0], powerUp.getPowerBoost[1],
            powerUp.getPowerBoost[2], powerUp.getPowerBoost[3]);
          // console.log(powerUp.getPowerBoost);
          hdlDestruction(powerUpNode, powerUps);
        }
      }
    }
  }

  function stopLoop(_event: KeyboardEvent): void {
    if (_event.key == "p") {
      // console.log("P pressed for pause, press o to continue");
      ƒ.Loop.stop();
    }
    if (_event.key == "o") {
      ƒ.Loop.continue();
    }
  }

  export function hdlCreation(_creation: ƒ.Node, _array: any[]): void {
    branch.appendChild(_creation);
    _array.push(_creation);
  }

  export function hdlDestruction(_creation: ƒ.Node, _array: any[]): void {
    branch.removeChild(_creation);
    for (let i = 0; i < _array.length; i++) {
      if (_creation == _array[i]) {
        // console.log(_array);
        _array = _array.splice(i, 1);
        // console.log(_array);
      }
    }
    counterGUI.enemyCounter = entities.length;
    if (counterGUI.enemyCounter == 0) {
      gameStateMachine.transit(GameState.NextStage);
    }
  }

  /**
   * set up the floor-tiles with a given texture for the whole stage
   */
  function setUpFloor(_texture: ƒ.Texture): void {
    // create one big tile with phong shader
    let floorTile: ƒ.Node = new ƒ.Node("Tile");
    floorTile.addComponent(new ƒ.ComponentTransform);
    floorTile.mtxLocal.translateZ(-1);
    floorTile.mtxLocal.scaleX(arenaDimension.x);
    floorTile.mtxLocal.scaleY(arenaDimension.y);
    // add SpriteMesh
    let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(new ƒ.MeshSprite("TileSprite"));
    floorTile.addComponent(cmpMesh);
    // add textured Material
    let coat: ƒ.CoatRemissiveTextured = new ƒ.CoatRemissiveTextured(ƒ.Color.CSS("white"), _texture);
    let mat: ƒ.Material = new ƒ.Material("TileMaterial", ƒ.ShaderPhongTextured, coat);
    // error with material
    let cmpMat: ƒ.ComponentMaterial = new ƒ.ComponentMaterial(mat);
    cmpMat.mtxPivot.scaleX(arenaDimension.x / 2);
    cmpMat.mtxPivot.scaleY(arenaDimension.y / 2);
    floorTile.addComponent(cmpMat);
    // append tile to parent
    branch.appendChild(floorTile);
  }

  /**
   * get the amount (Betrag) of a number
   */
  export function getAmount(_number: number): number {
    if (_number < 0) {
      return (_number * -1);
    }
    else
      return _number;
  }

  function hdlPowerUpCreation(_event: CustomEvent): void {
    // console.log("create Power Up");

    let powerUp: ƒ.Node = new ƒ.Node("PowerUp" + powerUps.length);
    powerUp.addComponent(new ƒ.ComponentTransform());
    powerUp.mtxLocal.translation = _event.detail._sourcePos;
    powerUp.addComponent(new ƒ.ComponentMesh(new ƒ.MeshSprite("meshPowerUp")))
    // powerUp.addComponent(new ƒ.ComponentMaterial(new ƒ.Material("matPowerUp", ƒ.ShaderLitTextured)))
    powerUp.addComponent(new AttributeUp());
    hdlCreation(powerUp, powerUps);
  }

}