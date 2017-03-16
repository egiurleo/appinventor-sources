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

Blockly.Keyboard.blockToMove = null;
Blockly.Keyboard.possibleConnections = [];

Blockly.Keyboard.workspaceKeyboardInteraction = function(keyCode) {

  var keyCodes = {
    DOWN: 40,
    UP: 38,
    RIGHT: 39,
    LEFT: 37,
    ENTER: 13
  };

  if(keyCode == keyCodes.DOWN) {
    if(Blockly.selected) { // if there is a selected block on the workspace
      Blockly.Keyboard.selectFirstBlockInNextLevel();
    } else {
      this.selectFirstBlockInWorkspace();
    }
  } else if(keyCode == keyCodes.UP) {
    Blockly.Keyboard.selectFirstBlockInPreviousLevel();
  } else if(keyCode == keyCodes.RIGHT) {
    Blockly.Keyboard.selectNextBlockInLevel();
  } else if(keyCode == keyCodes.LEFT) {
    Blockly.Keyboard.selectPreviousBlockInLevel();
  } else if(keyCode == keyCodes.ENTER) { // select a block to move
    if(Blockly.selected) {

      var blockToMove = Blockly.selected;
      var allBlocks = Blockly.mainWorkspace.getAllBlocks();

      if(blockToMove.outputConnection != null) { // if it's a value block
        Blockly.Keyboard.blockToMove = blockToMove;
      } else if(blockToMove.previousConnection != null) { // if it's a procedure block
        Blockly.Keyboard.blockToMove = blockToMove;
        Blockly.Keyboard.possibleConnections = allBlocks.filter(function(block) {
          return (block.nextConnection != null || block.inputList[-1].connection != null) && block != blockToMove;
        }).map(function(block) {
          return block.nextConnection ? block.nextConnection : block.inputList[-1].connection;
        });
      } // otherwise the block can't be moved
    }
  }
}

Blockly.Keyboard.selectFirstBlockInWorkspace = function() {
  Blockly.Keyboard.currentBlocksLevel = Blockly.mainWorkspace.getTopBlocks();
  Blockly.Keyboard.currentBlocksIndex = 0;
  Blockly.Keyboard.selectCurrentBlock();
}

Blockly.Keyboard.selectNextBlockInLevel = function() {
  Blockly.Keyboard.unselectSelectedBlock();
  Blockly.Keyboard.currentBlocksIndex = Blockly.Keyboard.wrapIncrement(Blockly.Keyboard.currentBlocksLevel, Blockly.Keyboard.currentBlocksIndex);
  Blockly.Keyboard.selectCurrentBlock();
}

Blockly.Keyboard.selectPreviousBlockInLevel = function() {
  Blockly.Keyboard.unselectSelectedBlock();
  Blockly.Keyboard.currentBlocksIndex = Blockly.Keyboard.wrapDecrement(Blockly.Keyboard.currentBlocksLevel, Blockly.Keyboard.currentBlocksIndex);
  Blockly.Keyboard.selectCurrentBlock();
}

Blockly.Keyboard.selectFirstBlockInNextLevel = function() {
  var childBlocks = Blockly.Keyboard.currentBlocksLevel[Blockly.Keyboard.currentBlocksIndex].childBlocks_;

  if(childBlocks.length > 0) {
    Blockly.Keyboard.unselectSelectedBlock();
    Blockly.Keyboard.currentBlocksLevel = Blockly.Keyboard.currentBlocksLevel[Blockly.Keyboard.currentBlocksIndex].childBlocks_;
    Blockly.Keyboard.currentBlocksIndex = 0;
    Blockly.Keyboard.selectCurrentBlock();
  }
}

Blockly.Keyboard.selectFirstBlockInPreviousLevel = function() {
  Blockly.Keyboard.unselectSelectedBlock();

  // the block is at least one level down
  if(Blockly.Keyboard.currentBlocksLevel[Blockly.Keyboard.currentBlocksIndex].parentBlock_ != null) {
    var parent1 = Blockly.Keyboard.currentBlocksLevel[Blockly.Keyboard.currentBlocksIndex].parentBlock_;
    if(parent1.parentBlock_ != null) { // if the parent block has no parent, then it is part of the top blocks
      Blockly.Keyboard.currentBlocksLevel = parent1.parentBlock_.childBlocks_;
    } else {
      Blockly.Keyboard.currentBlocksLevel = Blockly.mainWorkspace.getTopBlocks();
    }
    Blockly.Keyboard.currentBlocksIndex = Blockly.Keyboard.currentBlocksLevel.indexOf(parent1);
  } else {
    // do nothing, there is no parent
  }

  Blockly.Keyboard.selectCurrentBlock();
}

/* * * * * * * * * *
 *  UTIL FUNCTIONS *
 * * * * * * * * * *
 */

Blockly.Keyboard.unselectSelectedBlock = function() {
  Blockly.selected.unselect();
  Blockly.selected = null;
}

Blockly.Keyboard.selectCurrentBlock = function() {
  Blockly.Keyboard.currentBlocksLevel[Blockly.Keyboard.currentBlocksIndex].select();
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

Blockly.Keyboard.wrapDecrement = function(list, idx) {
  if(idx - 1 == -1) {
    return list.length - 1;
  } else {
    return idx - 1;
  }
}
