import { ref, watch,computed,onMounted,onUnmounted, reactive, toRefs, watchEffect } from '@vue/composition-api';

// @param options is vue $options - for filters (passed in from Layout.vue - a hack to get it in here)
export default function useMultiTree() {

    const state = reactive({
        currentDraggedNode : null,
        //isDragging : false,
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