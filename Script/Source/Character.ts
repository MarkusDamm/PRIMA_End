namespace Script {
  import ƒAid = FudgeAid;

  export enum State {
    Idle, Move, Attack, Die, Hurt
  }
  export interface Rectangles { [label: string]: number[]; }


  import ƒ = FudgeCore;
  export abstract class Character extends ƒ.Node {
    protected textureSrc: string;
    protected hiddenTextureSrc: string = "./Images/Hidden.png";
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
      this.hitbox = ƒ.Vector2.SCALE(_spriteDimensions, 1 / 32);
      console.log(this.hitbox);

    }

    // protected abstract move(): void;
    abstract attack(): void;
    public takeDamage(_sourcePower: number, _sourcePos: ƒ.Vector3): void {
      if (!this.hasIFrames) {

        this.health -= _sourcePower;
      }
    }
    abstract die(): void;
    abstract unveil(): void;
    public abstract update(_deltaTime: number): void;
    public async initializeAnimations(): Promise<void>{
      let texture: ƒ.TextureImage = new ƒ.TextureImage();
      await texture.load(this.hiddenTextureSrc);
      let coat: ƒ.CoatTextured = new ƒ.CoatTextured(ƒ.Color.CSS("white"), texture);
      let animationFrames: number = 1;
      let origin: ƒ.ORIGIN2D = ƒ.ORIGIN2D.CENTER;
      let offsetNext: ƒ.Vector2 = ƒ.Vector2.X(16);

      let rectangles: Rectangles = { "hidden": [0, 0, 16, 16] };

      this.initializeAnimationsByFrames(coat, rectangles, animationFrames, origin, offsetNext);

      this.spriteNode.setFrameDirection(1);
      this.spriteNode.framerate = 6;

    }

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