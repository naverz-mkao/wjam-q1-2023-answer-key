import { Quaternion, Random, Space, Time, Vector3 } from 'UnityEngine'
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class SpinScript extends ZepetoScriptBehaviour {

    //CODE: Declare 3 public variables named xSpeed, ySpeed, and zSpeed or type number whose values can be set in the inspector
    //      In the Inspector, set the values for xSpeed, ySpeed, and zSpeed to some values
    public xSpeed:number;
    public ySpeed:number;
    public zSpeed:number;

    Start() {    
    }

    Update() {
    //Code: Access the Transform component that exist on the game object that this SpinScript is attached to
    //      Call the Rotate function that exist in the Transform class to rotate the game object
    //      Note that the Rotate function takes a Vector3 as its first parameter
    //      Pass in xSpeed, ySpeed, zSpeed variables to create your Vector3
        this.transform.Rotate(new Vector3(this.xSpeed,this.ySpeed,this.zSpeed * Time.deltaTime));
    }
}