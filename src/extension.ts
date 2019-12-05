import fs = require('fs');
import path = require('path');
import mkdirp = require('mkdirp');
import * as vscode from 'vscode';

export const activate = (context: vscode.ExtensionContext) => {
  const bookmarks: any = context.workspaceState.get('bookmarks') || {};
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

  const findIndexOfBookmarkByLine = (targetLine: number) =>
    bookmarks[activeFile].findIndex(
      (bookmark: any) => bookmark.line === targetLine
    );

  const findIndexOfBookmarkByValue = (targetValue: string) =>
    bookmarks[activeFile].findIndex(
      (bookmark: any) => bookmark.value === targetValue
    );

  const updateDecorations = () => {
    if (!vscode.window.activeTextEditor) {
      return;
    }

    if (!activeFile) {
      return;
    }

    const books: vscode.Range[] = [];

    for (let position of bookmarks[activeFile]) {
      books.push(new vscode.Range(position.line, 0, position.line, 0));
    }

    vscode.window.activeTextEditor.setDecorations(
      bookmarkDecorationType,
      books
    );
  };

  const toggle = (assignedValue: string | undefined) => {
    if (!vscode.window.activeTextEditor) {
      vscode.window.showInformationMessage('Откройте файл для данной операции');
      return;
    }

    if (!activeFile) {
      activeFile = vscode.window.activeTextEditor.document.uri.fsPath;
    }

    const toggledPosition: vscode.Position =
      vscode.window.activeTextEditor.selection.active;

    if (!bookmarks[activeFile]) {
      bookmarks[activeFile] = [];
    }

    const lineIndexInStore = findIndexOfBookmarkByLine(toggledPosition.line);

    // If was found
    if (lineIndexInStore !== -1) {
      // Delete from the store
      bookmarks[activeFile].splice(lineIndexInStore, 1);
    } else {
      // Add to the store
      bookmarks[activeFile].push({
        line: toggledPosition.line,
        column: toggledPosition.character,
        value: assignedValue || (toggledPosition.line + 1).toString()
      });
    }

    updateDecorations();
    context.workspaceState.update('bookmarks', bookmarks);
  };

  vscode.commands.registerCommand('xbookmarks.toggle', toggle);

  const toggleAndAssignValue = () => {
    vscode.window
      .showInputBox({
        prompt: 'Assign Value to this Bookmark'
      })
      .then((assignedValue) => {
        toggle(assignedValue);
      });
  };

  vscode.commands.registerCommand(
    'xbookmarks.toggleAndAssignValue',
    toggleAndAssignValue
  );

  const revealPosition = (line: number, column: number) => {
    if (!vscode.window.activeTextEditor) {
      return;
    }

    const targetRevealSelection = new vscode.Selection(
      line,
      column,
      line,
      column
    );

    vscode.window.activeTextEditor.selection = targetRevealSelection;
    vscode.window.activeTextEditor.revealRange(
      targetRevealSelection,
      vscode.TextEditorRevealType.InCenter
    );
  };

  const list = () => {
    const books = bookmarks[activeFile].map((position: any) => position.value);

    vscode.window.showQuickPick(books).then((selected: string | undefined) => {
      if (!selected) {
        return;
      }

      const bookmarkIndex = findIndexOfBookmarkByValue(selected);
      const bookmark = bookmarks[activeFile][bookmarkIndex];
      revealPosition(bookmark.line, bookmark.column);
    });
  };

  vscode.commands.registerCommand('xbookmarks.list', list);
};

// this method is called when your extension is deactivated
export function deactivate() {}
