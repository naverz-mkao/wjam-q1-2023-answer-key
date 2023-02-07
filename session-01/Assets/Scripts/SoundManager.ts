import { AudioSource } from 'UnityEngine'
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class SoundManager extends ZepetoScriptBehaviour {
    //CODE: Create a public variable called CollectCoinAudio of type AudioSource
    //      In the inspector, drag the Audio Source component on the SoundManager game object into the CollectCoinAudio field
    public collectCoinAudio: AudioSource;
    
    public PlayCoinCollectSound() {
        //CODE: Call the Play function that exist in the AudioSource class to play your sound
        this.collectCoinAudio.Play();
    }
}