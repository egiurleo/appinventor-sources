package com.google.appinventor.client.controller;

import com.google.gwt.core.client.JavaScriptObject;

public class ProjectController extends JavaScriptObject {
  private ProjectController() {}
  
  public static native ProjectController get()/*-{
    return Blockly.ProjectController.get();
  }-*/;
}
