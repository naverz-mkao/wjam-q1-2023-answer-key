import { Transform, Vector3, Collider, Color, GameObject, Renderer } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import InteractibleObject from '../Interactibles/InteractibleObject';
import Main from '../Main';
import CharacterController from './CharacterController';

export default class CharacterTriggerCheck extends ZepetoScriptBehaviour {
    
    public myCC : CharacterController;
    
    private myCol : Collider;
    
    public Start()
    {
        this.myCC = Main.instance.characterController;
        this.myCol = this.GetComponent<Collider>();
    }
    
    public OnTriggerEnter(other: Collider)
    {
        if (other.gameObject.tag == "Survivor" && this.myCC.IsVirus())
        {
            this.myCC.AddTarget(other.gameObject.name);
        }
    }
    
    public OnTriggerExit(other: Collider)
    {
        if (other.gameObject.tag == "Survivor" && this.myCC.IsVirus())
        {
            this.myCC.RemoveTarget(other.gameObject.name);
        }
    }

}