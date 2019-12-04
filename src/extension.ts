import fs = require('fs');
import path = require('path');
import * as vscode from 'vscode';

export const activate = (context: vscode.ExtensionContext) => {
  const bookmarks = [];

  vscode.commands.registerCommand('xbookmarks.helloWorld', () => {
    vscode.window.showWarningMessage('shit');
  });
};

// this method is called when your extension is deactivated
export function deactivate() {}
