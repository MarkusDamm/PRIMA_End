namespace Script {
  import ƒ = FudgeCore;

  enum BoostKind {
    Speed, Health, Power, AttackSpeed
  }

  export class AttributeUp extends ƒ.ComponentScript {
    private static speedTextureSource: string;
    private static healthTextureSource: string;
    private static powerTextureSource: string;
    private static attackSpeedTextureSource: string;
    private static dimensions: ƒ.Vector2;
    private powerBoost: number[] = [0, 0, 0, 0];
    private boostKind: BoostKind;

    constructor() {
      super();
      let multiplier: number = 0.25;
      let randomNumber = Math.random();
      let i: number = 1;
      while (randomNumber > i * multiplier) { i++ }
      this.powerBoost[i--] = 1;
      this.boostKind = i;
      this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.setupNode.bind(this));
    }

    private setupNode(_event: Event): void {
      console.log(this.powerBoost);
      let cmpMat: ƒ.ComponentMaterial = this.node.getComponent(ƒ.ComponentMaterial);
      let texture: ƒ.TextureImage = new ƒ.TextureImage();
      switch (this.boostKind) {
        case BoostKind.Speed:
          texture.load(AttributeUp.speedTextureSource);
          break;
        case BoostKind.Health:
          texture.load(AttributeUp.healthTextureSource);
          break;
        case BoostKind.Power:
          texture.load(AttributeUp.powerTextureSource);
          break;
        case BoostKind.AttackSpeed:
          texture.load(AttributeUp.attackSpeedTextureSource);
          this.powerBoost[this.boostKind] = -50; // generic number for reducing the time between attacks
          break;
        default:
          console.warn("No valid kind of boost detected.");
          break;
      }
      let coat: ƒ.CoatRemissiveTextured = new ƒ.CoatRemissiveTextured(ƒ.Color.CSS("white"), texture);
      let mat: ƒ.Material = new ƒ.Material("TileMaterial", ƒ.ShaderLitTextured, coat);
      cmpMat.material = mat;
    }

    /**
     * setTextures
     */
    public static setTextures(_data: any) {
      AttributeUp.speedTextureSource = _data.speedTextureSource;
      AttributeUp.healthTextureSource = _data.healthTextureSource;
      AttributeUp.powerTextureSource = _data.powerTextureSource;
      AttributeUp.attackSpeedTextureSource = _data.attackSpeedTextureSource;
      AttributeUp.dimensions = new ƒ.Vector2(_data.dimensions.x, _data.dimensions.y);
      console.warn("Attribute Up Data");

      console.log(AttributeUp.speedTextureSource, AttributeUp.healthTextureSource, AttributeUp.powerTextureSource, AttributeUp.attackSpeedTextureSource, AttributeUp.dimensions, AttributeUp);

    }


  }
}