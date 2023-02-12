namespace Script {
  import ƒAid = FudgeAid;

  export enum State {
    Idle, Move, Attack, Die, Hurt
  }
  export interface Rectangles { [label: string]: number[]; }


  import ƒ = FudgeCore;
  export abstract class Character extends ƒ.Node {
    protected textureSrc: string;
    protected spriteNode: ƒAid.NodeSprite;
    protected animations: ƒAid.SpriteSheetAnimations;

    /** 
     * =16; 16 pixel equal one length unit
    */
    protected readonly resolution: number = 16;
    protected health: number;
    protected speed: number;
    public power: number;
    public hitbox: ƒ.Vector2;
    protected state: State;
    protected hasIFrames: boolean;

    /**
     * Create an character (Node) and add an transform-component
     */
    constructor(_name: string, _spriteDimensions: ƒ.Vector2) {
      super(_name);
      this.addComponent(new ƒ.ComponentTransform);
      this.mtxLocal.translateZ(1);
      this.hitbox = ƒ.Vector2.SCALE(_spriteDimensions, 1 / 32);
      console.log(this.hitbox);

    }

    public abstract move(): void;
    abstract attack(): void;
    public takeDamage(_sourcePower: number, _sourcePos: ƒ.Vector2 | ƒ.Vector3): void {
      if (!this.hasIFrames) {
        if (_sourcePos.z) {
          _sourcePos.toVector2();
        }

        this.health -= _sourcePower;
      }
    }
    abstract die(): void;
    public abstract update(): void;
    public abstract initializeAnimations(): Promise<void>;

    /**
    * initializes multiple animation with the same amount of frames
    */
    protected initializeAnimationsByFrames(_coat: ƒ.CoatTextured, _rectangles: Rectangles, _frames: number, _orig: ƒ.ORIGIN2D, _offsetNext: ƒ.Vector2): void {
      for (let key in _rectangles) {
        const rec: number[] = _rectangles[key];
        let anim: ƒAid.SpriteSheetAnimation = new ƒAid.SpriteSheetAnimation(key, _coat);
        let fRec: ƒ.Rectangle = ƒ.Rectangle.GET(rec[0], rec[1], rec[2], rec[3]);
        anim.generateByGrid(fRec, _frames, this.resolution, _orig, _offsetNext);
        console.log(key);

        this.animations[key] = anim;
      }
    }

  }

}