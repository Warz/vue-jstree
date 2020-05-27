import { reactive } from '@vue/composition-api';

export default function useMultiTree() {

    const state = reactive({
        currentDraggedNode : null,
    });

    function setDraggedNode(node) {
        state.currentDraggedNode = node;
    }

    function isDragging() {
        return !!state.currentDraggedNode;
    }

    return {
        state,
        isDragging,
        setDraggedNode
    }
}