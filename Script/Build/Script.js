"use strict";
var Script;
(function (Script) {
    let State;
    (function (State) {
        State[State["Idle"] = 0] = "Idle";
        State[State["Move"] = 1] = "Move";
        State[State["Attack"] = 2] = "Attack";
        State[State["Die"] = 3] = "Die";
    })(State = Script.State || (Script.State = {}));
    var ƒ = FudgeCore;
    class Character extends ƒ.Node {
        /**
         * Create an character (Node) and add an transform-component
         */
        constructor(_name) {
            super(_name);
            this.resolution = 16;
            this.addComponent(new ƒ.ComponentTransform);
        }
    }
    Script.Character = Character;
})(Script || (Script = {}));
var Script;
(function (Script) {
    // get from Configs
    let delay = 300;
    let camDelay = 500;
    // Control Singleton, since only one instance is necessary
    class Control {
        constructor() {
            this.controlType = 0 /* PROPORTIONAL */;
            this.controls = [];
            this.horizontal = new ƒ.Control("horizontal", Script.flame.getSpeed, this.controlType, delay);
            this.vertical = new ƒ.Control("vertical", Script.flame.getSpeed, this.controlType, delay);
            this.camHor = new ƒ.Control("Camera Horizontal", Script.flame.getSpeed, this.controlType, camDelay);
            this.camVer = new ƒ.Control("Camera Vertical", Script.flame.getSpeed, this.controlType, camDelay);
            this.controls.push(this.horizontal, this.vertical, this.camHor, this.camVer);
        }
        /**
         * get the Instance from Control. Since it is a Singleton,
         * it can't be instantiated multiple times.  If no instance exist,
         * it will create one.
         */
        static getInstance() {
            if (!Control.instance) {
                Control.instance = new Control();
            }
            return Control.instance;
        }
        /**
         * update Control witch deltaTime(time since last update)
         */
        update(_deltaTime) {
            let horizontalValue = (ƒ.Keyboard.mapToValue(1, 0, [ƒ.KEYBOARD_CODE.D]) +
                ƒ.Keyboard.mapToValue(-1, 0, [ƒ.KEYBOARD_CODE.A]));
            let verticalValue = (ƒ.Keyboard.mapToValue(1, 0, [ƒ.KEYBOARD_CODE.W]) +
                ƒ.Keyboard.mapToValue(-1, 0, [ƒ.KEYBOARD_CODE.S]));
            this.horizontal.setInput(horizontalValue * _deltaTime);
            this.camHor.setInput(horizontalValue * _deltaTime);
            this.vertical.setInput(verticalValue * _deltaTime);
            this.camVer.setInput(verticalValue * _deltaTime);
            this.moveCam();
        }
        moveCam() {
            let camVel = new ƒ.Vector3(-this.camHor.getOutput(), this.camVer.getOutput());
            Script.camNode.mtxLocal.translate(camVel);
        }
    }
    Script.Control = Control;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class CustomComponentScript extends ƒ.ComponentScript {
        constructor() {
            super();
            // Properties may be mutated by users in the editor via the automatically created user interface
            this.message = "CustomComponentScript added to ";
            // Activate the functions of this component as response to events
            this.hndEvent = (_event) => {
                switch (_event.type) {
                    case "componentAdd" /* COMPONENT_ADD */:
                        ƒ.Debug.log(this.message, this.node);
                        break;
                    case "componentRemove" /* COMPONENT_REMOVE */:
                        this.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
                        this.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
                        break;
                    case "nodeDeserialized" /* NODE_DESERIALIZED */:
                        // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                        break;
                }
            };
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
        }
    }
    // Register the script as component for use in the editor via drag&drop
    CustomComponentScript.iSubclass = ƒ.Component.registerSubclass(CustomComponentScript);
    Script.CustomComponentScript = CustomComponentScript;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒAid = FudgeAid;
    // get this from Configs
    let speed = 10;
    let health = 10;
    let power = 5;
    let Frames;
    (function (Frames) {
        Frames[Frames["RightIdle"] = 0] = "RightIdle";
        Frames[Frames["Right"] = 1] = "Right";
        Frames[Frames["RightUp"] = 2] = "RightUp";
        Frames[Frames["LeftIdle"] = 3] = "LeftIdle";
        Frames[Frames["Left"] = 4] = "Left";
        Frames[Frames["LeftUp"] = 5] = "LeftUp";
    })(Frames || (Frames = {}));
    ;
    var ƒ = FudgeCore;
    class Flame extends Script.Character {
        constructor() {
            super("Flame");
            this.textureSrc = "./Images/H-Sheet32x32.png";
            this.animations = {};
            this.velocity = new ƒ.Vector2();
            this.speed = speed;
            this.health = health;
            this.power = power;
            this.mtxLocal.translateZ(1);
            this.spriteNode = new ƒAid.NodeSprite("FlameSprite");
            this.spriteNode.addComponent(new ƒ.ComponentTransform);
            this.appendChild(this.spriteNode);
            this.lightNode = new ƒ.Node("FlameLight");
            this.lightNode.addComponent(new ƒ.ComponentTransform);
            let light = new ƒ.LightPoint(ƒ.Color.CSS("white"));
            let cmpLight = new ƒ.ComponentLight(light);
            this.lightNode.addComponent(cmpLight);
            this.lightNode.mtxLocal.translateZ(1);
            this.lightNode.mtxLocal.scale(ƒ.Vector3.ONE(20));
            this.appendChild(this.lightNode);
        }
        get getSpeed() {
            return this.speed;
        }
        attack() {
        }
        move() {
            let control = Script.Control.getInstance();
            // get inputs from control-class
            this.velocity.x = control.horizontal.getOutput();
            this.velocity.y = control.vertical.getOutput();
            // move the character
            this.mtxLocal.translate(this.velocity.toVector3());
        }
        die() {
        }
        takeDamage() {
        }
        update() {
            this.move();
            // update animation adjusted to current movement
            if (this.velocity.x >= 0) {
                if (this.velocity.y > 0)
                    this.chooseAnimation(Frames.RightUp);
                else {
                    if (Script.getAmount(this.velocity.y) > Script.getAmount(this.velocity.x))
                        this.chooseAnimation(Frames.RightIdle);
                    else
                        this.chooseAnimation(Frames.Right);
                }
            }
            else {
                if (this.velocity.y > 0)
                    this.chooseAnimation(Frames.LeftUp);
                else {
                    if (Script.getAmount(this.velocity.y) > Script.getAmount(this.velocity.x))
                        this.chooseAnimation(Frames.LeftIdle);
                    else
                        this.chooseAnimation(Frames.Left);
                }
            }
        }
        async initializeAnimations() {
            let texture = new ƒ.TextureImage();
            await texture.load(this.textureSrc);
            let coat = new ƒ.CoatTextured(ƒ.Color.CSS("white"), texture);
            let animationFrames = 1;
            let origin = ƒ.ORIGIN2D.CENTER;
            let offsetNext = ƒ.Vector2.X(32);
            // let offsetWrap: ƒ.Vector2 = ƒ.Vector2.X(32 * 3);
            let rectangles = {
                "rightIdle": [0, 0, 32, 32], "right": [32, 0, 32, 32], "rightUp": [64, 0, 32, 32],
                "leftIdle": [0, 32, 32, 32], "left": [32, 32, 32, 32], "leftUp": [64, 32, 32, 32]
            };
            this.initializeAnimationsByFrames(coat, rectangles, animationFrames, origin, offsetNext);
            this.chooseAnimation(Frames.RightIdle);
            // this.animState = Frame.Idle;
            this.spriteNode.setFrameDirection(1);
            this.spriteNode.framerate = 12;
        }
        /**
        * initializes multiple animation with the same amount of frames
        */
        initializeAnimationsByFrames(_coat, _rectangles, _frames, _orig, _offsetNext) {
            for (let key in _rectangles) {
                const rec = _rectangles[key];
                let anim = new ƒAid.SpriteSheetAnimation(key, _coat);
                let fRec = ƒ.Rectangle.GET(rec[0], rec[1], rec[2], rec[3]);
                anim.generateByGrid(fRec, _frames, this.resolution, _orig, _offsetNext);
                console.log(key);
                this.animations[key] = anim;
            }
        }
        /**
         * adjusts the animation to the given _state
         * @param _state current Frame
         */
        chooseAnimation(_state) {
            switch (_state) {
                case Frames.RightIdle:
                    this.spriteNode.setAnimation(this.animations.rightIdle);
                    break;
                case Frames.Right:
                    this.spriteNode.setAnimation(this.animations.right);
                    break;
                case Frames.RightUp:
                    this.spriteNode.setAnimation(this.animations.rightUp);
                    break;
                case Frames.LeftIdle:
                    this.spriteNode.setAnimation(this.animations.leftIdle);
                    break;
                case Frames.Left:
                    this.spriteNode.setAnimation(this.animations.left);
                    break;
                case Frames.LeftUp:
                    this.spriteNode.setAnimation(this.animations.leftUp);
                    break;
                default:
                    console.log("no valid Frame");
                    break;
            }
        }
    }
    Script.Flame = Flame;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    // config
    let stageDimension = new ƒ.Vector2(50, 50);
    let floorTileSrc = "./Images/Floor-TileBorderless24x24.png";
    let viewport;
    let branch;
    document.addEventListener("interactiveViewportStarted", start);
    window.addEventListener("load", init);
    window.addEventListener("keydown", stopLoop);
    // show dialog for startup, user interaction required e.g. for starting audio
    function init(_event) {
        let dialog = document.querySelector("dialog");
        dialog.querySelector("h1").textContent = document.title;
        dialog.addEventListener("click", function (_event) {
            dialog.close();
            let graphId = document.head.querySelector("meta[autoView]").getAttribute("autoView");
            startInteractiveViewport(graphId);
        });
        dialog.showModal();
    }
    async function startInteractiveViewport(_graphId) {
        // load resources referenced in the link-tag
        await ƒ.Project.loadResourcesFromHTML();
        ƒ.Debug.log("Project:", ƒ.Project.resources);
        // get the graph to show from loaded resources
        let graph = ƒ.Project.resources[_graphId];
        ƒ.Debug.log("Graph:", graph);
        if (!graph) {
            alert("Nothing to render. Create a graph with at least a mesh, material and probably some light");
            return;
        }
        // setup the viewport
        let cmpCamera = new ƒ.ComponentCamera();
        Script.camNode = new ƒ.Node("Camera");
        Script.camNode.addComponent(cmpCamera);
        Script.camNode.addComponent(new ƒ.ComponentTransform());
        Script.camNode.mtxLocal.translateZ(30);
        Script.camNode.mtxLocal.rotateY(180, false);
        graph.appendChild(Script.camNode);
        let canvas = document.querySelector("canvas");
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
    async function start(_event) {
        document.dispatchEvent(new CustomEvent("startedPrototype", { bubbles: true, detail: viewport }));
        let floorTexture = new ƒ.TextureImage();
        await floorTexture.load(floorTileSrc);
        setUpFloor(floorTexture);
        Script.flame = new Script.Flame();
        Script.Control.getInstance();
        Script.flame.initializeAnimations();
        branch.addChild(Script.flame);
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        let deltaTime = ƒ.Loop.timeFrameGame / 1000;
        // update Control, which also moves the camera
        Script.Control.getInstance().update(deltaTime);
        // update Character
        Script.flame.update();
        // ƒ.Physics.simulate();  // if physics is included and used
        viewport.draw();
        // ƒ.AudioManager.default.update();
    }
    function stopLoop(_event) {
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
    function setUpFloor(_texture) {
        let floorTiles = new ƒ.Node("FloorTiles");
        for (let x = -(stageDimension.x / 2); x < stageDimension.y / 2; x += 2) {
            for (let y = -(stageDimension.y / 2); y < stageDimension.y / 2; y += 2) {
                let floorTile = new ƒ.Node("Tile");
                floorTile.addComponent(new ƒ.ComponentTransform);
                floorTile.mtxLocal.translateX(x);
                floorTile.mtxLocal.translateY(y);
                floorTile.mtxLocal.scaleX(2);
                floorTile.mtxLocal.scaleY(2);
                // add SpriteMesh
                let cmpMesh = new ƒ.ComponentMesh(new ƒ.MeshSprite("TileSprite"));
                floorTile.addComponent(cmpMesh);
                // add textured Material
                let coat = new ƒ.CoatRemissiveTextured(ƒ.Color.CSS("white"), _texture);
                let mat = new ƒ.Material("TileMaterial", ƒ.ShaderFlatTextured, coat);
                let cmpMat = new ƒ.ComponentMaterial(mat);
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
    function getAmount(_number) {
        if (_number < 0) {
            return (_number * -1);
        }
        else
            return _number;
    }
    Script.getAmount = getAmount;
})(Script || (Script = {}));
var Script;
(function (Script) {
    let Direction;
    (function (Direction) {
        Direction[Direction["Up"] = 0] = "Up";
        Direction[Direction["Down"] = 1] = "Down";
        Direction[Direction["Right"] = 2] = "Right";
        Direction[Direction["Left"] = 3] = "Left";
    })(Direction || (Direction = {}));
    class Particle extends ƒAid.NodeSprite {
        /**
         * create
         */
        constructor(_direction) {
            super("Particle");
            this.addComponent(new ƒ.ComponentTransform);
            this.color = ƒ.Color.CSS("white");
            this.particleDirection = _direction;
            this.velocity = Particle.createRandomDirectionVector(this.particleDirection);
        }
        set color(_color) {
            this.color = _color;
        }
        setColorWithString(_color) {
            this.color = ƒ.Color.CSS(_color);
        }
        static createRandomDirectionVector(_direction) {
            let direction = new ƒ.Vector2();
            switch (_direction) {
                case Direction.Up:
                    direction.y = 5;
                    direction.x = Math.random() * 10 - 5;
                    break;
                case Direction.Down:
                    direction.y = -5;
                    direction.x = Math.random() * 10 - 5;
                    break;
                case Direction.Right:
                    direction.x = 5;
                    direction.y = Math.random() * 10 - 5;
                    break;
                case Direction.Left:
                    direction.x = 5;
                    direction.y = Math.random() * 10 - 5;
                    break;
                default:
                    console.log("No valid direction");
                    break;
            }
            return direction;
        }
    }
    Script.Particle = Particle;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map