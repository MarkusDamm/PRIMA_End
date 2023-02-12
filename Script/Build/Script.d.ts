declare namespace Script {
    enum State {
        Idle = 0,
        Move = 1,
        Attack = 2,
        Die = 3
    }
    import ƒ = FudgeCore;
    abstract class Character extends ƒ.Node {
        protected textureSrc: string;
        protected spriteNode: ƒAid.NodeSprite;
        protected animations: ƒAid.SpriteSheetAnimations;
        protected resolution: number;
        protected health: number;
        protected speed: number;
        protected power: number;
        protected state: State;
        /**
         * Create an character (Node) and add an transform-component
         */
        constructor(_name: string);
        abstract move(): void;
        abstract attack(): void;
        abstract takeDamage(): void;
        abstract die(): void;
        abstract update(): void;
        abstract initializeAnimations(_anim: Animation): void;
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
        velocity: ƒ.Vector2;
        protected speed: number;
        protected health: number;
        protected power: number;
        lightNode: ƒ.Node;
        constructor();
        get getSpeed(): number;
        attack(): void;
        move(): void;
        die(): void;
        takeDamage(): void;
        update(): void;
        initializeAnimations(): Promise<void>;
        /**
        * initializes multiple animation with the same amount of frames
        */
        private initializeAnimationsByFrames;
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
