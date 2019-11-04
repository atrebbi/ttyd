import { h, Component } from 'preact';

import { ITerminalOptions, ITheme } from 'xterm';
import { Xterm } from './terminal';

if ((module as any).hot) {
    // tslint:disable-next-line:no-var-requires
    require('preact/debug');
}

const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
const wsPath = window.location.pathname.endsWith('/') ? 'ws' : '/ws';
const url = [protocol, window.location.host, window.location.pathname, wsPath, window.location.search].join('');
const termOptions = {
    fontSize: 24,
    cols: 80,
    fontFamily: 'Glass_TTY_VT220,Courier,monospace',
    theme: {
        foreground: '#d2d2d2',
        background: '#2b2b2b80',
        cursor: '#adadad',
        black: '#000000',
        red: '#d81e00',
        green: '#5ea702',
        yellow: '#cfae00',
        blue: '#427ab3',
        magenta: '#89658e',
        cyan: '#00a7aa',
        white: '#dbded8',
        brightBlack: '#686a66',
        brightRed: '#f54235',
        brightGreen: '#99e343',
        brightYellow: '#fdeb61',
        brightBlue: '#84b0d8',
        brightMagenta: '#bc94b7',
        brightCyan: '#37e6e8',
        brightWhite: '#f1f1f0',
    } as ITheme,
} as ITerminalOptions;

export class App extends Component {
    render() {
        return <Xterm id="terminal-container" url={url} options={termOptions} />;
    }
}
