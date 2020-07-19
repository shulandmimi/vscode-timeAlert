import { TextDocumentContentProvider, WebviewPanel, EventEmitter, Uri, window, ViewColumn } from 'vscode';
import { join } from 'path';

class TaskWebview implements TextDocumentContentProvider {
    static type = 'view';
    static currentView?: WebviewPanel;
    static currentInstance?: TaskWebview;

    onDidChangeEmitter = new EventEmitter<Uri>();
    onDidChange = this.onDidChangeEmitter.event;
    webview?: WebviewPanel;
    extensionPath: string;

    provideTextDocumentContent(uri: Uri): string {
        return TaskWebview.type;
    }

    update(content: string, title: string = TaskWebview.type) {
        const webview = this.webview;
        if (!webview) return;
        webview.title = title;
        webview.webview.html = content;
    }

    static createOrShow(extensionPath: string): TaskWebview | undefined {
        const webview = TaskWebview.currentView;
        const column = webview ? webview.viewColumn : ViewColumn.One;

        if (webview) {
            webview.reveal(column);
            return;
        }

        const newWebview = window.createWebviewPanel(TaskWebview.type, '', column || ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [Uri.file(join(extensionPath, 'out'))],
        });
        return new TaskWebview(newWebview, extensionPath);
    }

    dispose() {
        TaskWebview.currentView?.dispose();
        TaskWebview.currentView = void 0;
        TaskWebview.currentInstance = void 0;
    }

    constructor(webview: WebviewPanel, extension: string) {
        this.webview = webview;
        this.extensionPath = extension;
        TaskWebview.currentInstance = this;
        TaskWebview.currentView = webview;

        webview.onDidDispose(this.dispose.bind(this), this, []);
        // tab切换
        webview.onDidChangeViewState((...arg) => {});
        // webview postMessage
        webview.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'alert':
                    window.showErrorMessage(message.text);
                    return;
            }
        });
    }
}

export default TaskWebview;
