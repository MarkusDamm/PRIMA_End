"use strict";
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
            this.hitbox = ƒ.Vector2.SCALE(_spriteDimensions, 1 / 32);
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
///<reference path="./TexturedMoveable.ts"/>
var Script;
///<reference path="./TexturedMoveable.ts"/>
(function (Script) {
    class Character extends Script.TexturedMoveable {
        /**
         * Create an character (Node) and add an transform-component
         */
        constructor(_name, _spriteName, _spriteDimensions) {
            super(_name, _spriteName, _spriteDimensions);
            this.hiddenTextureSrc = "./Images/Hidden.png";
            this.hasIFrames = false;
            this.takeDamage = (_event) => {
                if (!this.hasIFrames) {
                    this.health -= _event.detail._sourcePower;
                }
                console.log(this.health);
            };
        }
    }
    Script.Character = Character;
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
///<reference path="./Character.ts"/>
var Script;
///<reference path="./Character.ts"/>
(function (Script) {
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
    var ƒ = FudgeCore;
    class Flame extends Script.Character {
        constructor() {
            super("Flame", "FlameSprite", new ƒ.Vector2(32, 32));
            this.textureSrc = "./Images/H-Sheet32x32.png";
            this.animations = {};
            this.fireballTextureSrc = "./Images/Fireball16x16.png";
            this.affinity = Script.Affinity.Flame;
            this.velocity = new ƒ.Vector2();
            this.attack = (_event) => {
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
                // console.log(this.mtxLocal.translation);
                let projectile = new Script.Projectile(this.mtxLocal.translation, attackDirection, Script.Affinity.Flame, this.power, this.fireballTextureSrc);
                Script.hdlCreation(projectile, Script.projectiles);
            };
            this.takeDamage = (_event) => {
                super.takeDamage(_event);
                if (!this.hasIFrames) {
                    this.startIFrames(_event.detail._sourcePower * 1000);
                }
            };
            this.speed = Script.config.player.speed;
            this.health = Script.config.player.health;
            this.power = Script.config.player.power;
            this.addEventListener("Damage", this.takeDamage);
            // add light
            this.lightNode = new ƒ.Node("FlameLight");
            this.lightNode.addComponent(new ƒ.ComponentTransform);
            let light = new ƒ.LightPoint(ƒ.Color.CSS("white"));
            let cmpLight = new ƒ.ComponentLight(light);
            this.lightNode.addComponent(cmpLight);
            this.lightNode.mtxLocal.scale(ƒ.Vector3.ONE(20));
            this.appendChild(this.lightNode);
            this.hitTimeout = { timeoutID: 0, duration: 0 };
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
        unveil() {
            // propably useless here
        }
    }
    Script.Flame = Flame;
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
        State[State["Idle"] = 0] = "Idle";
        State[State["Move"] = 1] = "Move";
        State[State["Attack"] = 2] = "Attack";
        State[State["Die"] = 3] = "Die";
        State[State["Hurt"] = 4] = "Hurt";
    })(State = Script.State || (Script.State = {}));
    ;
    // from config
    let stageDimension;
    let floorTileSrc;
    // global variables
    let viewport;
    let branch;
    Script.characters = [];
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
        stageDimension = new ƒ.Vector2(Script.config.stage.dimensionX, Script.config.stage.dimensionY);
        floorTileSrc = Script.config.stage.floorTextureSource;
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
        branch.appendChild(Script.flame);
        // characters.push(flame);
        document.addEventListener("keydown", Script.flame.attack);
        addEnemy(10);
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function addEnemy(_amount) {
        for (let index = 0; index < _amount; index++) {
            let randomX;
            if (Math.random() - 0.5 < 0)
                randomX = randomNumber(-stageDimension.x / 2, -stageDimension.x / 4);
            else
                randomX = randomNumber(stageDimension.x / 4, stageDimension.x / 2);
            let randomY;
            if (Math.random() - 0.5 < 0)
                randomY = randomNumber(-stageDimension.y / 2, -stageDimension.y / 4);
            else
                randomY = randomNumber(stageDimension.y / 4, stageDimension.y / 2);
            let randomPos = new ƒ.Vector3(randomX, randomY);
            let enemy = new Script.Octo(randomPos);
            enemy.addEventListener("enemyIsClose", enemy.unveil);
            hdlCreation(enemy, Script.characters);
            // enemy.initializeAnimations();
            // branch.appendChild(enemy);
            // characters.push(enemy);
        }
    }
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
        for (const character of Script.characters) {
            character.update(deltaTime);
        }
        for (const projectile of Script.projectiles) {
            projectile.update(deltaTime);
        }
        checkHitbox();
        // ƒ.Physics.simulate();  // if physics is included and used
        viewport.draw();
        // ƒ.AudioManager.default.update();
    }
    function checkHitbox() {
        for (const character of Script.characters) {
            let posDifference = ƒ.Vector3.DIFFERENCE(Script.flame.mtxLocal.translation, character.mtxLocal.translation);
            posDifference = posDifference.toVector2();
            if (posDifference.magnitude < 6) {
                character.dispatchEventToTargetOnly(new CustomEvent("enemyIsClose"));
                let dimensions = ƒ.Vector2.SUM(Script.flame.hitbox, character.hitbox);
                posDifference = new ƒ.Vector2(getAmount(posDifference.x), getAmount(posDifference.y));
                if (dimensions.x > posDifference.x && dimensions.y > posDifference.y) {
                    let damageEvent = new CustomEvent("Damage", { bubbles: false, detail: { _sourcePower: this.power, _sourcePos: this.mtxLocal.translation } });
                    Script.flame.dispatchEventToTargetOnly(damageEvent);
                    // flame.takeDamage(character.power, character.mtxLocal.translation);
                }
            }
        }
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
    function hdlCreation(_creation, _array) {
        _creation.initializeAnimations();
        branch.appendChild(_creation);
        _array.push(_creation);
        // console.log(_creation, _array);
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
    }
    Script.hdlDestruction = hdlDestruction;
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
                floorTile.mtxLocal.translateZ(-1);
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
    class Octo extends Script.Character {
        constructor(_spawnPosition) {
            super("Octo", "OctoSprite", new ƒ.Vector2(16, 16));
            this.textureSrc = "./Images/ALTTP_Octo16x16.png";
            this.animations = {};
            this.affinity = Script.Affinity.Enemy;
            this.hasIFrames = false;
            this.health = 10;
            this.takeDamage = (_event) => {
                // super.takeDamage(_event);
                if (!this.hasIFrames) {
                    this.health -= _event.detail._sourcePower;
                }
                // console.log(this.health);
                if (this.health <= 0) {
                    this.die();
                }
                // console.log(this, "takes damage ", _event.detail._sourcePos);
            };
            this.unveil = () => {
                this.spriteNode.setAnimation(this.animations.idle);
            };
            this.speed = Script.config.enemy.speed;
            this.health = Script.config.enemy.health;
            this.power = Script.config.enemy.power;
            this.hasIFrames = false;
            // console.log("Health: ", this.health, "; Power: ", this.power, " Speed: ", this.speed);
            this.addEventListener("Damage", this.takeDamage);
            this.mtxLocal.translate(_spawnPosition);
            this.targetUpdateTimeout = { timeoutID: 0, duration: 0 };
            this.updateTarget();
        }
        move(_deltaTime) {
            let dir = ƒ.Vector3.DIFFERENCE(this.target, this.mtxLocal.translation);
            dir.normalize(this.speed);
            dir.scale(_deltaTime);
            this.mtxLocal.translateX(dir.x);
            this.mtxLocal.translateY(dir.y);
        }
        updateTarget() {
            this.target = Script.flame.mtxLocal.translation;
            this.targetUpdateTimeout.timeoutID = setTimeout(() => {
                this.updateTarget();
            }, 2500);
        }
        attack() {
        }
        die() {
            Script.hdlDestruction(this, Script.characters);
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
            // add light
            let lightNode = new ƒ.Node("FlameLight");
            lightNode.addComponent(new ƒ.ComponentTransform);
            let light = new ƒ.LightPoint(ƒ.Color.CSS("white"));
            let cmpLight = new ƒ.ComponentLight(light);
            lightNode.addComponent(cmpLight);
            lightNode.mtxLocal.scale(ƒ.Vector3.ONE(5));
            this.appendChild(lightNode);
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
            if (pos.x > Script.config.stage.dimensionX / 2 || pos.x < -Script.config.stage.dimensionX / 2 ||
                pos.y > Script.config.stage.dimensionY / 2 || pos.y < -Script.config.stage.dimensionY / 2) {
                this.state = Script.State.Die;
                Script.hdlDestruction(this, Script.projectiles);
            }
        }
        checkForCollision() {
            for (const character of Script.characters) {
                if (this.affinity != character.affinity) {
                    let posDifference = ƒ.Vector3.DIFFERENCE(this.mtxLocal.translation, character.mtxLocal.translation);
                    posDifference = posDifference.toVector2();
                    if (posDifference.magnitude < 6) {
                        let dimensions = ƒ.Vector2.SUM(this.hitbox, character.hitbox);
                        posDifference = new ƒ.Vector2(Script.getAmount(posDifference.x), Script.getAmount(posDifference.y));
                        if (dimensions.x > posDifference.x && dimensions.y > posDifference.y) {
                            // character.takeDamage(character.power, character.mtxLocal.translation);
                            let damageEvent = new CustomEvent("Damage", { bubbles: true, detail: { _sourcePower: this.power, _sourcePos: this.mtxLocal.translation } });
                            character.dispatchEvent(damageEvent);
                            // play explosion
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