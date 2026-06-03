/**
 * Form registry — maps a form name to its { update, onInput, getHitbox } module.
 * The active form is looked up here each frame by the game loop.
 */
import * as cube from './cube.js'
import * as ship from './ship.js'
import * as ball from './ball.js'
import * as ufo from './ufo.js'
import * as wave from './wave.js'
import * as robot from './robot.js'
import * as spider from './spider.js'
import * as swing from './swing.js'

export const FORM_MODULES = { cube, ship, ball, ufo, wave, robot, spider, swing }
export const getForm = (name) => FORM_MODULES[name] || cube
