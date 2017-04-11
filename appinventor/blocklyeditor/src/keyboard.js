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

Blockly.Keyboard.fields = [];
Blockly.Keyboard.fieldIndex = -1;

// Blockly.bindEvent_(document, 'keydown', null, Blockly.Keyboard.workspaceKeyboardInteraction);

Blockly.Keyboard.workspaceKeyboardInteraction = function(e) {

  if (Blockly.mainWorkspace.options.readOnly || Blockly.isTargetInput_(e)) {
    // No key actions on readonly workspaces.
    // When focused on an HTML text input widget, don't trap any keys.
    return;
  }

  var keyCode = e.keyCode;

  var keyCodes = {
    DOWN: 40,
    UP: 38,
    RIGHT: 39,
    LEFT: 37,
    ENTER: 13,
    ESC: 27,
    TAB: 9,
    SHIFT: 16
  };

  if(keyCode == keyCodes.DOWN) {
    if(Blockly.selected && !Blockly.Keyboard.blockToMove) { // if there is a selected block on the workspace
      Blockly.Keyboard.selectFirstBlockInNextLevel();
    } else if(!Blockly.Keyboard.blockToMove) {
      this.selectFirstBlockInWorkspace();
    }
  } else if(keyCode == keyCodes.UP) {
    if(!Blockly.Keyboard.blockToMove) {
      Blockly.Keyboard.selectFirstBlockInPreviousLevel();
    }
  } else if(keyCode == keyCodes.RIGHT) {
    if(Blockly.Keyboard.blockToMove) {
      Blockly.Keyboard.selectNextConnection();
    } else if(Blockly.Keyboard.fieldIndex > -1) {
      Blockly.Keyboard.selectNextField();
    } else {
      Blockly.Keyboard.selectNextBlockInLevel();
    }
  } else if(keyCode == keyCodes.LEFT) {
    if(Blockly.Keyboard.blockToMove) {
      Blockly.Keyboard.selectPreviousConnection();
    } else if(Blockly.Keyboard.fieldIndex > -1) {
      Blockly.Keyboard.selectPreviousField();
    } else {
      Blockly.Keyboard.selectPreviousBlockInLevel();
    }
  } else if(keyCode == keyCodes.ENTER) { // select a block to move
    if(Blockly.selected && !Blockly.highlightedConnection_ && Blockly.Keyboard.fieldIndex == -1) { // if you're just selecting a block
      Blockly.Keyboard.selectBlockToMove();
    } else if(Blockly.selected && Blockly.highlightedConnection_) { // if you're moving the block to a certain connetion
      Blockly.Keyboard.moveSelectedBlockToSelectedConnection();
    } else if(Blockly.Keyboard.fieldIndex > -1) {
      Blockly.Keyboard.accessField();
    }
  } else if(keyCode == keyCodes.ESC || keyCode == keyCodes.TAB) { // unselect everything
    if(Blockly.Keyboard.fieldIndex == -1) {
      Blockly.Keyboard.resetSelection(); //if you're not exiting out of a field
    } else {
      Blockly.Keyboard.unselectField();
    }
  } else if(keyCode == keyCodes.SHIFT) { // look at the fields
    if(Blockly.Keyboard.fieldIndex == -1) {
      Blockly.Keyboard.selectFirstField();
    }
  }
}

// --------------NAVIGATION AROUND BLOCKS WORKSPACE--------------

/*
 * selectFirstBlockInWorkspace
 *    when the ViewBox is focused, you can press the down arrow to navigate into the blocks menu
 *    and select the first block in the workspace; if there are no blocks, then do nothing
 */
Blockly.Keyboard.selectFirstBlockInWorkspace = function() {
  Blockly.Keyboard.currentBlocksLevel = Blockly.mainWorkspace.getTopBlocks();

  if(Blockly.Keyboard.currentBlocksLevel.length == 0) {
    return;
  }

  Blockly.Keyboard.currentBlocksIndex = 0;
  Blockly.Keyboard.selectCurrentBlock();
}

/*
 * selectNextBlockInLevel
 *    Use the right arrowkey to navigate to the next block in the same level of the hierarchy
 *    If there are no blocks on workspace, do nothing
 */
Blockly.Keyboard.selectNextBlockInLevel = function() {
  if(Blockly.Keyboard.currentBlocksLevel.length == 0) {
    return;
  }

  Blockly.Keyboard.unselectSelectedBlock();
  Blockly.Keyboard.currentBlocksIndex = Blockly.Keyboard.wrapIncrement(Blockly.Keyboard.currentBlocksLevel, Blockly.Keyboard.currentBlocksIndex);
  Blockly.Keyboard.selectCurrentBlock();
}

/*
 * selectPreviousBlockInLevel
 *    Use the left arrowkey to navigate to the previous block in the same level of the hierarchy
 *    If there are no blocks on workspace, do nothing
 */
Blockly.Keyboard.selectPreviousBlockInLevel = function() {
  if(Blockly.Keyboard.currentBlocksLevel.length == 0) {
    return;
  }

  Blockly.Keyboard.unselectSelectedBlock();
  Blockly.Keyboard.currentBlocksIndex = Blockly.Keyboard.wrapDecrement(Blockly.Keyboard.currentBlocksLevel, Blockly.Keyboard.currentBlocksIndex);
  Blockly.Keyboard.selectCurrentBlock();
}

/*
 * selectFirstBlockInNextLevel
 *    Use the down arrow key to select the first child block of the current block
 */
Blockly.Keyboard.selectFirstBlockInNextLevel = function() {
  if(Blockly.Keyboard.currentBlocksLevel.length == 0) {
    return;
  }

  var childBlocks = Blockly.Keyboard.currentBlocksLevel[Blockly.Keyboard.currentBlocksIndex].childBlocks_;

  if(childBlocks.length > 0) {
    Blockly.Keyboard.unselectSelectedBlock();
    Blockly.Keyboard.currentBlocksLevel = Blockly.Keyboard.currentBlocksLevel[Blockly.Keyboard.currentBlocksIndex].childBlocks_;
    Blockly.Keyboard.currentBlocksIndex = 0;
    Blockly.Keyboard.selectCurrentBlock();
  }
}

/*
 * selectFirstBlockInPreviousLevel
 *    Use the up arrow key to select the parent of the current block
 */
Blockly.Keyboard.selectFirstBlockInPreviousLevel = function() {
  if(Blockly.Keyboard.currentBlocksLevel.length == 0) {
    return;
  }

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

// --------------NAVIGATE AVAILABLE CONNECTIONS WHEN MOVING BLOCKS--------------
/*
 * selectNextConnection
 *    Use the right arrow key to navigate to the next available connection to the selected block
 */
Blockly.Keyboard.selectNextConnection = function() {
  Blockly.highlightedConnection_.unhighlight();
  Blockly.Keyboard.connectionIndex = Blockly.Keyboard.wrapIncrement(Blockly.Keyboard.possibleConnections, Blockly.Keyboard.connectionIndex);
  Blockly.highlightedConnection_ = Blockly.Keyboard.possibleConnections[Blockly.Keyboard.connectionIndex];
  Blockly.highlightedConnection_.highlight();
}

/*
 * selectPreviousConnection
 *    Use the left arrow key to navigate to the previous available connection to the selected block
 */
Blockly.Keyboard.selectPreviousConnection = function() {
  Blockly.highlightedConnection_.unhighlight();
  Blockly.Keyboard.connectionIndex = Blockly.Keyboard.wrapDecrement(Blockly.Keyboard.possibleConnections, Blockly.Keyboard.connectionIndex);
  Blockly.highlightedConnection_ = Blockly.Keyboard.possibleConnections[Blockly.Keyboard.connectionIndex];
  Blockly.highlightedConnection_.highlight();
}

/*
 * moveSelectedBlockToSelectedConnection
 *    Disconnect the selected block from its current connection (if necessary) and connect it to
 *    the newly highlighted connection
 */
Blockly.Keyboard.moveSelectedBlockToSelectedConnection = function () {
  var selectedBlockConnection = Blockly.Keyboard.blockToMove.outputConnection ? Blockly.Keyboard.blockToMove.outputConnection : Blockly.Keyboard.blockToMove.previousConnection;

  if(selectedBlockConnection.targetConnection) { // if the block is connected to something
    selectedBlockConnection.disconnect();
  }

  if(Blockly.highlightedConnection_.targetConnection) {
    Blockly.highlightedConnection_.disconnect();
  }

  selectedBlockConnection.connect(Blockly.highlightedConnection_);
  Blockly.Keyboard.resetSelection();
}

/*
 * selectBlockToMove
 *    select a block to move to a new place in the workspace; create an array of available connections
 */
Blockly.Keyboard.selectBlockToMove = function() {
  var blockToMove = Blockly.selected;
  var allBlocks = Blockly.mainWorkspace.getAllBlocks();

  // if this is a block with connections
  if(blockToMove.outputConnection != null || blockToMove.previousConnection != null) {
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

        if(block.previousConnection) {
          connections.push(block.previousConnection);
        }
      }
    });

    var selectedBlockConnection = blockToMove.outputConnection ? blockToMove.outputConnection : blockToMove.previousConnection;
    Blockly.Keyboard.possibleConnections = connections.filter(function(connection) {
      var isTargetConnection = connection.targetConnection == selectedBlockConnection;
      var isDescendent = Blockly.Keyboard.isDescendent(connection.sourceBlock_, blockToMove);
      return connection.canConnectWithReason_(selectedBlockConnection) == Blockly.Connection.CAN_CONNECT && !isTargetConnection && !isDescendent;
    });

    if(Blockly.Keyboard.possibleConnections.length > 0) {
      Blockly.Keyboard.blockToMove = blockToMove;
      Blockly.Keyboard.connectionIndex = 0;
      Blockly.highlightedConnection_ = Blockly.Keyboard.possibleConnections[Blockly.Keyboard.connectionIndex];
      Blockly.highlightedConnection_.highlight();
    }
  } // otherwise the block can't be moved
}

// --------------SELECTING FIELDS--------------
Blockly.Keyboard.selectFirstField = function() {
  if(!Blockly.selected) {
    return;
  }

  // for each field, see if it's a text input or drop down, if so edit it
  Blockly.selected.inputList.forEach(function(input) {
    if(input.fieldRow.length > 0) {
      input.fieldRow.forEach(function(field) {
        if(field.showEditor_) {
          Blockly.Keyboard.fields.push(field);
        }
      });
    }
  });

  if(Blockly.Keyboard.fields.length > 0) {
    Blockly.Keyboard.fieldIndex = 0;
  }
}

Blockly.Keyboard.selectNextField = function() {
  Blockly.Keyboard.fieldIndex = Blockly.Keyboard.wrapIncrement(Blockly.Keyboard.fields, Blockly.Keyboard.fieldIndex);
}

Blockly.Keyboard.selectPreviousField = function() {
  Blockly.Keyboard.fieldIndex = Blockly.Keyboard.wrapDecrement(Blockly.Keyboard.fields, Blockly.Keyboard.fieldIndex);
}

Blockly.Keyboard.accessField = function() {
  Blockly.Keyboard.fields[Blockly.Keyboard.fieldIndex].showEditor_();
}

Blockly.Keyboard.unselectField = function() {
  Blockly.Keyboard.fields = [];
  Blockly.Keyboard.fieldIndex = -1;
}

// --------------USEFUL FUNCTIONS--------------

Blockly.Keyboard.unselectSelectedBlock = function() {
  Blockly.selected.unselect();
  Blockly.selected = null;
}

Blockly.Keyboard.unselectField = function() {
  Blockly.Keyboard.fields = [];
  Blockly.Keyboard.fieldIndex = -1;
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

  if(Blockly.Keyboard.fieldIndex != -1) {
    Blockly.Keyboard.unselectField();
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

/*
 * wrapDecrement
 * @param list [Array] - a list
 * @param idx [int] - an index in the list given
 *
 * return the decremented index, or, if the index is going off the list, list.length - 1
 */
Blockly.Keyboard.wrapDecrement = function(list, idx) {
  if(idx - 1 == -1) {
    return list.length - 1;
  } else {
    return idx - 1;
  }
}

Blockly.Keyboard.isDescendent = function(block1, block2) {
  if(block2.childBlocks_.length == 0) {
    return false;
  } else if(block2.childBlocks_.indexOf(block1) != -1) {
    return true;
  } else {
    block2.childBlocks_.forEach(function(childBlock) {
      return Blockly.Keyboard.isDescendent(block1, childBlock);
    });
  }
}
