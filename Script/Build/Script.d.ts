declare namespace Script {
    import ƒAid = FudgeAid;
    enum State {
        Idle = 0,
        Move = 1,
        Attack = 2,
        Die = 3,
        Hurt = 4
    }
    interface Rectangles {
        [label: string]: number[];
    }
    import ƒ = FudgeCore;
    abstract class Character extends ƒ.Node {
        protected textureSrc: string;
        protected spriteNode: ƒAid.NodeSprite;
        protected animations: ƒAid.SpriteSheetAnimations;
        /**
         * =16; 16 pixel equal one length unit
        */
        protected readonly resolution: number;
        protected health: number;
        protected speed: number;
        power: number;
        hitbox: ƒ.Vector2;
        protected state: State;
        protected hasIFrames: boolean;
        /**
         * Create an character (Node) and add an transform-component
         */
        constructor(_name: string, _spriteDimensions: ƒ.Vector2);
        abstract move(): void;
        abstract attack(): void;
        takeDamage(_sourcePower: number, _sourcePos: ƒ.Vector2 | ƒ.Vector3): void;
        abstract die(): void;
        abstract update(): void;
        abstract initializeAnimations(): Promise<void>;
        /**
        * initializes multiple animation with the same amount of frames
        */
        protected initializeAnimationsByFrames(_coat: ƒ.CoatTextured, _rectangles: Rectangles, _frames: number, _orig: ƒ.ORIGIN2D, _offsetNext: ƒ.Vector2): void;
    }
}
declare namespace Script {
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
         * update Control witch deltaTime(time since last update)
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
    import ƒ = FudgeCore;
    class Flame extends Character {
        protected textureSrc: string;
        protected animations: ƒAid.SpriteSheetAnimations;
        /**
         * saves the id from the last started timeout
         */
        private timeout;
        private velocity;
        private lightNode;
        constructor();
        get getSpeed(): number;
        attack(): void;
        move(): void;
        die(): void;
        takeDamage(_sourcePower: number, _sourcePos: ƒ.Vector2 | ƒ.Vector3): void;
        private startIFrames;
        update(): void;
        initializeAnimations(): Promise<void>;
        /**
         * adjusts the animation to the given _state
         * @param _state current Frame
         */
        private chooseAnimation;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    let camNode: ƒ.Node;
    let flame: Flame;
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
        constructor();
        move(): void;
        attack(): void;
        takeDamage(): void;
        die(): void;
        update(): void;
        initializeAnimations(): Promise<void>;
    }
}
declare namespace Script {
    enum Direction {
        Up = 0,
        Down = 1,
        Right = 2,
        Left = 3
    }
    export class Particle extends ƒAid.NodeSprite {
        set color(_color: ƒ.Color);
        protected velocity: ƒ.Vector2;
        protected particleDirection: Direction;
        /**
         * create
         */
        constructor(_direction: Direction);
        setColorWithString(_color: string): void;
        private static createRandomDirectionVector;
    }
    export {};
}
