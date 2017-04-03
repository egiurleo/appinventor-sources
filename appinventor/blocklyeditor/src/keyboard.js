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
Blockly.Keyboard.connectionIndex = -1;

Blockly.Keyboard.workspaceKeyboardInteraction = function(keyCode) {

  var keyCodes = {
    DOWN: 40,
    UP: 38,
    RIGHT: 39,
    LEFT: 37,
    ENTER: 13,
    ESC: 27
  };

  if(keyCode == keyCodes.DOWN) {
    if(Blockly.selected && !Blockly.Keyboard.blockToMove) { // if there is a selected block on the workspace
      Blockly.Keyboard.selectFirstBlockInNextLevel();
    } else {
      this.selectFirstBlockInWorkspace();
    }
  } else if(keyCode == keyCodes.UP) {
    if(!Blockly.Keyboard.blockToMove) {
      Blockly.Keyboard.selectFirstBlockInPreviousLevel();
    }
  } else if(keyCode == keyCodes.RIGHT) {
    if(Blockly.Keyboard.blockToMove) {
      Blockly.Keyboard.selectNextConnection();
    } else {
      Blockly.Keyboard.selectNextBlockInLevel();
    }
  } else if(keyCode == keyCodes.LEFT) {
    if(Blockly.Keyboard.blockToMove) {
      Blockly.Keyboard.selectPreviousConnection();
    } else {
      Blockly.Keyboard.selectPreviousBlockInLevel();
    }
  } else if(keyCode == keyCodes.ENTER) { // select a block to move
    if(Blockly.selected && !Blockly.highlightedConnection_) { // if you're just selecting a block
      Blockly.Keyboard.selectBlockToMove();
    } else if(Blockly.selected && Blockly.highlightedConnection_) { // if you're moving the block to a certain connetion
      Blockly.Keyboard.moveSelectedBlockToSelectedConnection();
    }
  } else if(keyCode == keyCodes.ESC) { // unselect everything
    Blockly.Keyboard.resetSelection();
  }
}

Blockly.Keyboard.moveSelectedBlockToSelectedConnection = function () {
  var selectedBlockConnection = Blockly.Keyboard.blockToMove.outputConnection ? Blockly.Keyboard.blockToMove.outputConnection : Blockly.Keyboard.blockToMove.previousConnection;
  if(selectedBlockConnection.targetConnection) { // if the block is connected to something
    selectedBlockConnection.disconnect();
  }
  selectedBlockConnection.connect(Blockly.highlightedConnection_);
  Blockly.Keyboard.resetSelection();
}

Blockly.Keyboard.selectBlockToMove = function() {
  var blockToMove = Blockly.selected;
  var allBlocks = Blockly.mainWorkspace.getAllBlocks();

  // if this is a block with connections
  if(blockToMove.outputConnection != null || blockToMove.previousConnection != null) {
    Blockly.Keyboard.blockToMove = blockToMove;
    var connections = [];

    allBlocks.forEach(function(block) { // map each block to its connections
      if(block != blockToMove) { // a block can't be connected to itself
        block.inputList.forEach(function(input) { // add all input connections
          if(input.connection) {
            connections.push(input.connection);
          }
        });

        if(block.nextConnection) { // if you can add a block below this block, then add it
          connections.push(block.nextConnection);
        }
      }
    });

    var selectedBlockConnection = blockToMove.outputConnection ? blockToMove.outputConnection : blockToMove.previousConnection;
    Blockly.Keyboard.possibleConnections = connections.filter(function(connection) {
      return connection.isConnectionAllowed(selectedBlockConnection);
    });

    Blockly.Keyboard.connectionIndex = 0;
    Blockly.highlightedConnection_ = Blockly.Keyboard.possibleConnections[Blockly.Keyboard.connectionIndex];
    Blockly.highlightedConnection_.highlight();
  } // otherwise the block can't be moved
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

Blockly.Keyboard.selectNextConnection = function() {
  Blockly.highlightedConnection_.unhighlight();
  Blockly.Keyboard.connectionIndex = Blockly.Keyboard.wrapIncrement(Blockly.Keyboard.possibleConnections, Blockly.Keyboard.connectionIndex);
  Blockly.highlightedConnection_ = Blockly.Keyboard.possibleConnections[Blockly.Keyboard.connectionIndex];
  Blockly.highlightedConnection_.highlight();
}

Blockly.Keyboard.selectPreviousConnection = function() {
  Blockly.highlightedConnection_.unhighlight();
  Blockly.Keyboard.connectionIndex = Blockly.Keyboard.wrapDecrement(Blockly.Keyboard.possibleConnections, Blockly.Keyboard.connectionIndex);
  Blockly.highlightedConnection_ = Blockly.Keyboard.possibleConnections[Blockly.Keyboard.connectionIndex];
  Blockly.highlightedConnection_.highlight();
}

/* * * * * * * * * *
 *  UTIL FUNCTIONS *
 * * * * * * * * * *
 */

Blockly.Keyboard.unselectSelectedBlock = function() {
  Blockly.selected.unselect();
  Blockly.selected = null;
}

Blockly.Keyboard.resetSelection = function() {
  if(Blockly.selected) {
    Blockly.Keyboard.unselectSelectedBlock();

    // reset all the relevant variables
    Blockly.Keyboard.currentBlocksLevel = [];
    Blockly.Keyboard.currentBlocksIndex = -1;
  }

  if(Blockly.highlightedConnection_) {
    Blockly.Keyboard.blockToMove = null;
    Blockly.Keyboard.possibleConnections = [];
    Blockly.Keyboard.connectionIndex = -1;

    Blockly.highlightedConnection_.unhighlight();
    Blockly.highlightedConnection_ = null;
  }
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
