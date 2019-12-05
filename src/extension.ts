import fs = require('fs');
import path = require('path');
import mkdirp = require('mkdirp');
import * as vscode from 'vscode';

export const activate = (context: vscode.ExtensionContext) => {
  const bookmarkedLines: any = context.workspaceState.get('bookmarks') || {};
  let activeFile: string = '';

  const decorationOptions: vscode.DecorationRenderOptions = {
    gutterIconPath: context.asAbsolutePath('images/bookmark.svg'),
    overviewRulerLane: vscode.OverviewRulerLane.Full,
    overviewRulerColor: 'rgba(21, 126, 251, 0.7)'
  };

  const bookmarkDecorationType = vscode.window.createTextEditorDecorationType(
    decorationOptions
  );

  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (!editor) {
      return;
    }

    activeFile = editor.document.uri.fsPath;
    updateDecorations();
  });

  const updateDecorations = () => {
    if (!vscode.window.activeTextEditor) {
      return;
    }

    if (!activeFile) {
      return;
    }

    const books: vscode.Range[] = [];

    for (let line of bookmarkedLines[activeFile]) {
      books.push(new vscode.Range(line, 0, line, 0));
    }

    vscode.window.activeTextEditor.setDecorations(
      bookmarkDecorationType,
      books
    );
  };

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

    // If already exists
    if (lineIndexInStore !== -1) {
      // Delete from the store
      bookmarkedLines[activeFile].splice(lineIndexInStore, 1);
    } else {
      // Add to the store
      bookmarkedLines[activeFile].push(toggledPosition.line);
    }

    updateDecorations();
    context.workspaceState.update('bookmarks', bookmarkedLines);
  };

  vscode.commands.registerCommand('xbookmarks.toggle', toggle);
};

// this method is called when your extension is deactivated
export function deactivate() {}
