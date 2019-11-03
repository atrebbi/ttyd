        //import { WebLinksAddon } from 'xterm-addon-web-links';
        //import { FitAddon } from 'xterm-addon-attach';

        //import  { Terminal } from 'xterm';
        //import { AttachAddon } from 'xterm-addon-attach';

//var exports;

//SystemJS.import('./node_modules/xterm/lib/xterm.js');
//SystemJS.import('./node_modules/xterm-addon-attach/out/AttachAddon.js');

//import { Terminal } from './node_modules/xterm/lib/xterm.js';
//import { Terminal } from 'xterm';


//import { Terminal } from './node_modules/xterm/lib/xterm.js';
//import * as Terminal from './node_modules/xterm/lib/xterm.js';

// import { AttachAddon } from './node_modules/xterm-addon-attach/lib/xterm-addon-attach.js';



// import { AttachAddon } from './node_modules/xterm/dist/addons/attach/attach.js';


import  * as Terminal from './node_modules/xterm/lib/xterm.js';


$(document).ready(function () {

  function second_passed() {
    $('.clock').removeClass('is-off');
  }
  setTimeout(second_passed, 2000)

  $('.switcher').on('click', function(e) {
    e.preventDefault();
    $('.screen').toggleClass('glitch');
  });

/* no orologio
  var newDate = new Date();
  newDate.setDate(newDate.getDate());

  setInterval( function() {

    var hours    = new Date().getHours();
    var seconds  = new Date().getSeconds();
    var minutes  = new Date().getMinutes();

    var realTime = ( hours < 10 ? '0' : '' ) + hours + ' : ' + ( minutes < 10 ? '0' : '' ) + minutes + ' : ' + ( seconds < 10 ? '0' : '' ) + seconds

    $('.time').html(realTime);
    $('.time').attr('data-time', realTime);

  }, 1000);
*/

       // import { Terminal } from './node_modules/xterm/dist/xterm.js';

        var term = new Terminal({
          rows: 32,
          cols: 80
        });

        //term.loadAddon(new WebLinksAddon());
        //term.loadAddon(new FitAddon());
        
        // wss e' criptato ed anche piu affidabile, 
        //  verificare se e' possibile usarlo (il certificato c'e')
        // const webSocket = new WebSocket('ws://aleforever.3bsoft.com:3270');
        
        var webSocket = new WebSocket('ws://127.0.0.1:9001');

        // import { Terminal } from '../out/public/Terminal';
        //import { AttachAddon } from './xterm-addon-attach/out/AttachAddon';
        //var aa = new AttachAddon()
        //term.loadAddon(new AttachAddon(webSocket));

        term.open(document.getElementById('terminal'));

  
        term.write("This is a private computer, please don't hack!\r\n\n")
        term.write('Hello from \x1B[1;3;31mMVS 3.8j Mainframe\x1B[0m $ ')


});