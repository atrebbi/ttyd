import { h, render } from 'preact';
import { ModemSound } from './components/modemsound';
import { App } from './components/app';
import { SwitcherBtn } from './components/switcherbtn';

import './style/index.scss';
import './style/font.scss';

render(<ModemSound />, document.body);
render(<App />, document.body);
render(<SwitcherBtn />, document.body.querySelector('.screen'));
