namespace Script {
  // get from Configs
  let delay: number = 300;
  let camDelay: number = 500;

  /** Control as singleton, since only one instance is necessary*/ 
  export class Control {
    private static instance: Control;
    controlType: ƒ.CONTROL_TYPE = ƒ.CONTROL_TYPE.PROPORTIONAL;
    controls: ƒ.Control[] = [];

    horizontal: ƒ.Control;
    vertical: ƒ.Control;

    camHor: ƒ.Control;
    camVer: ƒ.Control;

    private constructor() {
      this.horizontal = new ƒ.Control("horizontal", flame.getSpeed, this.controlType, delay);
      this.vertical = new ƒ.Control("vertical", flame.getSpeed, this.controlType, delay);

      this.camHor = new ƒ.Control("Camera Horizontal", flame.getSpeed, this.controlType, camDelay);
      this.camVer = new ƒ.Control("Camera Vertical", flame.getSpeed, this.controlType, camDelay);

      this.controls.push(this.horizontal, this.vertical, this.camHor, this.camVer);
    }
    /**
     * get the Instance from Control. Since it is a Singleton, 
     * it can't be instantiated multiple times.  If no instance exist,
     * it will create one.
     */
    public static getInstance(): Control {
      if (!Control.instance) {
        Control.instance = new Control();
      }
      return Control.instance;
    }

    /**
     * update Control with deltaTime  
     * @param _deltaTime time since last update
     */
    public update(_deltaTime: number): void {
      let horizontalValue: number = (
        ƒ.Keyboard.mapToValue(1, 0, [ƒ.KEYBOARD_CODE.D]) +
        ƒ.Keyboard.mapToValue(-1, 0, [ƒ.KEYBOARD_CODE.A])
      );
      let verticalValue: number = (
        ƒ.Keyboard.mapToValue(1, 0, [ƒ.KEYBOARD_CODE.W]) +
        ƒ.Keyboard.mapToValue(-1, 0, [ƒ.KEYBOARD_CODE.S])
      );

      this.horizontal.setInput(horizontalValue * _deltaTime);
      this.camHor.setInput(horizontalValue * _deltaTime);

      this.vertical.setInput(verticalValue * _deltaTime);
      this.camVer.setInput(verticalValue * _deltaTime);
      this.moveCam();
    }

    private moveCam(): void {
      let camVel: ƒ.Vector3 = new ƒ.Vector3(-this.camHor.getOutput(), this.camVer.getOutput());
      camNode.mtxLocal.translate(camVel);
    }

  }

}