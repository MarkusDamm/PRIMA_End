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

    public static get getDimensions(): ƒ.Vector2 { return AttributeUp.dimensions }

    public get getPowerBoost(): number[] { return this.powerBoost }

    private async setupNode(_event: Event): Promise<void> {
      let cmpMat: ƒ.ComponentMaterial = this.node.getComponent(ƒ.ComponentMaterial);
      let texture: ƒ.TextureImage = new ƒ.TextureImage();
      switch (this.boostKind) {
        case BoostKind.Speed:
          await texture.load(AttributeUp.speedTextureSource);
          break;
        case BoostKind.Health:
          await texture.load(AttributeUp.healthTextureSource);
          break;
        case BoostKind.Power:
          await texture.load(AttributeUp.powerTextureSource);
          break;
        case BoostKind.AttackSpeed:
          await texture.load(AttributeUp.attackSpeedTextureSource);
          this.powerBoost[this.boostKind] = -50; // generic number for reducing the time between attacks
          break;
        default:
          console.warn("No valid kind of boost detected.");
          break;
      }
      let coat: ƒ.CoatRemissiveTextured = new ƒ.CoatRemissiveTextured(ƒ.Color.CSS("white"), texture);
      let mat: ƒ.Material = new ƒ.Material("TileMaterial", ƒ.ShaderLitTextured, coat);
      this.node.addComponent(new ƒ.ComponentMaterial(mat));
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
    }


  }
}