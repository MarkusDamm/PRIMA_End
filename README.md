# Flame
by Markus Damm

MKB 7

Winter 2023/2024

Created in the course PRIMA from Prof. Jirka Dell'Oro-Friedl at Furtwangen University.

### [Play here](MarkusDamm.github.io/PRIMA_End/index.html)

### [Code is here](github.com/MarkusDamm/PRIMA_End/tree/master/Script/Source)

### [The Documentation](https://github.com/MarkusDamm/PRIMA_End/blob/master/Documentation/DesignDoc.pdf)

## Controls:

W A S D to move

Arrow-Keys to fireball

## Checklist for the final assignment
© Prof. Dipl.-Ing. Jirka R. Dell'Oro-Friedl, HFU
| Nr | Criterion           | Explanation                                                                                                                                     |
|---:|---------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
|  1 | Units and Positions | The zero-position is in the middle of the arena, right where the Player Character (PC) starts. 16 Pixel equal one unit in length, which gives the PC a size of 2 units in width and height.                                                                |
|  2 | Hierarchy           | All elements are direct children of the main ƒ.Node. A hierarchy was not neccessary, since groups of elements are handled by arrays.|
|  3 | Editor              | The first iteration of the arena was created with the editor, however using external data to resize the arena was better done within code only.|
|  4 | Scriptcomponents    | Scriptcomponents are used for Power-Ups only. While creating the component, it seemd more in line with the rest of the prototype to design them as a extension of the FUDGE node. A scriptcomponent could have been used to move a projectiel, which also became a extension of Node instead.                                                |
|  5 | Extend              | Most elements are a extension of the FUDGE Node. Every entity (enemies as well as the PC) and projectiles are extensions of TexturedMoveables, which derives from the FUDGE node. The visual user interface extends the FUDGE Mutable, the Game State Machine derives from the FUDGE State Machine. Using derived classes proved to be a very good way to design complex elements and easily add them to the scene.                |
|  6 | Sound               | Sound is used for the impact of projectiles to give user-feedback. The sound of an explosion plays at the position where the projectile hits a entity.|
|  7 | VUI                 | A VUI is placed in the top left corner of the screen. It shows the remaining health as well as the remaining enemies on the stage. It's update when changes to any of these properties occure. An interface to explain the controls could have been added as well.|
|  8 | Event-System        | Events are used when damage to an entity is detected as well as when enemies are close to the PC, since they turn from obscured to easily visible. In both cases they not only seem fitting, since an actual event occurred, but also because a entity can deside when to listen to an event. It opens the possibility to ignore events under spezificsurcumstances. |
|  9 | External Data       | Data about the PC and enemies, controls, the arena and power ups as well as the amount of enemies and Stages is stored in a json-file thus making changes to grafics and forbalancing possible in one file via text.|
|  A | Light               | Light was supossed to be a bigger part of the prototype's experience. A light-componentwith a point light is attaced to the PC and to projectiles. Since mostly Node Sprites from FUDGE Aid are used, most elements are not effected by light. Sadly the textured shaders don't seem to be particular consurned by point lights in FUDGE's current version (1).                                                                          |
|  B | Physics             | Physics and network funcions are not used. (0) |
|  C | Net                 | Physics and network funcions are not used. (0) |
|  D | State Machines      | State Machines are used as autonomous entity for controlling the game (1) in addition to the state machine component of a particular enemy (names Goriya) (1).|
|  E | Animation           | The PC and Enemies are animated using FUDGE aid's Sprites (1).                                                   |
