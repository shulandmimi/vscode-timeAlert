import { TreeDataProvider, TreeItem } from 'vscode';

export default class TaskDataProvider implements TreeDataProvider<TreeItem> {
    getChildren(ele: TreeItem) {
        console.log('children', ele);
        return [new TreeItem('未完成', 1), new TreeItem('未完成2'), new TreeItem('未完成3')];
    }

    getTreeItem(ele: TreeItem) {
        const item = new TreeItem('123');
        return ele;
    }
}
