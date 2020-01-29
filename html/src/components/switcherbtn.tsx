

import { h, Component } from 'preact';

if ((module as any).hot) {
    // tslint:disable-next-line:no-var-requires
    require('preact/debug');
}



export class SwitcherBtn extends Component {

    private switcherButton : HTMLElement

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        
        let theScreen = document.querySelector('.screen');

        var isGlitch = localStorage.getItem('isGlitch') === 'true';

        if (isGlitch)
            theScreen.classList.add('glitch');
        else 
            theScreen.classList.remove('glitch');

        this.switcherButton.addEventListener("click",  function (e) { 
          e.preventDefault();

          let theScreen = document.querySelector('.screen');
          theScreen.classList.toggle('glitch');

          var isGlitch = theScreen.classList.contains('glitch');
          localStorage.setItem('isGlitch', isGlitch ? 'true' : 'false');

          /*
          var audios=document.getElementsByTagName('audio');
          for (var j = 0; j < audios.length; j++) {
            audios[j].muted = !isGlitch;
          }
          */

          eval("gtag('event', 'toggle_glitch', {'event_category' : 'preferences', 'event_label' : '" + isGlitch + "'})");

          //terminal.focus();
        });

    }

    render() {

       /*
       let src = "data:audio/mpeg;charset=utf-8;base64," + initialSound;
       let type = "audio/mpeg";

       return (
           <div>
                <audio ref={c => (this.audio = c)}>
                    <source src={src} type={type} />
                    Your browser does not support the audio element.
                </audio>    
           </div> 
       ) ;
       */

      return (

            <a ref={c => (this.switcherButton = c)} class="switcher" href="#"></a>
 
      );

    }

 

}

