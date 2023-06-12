namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  export enum Affinity {
    Flame, Enemy
  };
  export enum State {
    Idle, Move, Attack, Die, Hurt
  };

  // from config
  let stageDimension: ƒ.Vector2;
  let floorTileSrc: string;

  // global variables
  let viewport: ƒ.Viewport;
  let branch: ƒ.Node;
  export let camNode: ƒ.Node;
  export let flame: Flame;
  export let characters: Character[] = [];
  export let projectiles: Projectile[] = [];

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
    ƒ.Debug.log("Project:", ƒ.Project.resources);

    config = await (await fetch("./config.json")).json();
    console.log(config.control);
    stageDimension = new ƒ.Vector2(config.stage.dimensionX, config.stage.dimensionY);
    floorTileSrc = config.stage.floorTextureSource;

    // get the graph to show from loaded resources
    let graph: ƒ.Graph = <ƒ.Graph>ƒ.Project.resources[_graphId];
    ƒ.Debug.log("Graph:", graph);
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
    ƒ.Debug.log("Viewport:", viewport);
    branch = viewport.getBranch();

    // hide the cursor when interacting, also suppressing right-click menu
    canvas.addEventListener("mousedown", canvas.requestPointerLock);
    canvas.addEventListener("mouseup", function () { document.exitPointerLock(); });

    viewport.draw();

    // dispatch event to signal startup done
    canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", { bubbles: true, detail: viewport }));
  }

  async function start(_event: CustomEvent): Promise<void> {
    document.dispatchEvent(new CustomEvent("startedPrototype", { bubbles: true, detail: viewport }))

    let floorTexture: ƒ.TextureImage = new ƒ.TextureImage();
    await floorTexture.load(floorTileSrc);
    setUpFloor(floorTexture);

    flame = new Flame();
    Control.getInstance();
    flame.initializeAnimations();
    branch.appendChild(flame);
    // characters.push(flame);

    document.addEventListener("keydown", flame.attack);

    //can be put in Config
    addEnemy(100);

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);

    ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function addEnemy(_amount: number): void {
    for (let index: number = 0; index < _amount; index++) {
      let randomX: number;
      if (Math.random() - 0.5 < 0) randomX = randomNumber(-stageDimension.x / 2, -stageDimension.x / 4);
      else randomX = randomNumber(stageDimension.x / 4, stageDimension.x / 2);

      let randomY: number;
      if (Math.random() - 0.5 < 0) randomY = randomNumber(-stageDimension.y / 2, -stageDimension.y / 4);
      else randomY = randomNumber(stageDimension.y / 4, stageDimension.y / 2);

      let randomPos: ƒ.Vector3 = new ƒ.Vector3(randomX, randomY);

      let enemy: Octo = new Octo(randomPos);
      enemy.addEventListener("enemyIsClose", enemy.unveil);
      hdlCreation(enemy, characters);
      // enemy.initializeAnimations();
      // branch.appendChild(enemy);
      // characters.push(enemy);
    }
  }

  function randomNumber(_lowEnd: number, _highEnd: number): number {
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
    for (const character of characters) {
      character.update(deltaTime);
    }
    for (const projectile of projectiles) {
      projectile.update(deltaTime);
    }

    checkHitbox();

    // ƒ.Physics.simulate();  // if physics is included and used
    viewport.draw();
    // ƒ.AudioManager.default.update();
  }

  function checkHitbox(): void {
    for (const character of characters) {
      let posDifference: ƒ.Vector3 | ƒ.Vector2 = ƒ.Vector3.DIFFERENCE(flame.mtxLocal.translation, character.mtxLocal.translation);
      posDifference = posDifference.toVector2();
      if (posDifference.magnitude < 6) {
        character.dispatchEventToTargetOnly(new CustomEvent("enemyIsClose"))

        let dimensions: ƒ.Vector2 = ƒ.Vector2.SUM(flame.hitbox, character.hitbox);
        posDifference = new ƒ.Vector2(getAmount(posDifference.x), getAmount(posDifference.y));
        if (dimensions.x > posDifference.x && dimensions.y > posDifference.y) {
          let damageEvent: Event = new CustomEvent("Damage", { bubbles: false, detail: { _sourcePower: this.power, _sourcePos: this.mtxLocal.translation } })
          flame.dispatchEventToTargetOnly(damageEvent);
          // flame.takeDamage(character.power, character.mtxLocal.translation);
        }
      }
    }
  }

  function stopLoop(_event: KeyboardEvent): void {
    if (_event.key == "p") {
      console.log("P pressed");
      ƒ.Loop.stop();
    }
    if (_event.key == "o") {
      ƒ.Loop.continue();
    }
  }

  export function hdlCreation(_creation: Projectile | Octo, _array: any[]): void {
    _creation.initializeAnimations();
    branch.appendChild(_creation);
    _array.push(_creation);
    // console.log(_creation, _array);
  }

  export function hdlDestruction(_creation: Projectile | Octo, _array: any[]): void {
    branch.removeChild(_creation);
    for (let i = 0; i < _array.length; i++) {
      if (_creation == _array[i]) {
        console.log(_array);
        _array = _array.splice(i, 1);
        console.log(_array);

      }
    }
  }

  /**
   * set up the floor-tiles with a given texture for the whole stage
   */
  function setUpFloor(_texture: ƒ.Texture): void {

    // append one tile with phong shader
    let floorTile: ƒ.Node = new ƒ.Node("Tile");
    floorTile.addComponent(new ƒ.ComponentTransform);
    floorTile.mtxLocal.translateZ(-1);
    floorTile.mtxLocal.scaleX(stageDimension.x);
    floorTile.mtxLocal.scaleY(stageDimension.y);
    // add SpriteMesh
    let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(new ƒ.MeshSprite("TileSprite"));
    floorTile.addComponent(cmpMesh);
    // add textured Material
    let coat: ƒ.CoatRemissiveTextured = new ƒ.CoatRemissiveTextured(ƒ.Color.CSS("white"), _texture);
    let mat: ƒ.Material = new ƒ.Material("TileMaterial", ƒ.ShaderPhongTextured, coat);
    // error with material
    let cmpMat: ƒ.ComponentMaterial = new ƒ.ComponentMaterial(mat);
    cmpMat.mtxPivot.scaleX(stageDimension.x / 2);
    cmpMat.mtxPivot.scaleY(stageDimension.y / 2);
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

}