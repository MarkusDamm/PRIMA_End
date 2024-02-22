"use strict";
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    class AttributeUp extends ƒ.ComponentScript {
        constructor() {
            super();
        }
    }
    Script.AttributeUp = AttributeUp;
})(Script || (Script = {}));
var Script;
(function (Script) {
    /** Control as singleton, since only one instance is necessary*/
    class Control {
        constructor() {
            this.controlType = 0 /* PROPORTIONAL */;
            this.controls = [];
            this.horizontal = new ƒ.Control("horizontal", Script.flame.getSpeed, this.controlType, Script.config.control.characterDelay);
            this.vertical = new ƒ.Control("vertical", Script.flame.getSpeed, this.controlType, Script.config.control.characterDelay);
            this.camHor = new ƒ.Control("Camera Horizontal", Script.flame.getSpeed, this.controlType, Script.config.control.cameraDelay);
            this.camVer = new ƒ.Control("Camera Vertical", Script.flame.getSpeed, this.controlType, Script.config.control.cameraDelay);
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
         * update Control with deltaTime
         * @param _deltaTime time since last update
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
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    ;
    class TexturedMoveable extends ƒ.Node {
        constructor(_name, _spriteName, _spriteDimensions) {
            super(_name);
            /**
             * =16; 16 pixel equal one length unit
            */
            this.resolution = 16;
            this.addComponent(new ƒ.ComponentTransform);
            this.spriteNode = new ƒAid.NodeSprite(_spriteName);
            this.spriteNode.addComponent(new ƒ.ComponentTransform);
            this.appendChild(this.spriteNode);
            this.hitbox = ƒ.Vector2.SCALE(_spriteDimensions, (1 / 32));
        }
        /**
         * initializes the animations with
         * @param _textureSrc URL to texture
         * @param _rectangles Rectangles (Interface), to set up animation-frames
         * @param _frames frames of the animation
         * @param _offsetX offset to next frame
         */
        async initializeAnimations(_textureSrc, _rectangles, _frames, _offsetX) {
            let texture = new ƒ.TextureImage();
            await texture.load(_textureSrc);
            let coat = new ƒ.CoatTextured(ƒ.Color.CSS("white"), texture);
            let origin = ƒ.ORIGIN2D.CENTER;
            let offsetNext = ƒ.Vector2.X(_offsetX);
            this.initializeAnimationsByFrames(coat, _rectangles, _frames, origin, offsetNext);
            this.spriteNode.setFrameDirection(1);
            this.spriteNode.framerate = 6;
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
                this.animations[key] = anim;
            }
        }
    }
    Script.TexturedMoveable = TexturedMoveable;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    let Affinity;
    (function (Affinity) {
        Affinity[Affinity["Flame"] = 0] = "Flame";
        Affinity[Affinity["Enemy"] = 1] = "Enemy";
    })(Affinity = Script.Affinity || (Script.Affinity = {}));
    ;
    let State;
    (function (State) {
        State[State["Hidden"] = 0] = "Hidden";
        State[State["Idle"] = 1] = "Idle";
        State[State["Move"] = 2] = "Move";
        State[State["Attack"] = 3] = "Attack";
        State[State["Die"] = 4] = "Die";
        State[State["Hurt"] = 5] = "Hurt";
    })(State = Script.State || (Script.State = {}));
    ;
    // from config
    let arenaDimension;
    let floorTileSrc;
    // global variables
    let viewport;
    let branch;
    let gameStateMachine;
    Script.entities = [];
    Script.projectiles = [];
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
        Script.config = await (await fetch("./config.json")).json();
        console.log(Script.config.control);
        arenaDimension = new ƒ.Vector2(Script.config.arena.dimensionX, Script.config.arena.dimensionY);
        floorTileSrc = Script.config.arena.floorTextureSource;
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
        // add Audio
        let cmpAudioListener = new ƒ.ComponentAudioListener();
        Script.camNode.addComponent(cmpAudioListener);
        ƒ.AudioManager.default.listenWith(cmpAudioListener);
        ƒ.AudioManager.default.listenTo(branch);
        ƒ.Debug.log("Audio:", ƒ.AudioManager.default);
        // hide the cursor when interacting, also suppressing right-click menu
        canvas.addEventListener("mousedown", canvas.requestPointerLock);
        canvas.addEventListener("mouseup", function () { document.exitPointerLock(); });
        viewport.draw();
        // dispatch event to signal startup done
        canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", { bubbles: true, detail: viewport }));
    }
    async function start(_event) {
        let floorTexture = new ƒ.TextureImage();
        await floorTexture.load(floorTileSrc);
        setUpFloor(floorTexture);
        Script.flame = new Script.Flame(await Script.config.player);
        Script.Control.getInstance();
        // flame.initializeAnimations();
        branch.appendChild(Script.flame);
        // characters.push(flame);
        gameStateMachine = Script.GameStateMachine.getInstance();
        gameStateMachine.transit(Script.GameState.Start);
        document.addEventListener("keydown", Script.flame.attack);
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
        document.dispatchEvent(new CustomEvent("startedPrototype", { bubbles: true, detail: viewport }));
    }
    function addEnemy(_amount) {
        for (let index = 0; index < _amount; index++) {
            let randomX;
            if (Math.random() - 0.5 < 0)
                randomX = randomNumber(-arenaDimension.x / 2, -arenaDimension.x / 4);
            else
                randomX = randomNumber(arenaDimension.x / 4, arenaDimension.x / 2);
            let randomY;
            if (Math.random() - 0.5 < 0)
                randomY = randomNumber(-arenaDimension.y / 2, -arenaDimension.y / 4);
            else
                randomY = randomNumber(arenaDimension.y / 4, arenaDimension.y / 2);
            let randomPos = new ƒ.Vector3(randomX, randomY);
            let enemy;
            if (index % 2 == 0) {
                enemy = new Script.Octo(randomPos, Script.config.enemies.octo);
            }
            else {
                enemy = new Script.Goriya(randomPos, Script.config.enemies.goriya);
            }
            // enemy.addEventListener("enemyIsClose", enemy.unveil);
            hdlCreation(enemy, Script.entities);
            // enemy.initializeAnimations();
            // branch.appendChild(enemy);
            // characters.push(enemy);
        }
    }
    Script.addEnemy = addEnemy;
    function randomNumber(_lowEnd, _highEnd) {
        let randomNumber = Math.floor(Math.random() * (_highEnd - _lowEnd));
        randomNumber += _lowEnd;
        return randomNumber;
    }
    function update(_event) {
        let deltaTime = ƒ.Loop.timeFrameGame / 1000;
        // update Control, which also moves the camera
        Script.Control.getInstance().update(deltaTime);
        // update Character
        Script.flame.update();
        for (const character of Script.entities) {
            character.update(deltaTime);
        }
        for (const projectile of Script.projectiles) {
            projectile.update(deltaTime);
        }
        checkHitbox();
        // counterGUI.enemyCounter = entities.length;
        // ƒ.Physics.simulate();  // if physics is included and used
        viewport.draw();
        ƒ.AudioManager.default.update();
    }
    function checkHitbox() {
        for (const entity of Script.entities) {
            let posDifference = ƒ.Vector3.DIFFERENCE(Script.flame.mtxLocal.translation, entity.mtxLocal.translation);
            posDifference = posDifference.toVector2();
            if (posDifference.magnitude < 6) {
                entity.dispatchEventToTargetOnly(new CustomEvent("enemyIsClose"));
                let dimensions = ƒ.Vector2.SUM(Script.flame.hitbox, entity.hitbox);
                posDifference = new ƒ.Vector2(getAmount(posDifference.x), getAmount(posDifference.y));
                if (dimensions.x > posDifference.x && dimensions.y > posDifference.y) {
                    let damageEvent = new CustomEvent("Damage", { bubbles: false, detail: { _sourcePower: entity.power, _sourcePos: entity.mtxLocal.translation } });
                    Script.flame.dispatchEventToTargetOnly(damageEvent);
                }
            }
        }
    }
    // function checkDistance(_current: Entity, _target: Entity): number {
    //   let posDifference: ƒ.Vector3 | ƒ.Vector2 = ƒ.Vector3.DIFFERENCE(_target.mtxLocal.translation, _current.mtxLocal.translation);
    //   posDifference = posDifference.toVector2();
    //   return posDifference.magnitude;
    // }
    function stopLoop(_event) {
        if (_event.key == "p") {
            console.log("P pressed for pause, press o to continue");
            ƒ.Loop.stop();
        }
        if (_event.key == "o") {
            ƒ.Loop.continue();
        }
    }
    function hdlCreation(_creation, _array) {
        // _creation.initializeAnimations();
        branch.appendChild(_creation);
        _array.push(_creation);
    }
    Script.hdlCreation = hdlCreation;
    function hdlDestruction(_creation, _array) {
        branch.removeChild(_creation);
        for (let i = 0; i < _array.length; i++) {
            if (_creation == _array[i]) {
                console.log(_array);
                _array = _array.splice(i, 1);
                console.log(_array);
            }
        }
        Script.counterGUI.enemyCounter = Script.entities.length;
        if (Script.counterGUI.enemyCounter == 0) {
            gameStateMachine.transit(Script.GameState.NextStage);
        }
    }
    Script.hdlDestruction = hdlDestruction;
    /**
     * set up the floor-tiles with a given texture for the whole stage
     */
    function setUpFloor(_texture) {
        // create one big tile with phong shader
        let floorTile = new ƒ.Node("Tile");
        floorTile.addComponent(new ƒ.ComponentTransform);
        floorTile.mtxLocal.translateZ(-1);
        floorTile.mtxLocal.scaleX(arenaDimension.x);
        floorTile.mtxLocal.scaleY(arenaDimension.y);
        // add SpriteMesh
        let cmpMesh = new ƒ.ComponentMesh(new ƒ.MeshSprite("TileSprite"));
        floorTile.addComponent(cmpMesh);
        // add textured Material
        let coat = new ƒ.CoatRemissiveTextured(ƒ.Color.CSS("white"), _texture);
        let mat = new ƒ.Material("TileMaterial", ƒ.ShaderPhongTextured, coat);
        // error with material
        let cmpMat = new ƒ.ComponentMaterial(mat);
        cmpMat.mtxPivot.scaleX(arenaDimension.x / 2);
        cmpMat.mtxPivot.scaleY(arenaDimension.y / 2);
        floorTile.addComponent(cmpMat);
        // append tile to parent
        branch.appendChild(floorTile);
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
///<reference path="./TexturedMoveable.ts"/>
///<reference path="./Main.ts"/>
var Script;
///<reference path="./TexturedMoveable.ts"/>
///<reference path="./Main.ts"/>
(function (Script) {
    var ƒ = FudgeCore;
    class Entity extends Script.TexturedMoveable {
        /**
         * Create an character (Node) and add an transform-component
         */
        constructor(_data) {
            super(_data.name, _data.name + "Sprite", new ƒ.Vector2(_data.spriteDimensions[0], _data.spriteDimensions[1]));
            this.hasIFrames = false;
            this.animations = {};
            this.data = _data;
            this.textureSrc = this.data.textureSrc;
            this.hiddenTextureSrc = this.data.hiddenTextureSrc;
            this.speed = this.data.speed;
            this.health = this.data.health;
            this.power = this.data.power;
        }
        takeDamage(_event) {
            if (!this.hasIFrames) {
                this.health -= _event.detail._sourcePower;
            }
            if (this.health <= 0) {
                this.die();
            }
            console.log(this.health);
        }
    }
    Script.Entity = Entity;
})(Script || (Script = {}));
///<reference path="./Entity.ts"/>
var Script;
///<reference path="./Entity.ts"/>
(function (Script) {
    var ƒ = FudgeCore;
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
    ;
    class Flame extends Script.Entity {
        constructor(_data) {
            super(_data);
            // protected textureSrc: string = "./Images/H-Sheet32x32.png";
            this.fireballTextureSrc = "./Images/Fireball16x16.png";
            this.affinity = Script.Affinity.Flame;
            this.velocity = new ƒ.Vector2();
            this.isAttackAvailable = true;
            this.attack = (_event) => {
                if (this.isAttackAvailable) {
                    let key = _event.key;
                    let attackDirection;
                    switch (key) {
                        case ƒ.KEYBOARD_CODE.ARROW_UP:
                            attackDirection = ƒ.Vector2.Y();
                            break;
                        case ƒ.KEYBOARD_CODE.ARROW_RIGHT:
                            attackDirection = ƒ.Vector2.X();
                            break;
                        case ƒ.KEYBOARD_CODE.ARROW_LEFT:
                            attackDirection = ƒ.Vector2.X(-1);
                            break;
                        case ƒ.KEYBOARD_CODE.ARROW_DOWN:
                            attackDirection = ƒ.Vector2.Y(-1);
                            break;
                        default: return;
                    }
                    let projectile = new Script.Projectile(this.mtxLocal.translation, attackDirection, Script.Affinity.Flame, this.power, this.fireballTextureSrc);
                    Script.hdlCreation(projectile, Script.projectiles);
                    this.isAttackAvailable = false;
                    setTimeout(() => {
                        this.isAttackAvailable = true;
                    }, this.attackCooldown);
                }
            };
            this.attackCooldown = Script.config.player.attackCooldown;
            console.log("Health: " + this.health);
            this.gui = new Script.GUI(Script.GUIType.Health, this.health);
            this.addEventListener("Damage", this.takeDamage.bind(this));
            // add light
            this.lightNode = new ƒ.Node("FlameLight");
            this.lightNode.addComponent(new ƒ.ComponentTransform);
            let light = new ƒ.LightPoint(ƒ.Color.CSS("white"));
            let cmpLight = new ƒ.ComponentLight(light);
            this.lightNode.addComponent(cmpLight);
            this.lightNode.mtxLocal.scale(ƒ.Vector3.ONE(8));
            // this.appendChild(this.lightNode);
            this.hitTimeout = { timeoutID: 0, duration: 0 };
            this.initializeAnimations();
        }
        get getSpeed() {
            return this.speed;
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
            console.log("You Died!");
            Script.GameStateMachine.getInstance().transit(Script.GameState.Defeat);
            this.removeEventListener("Damage", this.takeDamage);
            // this.activate(false);
        }
        takeDamage(_event) {
            super.takeDamage(_event);
            this.gui.health = this.health;
            console.log("Flame takes damage");
            if (!this.hasIFrames) {
                this.startIFrames(_event.detail._sourcePower * 1000);
            }
        }
        startIFrames(_timeoutDuration) {
            this.hasIFrames = true;
            if (this.hitTimeout.duration > _timeoutDuration) {
                return;
            }
            clearTimeout(this.hitTimeout.timeoutID);
            this.hitTimeout.timeoutID = setTimeout(() => {
                this.hasIFrames = false;
            }, _timeoutDuration);
            this.hitTimeout.duration = _timeoutDuration;
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
            this.hitTimeout.duration--;
            if (this.hitTimeout.duration < 0) {
                this.hitTimeout = { timeoutID: 0, duration: 0 };
            }
        }
        async initializeAnimations() {
            let rectangles = {
                "rightIdle": [0, 0, 32, 32], "right": [32, 0, 32, 32], "rightUp": [64, 0, 32, 32],
                "leftIdle": [0, 32, 32, 32], "left": [32, 32, 32, 32], "leftUp": [64, 32, 32, 32]
            };
            super.initializeAnimations(this.textureSrc, rectangles, 1, 32);
            this.chooseAnimation(Frames.RightIdle);
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
        // For Power Ups
        // private changeAttributes(_speedDifference: number, _healthDifference: number, _powerDifference: number, _cooldownDifference: number): void {
        //   this.speed += _speedDifference;
        //   this.health += _healthDifference;
        //   this.power += _powerDifference;
        //   this.attackCooldown += _cooldownDifference;
        // }
        unveil() {
            // propably useless here
        }
    }
    Script.Flame = Flame;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    var ƒUI = FudgeUserInterface;
    let GUIType;
    (function (GUIType) {
        GUIType[GUIType["Health"] = 0] = "Health";
        GUIType[GUIType["EnemyCount"] = 1] = "EnemyCount";
    })(GUIType = Script.GUIType || (Script.GUIType = {}));
    ;
    class GUI extends ƒ.Mutable {
        constructor(_type, _value) {
            super();
            switch (_type) {
                case GUIType.Health:
                    this.health = _value;
                    break;
                case GUIType.EnemyCount:
                    this.enemyCounter = _value;
                    break;
                default:
                    break;
            }
            let UI = document.querySelector("div#vui");
            UI.hidden = false;
            console.log("connect GUI");
            new ƒUI.Controller(this, UI);
        }
        reduceMutator(_mutator) { }
    }
    Script.GUI = GUI;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    let GameState;
    (function (GameState) {
        GameState[GameState["Wait"] = 0] = "Wait";
        GameState[GameState["Start"] = 1] = "Start";
        GameState[GameState["NextStage"] = 2] = "NextStage";
        GameState[GameState["Victory"] = 3] = "Victory";
        GameState[GameState["Defeat"] = 4] = "Defeat";
    })(GameState = Script.GameState || (Script.GameState = {}));
    ;
    class GameStateMachine extends ƒAid.StateMachine {
        constructor() {
            super();
            this.update = (_event) => { this.act(); };
            this.instructions = GameStateMachine.instructions;
            this.stages = Script.config.stages;
            this.currentStage = this.frameCounter = 0;
            console.log("Stages and Current Stage");
            console.log(this.stages, this.stages[this.currentStage]);
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
        }
        /**
         * accsess the instance of GameStateMachine
         */
        static getInstance() {
            if (!GameStateMachine.instance) {
                GameStateMachine.instance = new GameStateMachine();
                ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, GameStateMachine.instance.update);
            }
            return GameStateMachine.instance;
        }
        /**
         * setup the instructions from the methods to the state
         */
        static getInstructions() {
            let setup = new ƒAid.StateMachineInstructions();
            setup.transitDefault = GameStateMachine.transitDefault;
            setup.actDefault = GameStateMachine.actDefault;
            setup.setAction(GameState.Start, this.actStart);
            // setup.setAction(GameState.Running, <ƒ.General>this.actRunning);
            setup.setAction(GameState.NextStage, this.actNextStage);
            setup.setAction(GameState.Victory, this.actVictory);
            setup.setAction(GameState.Defeat, this.actDefeat);
            setup.setTransition(GameState.Wait, GameState.NextStage, GameStateMachine.transitNextStage);
            return setup;
        }
        static transitDefault(_machine) {
            //nothing?
            console.log("default transition");
        }
        static actDefault(_machine) {
            //not needed?
            console.log("default action", _machine.stateCurrent);
        }
        static actStart(_machine) {
            //spawn enemies
            Script.addEnemy(_machine.stages[_machine.currentStage].enemyCount);
            console.warn("EnemyCount for stage " + _machine.currentStage + 1 + " : " + _machine.stages[_machine.currentStage].enemyCount);
            Script.counterGUI = new Script.GUI(Script.GUIType.EnemyCount, _machine.stages[_machine.currentStage].enemyCount);
            console.log("Gamestate", _machine.stateCurrent, "Action");
            _machine.transit(GameState.Wait);
        }
        // private static actRunning(_machine: GameStateMachine) {
        //   //not needed?
        //   console.log("running action");
        // }
        static transitNextStage(_machine) {
            console.log("GameState Transition from Wait to Next Stage");
            console.log(_machine.stages, _machine.stages.length);
            // if (_machine.stages.length < _machine.currentStage + 1) {
            if (_machine.stages[_machine.currentStage + 1]) {
                _machine.currentStage++;
                _machine.frameCounter = 0;
                let notification = document.querySelector("div#notification");
                notification.hidden = false;
                Script.addEnemy(_machine.stages[_machine.currentStage].enemyCount);
                console.warn("EnemyCount for stage " + _machine.currentStage + 1 + " : " + _machine.stages[_machine.currentStage].enemyCount);
                Script.counterGUI.enemyCounter = _machine.stages[_machine.currentStage].enemyCount;
            }
            else {
                _machine.frameCounter = -100;
                _machine.transit(GameState.Victory);
            }
        }
        static actNextStage(_machine) {
            if (_machine.frameCounter < 0) {
                _machine.transit(GameState.Victory);
                return;
            }
            _machine.frameCounter++;
            if (_machine.frameCounter > 150) {
                let notification = document.querySelector("div#notification");
                notification.hidden = true;
                _machine.transit(GameState.Wait);
            }
        }
        static actVictory(_machine) {
            console.log("Action", _machine.stateCurrent);
            let notification = document.querySelector("div#notification");
            notification.querySelector("h1").innerText = "Your Flame never fades!!  Congratulations, you cleared all stages!";
            notification.hidden = false;
            // Why doesn't it stop?
            ƒ.Loop.stop();
        }
        static actDefeat(_machine) {
            console.log("Action", _machine.stateCurrent);
            let notification = document.querySelector("div#notification");
            notification.querySelector("h1").innerText = "Your Flame got extinguished! Try again.";
            notification.hidden = false;
            // WHY DOESN'T IT STOOOOOOOOPPP????
            ƒ.Loop.stop();
        }
    }
    GameStateMachine.instructions = GameStateMachine.getInstructions();
    Script.GameStateMachine = GameStateMachine;
})(Script || (Script = {}));
///<reference path="./Entity.ts"/>
///<reference path="./Main.ts"/>
var Script;
///<reference path="./Entity.ts"/>
///<reference path="./Main.ts"/>
(function (Script) {
    // enum Direction {
    //   Up, Right, Down, Left
    // };
    class Goriya extends Script.Entity {
        // private targetUpdateTimeout: Timeout;
        constructor(_spawnPosition, _data) {
            super(_data);
            // protected hiddenTextureSrc: string = "./Images/Goriya-Hidden22x25.png";
            // protected textureSrc: string = "./Images/Goriya22x25.png";
            this.affinity = Script.Affinity.Enemy;
            this.hasIFrames = false;
            this.health = 10;
            this.hasIFrames = false;
            this.addEventListener("Damage", this.takeDamage.bind(this));
            this.addEventListener("enemyIsClose", this.unveil.bind(this));
            this.mtxLocal.translate(_spawnPosition);
            this.target = Script.flame.mtxLocal.translation.toVector2();
            this.isUnveiled = false;
            this.initializeAnimations();
        }
        attack(_event) {
        }
        die() {
            Script.hdlDestruction(this, Script.entities);
        }
        unveil() {
            this.removeEventListener("enemyIsClose", this.unveil);
            this.isUnveiled = true;
            this.spriteNode.setAnimation(this.animations.side);
        }
        update(_deltaTime) {
            this.move(_deltaTime);
            if (this.isUnveiled) {
                if (this.velocity.y > 0 && this.velocity.y > Script.getAmount(this.velocity.x)) {
                    // move up
                    this.spriteNode.setAnimation(this.animations.up);
                }
                else if (this.velocity.y <= 0 && Script.getAmount(this.velocity.y) > Script.getAmount(this.velocity.x)) {
                    // move down
                    this.spriteNode.setAnimation(this.animations.down);
                }
                else if (this.velocity.x < 0) {
                    // move left
                    this.spriteNode.setAnimation(this.animations.side);
                    // turn sprite
                    this.spriteNode.mtxLocal.rotation = ƒ.Vector3.Y(180);
                }
                else {
                    // move right
                    this.spriteNode.setAnimation(this.animations.side);
                }
            }
        }
        async initializeAnimations() {
            let rectangles = { "hidden": [0, 0, 22, 25] };
            await super.initializeAnimations(this.hiddenTextureSrc, rectangles, 1, 22);
            rectangles = { "down": [0, 0, 22, 25], "up": [0, 25, 22, 25] };
            await super.initializeAnimations(this.textureSrc, rectangles, 3, 22);
            rectangles = { "side": [0, 50, 22, 25] };
            await super.initializeAnimations(this.textureSrc, rectangles, 2, 22);
            // Attack Animations need to be implemented
            this.spriteNode.setAnimation(this.animations.hidden);
            this.state = Script.State.Hidden;
        }
        // Adjust later for enemy to fire fireballs
        move(_deltaTime) {
            this.velocity = ƒ.Vector2.DIFFERENCE(this.target, this.mtxLocal.translation.toVector2());
            this.velocity.normalize(this.speed);
            this.velocity.scale(_deltaTime);
            this.mtxLocal.translateX(this.velocity.x);
            this.mtxLocal.translateY(this.velocity.y);
        }
    }
    Script.Goriya = Goriya;
})(Script || (Script = {}));
///<reference path="./Entity.ts"/>
// ///<reference path="./Main.ts"/>
var Script;
///<reference path="./Entity.ts"/>
// ///<reference path="./Main.ts"/>
(function (Script) {
    class Octo extends Script.Entity {
        constructor(_spawnPosition, _data) {
            super(_data);
            // protected textureSrc: string = "./Images/ALTTP_Octo16x16.png";
            this.affinity = Script.Affinity.Enemy;
            this.hasIFrames = false;
            this.unveil = () => {
                this.removeEventListener("enemyIsClose", this.unveil);
                this.spriteNode.setAnimation(this.animations.idle);
            };
            this.hasIFrames = false;
            // console.log("Health: ", this.health, "; Power: ", this.power, " Speed: ", this.speed);
            this.addEventListener("Damage", this.takeDamage.bind(this));
            this.addEventListener("enemyIsClose", this.unveil.bind(this));
            this.mtxLocal.translate(_spawnPosition);
            this.targetUpdateTimeout = { timeoutID: 0, duration: 0 };
            this.updateTarget();
            this.initializeAnimations();
        }
        move(_deltaTime) {
            this.velocity = ƒ.Vector2.DIFFERENCE(this.target, this.mtxLocal.translation.toVector2());
            this.velocity.normalize(this.speed);
            this.velocity.scale(_deltaTime);
            this.mtxLocal.translateX(this.velocity.x);
            this.mtxLocal.translateY(this.velocity.y);
        }
        updateTarget() {
            this.target = Script.flame.mtxLocal.translation.toVector2();
            ;
            this.targetUpdateTimeout.timeoutID = setTimeout(() => {
                this.updateTarget();
            }, 2500);
        }
        attack() {
        }
        takeDamage(_event) {
            super.takeDamage(_event);
            if (this.health <= 0) {
                this.die();
            }
            // console.log(this, "takes damage ", _event.detail._sourcePos);
        }
        die() {
            Script.hdlDestruction(this, Script.entities);
        }
        update(_deltaTime) {
            this.move(_deltaTime);
        }
        async initializeAnimations() {
            let rectangles = { "hidden": [0, 0, 16, 16] };
            await super.initializeAnimations(this.hiddenTextureSrc, rectangles, 1, 16);
            rectangles = { "idle": [0, 0, 16, 16], "death": [32, 0, 16, 16] };
            await super.initializeAnimations(this.textureSrc, rectangles, 2, 16);
            this.spriteNode.setAnimation(this.animations.hidden);
            this.state = Script.State.Hidden;
        }
    }
    Script.Octo = Octo;
})(Script || (Script = {}));
///<reference path="./TexturedMoveable.ts"/>
var Script;
///<reference path="./TexturedMoveable.ts"/>
(function (Script) {
    class Projectile extends Script.TexturedMoveable {
        constructor(_position, _direction, _affinity, _power, _spriteSource) {
            super("Projectile", "ProjectileSprite", Projectile.spriteDimensions);
            this.textureSrc = "./Images/Fireball16x16.png";
            this.soundSrc = "./Sounds/explosion.wav";
            this.animations = {};
            this.speed = 3;
            this.mtxLocal.translate(_position);
            _direction.normalize(this.speed);
            _direction.scale(this.speed);
            this.velocity = _direction.toVector3();
            this.adjustSprite(_direction);
            this.affinity = _affinity;
            this.textureSrc = _spriteSource;
            this.power = _power;
            // add Audio Source
            let explosionAudio = new ƒ.Audio(this.soundSrc);
            this.cmpAudio = new ƒ.ComponentAudio(explosionAudio, false, false);
            this.addComponent(this.cmpAudio);
            this.cmpAudio.volume += 5;
            this.cmpAudio.setPanner(ƒ.AUDIO_PANNER.CONE_INNER_ANGLE, 360);
            // add light
            let lightNode = new ƒ.Node("FlameLight");
            lightNode.addComponent(new ƒ.ComponentTransform);
            let light = new ƒ.LightPoint(ƒ.Color.CSS("white"));
            let cmpLight = new ƒ.ComponentLight(light);
            lightNode.addComponent(cmpLight);
            lightNode.mtxLocal.scale(ƒ.Vector3.ONE(5));
            this.appendChild(lightNode);
            this.initializeAnimations();
        }
        adjustSprite(_direction) {
            _direction.normalize();
            if (_direction.x == -1) // Left
                this.spriteNode.mtxLocal.rotateZ(180);
            if (_direction.y == 1) // Up
                this.spriteNode.mtxLocal.rotateZ(90);
            else if (_direction.y == -1) // Down
                this.spriteNode.mtxLocal.rotateZ(270);
        }
        update(_deltaTime) {
            if (this.state != Script.State.Die) {
                this.move(_deltaTime);
                this.checkForCollision();
            }
        }
        move(_deltaTime) {
            let distance = new ƒ.Vector3(this.velocity.x, this.velocity.y);
            // distance.normalize(this.speed);
            distance.scale(_deltaTime);
            this.mtxLocal.translate(distance);
            let pos = this.mtxLocal.translation;
            if (pos.x > Script.config.arena.dimensionX / 2 || pos.x < -Script.config.arena.dimensionX / 2 ||
                pos.y > Script.config.arena.dimensionY / 2 || pos.y < -Script.config.arena.dimensionY / 2) {
                this.state = Script.State.Die;
                Script.hdlDestruction(this, Script.projectiles);
            }
        }
        checkForCollision() {
            for (const entity of Script.entities) {
                if (this.affinity != entity.affinity) {
                    let posDifference = ƒ.Vector3.DIFFERENCE(this.mtxLocal.translation, entity.mtxLocal.translation);
                    posDifference = posDifference.toVector2();
                    if (posDifference.magnitude < 6) {
                        let dimensions = ƒ.Vector2.SUM(this.hitbox, entity.hitbox);
                        posDifference = new ƒ.Vector2(Script.getAmount(posDifference.x), Script.getAmount(posDifference.y));
                        if (dimensions.x > posDifference.x && dimensions.y > posDifference.y) {
                            // character.takeDamage(character.power, character.mtxLocal.translation);
                            let damageEvent = new CustomEvent("Damage", { bubbles: true, detail: { _sourcePower: this.power, _sourcePos: this.mtxLocal.translation } });
                            entity.dispatchEvent(damageEvent);
                            // play explosion
                            this.cmpAudio.play(true);
                            this.state = Script.State.Die;
                            // then destroy projectile
                            setTimeout(() => {
                                Script.hdlDestruction(this, Script.projectiles);
                            }, 1000);
                        }
                    }
                }
            }
        }
        // private checkForCollision(): void {
        //   for (const entity of entities) {
        //     if (this.affinity != entity.affinity) {
        //       let posDifference: ƒ.Vector3 | ƒ.Vector2 = ƒ.Vector3.DIFFERENCE(this.mtxLocal.translation, entity.mtxLocal.translation);
        //       posDifference = posDifference.toVector2();
        //       if (posDifference.magnitude < 6) {
        //         let dimensions: ƒ.Vector2 = ƒ.Vector2.SUM(this.hitbox, entity.hitbox);
        //         posDifference = new ƒ.Vector2(getAmount(posDifference.x), getAmount(posDifference.y));
        //         if (dimensions.x > posDifference.x && dimensions.y > posDifference.y) {
        //           // character.takeDamage(character.power, character.mtxLocal.translation);
        //           let damageEvent: Event = new CustomEvent("Damage", { bubbles: true, detail: { _sourcePower: this.power, _sourcePos: this.mtxLocal.translation } })
        //           entity.dispatchEvent(damageEvent);
        //           // play explosion
        //           this.cmpAudio.play(true);
        //           this.state = State.Die;
        //           // then destroy projectile
        //           setTimeout(() => {
        //             hdlDestruction(this, projectiles);
        //           }, 1000);
        //         }
        //       }
        //     }
        //   }
        // }
        async initializeAnimations() {
            let rectangles = { "idle": [0, 0, 16, 16] };
            await super.initializeAnimations(this.textureSrc, rectangles, 1, this.resolution);
            this.spriteNode.setAnimation(this.animations.idle);
            this.state = Script.State.Idle;
        }
    }
    Projectile.spriteDimensions = new ƒ.Vector2(16, 16);
    Script.Projectile = Projectile;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map