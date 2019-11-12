import { bind } from 'decko';
import * as backoff from 'backoff';
import { Component, h } from 'preact';
import { ITerminalOptions, Terminal } from 'xterm';
import { OverlayAddon } from './overlay';
import { ZmodemAddon } from '../zmodem';

import 'xterm/css/xterm.css';

export interface TerminalExtended extends Terminal {

}
        
export interface WindowExtended extends Window {
    term: TerminalExtended;
    tty_auth_token?: string;
}
declare let window: WindowExtended;

const enum Command {
    // server side
    OUTPUT = '0',
    SET_WINDOW_TITLE = '1',
    SET_PREFERENCES = '2',

    // client side
    INPUT = '0',
    RESIZE_TERMINAL = '1',
}

interface Props {
    id: string;
    url: string;
    options: ITerminalOptions;
}

export class Xterm extends Component<Props> {
    private textEncoder: TextEncoder;
    private textDecoder: TextDecoder;
    private container: HTMLElement;
    private terminal: Terminal;d
    private overlayAddon: OverlayAddon;
    private zmodemAddon: ZmodemAddon;
    private socket: WebSocket;
    private title: string;
    private resizeTimeout: NodeJS.Timer;
    private backoff: backoff.Backoff;
    private backoffLock = false;

    constructor(props) {
        super(props);

        this.textEncoder = new TextEncoder();
        this.textDecoder = new TextDecoder();
        this.overlayAddon = new OverlayAddon();
        this.backoff = backoff.exponential({
            initialDelay: 100,
            maxDelay: 10000,
        });
        this.backoff.on('ready', () => {
            this.backoffLock = false;
            this.openTerminal();
        });
        this.backoff.on('backoff', (_, delay: number) => {
            console.log(`[ttyd] will attempt to reconnect websocket in ${delay}ms`);
            this.backoffLock = true;
        });
    }

    componentDidMount() {
        this.openTerminal();
    }

    componentWillUnmount() {
        this.socket.close();
        this.terminal.dispose();

        window.removeEventListener('resize', this.onWindowResize);
        window.removeEventListener('beforeunload', this.onWindowUnload);
    }

    render({ id }: Props) {
      /*
      <a class="switcher" href="#"></a>
      <div class="screen glitch">
        <div class="terminal is-off">
          <span logo="MVS 3.8j">
              <div id="terminal"></div>
          </span>
        </div>
        <div class="figure"></div>
        <div class="figure-mask"></div>
      </div>
      */
        return (

                <div class="screen glitch">
                    <div id={id} ref={c => (this.container = c)}>
                        <ZmodemAddon ref={c => (this.zmodemAddon = c)} sender={this.sendData} />
                    </div>
                    <a class="switcher" href="#"></a>
                </div>

        );
    }

    @bind
    private sendData(data: ArrayLike<number>) {
        const { socket } = this;
        const payload = new Uint8Array(data.length + 1);
        payload[0] = Command.INPUT.charCodeAt(0);
        payload.set(data, 1);
        socket.send(payload);
    }

    @bind
    private onWindowResize() {
        const { overlayAddon, container } = this;
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => { 

                if (this.terminal) {
                    var containerWidth = window.innerWidth * 0.9;
                    var containerHeight = window.innerHeight * 0.9;

                    var cols = this.terminal.getOption("cols");
                    var rows = this.terminal.getOption("rows");
                    var fontSizeOld = this.terminal.getOption("fontSize");

                    var fontSize = Math.min(
                        Math.floor(containerWidth / cols * 2 - 2),
                        Math.floor(containerHeight / rows - 2),
                    );   

                    var fontHeight = Math.floor(fontSize) + 1
                    var fontWidth = Math.floor(fontSize / 2.0) + 1

                    containerWidth = fontWidth * cols;
                    containerHeight = fontHeight * rows;

                    var containerTop = (window.innerHeight - containerHeight) / 2.0;
                        
                    container.style.width = containerWidth + "px";
                    container.style.height = containerHeight + "px";
                    container.style.top = containerTop + "px";

                    if (fontSize != fontSizeOld) {
                        this.terminal.setOption("fontSize", fontSize)
                        this.terminal.refresh(0, this.terminal.rows-1)
                    }

                    eval("gtag('event', 'resize_screen', {'event_category' : 'preferences', 'event_label' : '" + 
                        container.clientWidth + "x" +  container.clientHeight + ", fontSize=" + fontSize + "'})");
          
                    overlayAddon.showOverlay(container.clientWidth + "x" +  container.clientHeight + ", fontSize=" + fontSize);

                }
                
        }, 250)
    }

    private onWindowUnload(event: BeforeUnloadEvent): string {
        const message = 'Close terminal? this will also terminate the command.';
        event.returnValue = message;
        return message;
    }

    @bind
    private openTerminal() {
        if (this.terminal) {
            this.terminal.dispose();
        }

        this.socket = new WebSocket(this.props.url, ['tty']);
        this.terminal = new Terminal(this.props.options);
        const { socket, terminal, container, overlayAddon } = this;
        window.term = terminal as TerminalExtended;

        socket.binaryType = 'arraybuffer';
        socket.onopen = this.onSocketOpen;
        socket.onmessage = this.onSocketData;
        socket.onclose = this.onSocketClose;
        socket.onerror = this.onSocketError;

        terminal.loadAddon(overlayAddon);
        terminal.loadAddon(this.zmodemAddon);

        terminal.onTitleChange(data => {
            if (data && data !== '') {
                // document.title = data + ' | ' + this.title;
            }
        });
        terminal.onData(this.onTerminalData);
        terminal.onResize(this.onTerminalResize);
        if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
            terminal.onSelectionChange(() => {
                if (terminal.getSelection() === '') return;
                overlayAddon.showOverlay('\u2702', 200);
                document.execCommand('copy');
            });
        }

        terminal.open(container);
        terminal.focus();

        this.onWindowResize();
        window.addEventListener('resize', this.onWindowResize);
        window.addEventListener('beforeunload', this.onWindowUnload);

        let switcherButton = document.querySelector('.switcher');
        switcherButton.addEventListener("click",  function (e) { 
          e.preventDefault();
          let theScreen = document.querySelector('.screen');
          theScreen.classList.toggle('glitch');

          var isGlitch = theScreen.classList.contains('glitch');

          var audios=document.getElementsByTagName('audio');
          for (var j = 0; j < audios.length; j++) {
            audios[j].muted = !isGlitch;
          }

          eval("gtag('event', 'toggle_glitch', {'event_category' : 'preferences', 'event_label' : '" + isGlitch + "'})");

          terminal.focus();
        });

        let screen = document.querySelector('.screen');
        screen.addEventListener("click",  function (e) { 
          e.preventDefault();
          //alert('screen click');
          terminal.focus();
        });

    }

    @bind
    private reconnect() {
        if (!this.backoffLock) {
            this.backoff.backoff();
        }
    }

    @bind
    private onSocketOpen() {
        console.log('[ttyd] Websocket connection opened');
        this.backoff.reset();

        const { socket, textEncoder } = this;
        const authToken = window.tty_auth_token;

        eval("gtag('event', 'open_connection', {'event_category' : 'terminal', 'event_label' : 'onSocketOpen'})");

        socket.send(textEncoder.encode(JSON.stringify({ AuthToken: authToken })));
    }

    @bind
    private onSocketClose(event: CloseEvent) {
        console.log(`[ttyd] websocket connection closed with code: ${event.code}`);

        const { overlayAddon } = this;
        overlayAddon.showOverlay('Connection Closed', null);
        window.removeEventListener('beforeunload', this.onWindowUnload);

        eval("gtag('event', 'close_connection', {'event_category' : 'terminal', 'event_label' : 'onSocketClose', 'value' : " + event.code + "})");

        // 1008: POLICY_VIOLATION - Auth failure
        if (event.code === 1008) {
            window.location.reload();
        }

        // 1000: CLOSE_NORMAL
        if (event.code !== 1000) {
            this.reconnect();
        }
    }

    @bind
    private onSocketError() {
        this.reconnect();
    }

    @bind
    private onSocketData(event: MessageEvent) {
        const { terminal, textDecoder, zmodemAddon } = this;
        const rawData = event.data as ArrayBuffer;
        const cmd = String.fromCharCode(new Uint8Array(rawData)[0]);
        const data = rawData.slice(1);

        switch (cmd) {
            case Command.OUTPUT:
                zmodemAddon.consume(data);
                break;
            case Command.SET_WINDOW_TITLE:
                this.title = textDecoder.decode(data);
                document.title = this.title;
                break;
            case Command.SET_PREFERENCES:
                const preferences = JSON.parse(textDecoder.decode(data));
                Object.keys(preferences).forEach(key => {
                    console.log(`[ttyd] setting ${key}: ${preferences[key]}`);
                    terminal.setOption(key, preferences[key]);
                });
                break;
            default:
                console.warn(`[ttyd] unknown command: ${cmd}`);
                break;
        }
    }

    @bind
    private onTerminalResize(size: { cols: number; rows: number }) {
        //alert('No terminal resize')
        const { overlayAddon, socket, textEncoder } = this;
        if (socket.readyState === WebSocket.OPEN) {
            const msg = JSON.stringify({ columns: size.cols, rows: size.rows });
            socket.send(textEncoder.encode(Command.RESIZE_TERMINAL + msg));
        }
        setTimeout(() => {
            overlayAddon.showOverlay(`${size.cols}x${size.rows}`);
        }, 500);
    }

    @bind
    private onTerminalData(data: string) {
        const { socket, textEncoder } = this;
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(textEncoder.encode(Command.INPUT + data));
             
            eval("gtag('event', 'terminal_data', {'event_category' : 'terminal', 'event_label' : 'onTerminalData', value: " + data.length + "})");

        }
    }

}

