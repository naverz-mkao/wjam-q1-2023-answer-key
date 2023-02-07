import { ZepetoPlayers, SpawnInfo, LocalPlayer } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { WorldService } from 'ZEPETO.World';

export default class CharacterLoader extends ZepetoScriptBehaviour {

    Start() {    
        //CODE: Call the CreatePlayerWithUserId function in the ZepetoPlayers class to load in your character avatar
        //TIP:  WorldService.userId will give the user id of the user logged into Unity or the user logged in on device
        ZepetoPlayers.instance.CreatePlayerWithUserId(WorldService.userId, new SpawnInfo(), true);
    }
}