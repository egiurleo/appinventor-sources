package com.google.appinventor.client.controller;

import com.google.gwt.core.client.JavaScriptObject;

public class CompanionController extends JavaScriptObject {
  private CompanionController() {}

  public native void addEventListener(CompanionEventListener listener)/*-{
    this.gwtListeners.push(listener);
    this.listeners.push($entry(function(e) {
      listener.@com.google.appinventor.client.controller.CompanionEventListener::onStateChange(Lcom/google/appinventor/client/controller/CompanionEvent;)(e);
    }));
  }-*/;

  public native void removeEventListener(CompanionEventListener listener)/*-{
    var i = this.gwtListeners.indexOf(listener);
    if (i >= 0) {
      this.gwtListeners.splice(i, 1);
      this.listeners.splice(i, 1);
    }
  }-*/;

  public static native CompanionController get()/*-{
    return AppInventor.CompanionController.get();
  }-*/;
}
