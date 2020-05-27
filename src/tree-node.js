/**
 * Auto-incremented ID for each node
 * @type {number}
 */
var ITEM_ID = 1;

export default function TreeNode(tree,item) {

    /**
     * Initialize tree node from json data
     * @param tree
     * @param item
     * @returns {any}
     */
    function initNode(tree,item)
    {

        // Create node model and merge extra attributes:
        let node = Object.assign(
            new Model(
                item,
                tree.textFieldName,
                tree.valueFieldName,
                tree.childrenFieldName,
                tree.collapse
            ),
            item);

        /**
         * Create a node model which holds all node attributes
         * @param item
         * @param textFieldName
         * @param valueFieldName
         * @param childrenFieldName
         * @param collapse
         * @constructor
         */
        function Model(item, textFieldName, valueFieldName, childrenFieldName, collapse) {
            this.id = item.id || ITEM_ID++;
            this[textFieldName] = item[textFieldName] || '';
            this[valueFieldName] = item[valueFieldName] || item[textFieldName];
            this.icon = item.icon || '';
            this.opened = item.opened || collapse;
            this.focused = item.focused || false; // focused/active node (has been clicked on and user has NOT clicked elsewhere which means the item is focused)
            this.selected = item.selected || false; // item has been clicked on (the last item clicked) - item can be selected without focused
            this.checked = item.checked || false; // checkbox is ticked
            this.disabled = item.disabled || false;
            this.draggable = item.draggable || true; // the old !dragDisabled
            this.drop = item.drop || true; // the old !dropDisabled
            this.cut = item.cut || false; // if cut = true the item is currently involved in a cut action
            this.loading = item.loading || false;
            this.editing = item.editing || false; // Is user editing the node ? (usually input field for text)

            this[childrenFieldName] = tree.initializeNodes(item[childrenFieldName]) || []
        }

        node.addBefore = function (data, selectedNode) {
            let newItem = initNode(tree,data)
            let index = selectedNode.parentSiblings.findIndex(t => t.id === node.id)
            selectedNode.parentSiblings.splice(index, 0, newItem)
        }
        node.addAfter = function (data, selectedNode) {
            let newItem = initNode(tree,data)
            let index = selectedNode.parentSiblings.findIndex(t => t.id === node.id) + 1
            selectedNode.parentSiblings.splice(index, 0, newItem)
        }
        node.addChild = function (data) {
            let newItem = initNode(tree, data)
            node.opened = true
            node[tree.childrenFieldName].push(newItem)
        }
        /**
         * Add item to position of the arrow next to selected/hovered node
         *
         * There are three positions:
         * - Above the node
         * - Inside the node
         * - Below the node
         *
         * You can optionally specify position to force a specific position
         *
         * @author Warz
         */
        node.addToPosition = function (data, selectedNode, position) {

            position = position || selectedNode.dropPosition;

            switch (position) {
                // 1 = putting it above the node
                case "1":
                    node.addBefore(data, selectedNode);
                    break;
                // 2 = putting it into a node
                case "2":
                    node.addChild(data);
                    break;
                // 3 = putting it after the node
                default:
                    node.addAfter(data, selectedNode);
            }
        }
        node.openChildren = function () {
            node.opened = true
            tree.handleRecursionNodeChildren(node, node => {
                node.opened = true
            })
        }
        node.closeChildren = function () {
            node.opened = false
            tree.handleRecursionNodeChildren(node, node => {
                node.opened = false
            })
        }
        node.moveTo = function (draggedItem, anchorNode) {

            // clone draggedItem
            var swapItem = Object.assign({}, draggedItem);

            // remove the dragged item from the parent list of items in preparation of placing it somewhere else
            draggedItem.parentSiblings.splice(draggedItem.index, 1)

            // add item as child
            anchorNode[tree.childrenFieldName].push(swapItem.item);

            anchorNode.opened = true

        }
        node.moveLeftTo = function (draggedItem, anchorNode, oriIndex) {

            let index = oriIndex;
            let isSameParents = draggedItem.parentSiblings === anchorNode.parentSiblings;
            let isFurtherDown = draggedItem.index < oriIndex;

            draggedItem.parentSiblings.splice(draggedItem.index, 1);

            if (isSameParents && isFurtherDown) {
                // The array of items will have it's index changed with -1 if you pull out an item
                // higher up. So if we're using the same index to place item as where we grab it from
                // we have to adjust for that or we'd end up placing the item 1 position too low.
                index--;
            }

            anchorNode.parentSiblings.splice(index, 0, draggedItem.item);
        }
        node.moveRightTo = function (draggedItem, anchorNode, oriIndex) {

            let index = oriIndex + 1; // + 1 to place it below item
            let isSameParents = draggedItem.parentSiblings === anchorNode.parentSiblings;
            let isFurtherDown = draggedItem.index < oriIndex;

            draggedItem.parentSiblings.splice(draggedItem.index, 1);

            if (isSameParents && isFurtherDown) {
                // The array of items will have it's index changed with -1 if you pull out an item
                // higher up. So if we're using the same index to place item as where we grab it from
                // we have to adjust for that or we'd end up placing the item 1 position too low.
                index--;
            }

            anchorNode.parentSiblings.splice(index, 0, draggedItem.item);

        }
        node.deleteNode = function (selectedNode) {
            let index = selectedNode.parentSiblings.findIndex(t => t.id === node.id)
            selectedNode.parentSiblings.splice(index, 1)
        }
        node.cancelEditing = function () {
            if(node.editing) {
                node.editing = false;
                tree.$emit('cancel-editing', node)
            }
        }
        node.editingKeyDown = function(e) {
                // Ctrl + A will select all the text in the input field
                if (e.keyCode == 65 && e.ctrlKey) {
                    e.target.select()
                }
        }

        /**
         * Check if node is in children (recursive) (or if matching self)
         * @param targetNode
         * @param draggedNode
         * @returns {boolean}
         */
        node.isOrContains = function(targetNode,draggedNode) {
            draggedNode = draggedNode || node;

            for(let child of draggedNode[tree.childrenFieldName]) {
                if(child.isOrContains(targetNode,child)) {
                    return true;
                }
            }
            return draggedNode.id === targetNode.model.id;
        }
        /**
         * Is drop (target)
         * @returns {boolean} true if you are allowed to drop other nodes into this node
         */
        node.isDrop = function() {
            return node.drop;
        }

        /**
         * Is draggable
         * @returns {boolean} true if you are allowed to drag this node
         */
        node.isDraggable = function() {
            return node.draggable;
        }

        node.toggleSelect = function() {
            node.focused = !node.focused;
            node.selected = !node.selected;
            tree.unselectExcept(node);
        }
        node.unselect = function() {
            node.focused = false;
            node.selected = false;
        }
        node.select = function() {
            node.focused = true;
            node.selected = true;
            tree.unselectExcept(node);
        }

        // The vue instance of the tree has an id
        node.treeId = tree._uid;

        return node
    }

    return initNode(tree,item);
}