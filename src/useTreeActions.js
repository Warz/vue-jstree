import { ref, watch,computed,onMounted,onUnmounted, reactive, toRefs, watchEffect } from '@vue/composition-api';

export default function useTreeActions(editingNode) {

    const cutNode = ref(null);
    /**
     * Array holding all the nodes cut (node and it's children) so that they can be cleared easily on paste
     * @type Ref<Array>
     */
    const cutNodes = ref([]);
    const copyNodes = ref([]);
    const copyNode = ref(null);
    const pendingPaste = computed(()  => cutNode.value !== null || copyNode.value !== null);

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
        recursiveCopy(editingNode.value.model);
        clearAttributes();
        // deepClone object to save current state of the copied node:
        copyNode.value = JSON.parse(JSON.stringify(editingNode.value.model));
        clearCuts();
    }

    /**
     * Initiate cut state
     */
    function cut() {
        recursiveCut(editingNode.value.model);
        cutNode.value = editingNode.value;
        copyNode.value = null
    }

    /**
     * Delete the node
     * @param item (optional)
     */
    function removeNode(item) {
        if (editingNode.value.model.id !== undefined) {
            var index = editingNode.value.parentSiblings.indexOf(editingNode.value.model);
            editingNode.value.parentSiblings.splice(index, 1)
        }
    }

    /**
     * Paste item(s) and reset cut state
     */
    function paste() {

        if( ! pendingPaste) {
            return;
        }

        clearAttributes();
        clearCuts();

        if( ! editingNode.value.model.isDrop()) return false;

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
        cutNodes.value = [];
    }

    function canPaste() {
        return pendingPaste.value && editingNode.value && editingNode.value.model.isDrop();
    }

    function clearAttributes() {
        cutNodes.value.forEach(node => {
            node.unselect();
        })
        copyNodes.value.forEach(node => {
            node.unselect();
        })
    }

    function clearCuts() {
        cutNodes.value.forEach(node => {
            node.cut = false;
        });
    }
    function recursiveCopy(item) {
        item.children.forEach(child => {
            recursiveCopy(child);
        });

        copyNodes.value.push(item);
    }

    function recursiveCut(item) {

        item.cut = true;

        item.children.forEach(child => {
            recursiveCut(child);
        });

        item.cut = true;
        cutNodes.value.push(item);
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
        pendingPaste,
        canPaste
    }
}
