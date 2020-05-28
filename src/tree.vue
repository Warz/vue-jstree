<template>
    <div :class="classes" role="tree" onselectstart="return false">
        <ul :class="containerClasses" role="group">
            <tree-item v-for="(child, index) in data"
                       :key="index"
                       :data="child"
                       :text-field-name="textFieldName"
                       :value-field-name="valueFieldName"
                       :children-field-name="childrenFieldName"
                       :item-events="itemEvents"
                       :whole-row="wholeRow"
                       :show-checkbox="showCheckbox"
                       :allow-transition="allowTransition"
                       :height="sizeHeight"
                       :parentSiblings="data"
                       :draggable="draggable"
                       :drag-over-background-color="dragOverBackgroundColor"
                       :on-item-click="onItemClick"
                       :on-item-checked="onItemChecked"
                       :on-item-toggle="onItemToggle"
                       :on-item-drag-start="onItemDragStart"
                       :on-item-drag-end="onItemDragEnd"
                       :on-item-drop="onItemDrop"
                       :klass="index === data.length-1?'tree-last':''"
                       :expand-timer="expandTimer"
                       :expand-timer-time-out="expandTimerTimeOut"
                       :show-drop-position="showDropPosition"
                       :current-is-draggable="currentIsDraggable"
                       :is-any-dragging="isAnyDragging"

            >
                <!-- using slot from tree-item and assigning all variables to _ --->
                <template slot-scope="_">
                    <!-- creating a slot that can be consumed by App.vue and set up vm and model as usable slot variables in App.vue  -->
                    <slot :vm="_.vm" :model="_.model">
                        <i :class="_.vm.themeIconClasses" role="presentation" v-if="!_.model.loading"></i>
                        <input @keyup.esc="_.model.cancelEditing" @keyup.enter="_.model.cancelEditing" @keydown="_.model.editingKeyDown" @blur="_.model.cancelEditing" v-model="_.model[textFieldName]" v-if="_.model.editing">
                        <span class="tree-text" v-html="_.model[textFieldName]" v-else></span>
                    </slot>
                </template>
            </tree-item>
        </ul>
    </div>
</template>
<script>
    import TreeItem from './tree-item.vue' // holds the node vue component
    import TreeNode from './tree-node' // holds the node data model

    let ITEM_HEIGHT_SMALL = 18;
    let ITEM_HEIGHT_DEFAULT = 24;
    let ITEM_HEIGHT_LARGE = 32;
    const DropPosition = {
        empty: '0',
        before: '1',
        inside: '2',
        after: '3'
    };

    export default {
        name: 'VJstree',
        props: {
            data: {type: Array},
            size: {type: String, validator: value => ['large', 'small',''].indexOf(value) > -1},
            showCheckbox: {type: Boolean, default: false},
            wholeRow: {type: Boolean, default: false},
            noDots: {type: Boolean, default: false},
            collapse: {type: Boolean, default: false},
            multiple: {type: Boolean, default: false},
            allowBatch: {type: Boolean, default: false},
            allowTransition: {type: Boolean, default: true},
            textFieldName: {type: String, default: 'text'},
            valueFieldName: {type: String, default: 'value'},
            childrenFieldName: {type: String, default: 'children'},
            itemEvents: {
                type: Object, default: function () {
                    return {}
                }
            },
            async: {type: Function},
            loadingText: {type: String, default: 'Loading...'},
            draggable: {type: Boolean, default: false},
            dragOverBackgroundColor: {type: String, default: "#C9FDC9"},
            klass: String,
            expandTimer:{type: Boolean, default: false},
            expandTimerTimeOut:{type: Number, default: 1500},
            executeSiblingMovement:{type: Boolean, default:false},
            showDropPosition:{type: Boolean, default:true},
            multiTree: {type: [Boolean, Object], default: false},
            allowMultiTreeAndUsual: {type: Boolean, default: false},
        },
        data() {
            return {
                draggedItem: undefined,
                draggedElm: undefined,
                currentIsDraggable : false,
            }
        },
        computed: {
            classes() {
                return [
                    {'tree': true},
                    {'tree-default': !this.size},
                    {[`tree-default-${this.size}`]: !!this.size},
                    {'tree-checkbox-selection': !!this.showCheckbox},
                    {[this.klass]: !!this.klass}
                ]
            },
            containerClasses() {
                return [
                    {'tree-container-ul': true},
                    {'tree-children': true},
                    {'tree-wholerow-ul': !!this.wholeRow},
                    {'tree-no-dots': !!this.noDots}
                ]
            },
            sizeHeight() {
                switch (this.size) {
                    case 'large':
                        return ITEM_HEIGHT_LARGE;
                    case 'small':
                        return ITEM_HEIGHT_SMALL;
                    default:
                        return ITEM_HEIGHT_DEFAULT;
                }
            }
        },
        methods: {
            /**
             * Initialize nodes takes a json object and sets nodes by reference
             * @param nodes
             */
            initializeNodes(nodes) {

                if (nodes && nodes.length > 0) {
                    for (let i in nodes) {
                        nodes[i] = this.initializeNode(nodes[i]);
                    }
                }

            },
            initializeNode(item) {
                return new TreeNode(this,item); // todo: put initialization stuff in setup() ?
            },
            initializeLoading() {
                var item = {}
                item[this.textFieldName] = this.loadingText
                item.disabled = true
                item.loading = true
                return this.initializeNode(item)
            },
            handleRecursionNodeChilds(node, func) {
                if (func(node) !== false) {
                    if (node.$children && node.$children.length > 0) {
                        for (let childNode of node.$children) {
                            if (!childNode.disabled) {
                                this.handleRecursionNodeChilds(childNode, func)
                            }
                        }
                    }
                }
            },
            handleRecursionNodeChildren(node, func) {
                if (func(node) !== false) {
                    if (node[this.childrenFieldName] && node[this.childrenFieldName].length > 0) {
                        for (let childNode of node[this.childrenFieldName]) {
                            this.handleRecursionNodeChildren(childNode, func)
                        }
                    }
                }
            },
            // unselect all nodes except one
            unselectExcept(node) {
                let rootChildren = this.$children; // todo replace $children (vue-specific) with data access ?

                rootChildren.forEach(matchedNode => {

                    if(matchedNode.model.id !== node.id) {
                        matchedNode.model.unselect();
                    }

                    let item = matchedNode.model;
                    this.handleRecursionNodeChildren(item,child => {

                        if(child.id !== node.id) {
                            child.unselect();
                        }

                    });
                });
            },
            onItemClick(targetNode, e) {
                this.$emit('item-click', targetNode, targetNode.model, e)
            },
            onItemChecked(targetNode, e) {
                if (this.multiple) {
                    if (this.allowBatch) {
                        this.handleBatchSelectItems(targetNode)
                    }
                } else {
                    this.handleSingleSelectItems(targetNode)
                }
                this.$emit('item-checked', targetNode, targetNode.model, e)
            },
            // todo rename checked
            handleSingleSelectItems(targetNode) {
                this.handleRecursionNodeChilds(this, node => {
                    if (node.model) node.model.checked = false
                })
                targetNode.model.checked = true
            },
            // todo rename checked
            handleBatchSelectItems(targetNode) {
                this.handleRecursionNodeChilds(targetNode, node => {
                    if (node.model.disabled) return
                    node.model.checked = targetNode.model.checked
                })
            },
            onItemToggle(targetNode, e) {
                if (targetNode.model.opened) {
                    this.handleAsyncLoad(targetNode.model[this.childrenFieldName], targetNode)
                }
                this.$emit('item-toggle', targetNode, targetNode.model, e)
            },
            handleAsyncLoad(targetParent, targetNode) {
                var self = this;
                if (this.async) {
                    this.async(targetNode, (data) => {
                        if (data.length > 0) {
                            for (let i in data) {
                                if (!data[i].isLeaf) {
                                    if (typeof data[i][self.childrenFieldName] !== "object") {
                                        data[i][self.childrenFieldName] = [self.initializeLoading()]
                                    }
                                }
                                var node = self.initializeNode(data[i])
                                self.$set(targetParent, i, node)
                            }
                        } else {
                            targetNode.model[self.childrenFieldName] = []
                        }
                        if(targetNode.model){
                            targetNode.model.loading = false;
                        }
                    })

                }
            },
            onItemDragStart(e, draggedNode) {

                if(draggedNode && draggedNode.draggable) {
                    this.currentIsDraggable = true;
                    if(this.multiTree) {
                        this.multiTree.setDraggedNode(draggedNode);
                    }
                }

                if (!this.draggable || !draggedNode.model.isDraggable()) {

                    // The dragged item isn't draggable
                    this.currentIsDraggable = false;

                    // Hide item during drag:
                    e.target.style.opacity = '0';

                    // Since dragstart event freezes style during drag operation we can reset style immediately
                    // without impacting it. As soon as user drops the item it will reset back to original.
                    setTimeout(() => e.target.style.opacity = '1',1);

                    // Set mouse pointer to forbidden pointer during drag:
                    e.dataTransfer.effectAllowed = 'none';

                    return false;
                }

                if(this.multiTree){

                    this.draggedItem = {
                        item: draggedNode.model,
                        parentSiblings: draggedNode.parentSiblings,
                        index: draggedNode.parentSiblings.findIndex(t => t.id === draggedNode.model.id),
                    }

                }else{

                    e.dataTransfer.effectAllowed = "move"
                    e.dataTransfer.setData('text', "")
                    this.draggedElm = e.target
                    this.draggedItem = {
                        item: draggedNode.model,
                        parentSiblings: draggedNode.parentSiblings,
                        index: draggedNode.parentSiblings.findIndex(t => t.id === draggedNode.model.id)
                    }

                }

                if(this.multiTree) {
                    this.multiTree.setDraggedNode(this.draggedItem); // todo: is this a node tho?
                }

                this.$emit("item-drag-start", draggedNode, draggedNode.model,this.draggedItem, e)

            },
            /**
             * Is local tree or one of the other trees in the group in drag state?
             * @return {Boolean}
             */
            isAnyDragging() {
              return this.currentIsDraggable || (this.multiTree && this.multiTree.isDragging());
            },
            /**
             * Is this a drag operation between two trees?
             * @return {boolean} true if multitree operation between two different trees
             */
            isDraggingBetweenTrees() {
                return this.multiTree && this.draggedItem !== this.multiTree.state.currentDraggedNode;
            },
            onItemDragEnd(e, targetNode) {
                this.draggedItem = undefined;
                this.draggedElm = undefined;
                this.currentIsDraggable = false;

                if(this.multiTree) {
                    this.multiTree.setDraggedNode(null);
                }
                this.$emit("item-drag-end", targetNode, targetNode.model, e)
            },
            onItemDrop(e, targetNode, position) {

                if (!this.draggable)
                    return false;

                // i todo: we should allow any html tag with attribute draggable="true" to be dragged
                if(!this.isAnyDragging()) {
                    return false;
                }

                this.$emit("item-drop-before", targetNode, targetNode.model, !this.draggedItem ? undefined : this.draggedItem.item, e, position)

                if(this.multiTree && !this.allowMultiTreeAndUsual) {

                    if( ! this.multiTree.isDragging()) {
                        return false;
                    }

                    this.draggedItem = this.multiTree.state.currentDraggedNode;

                }

                if (this.draggedItem && targetNode.model[this.childrenFieldName] !== this.draggedItem.item[this.childrenFieldName]) {

                    var newParent = '';

                    if (!targetNode.model.isValidDragDrop(position)) return false;

                    if (position === DropPosition.inside) {
                        /** Item is droped on the other item (folder) ****/
                        if(this.executeSiblingMovement){
                            this.draggedItem.item.moveTo(this.draggedItem, targetNode.model);
                        }

                        this.$emit('item-drop', targetNode, targetNode.model, this.draggedItem, e)

                    }
                    else if (targetNode.parentSiblings) { // ps: parentSiblings can contain multiple parents
                        /** Item is droped before or under existing item ****/

                        if (targetNode.parentId) newParent = targetNode.parentId;

                        // Find position of destination item in the parent group
                        var oriIndex = targetNode.parentSiblings.findIndex(node => node.id === targetNode.model.id);

                        var anchor_modificator = '';
                        if (position === DropPosition.before) { //before anchor node
                            if(this.executeSiblingMovement){
                                this.draggedItem.item.moveLeftTo(this.draggedItem, targetNode, oriIndex)
                            }
                            anchor_modificator = "-left";
                        }
                        else if (position === DropPosition.after) { //after anchor node
                            if(this.executeSiblingMovement) {
                                this.draggedItem.item.moveRightTo(this.draggedItem, targetNode, oriIndex);
                            }
                            anchor_modificator = "-right";
                        }

                        this.$emit('item-drop-sibling'+anchor_modificator, targetNode, targetNode.model, this.draggedItem, oriIndex,e)
                    }
                }
            }
        },
        created() {

            if(this.data && this.data[0] && this.data[0].treeId) {
                // Each tree creates it's own instance of tree.vue (this) - that can be an issue when we are using
                // the same data because the latest tree created will be the tree.vue instance used in the Models
                // (see TreeNode) and that results in updating the wrong data (?) when using methods such as $children
                //
                // Still not 100% sure about this issue, for now it works wonders to disable multiple trees using the
                // same data source. If we figure out a better way to access this.tree (such as $this.$children) then
                // we can consider restoring support for using same data source.
                //
                // todo: look more into this issue and possible replace $this.$children (?)

                throw "You cannot use the same tree data object/json for multiple trees";
            }

            this.initializeNodes(this.data)
        },
        mounted() {
            if (this.async) {
                this.$set(this.data, 0, this.initializeLoading());
                this.handleAsyncLoad(this.data, this)
            }
        },
        components: {
            TreeItem
        }
    }
</script>
<style lang="less">
    @import "./less/style";
</style>