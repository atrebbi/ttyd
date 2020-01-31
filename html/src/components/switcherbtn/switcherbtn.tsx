

import { h, Component } from 'preact';

if ((module as any).hot) {
    // tslint:disable-next-line:no-var-requires
    require('preact/debug');
}

import './switcherbtn.scss';

export class SwitcherBtn extends Component {

    private switcherButton : HTMLElement
    
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.switcherButton.style.visibility = "hidden";
    }

    render() {

      return (

            <a ref={c => (this.switcherButton = c)} class="switcher" href="#"></a>
 
      );

    }


    public show() {
        const { switcherButton } = this;

        switcherButton.style.visibility = "visible";

        let theScreen = switcherButton.parentElement; //    document.querySelector('.screen');

        //alert(theScreen);

        var isGlitch = localStorage.getItem('isGlitch') === 'true';

        if (isGlitch)
            theScreen.classList.add('glitch');
        else
            theScreen.classList.remove('glitch');

        switcherButton.addEventListener("click",  function (e) { 
          e.preventDefault();

          //let theScreen = document.querySelector('.screen');
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

}

