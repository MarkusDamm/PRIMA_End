namespace Script {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid
  ;
  export interface Rectangles { [label: string]: number[] };

  export abstract class TexturedMoveable extends ƒ.Node {
    protected textureSrc: string;
    protected spriteNode: ƒAid.NodeSprite;
    protected animations: ƒAid.SpriteSheetAnimations;
    public hitbox: ƒ.Vector2;

    /** 
     * =16; 16 pixel equal one length unit
    */
    protected readonly resolution: number = 16;
    protected speed: number;

    constructor(_name: string, _spriteName: string, _spriteDimensions: ƒ.Vector2) {
      super(_name);
      this.addComponent(new ƒ.ComponentTransform);

      this.spriteNode = new ƒAid.NodeSprite(_spriteName);
      this.spriteNode.addComponent(new ƒ.ComponentTransform);
      this.appendChild(this.spriteNode);

      this.hitbox = ƒ.Vector2.SCALE(_spriteDimensions, 1 / 32);
    }

    public abstract update(_deltaTime: number): void;

    /**
     * initializes the animations with
     * @param _textureSrc URL to texture
     * @param _rectangles Rectangles (Interface), to set up animation-frames
     * @param _frames frames of the animation 
     * @param _offsetX offset to next frame
     */
    public async initializeAnimations(_textureSrc: string, _rectangles: Rectangles, _frames: number, _offsetX: number): Promise<void> {
      let texture: ƒ.TextureImage = new ƒ.TextureImage();
      await texture.load(_textureSrc);

      let coat: ƒ.CoatTextured = new ƒ.CoatTextured(ƒ.Color.CSS("white"), texture);
      let origin: ƒ.ORIGIN2D = ƒ.ORIGIN2D.CENTER;
      let offsetNext: ƒ.Vector2 = ƒ.Vector2.X(_offsetX);

      this.initializeAnimationsByFrames(coat, _rectangles, _frames, origin, offsetNext);

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