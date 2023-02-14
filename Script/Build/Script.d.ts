declare namespace Script {
    import ƒ = FudgeCore;
    abstract class Character extends TexturedMoveable {
        protected hiddenTextureSrc: string;
        protected health: number;
        power: number;
        hitbox: ƒ.Vector2;
        protected state: State;
        protected hasIFrames: boolean;
        /**
         * Create an character (Node) and add an transform-component
         */
        constructor(_name: string, _spriteName: string, _spriteDimensions: ƒ.Vector2);
        abstract attack(_event?: Event | KeyboardEvent): void;
        takeDamage(_sourcePower: number, _sourcePos: ƒ.Vector3): void;
        abstract die(): void;
        abstract unveil(): void;
    }
}
declare namespace Script {
    /** Control as singleton, since only one instance is necessary*/
    class Control {
        private static instance;
        controlType: ƒ.CONTROL_TYPE;
        controls: ƒ.Control[];
        horizontal: ƒ.Control;
        vertical: ƒ.Control;
        camHor: ƒ.Control;
        camVer: ƒ.Control;
        private constructor();
        /**
         * get the Instance from Control. Since it is a Singleton,
         * it can't be instantiated multiple times.  If no instance exist,
         * it will create one.
         */
        static getInstance(): Control;
        /**
         * update Control with deltaTime
         * @param _deltaTime time since last update
         */
        update(_deltaTime: number): void;
        private moveCam;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class CustomComponentScript extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        message: string;
        constructor();
        hndEvent: (_event: Event) => void;
    }
}
declare namespace Script {
    import ƒAid = FudgeAid;
    interface Timeout {
        timeoutID: number;
        duration: number;
    }
    import ƒ = FudgeCore;
    class Flame extends Character {
        protected textureSrc: string;
        protected animations: ƒAid.SpriteSheetAnimations;
        fireballTextureSrc: string;
        /**
         * saves the id from the last started timeout related to taking damage as well as the remaining duration
         */
        private hitTimeout;
        private velocity;
        private lightNode;
        constructor();
        get getSpeed(): number;
        attack(_event: KeyboardEvent): void;
        protected move(): void;
        die(): void;
        takeDamage(_sourcePower: number, _sourcePos: ƒ.Vector3): void;
        private startIFrames;
        update(): void;
        initializeAnimations(): Promise<void>;
        /**
         * adjusts the animation to the given _state
         * @param _state current Frame
         */
        private chooseAnimation;
        unveil(): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    enum Affinity {
        Flame = 0,
        Enemy = 1
    }
    enum State {
        Idle = 0,
        Move = 1,
        Attack = 2,
        Die = 3,
        Hurt = 4
    }
    let camNode: ƒ.Node;
    let flame: Flame;
    let config: any;
    /**
     * get the amount (Betrag) of a number
     */
    function getAmount(_number: number): number;
}
declare namespace Script {
    import ƒAid = FudgeAid;
    class Octo extends Character {
        protected textureSrc: string;
        protected animations: ƒAid.SpriteSheetAnimations;
        private target;
        private targetUpdateTimeout;
        constructor(_spawnPosition: ƒ.Vector3);
        protected move(_deltaTime: number): void;
        private updateTarget;
        attack(): void;
        takeDamage(): void;
        die(): void;
        update(_deltaTime: number): void;
        initializeAnimations(): Promise<void>;
        unveil: () => void;
    }
}
declare namespace Script {
}
declare namespace Script {
    class Projectile extends TexturedMoveable {
        spriteSource: string;
        velocity: ƒ.Vector2;
        affinity: Affinity;
        constructor(_position: ƒ.Vector3, _direction: ƒ.Vector2, _affinity: Affinity, _spriteSource: string);
        update(_deltaTime: number): void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    interface Rectangles {
        [label: string]: number[];
    }
    abstract class TexturedMoveable extends ƒ.Node {
        protected textureSrc: string;
        protected spriteNode: ƒAid.NodeSprite;
        protected animations: ƒAid.SpriteSheetAnimations;
        /**
         * =16; 16 pixel equal one length unit
        */
        protected readonly resolution: number;
        protected speed: number;
        constructor(_name: string, _spriteName: string);
        abstract update(_deltaTime: number): void;
        /**
         * initializes the animations with
         * @param _textureSrc URL to texture
         * @param _rectangles Rectangles (Interface), to set up animation-frames
         * @param _frames frames of the animation
         * @param _offsetX offset to next frame
         */
        initializeAnimations(_textureSrc: string, _rectangles: Rectangles, _frames: number, _offsetX: number): Promise<void>;
        /**
        * initializes multiple animation with the same amount of frames
        */
        protected initializeAnimationsByFrames(_coat: ƒ.CoatTextured, _rectangles: Rectangles, _frames: number, _orig: ƒ.ORIGIN2D, _offsetNext: ƒ.Vector2): void;
    }
}
