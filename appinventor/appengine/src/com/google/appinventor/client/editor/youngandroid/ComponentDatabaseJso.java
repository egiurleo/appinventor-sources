package com.google.appinventor.client.editor.youngandroid;

import com.google.appinventor.shared.simple.ComponentDatabaseInterface;
import com.google.gwt.core.client.JavaScriptObject;

public class ComponentDatabaseJso {
  public static native JavaScriptObject wrap(ComponentDatabaseInterface db)/*-{
    var obj = {};
    obj.getComponentNames = db.@com.google.appinventor.shared.simple.ComponentDatabaseInterface::getComponent().bind(db);
    obj.getComponentType = db.@com.google.appinventor.shared.simple.ComponentDatabaseInterface::getComponentType(Ljava/lang/String;).bind(db);
    obj.getComponentName = db.@com.google.appinventor.shared.simple.ComponentDatabaseInterface::getComponentName(Ljava/lang/String;).bind(db);
    obj.getComponentExternal = db.@com.google.appinventor.shared.simple.ComponentDatabaseInterface::getComponentExternal(Ljava/lang/String;).bind(db);
    obj.getComponentVersion = db.@com.google.appinventor.shared.simple.ComponentDatabaseInterface::getComponentVersion(Ljava/lang/String;).bind(db);
    obj.getCategoryString = db.@com.google.appinventor.shared.simple.ComponentDatabaseInterface::getCategoryString(Ljava/lang/String;).bind(db);
    obj.getCategoryDocUrlString = db.@com.google.appinventor.shared.simple.ComponentDatabaseInterface::getCategoryDocUrlString(Ljava/lang/String;).bind(db);
    obj.getHelpString = db.@com.google.appinventor.shared.simple.ComponentDatabaseInterface::getHelpString(Ljava/lang/String;).bind(db);
    obj.getShowOnPalette = db.@com.google.appinventor.shared.simple.ComponentDatabaseInterface::getShowOnPalette(Ljava/lang/String;).bind(db);
    obj.getNonVisible = db.@com.google.appinventor.shared.simple.ComponentDatabaseInterface::getNonVisible(Ljava/lang/String;).bind(db);
    obj.getIconName = db.@com.google.appinventor.shared.simple.ComponentDatabaseInterface::getIconName(Ljava/lang/String;).bind(db);
    obj.getPropertyDefinitions = db.@com.google.appinventor.shared.simple.ComponentDatabaseInterface::getPropertyDefinitions(Ljava/lang/String;).bind(db);
    obj.getBlockPropertyDefinitions = db.@com.google.appinventor.shared.simple.ComponentDatabaseInterface::getBlockPropertyDefinitions(Ljava/lang/String;).bind(db);
    obj.getEventDefinitions = db.@com.google.appinventor.shared.simple.ComponentDatabaseInterface::getEventDefinitions(Ljava/lang/String;).bind(db);
    obj.getMethodDefinitions = db.@com.google.appinventor.shared.simple.ComponentDatabaseInterface::getMethodDefinitions(Ljava/lang/String;).bind(db);
    obj.getPropertyTypesByName = db.@com.google.appinventor.shared.simple.ComponentDatabaseInterface::getPropertyTypesByName(Ljava/lang/String;).bind(db);
    obj.getTypeDescription = db.@com.google.appinventor.shared.simple.ComponentDatabaseInterface::getTypeDescription(Ljava/lang/String;).bind(db);
    obj.isComponent = db.@com.google.appinventor.shared.simple.ComponentDatabaseInterface::isComponent(Ljava/lang/String;).bind(db);
    return obj;
  }-*/;
}
