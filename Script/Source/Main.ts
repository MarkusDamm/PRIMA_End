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
  let characters: Character[] = [];

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

    addEnemy(10);

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
      enemy.initializeAnimations();
      branch.appendChild(enemy);
      enemy.addEventListener("enemyIsClose", enemy.unveil);
      characters.push(enemy);
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

    checkHitbox();

    // ƒ.Physics.simulate();  // if physics is included and used
    viewport.draw();
    // ƒ.AudioManager.default.update();
  }

  function checkHitbox(): void {
    for (const character of characters) {
      // if (character == flame) {

      //   continue;
      // }

      let posDifference: ƒ.Vector3 | ƒ.Vector2 = ƒ.Vector3.DIFFERENCE(flame.mtxLocal.translation, character.mtxLocal.translation);
      posDifference = posDifference.toVector2();
      if (posDifference.magnitude < 6) {
        character.dispatchEventToTargetOnly(new CustomEvent("enemyIsClose"))

        let dimensions: ƒ.Vector2 = ƒ.Vector2.SUM(flame.hitbox, character.hitbox);
        posDifference = new ƒ.Vector2(getAmount(posDifference.x), getAmount(posDifference.y));
        if (dimensions.x > posDifference.x && dimensions.y > posDifference.y) {

          flame.takeDamage(character.power, character.mtxLocal.translation);
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

  /**
   * set up the floor-tiles with a given texture for the whole stage
   */
  function setUpFloor(_texture: ƒ.Texture): void {
    let floorTiles: ƒ.Node = new ƒ.Node("FloorTiles");
    for (let x: number = -(stageDimension.x / 2); x < stageDimension.y / 2; x += 2) {
      for (let y: number = -(stageDimension.y / 2); y < stageDimension.y / 2; y += 2) {
        let floorTile: ƒ.Node = new ƒ.Node("Tile");
        floorTile.addComponent(new ƒ.ComponentTransform);
        floorTile.mtxLocal.translateX(x);
        floorTile.mtxLocal.translateY(y);
        floorTile.mtxLocal.translateZ(-1);
        floorTile.mtxLocal.scaleX(2);
        floorTile.mtxLocal.scaleY(2);
        // add SpriteMesh
        let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(new ƒ.MeshSprite("TileSprite"));
        floorTile.addComponent(cmpMesh);
        // add textured Material
        let coat: ƒ.CoatTextured = new ƒ.CoatRemissiveTextured(ƒ.Color.CSS("white"), _texture);
        let mat: ƒ.Material = new ƒ.Material("TileMaterial", ƒ.ShaderFlatTextured, coat);
        let cmpMat: ƒ.ComponentMaterial = new ƒ.ComponentMaterial(mat);
        floorTile.addComponent(cmpMat);
        // append tile to parent
        floorTiles.appendChild(floorTile);
      }
    }
    // append all tiles to branch
    branch.appendChild(floorTiles);
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