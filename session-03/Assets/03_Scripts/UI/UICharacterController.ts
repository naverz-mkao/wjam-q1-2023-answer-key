import { PointerEventData } from 'UnityEngine.EventSystems';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {GameObject, Vector2} from "UnityEngine";
import { PlayerTeam } from '../Game Management/GameManager';
import { Button } from 'UnityEngine.UI';
import Main from '../Main';

export default class UICharacterController extends ZepetoScriptBehaviour {
    public killButton: Button;
    
    public Start()
    {   
        this.killButton.gameObject.SetActive(false);
        this.killButton.onClick.AddListener(() => { Main.instance.characterController.Kill(); });
    }

    public SetTeam(team: PlayerTeam)
    {
        switch (team)
        {
            case PlayerTeam.VIRUS:
                this.killButton.gameObject.SetActive(true);
                
                this.EnableKill(false);
                break;
            case PlayerTeam.SURVIVOR:
                this.killButton.gameObject.SetActive(false);
                break;
            case PlayerTeam.GHOST:
                this.killButton.gameObject.SetActive(false);
                break;
        }
    }
    public EnableKill(b: bool)
    {
        this.killButton.interactable = b;
    }
}