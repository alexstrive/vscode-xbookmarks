import fs = require('fs');
import path = require('path');
import * as vscode from 'vscode';

export const activate = (context: vscode.ExtensionContext) => {
  let bookmarkedLines: any = {};
  let activeFile: string = '';

  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (!editor) {
      return;
    }

    activeFile = editor.document.uri.fsPath;
  });

  const updateDecoration = () => {};

  const toggle = () => {
    if (!vscode.window.activeTextEditor) {
      vscode.window.showInformationMessage('Откройте файл для данной операции');
      return;
    }

    if (!activeFile) {
      activeFile = vscode.window.activeTextEditor.document.uri.fsPath;
    }

    const toggledPosition: vscode.Position =
      vscode.window.activeTextEditor.selection.active;

    if (!bookmarkedLines[activeFile]) {
      bookmarkedLines[activeFile] = [];
    }

    const lineIndexInStore = bookmarkedLines[activeFile].indexOf(
      toggledPosition.line
    );

    // Delete line if it exists in store
    if (lineIndexInStore !== -1) {
      bookmarkedLines[activeFile].splice(lineIndexInStore, 1);
      return;
    }

    // Add line in store
    bookmarkedLines[activeFile].push(toggledPosition.line);

    console.log(bookmarkedLines);
  };

  vscode.commands.registerCommand('xbookmarks.toggle', toggle);
};

// this method is called when your extension is deactivated
export function deactivate() {}
