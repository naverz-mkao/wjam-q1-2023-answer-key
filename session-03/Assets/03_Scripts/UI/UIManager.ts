import { TextMeshProUGUI } from 'TMPro';
import {GameObject, Vector2 } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { PlayerTeam } from '../Game Management/GameManager';
import { GameState } from '../Game Management/Multiplay/ClientScript';
import Main from '../Main';
import UICharacterController from './UICharacterController';

export default class UIManager extends ZepetoScriptBehaviour {
    public uicontroller: UICharacterController;
    public messageText: TextMeshProUGUI;
    public timerText: TextMeshProUGUI;
    
    public titleUI: GameObject;
    public titleFX: GameObject;
    public Init()
    {
        
    }
    
    public InitUI(uicontroller: UICharacterController)
    {
        this.uicontroller = uicontroller;
        this.SetUIState(GameState.Wait);
    }
    
    public SetUIState(state: GameState)
    {
        console.log("Setting State: " + state);
        if (state == GameState.Wait)
        {
            this.titleUI.SetActive(true);
            this.titleFX.SetActive(true);
        }
        else if (state == GameState.GameReady)
        {
            this.titleUI.SetActive(false);
            this.titleFX.SetActive(false);
        }
        else if (state == GameState.GameStart)
        {
            this.titleUI.SetActive(false);
            this.titleFX.SetActive(false);
        }
        else if (state == GameState.GameFinish)
        {
            this.titleUI.SetActive(false);
            this.titleFX.SetActive(false);
        }
    }

    UpdateMeetingTimer(timer: number)
    {
        this.timerText.text = Math.max(0,timer).toString();
    }
    
    public SetTeam(team: PlayerTeam)
    {
        if (team == PlayerTeam.VIRUS)
        {
            this.UpdateUIConsole("You are the Virus. Go destroy the system!");
        }
        else if (team == PlayerTeam.SURVIVOR)
        {
            this.UpdateUIConsole("You are not the virus. Find the Virus and save zepeto!");
        }
        else if (team == PlayerTeam.GHOST)
        {
            this.UpdateUIConsole("You died... You can still help though, by completing missions!");
        }
    }
    
    public UpdateUIConsole(message: string)
    {
        this.messageText.text = message;
    }
}
