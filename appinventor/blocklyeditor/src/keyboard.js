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

Blockly.Keyboard.currentBlocksLevel = [];
Blockly.Keyboard.currentBlocksIndex = -1;

Blockly.Keyboard.workspaceKeyboardInteraction = function(keyCode) {

  var keyCodes = {
    DOWN: 40,
    UP: 38,
    RIGHT: 39,
    LEFT: 37
  };

  if(keyCode == keyCodes.DOWN) {
    if(Blockly.selected) { // if there is a selected block on the workspace
      //DO SOMETHING
    } else {
      this.selectFirstBlockInWorkspace();
    }
  } else if(keyCode == keyCodes.UP) {

  } else if(keyCode == keyCodes.RIGHT) {
    Blockly.Keyboard.selectNextBlockInLevel();
  } else if(keyCode == keyCodes.LEFT) {

  }
}

Blockly.Keyboard.selectFirstBlockInWorkspace = function() {
  Blockly.Keyboard.currentBlocksLevel = Blockly.mainWorkspace.getTopBlocks();
  Blockly.Keyboard.currentBlocksIndex = 0;
  Blockly.Keyboard.currentBlocksLevel[Blockly.Keyboard.currentBlocksIndex].select();
}

Blockly.Keyboard.selectNextBlockInLevel = function() {
  Blockly.Keyboard.unselectSelectedBlock();
  Blockly.Keyboard.currentBlocksIndex = Blockly.Keyboard.wrapIncrement(Blockly.Keyboard.currentBlocksLevel, Blockly.Keyboard.currentBlocksIndex);
  Blockly.Keyboard.currentBlocksLevel[Blockly.Keyboard.currentBlocksIndex].select();
}

Blockly.Keyboard.selectPreviousBlockInLevel = function() {
  Blockly.Keyboard.unselectSelectedBlock();
}

Blockly.Keyboard.selectFirstBlockInNextLevel = function() {
  //TODO: go down a level in hierarchy
}

Blockly.Keyboard.selectFirstBlockInPreviousLevel = function() {
  //TODO: go up a level in hierarchy
}

/* * * * * * * * * *
 *  UTIL FUNCTIONS *
 * * * * * * * * * *
 */

Blockly.Keyboard.unselectSelectedBlock = function() {
  Blockly.selected.unselect();
  Blockly.selected = null;
}

/*
 * wrapIncrement
 * @param list [Array] - a list
 * @param idx [int] - an index in the list given
 *
 * return the incremented index, or, if the index is going off the list, 0
 */
Blockly.Keyboard.wrapIncrement = function(list, idx) {
  if(idx + 1 == list.length) {
    return 0;
  } else {
    return idx + 1;
  }
}
