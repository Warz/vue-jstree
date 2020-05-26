import { ref, watch,computed,onMounted,onUnmounted, reactive, toRefs, watchEffect } from '@vue/composition-api';

export default function useTreeActions(editingNode) {

    const cutNode = ref(null);
    const copyNode = ref(null);
    const pendingPaste = computed(cutNode.value !== null || copyNode.value !== null);

    /**
     * Create a new item inside selected
     */
    function addChildNode () {
        if (editingNode.value.model.id !== undefined) {
            editingNode.value.model.addChild({
                text: "New Folder"
            })
        }
    }

    /**
     * Add a new item before selected
     */
    function addBeforeNode() {
        if (editingNode.value.model.id !== undefined) {
            editingNode.value.model.addBefore({
                text: editingNode.value.model.text + " before"
            }, editingNode.value)
        }
    }

    /**
     * Add a new item after selected
     */
    function addAfterNode() {
        if (editingNode.value.model.id !== undefined) {
            editingNode.value.model.addAfter({
                text: editingNode.value.model.text + " after"
            }, editingNode.value)
        }
    }

    /**
     * Open children of selected
     */
    function openChildren() {
        if (editingNode.value.model.id !== undefined) {
            editingNode.value.model.openChildren()
        }
    }

    /**
     * Close children of selected
     */
    function closeChildren () {
        if (editingNode.value.model.id !== undefined) {
            editingNode.value.model.closeChildren()
        }
    }

    /**
     * Initiate copy state
     */
    function copy() {
        // deepClone object to save current state of the copied node:
        copyNode.value = JSON.parse(JSON.stringify(editingNode.value.model));
    }

    /**
     * Initiate cut state
     */
    function cut() {
        cutNode.value = editingNode.value;
        copyNode.value = null
    }

    /**
     * Delete the node
     * @param item (optional)
     */
    function removeNode(item) {
        if (editingNode.value.model.id !== undefined) {
            var index = editingNode.value.parentItem.indexOf(editingNode.value.model);
            editingNode.value.parentItem.splice(index, 1)
        }
    }
    /**
     * Paste item(s) and reset cut state
     */
    function paste() {
        if( ! pendingPaste) {
            return;
        }

        if(copyNode.value) {
            let stripped = idCleanup(copyNode.value);
            editingNode.value.model.addChild(stripped);
        }

        if(cutNode.value) {
            // clone it
            let clonedCutNode = Object.assign({},cutNode.value);

            if( editingNode.value.model === clonedCutNode.model) {
                return;
            }

            // todo: replace with moveTo (?)
            editingNode.value.model.addChild(clonedCutNode.model);
            cutNode.value.model.deleteNode(cutNode.value);
        }

        cutNode.value = null;
    }

    /**
     * Get rid of the id property from the node and its children
     */
    function idCleanup(item) {
        // Clone
        let newNode = Object.assign({}, item);
        // It's not a deep clone so children needs to be re-created
        newNode['children'] = [];
        // Get rid of the id so we can auto-increment new later
        delete newNode['id'];

        if(item.children.length) {
            item.children.forEach(child => {
                newNode.children.push(idCleanup(child));
            })
        }

        return newNode;
    }

    return {
        "action" : ({
            addChildNode,
            addBeforeNode,
            addAfterNode,
            openChildren,
            closeChildren,
            removeNode,
            "new" : addChildNode,
            copy,
            cut,
            paste,
            "remove" : removeNode,
            "state" : {

            }
        }),
        pendingPaste
    }
}
