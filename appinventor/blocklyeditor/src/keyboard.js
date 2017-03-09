/**
 * Created by egiurleo, spring 2017
 * Implements keyboard interactions that allow users to move blocks in the workspace without the use of a mouse
 */

'use strict';

goog.provide('Blockly.Keyboard');

goog.require('Blockly.Workspace');
goog.require('Blockly.Block');
goog.require('goog.events');
goog.require('goog.events.KeyCodes');
goog.require('goog.events.KeyHandler');
goog.require('goog.window');

Blockly.Keyboard.selectFirstBlock = function(keyCode) {
  // arrow key logic
  // if down arrow
  //    if nothing selected: select first block in top blocks
  //    if something selected
  // if up arrow
  //    if nothing selected: nothing
  //    if something selected
  // if right arrow
  //    if something selected:
  // if left arrow
  //    if something selected:

  var keyCodes = {
    DOWN: 40,
    UP: 38,
    RIGHT: 39,
    LEFT: 37
  }

  if(keyCode == keyCodes.DOWN) {
    if(Blockly.selected) { // if there is a selected block on the workspace

    } else {
      var topBlocks = Blockly.mainWorkspace.getTopBlocks();
      topBlocks[0].select();
    }


  } elseif(keyCode == keyCodes.UP) {

  } elseif(keyCode == keyCodes.RIGHT) {

  } elseif(keyCode == keyCodes.LEFT) {

  }



}
