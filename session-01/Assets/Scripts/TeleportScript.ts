import { Collider, Debug, Quaternion, Transform, Vector3 } from 'UnityEngine'
import { ZepetoCharacter } from 'ZEPETO.Character.Controller'
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class TeleportScript extends ZepetoScriptBehaviour {
    public spawnPoint: Transform;
    Start() {    

    }

    OnTriggerEnter(other: Collider) {
        //CODE: Use Debug.Log to log the name of game object that entered the trigger of the game object this TeleportScript is attached to
        console.log("Entered Trigger");
        
        //TIP:  This if block checks to see if game object that entered the trigger of the game object this TeleportScript is attached to has a ZepetoCharacter component attached to it
        //      Only a ZEPETO character would have a ZepetoCharacter component attached to it, so this would mean a ZEPETO character triggered the trigger
        let character = other.gameObject.GetComponent<ZepetoCharacter>();
        if (character != undefined)
        {
        //CODE: Get the ZepetoCharacter component through the Collider name other that was pass into OnTriggerEnter
        //      Call the Teleport function that exist in the ZepetoCharacter class, and teleport to position 0 for x, 0 for y, and 0 for z
            character.Teleport(this.spawnPoint.position, Quaternion.identity);
        }
    }

}